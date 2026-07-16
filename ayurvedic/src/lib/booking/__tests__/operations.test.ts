import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  getOperationalTransitionOffer,
  mapOperationalTransitionWriteFailure,
  validateOperationalTransition,
} from '../operations'

describe('validateOperationalTransition', () => {
  it.each(['checked_in', 'in_progress'] as const)('blocks unassigned treatments moving to %s', (to) => {
    expect(validateOperationalTransition({ bookingKind: 'treatment', assignedTherapistCode: null, to })).toEqual({
      error: 'Assign a therapist before checking in or starting this treatment.',
    })
  })

  it.each(['   ', '\t', '\n', ' \t\n '])('treats all-whitespace therapist code %j as unassigned', (assignedTherapistCode) => {
    expect(validateOperationalTransition({
      bookingKind: 'treatment',
      assignedTherapistCode,
      to: 'checked_in',
    })).toEqual({
      error: 'Assign a therapist before checking in or starting this treatment.',
    })
  })

  it('preserves a valid therapist code surrounded by whitespace', () => {
    expect(validateOperationalTransition({
      bookingKind: 'treatment',
      assignedTherapistCode: ' NT02 ',
      to: 'checked_in',
    })).toEqual({ ok: true })
  })

  it('allows an assigned treatment to check in', () => {
    expect(validateOperationalTransition({
      bookingKind: 'treatment',
      assignedTherapistCode: 'NT02',
      to: 'checked_in',
    })).toEqual({ ok: true })
  })

  it('allows a consultation to check in without a therapist', () => {
    expect(validateOperationalTransition({
      bookingKind: 'consultation',
      assignedTherapistCode: null,
      to: 'checked_in',
    })).toEqual({ ok: true })
  })

  it('does not require a therapist for non-operational transitions', () => {
    expect(validateOperationalTransition({
      bookingKind: 'treatment',
      assignedTherapistCode: null,
      to: 'cancelled',
    })).toEqual({ ok: true })
  })
})

describe('getOperationalTransitionOffer', () => {
  it.each(['checked_in', 'in_progress'] as const)('does not offer %s for an unassigned treatment', (to) => {
    expect(getOperationalTransitionOffer({
      bookingKind: 'treatment',
      assignedTherapistCode: null,
      to,
    })).toEqual({ offered: false, message: 'Assign a therapist first' })
  })

  it('offers check-in for an assigned treatment', () => {
    expect(getOperationalTransitionOffer({
      bookingKind: 'treatment',
      assignedTherapistCode: 'NT02',
      to: 'checked_in',
    })).toEqual({ offered: true, message: null })
  })

  it('offers check-in for an unassigned consultation', () => {
    expect(getOperationalTransitionOffer({
      bookingKind: 'consultation',
      assignedTherapistCode: null,
      to: 'checked_in',
    })).toEqual({ offered: true, message: null })
  })
})

describe('mapOperationalTransitionWriteFailure', () => {
  it('maps the database assignment invariant to the stable operational error', () => {
    expect(mapOperationalTransitionWriteFailure({
      error: { code: '23514', message: 'treatment_operational_assignment_required' },
      updated: false,
    })).toBe('Assign a therapist before checking in or starting this treatment.')
  })

  it('maps a zero-row compare-and-set to a stable status conflict', () => {
    expect(mapOperationalTransitionWriteFailure({ error: null, updated: false }))
      .toBe('Appointment status changed. Refresh and try again.')
  })

  it('preserves unrelated database errors and accepts a successful write', () => {
    expect(mapOperationalTransitionWriteFailure({
      error: { code: '42501', message: 'permission denied' },
      updated: false,
    })).toBe('permission denied')
    expect(mapOperationalTransitionWriteFailure({ error: null, updated: true })).toBeNull()
  })
})

