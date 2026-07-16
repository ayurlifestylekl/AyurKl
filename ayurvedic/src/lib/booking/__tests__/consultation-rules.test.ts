import { describe, expect, it } from 'vitest'
import { canClearConsultation, canLinkTreatmentToConsultation } from '../consultation-rules'

const past = '2026-07-15T02:00:00.000Z'
const future = '2026-07-18T02:00:00.000Z'
const nowMs = new Date('2026-07-16T02:00:00.000Z').getTime()

describe('canClearConsultation', () => {
  it.each(['checked_in', 'in_progress', 'completed'] as const)('allows an attended past consultation in %s', (status) => {
    expect(canClearConsultation({ bookingKind: 'consultation', status, appointmentISO: past, nowMs })).toBe(true)
  })

  it('rejects future consultations', () => {
    expect(canClearConsultation({ bookingKind: 'consultation', status: 'confirmed', appointmentISO: future, nowMs })).toBe(false)
  })

  it('rejects treatments', () => {
    expect(canClearConsultation({ bookingKind: 'treatment', status: 'completed', appointmentISO: past, nowMs })).toBe(false)
  })
})

describe('canLinkTreatmentToConsultation', () => {
  const cleared = { bookingKind: 'consultation' as const, treatmentUnlocked: true }

  it('accepts a cleared consultation only when access was proved', () => {
    expect(canLinkTreatmentToConsultation({ ...cleared, accessGranted: true })).toBe(true)
  })

  it('rejects reuse by a customer without owner or signed-token access', () => {
    expect(canLinkTreatmentToConsultation({ ...cleared, accessGranted: false })).toBe(false)
  })

  it('rejects an accessible but uncleared or non-consultation appointment', () => {
    expect(canLinkTreatmentToConsultation({ ...cleared, treatmentUnlocked: false, accessGranted: true })).toBe(false)
    expect(canLinkTreatmentToConsultation({ bookingKind: 'treatment', treatmentUnlocked: true, accessGranted: true })).toBe(false)
  })
})
