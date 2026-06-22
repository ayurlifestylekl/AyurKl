import { describe, it, expect } from 'vitest'
import {
  canCancel,
  cancellationDeadline,
  requiredTherapistGender,
  payableAmount,
  whatsappRescheduleLink,
} from '../policy'

describe('booking policy', () => {
  const appt = '2026-06-25T10:00:00+08:00'

  it('enforces same-gender therapist matching', () => {
    expect(requiredTherapistGender('male')).toBe('male')
    expect(requiredTherapistGender('female')).toBe('female')
  })

  it('cancellation deadline is 12h before the appointment', () => {
    expect(cancellationDeadline(appt).toISOString()).toBe(
      new Date('2026-06-24T22:00:00+08:00').toISOString(),
    )
  })

  it('allows cancellation more than 12h before, blocks within 12h', () => {
    expect(canCancel(appt, new Date('2026-06-24T21:00:00+08:00'))).toBe(true)
    expect(canCancel(appt, new Date('2026-06-24T23:00:00+08:00'))).toBe(false)
  })

  it('returns full price as payable, throws when no fixed price', () => {
    expect(payableAmount(155)).toBe(155)
    expect(() => payableAmount(null)).toThrow()
  })

  it('builds a WhatsApp reschedule link with clinic number and name', () => {
    const link = whatsappRescheduleLink('Asha', appt)
    expect(link).toContain('601165043436')
    expect(decodeURIComponent(link)).toContain('Asha')
    expect(decodeURIComponent(link)).toContain('12–24 hours')
  })
})
