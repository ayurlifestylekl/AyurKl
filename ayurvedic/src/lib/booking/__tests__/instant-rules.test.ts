import { describe, expect, it } from 'vitest'
import {
  GENERIC_INSTANT_ERROR,
  canonicalInstantTiming,
  patientGenderError,
  publicInstantFailure,
  resolveRequestedConsultationTreatment,
  validateInstantGroupGuests,
} from '../instant-rules'

const validGuest = {
  name: 'Anu',
  gender: 'female' as const,
  preferredAt: '2026-07-18T02:00:00.000Z',
}

describe('validateInstantGroupGuests', () => {
  it('rejects the whole group when any submitted guest is incomplete', () => {
    const result = validateInstantGroupGuests([
      validGuest,
      { ...validGuest, name: '  ' },
    ])
    expect(result).toHaveProperty('error')
  })

  it('rejects a null submitted guest instead of throwing', () => {
    expect(validateInstantGroupGuests([validGuest, null as never])).toHaveProperty('error')
  })

  it('checks the submitted count before validation so filtering cannot evade the limit', () => {
    const seven = Array.from({ length: 7 }, (_, i) => ({
      ...validGuest,
      name: i === 6 ? '' : `Guest ${i + 1}`,
    }))
    expect(validateInstantGroupGuests(seven)).toEqual({ error: 'Up to 6 guests per group booking.' })
  })

  it('rejects invalid gender, time, or age without dropping that guest', () => {
    expect(validateInstantGroupGuests([validGuest, { ...validGuest, gender: 'other' }])).toHaveProperty('error')
    expect(validateInstantGroupGuests([validGuest, { ...validGuest, preferredAt: 'not-a-date' }])).toHaveProperty('error')
    expect(validateInstantGroupGuests([validGuest, { ...validGuest, age: -1 }])).toHaveProperty('error')
  })

  it('rejects a non-string guest treatment before the action can call trim', () => {
    expect(validateInstantGroupGuests([
      validGuest,
      { ...validGuest, treatmentId: 5 },
    ])).toEqual({ error: 'Please choose a valid treatment for every guest.' })
  })

  it('preserves optional, blank, and string guest treatments for shared-treatment fallback', () => {
    expect(validateInstantGroupGuests([
      validGuest,
      { ...validGuest, treatmentId: null },
      { ...validGuest, treatmentId: '' },
      { ...validGuest, treatmentId: 'treatment-id' },
    ])).toEqual({ ok: true })
  })
})

describe('patientGenderError', () => {
  it('uses consultation-specific public copy with no therapist-matching language', () => {
    const message = patientGenderError('consultation')
    expect(message).toBe('Please select the patient’s gender.')
    expect(message).not.toMatch(/therapist|matching/i)
  })

  it('keeps the matching explanation for treatment bookings', () => {
    expect(patientGenderError('treatment')).toBe('Please select a gender for therapist matching.')
  })
})

describe('canonicalInstantTiming', () => {
  it('suppresses alternate times for treatment and group claim rows', () => {
    expect(canonicalInstantTiming({
      kind: 'treatment', preferredAt: validGuest.preferredAt, durationMins: 60,
    })).toEqual({
      appointmentDatetime: validGuest.preferredAt,
      durationMins: 60,
      requestedDatetime: validGuest.preferredAt,
      requestedDatetimeAlt: null,
    })
  })

  it('forces a linked consultation to 30 minutes', () => {
    expect(canonicalInstantTiming({
      kind: 'consultation', preferredAt: validGuest.preferredAt, durationMins: 120,
    }).durationMins).toBe(30)
  })
})

describe('publicInstantFailure', () => {
  it('never exposes raw provider details', () => {
    const message = publicInstantFailure(new Error('relation appointments_secret does not exist'))
    expect(message).toBe(GENERIC_INSTANT_ERROR)
    expect(message).not.toContain('appointments_secret')
  })

  it('preserves the stable just-taken slot response', () => {
    expect(publicInstantFailure(new Error('SLOT_FULL: female'))).toBe('That slot was just taken — please pick another time.')
  })
})

describe('resolveRequestedConsultationTreatment', () => {
  it('returns a stable error when a requested treatment lookup fails', () => {
    expect(resolveRequestedConsultationTreatment({
      requested: true,
      data: null,
      error: new Error('upstream provider credentials'),
    })).toEqual({ error: GENERIC_INSTANT_ERROR })
  })

  it('allows an intentional standalone free consultation', () => {
    expect(resolveRequestedConsultationTreatment({ requested: false, data: null, error: null })).toEqual({ value: null })
  })
})
