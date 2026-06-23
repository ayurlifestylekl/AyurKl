import { describe, it, expect } from 'vitest'
import { findClash } from '../scheduling'
import { parseDurationMins } from '../duration'

describe('parseDurationMins', () => {
  it('parses hours + minutes', () => {
    expect(parseDurationMins('1 Hour 30 min')).toBe(90)
    expect(parseDurationMins('30 min')).toBe(30)
    expect(parseDurationMins('45 min')).toBe(45)
    expect(parseDurationMins('1 Hour')).toBe(60)
    expect(parseDurationMins('1HR 30min')).toBe(90)
  })
  it('ignores trailing day-course notes', () => {
    expect(parseDurationMins('1 Hour (3, 5, 7 or 10 days)')).toBe(60)
  })
  it('falls back when unparseable', () => {
    expect(parseDurationMins(null)).toBe(60)
    expect(parseDurationMins('see practitioner')).toBe(60)
  })
})

describe('findClash (30-min buffer)', () => {
  const busy = [{ startISO: '2026-06-25T10:00:00+08:00', durationMins: 60 }] // occupied 10:00–11:30

  it('blocks an overlapping session', () => {
    // new 11:00 +60 → overlaps the busy window
    expect(findClash({ startISO: '2026-06-25T11:00:00+08:00', durationMins: 60 }, busy)).not.toBeNull()
  })
  it('blocks a session that starts inside the buffer', () => {
    // busy frees at 11:30; new at 11:15 → clash
    expect(findClash({ startISO: '2026-06-25T11:15:00+08:00', durationMins: 60 }, busy)).not.toBeNull()
  })
  it('allows a session that starts after the buffer', () => {
    // new at 11:30 → exactly when free → no clash
    expect(findClash({ startISO: '2026-06-25T11:30:00+08:00', durationMins: 60 }, busy)).toBeNull()
  })
  it('allows a session well before', () => {
    // new 08:00 +60 → occupies 08:00–09:30, busy needs 09:30 buffer-free; busy starts 10:00 → ok
    expect(findClash({ startISO: '2026-06-25T08:00:00+08:00', durationMins: 60 }, busy)).toBeNull()
  })
})
