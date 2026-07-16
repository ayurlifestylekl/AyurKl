import { describe, expect, it } from 'vitest'
import { CONSULTATION_MINS, consultationSlots, slotIso, validateSubmittedSlot } from '../slots'

const now = new Date('2026-07-16T01:00:00.000Z').getTime() // 09:00 MYT

describe('validateSubmittedSlot', () => {
  it('accepts a generated future treatment slot', () => {
    expect(validateSubmittedSlot({
      iso: slotIso('2026-07-17', '09:30'), durationMins: 60,
      nowMs: now, leadTimeHours: 0, kind: 'treatment',
    })).toEqual({ ok: true })
  })

  it.each([
    ['invalid timestamp', 'not-a-date'],
    ['past slot', '2026-07-15T01:30:00.000Z'],
    ['misaligned slot', '2026-07-17T01:45:00.000Z'],
    ['outside opening hours', '2026-07-17T00:30:00.000Z'],
  ])('rejects %s', (_label, iso) => {
    expect(validateSubmittedSlot({ iso, durationMins: 60, nowMs: now, leadTimeHours: 0, kind: 'treatment' })).toHaveProperty('error')
  })

  it('rejects a slot inside the treatment lead time', () => {
    expect(validateSubmittedSlot({
      iso: '2026-07-16T02:30:00.000Z', durationMins: 60,
      nowMs: now, leadTimeHours: 24, kind: 'treatment',
    })).toHaveProperty('error')
  })

  it('allows only generated 30-minute consultation slots', () => {
    expect(validateSubmittedSlot({
      iso: slotIso('2026-07-17', '10:00'), durationMins: 30,
      nowMs: now, leadTimeHours: 0, kind: 'consultation',
    })).toEqual({ ok: true })
  })

  it('uses the same consultation generator for the 10:00 opening boundary', () => {
    expect(CONSULTATION_MINS).toBe(30)
    expect(consultationSlots()[0]).toBe('10:00')
    expect(consultationSlots()).not.toContain('09:30')
    expect(validateSubmittedSlot({
      iso: slotIso('2026-07-17', '09:30'), durationMins: 30,
      nowMs: now, leadTimeHours: 0, kind: 'consultation',
    })).toHaveProperty('error')
  })
})