function source(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

function exportedFunction(path: string, name: string): string {
  const contents = source(path)
  const start = contents.indexOf(`export async function ${name}`)
  expect(start, `${name} should be exported from ${path}`).toBeGreaterThanOrEqual(0)
  const nextExport = contents.indexOf('\nexport ', start + 1)
  return contents.slice(start, nextExport < 0 ? undefined : nextExport)
}

describe('operational transition integration contracts', () => {
  it.each([
    ['src/lib/staff/actions.ts', 'setStatus'],
    ['src/lib/admin/appointments/actions.ts', 'moveAppointmentStatus'],
  ])('%s validates booking kind and therapist assignment before updating status', (path, functionName) => {
    const action = exportedFunction(path, functionName)
    const select = action.indexOf('.select(')
    const transitionCheck = action.indexOf(
      functionName === 'setStatus' ? 'canTransition(' : 'canTransitionAppointment(',
    )
    const guard = action.indexOf('validateOperationalTransition({')
    const update = action.indexOf('.update(')

    expect(action).toMatch(/\.select\('[^']*booking_kind[^']*assigned_therapist_code[^']*'\)/)
    expect(guard).toBeGreaterThan(select)
    expect(guard).toBeGreaterThan(transitionCheck)
    expect(update).toBeGreaterThan(guard)
    expect(action).toContain("if ('error' in operationalTransition)")
    expect(action).toContain('operationalTransition.error')
  })

  it.each([
    ['src/lib/staff/actions.ts', 'setStatus', 'appt.status'],
    ['src/lib/admin/appointments/actions.ts', 'moveAppointmentStatus', 'from'],
  ])('%s compare-and-sets the status read and verifies one updated row', (path, functionName, fromExpression) => {
    const action = exportedFunction(path, functionName)
    const update = action.indexOf('.update(')
    const conditionalStatus = action.indexOf(`.eq('status', ${fromExpression})`, update)
    const select = action.indexOf(".select('id')", update)
    const maybeSingle = action.indexOf('.maybeSingle()', update)
    const failureMapping = action.indexOf('mapOperationalTransitionWriteFailure({', update)
    const failureReturn = action.indexOf('if (writeFailure)', failureMapping)
    const firstSideEffect = action.indexOf(functionName === 'setStatus' ? 'voidBill(' : 'notifyCustomer(', update)

    expect(conditionalStatus).toBeGreaterThan(update)
    expect(select).toBeGreaterThan(conditionalStatus)
    expect(maybeSingle).toBeGreaterThan(select)
    expect(failureMapping).toBeGreaterThan(maybeSingle)
    expect(failureReturn).toBeGreaterThan(failureMapping)
    expect(firstSideEffect).toBeGreaterThan(failureReturn)
    expect(action).toContain('updated: !!updated')
  })

  it('disables blocked detail actions and explains how to unblock them', () => {
    const component = source('src/components/staff/AppointmentActions.tsx')

    expect(component).toContain('getOperationalTransitionOffer({')
    expect(component).toContain("to: status === 'confirmed' ? 'checked_in' : 'in_progress'")
    expect(component.match(/disabled=\{pending \|\| operationalActionBlocked\}/g)).toHaveLength(2)
    expect(component).toContain('{operationalActionOffer.message}')
  })

  it('installs a database trigger for the operational therapist invariant', () => {
    const migration = source('supabase/migrations/20260717_treatment_operational_assignment.sql').toLowerCase()

    expect(migration).toContain('treatment_operational_assignment_required')
    expect(migration).toContain("new.booking_kind = 'treatment'")
    expect(migration).toContain("new.status in ('checked_in', 'in_progress')")
    expect(migration).toContain('new.assigned_therapist_code is null')
    expect(migration).toContain("new.assigned_therapist_code !~ '[^[:space:]]'")
    expect(migration).toContain("errcode = '23514'")
    expect(migration).toMatch(/before insert or update of status, booking_kind, assigned_therapist_code/)
    expect(migration).toContain('security definer')
    expect(migration).toContain('set search_path = public')
  })

  it('disables blocked Today-board actions and wires the booking data at its call site', () => {
    const buttons = source('src/components/staff/CheckInButtons.tsx')
    const board = source('src/components/staff/TodayBoard.tsx')

    expect(buttons).toContain('bookingKind: BookingKind')
    expect(buttons).toContain('assignedTherapistCode: string | null')
    expect(buttons).toContain('getOperationalTransitionOffer({')
    expect(buttons.match(/disabled=\{pending \|\| operationalActionBlocked\}/g)).toHaveLength(2)
    expect(buttons).toContain('{operationalActionOffer.message}')
    expect(board).toContain('bookingKind={a.bookingKind}')
    expect(board).toContain('assignedTherapistCode={a.assignedTherapistCode}')
  })

  it('filters invalid admin status offers and wires booking data from the detail page', () => {
    const dialog = source('src/app/admin/(portal)/appointments/[id]/StatusDialog.tsx')
    const page = source('src/app/admin/(portal)/appointments/[id]/page.tsx')

    expect(dialog).toContain('bookingKind: BookingKind')
    expect(dialog).toContain('assignedTherapistCode: string | null')
    expect(dialog).toContain('getOperationalTransitionOffer({')
    expect(dialog).toMatch(/\.filter\(\(\w+\) => getOperationalTransitionOffer\(/)
    expect(dialog).toContain('{blockedOffer.message}')
    expect(page).toContain('bookingKind={a.booking_kind}')
    expect(page).toContain('assignedTherapistCode={a.assigned_therapist_code}')
  })

  it.each([
    'src/app/(staff)/console/[id]/page.tsx',
    'src/app/(staff)/doctor/[id]/page.tsx',
  ])('wires therapist assignment into AppointmentActions from %s', (path) => {
    const page = source(path)

    expect(page).toContain('bookingKind={a.bookingKind}')
    expect(page).toContain('assignedTherapistCode={a.assignedTherapistCode}')
  })
})
