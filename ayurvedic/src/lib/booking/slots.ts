import { mytDayKey, mytTimeOfDay } from '@/lib/datetime'

/**
 * Customer booking slots. Opening hours 9:30 AM; the centre's last therapy must
 * finish by 8:30 PM, and no booking starts after 7:30 PM. Slots are 30 minutes.
 * The latest start therefore shifts with therapy length:
 *   1-hour  → last start 7:30 PM   ·   90-min → last start 7:00 PM
 * All times are Malaysia time (UTC+8).
 */
const OPEN_MIN = 9 * 60 + 30       // 09:30
const CLOSE_END_MIN = 20 * 60 + 30 // 20:30 — a therapy must end by here
const LAST_START_CAP = 19 * 60 + 30 // 19:30 — hard cap on the start time
const STEP = 30

export const CONSULTATION_MINS = 30

function hhmm(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

/** 30-min start times (HH:MM) bookable for a therapy of the given length. */
export function slotsForDuration(durationMins: number): string[] {
  const lastStart = Math.min(LAST_START_CAP, CLOSE_END_MIN - durationMins)
  const out: string[] = []
  for (let t = OPEN_MIN; t <= lastStart; t += STEP) out.push(hhmm(t))
  return out
}

/** Canonical Vaidya consultation starts (the consultation day begins at 10:00). */
export function consultationSlots(): string[] {
  return slotsForDuration(CONSULTATION_MINS).filter((t) => Number(t.slice(0, 2)) >= 10)
}

export function validateSubmittedSlot(input: {
  iso: string
  durationMins: number
  nowMs: number
  leadTimeHours: number
  kind: 'treatment' | 'consultation'
}): { ok: true } | { error: string } {
  const at = new Date(input.iso).getTime()
  if (!Number.isFinite(at)) return { error: 'Please choose a valid appointment time.' }
  if (at <= input.nowMs + input.leadTimeHours * 3_600_000) return { error: 'That time is too soon or has already passed.' }
  const hhmm = mytTimeOfDay(input.iso)
  const generated = input.kind === 'consultation'
    ? consultationSlots()
    : slotsForDuration(input.durationMins)
  if (!generated.includes(hhmm)) return { error: 'That time is outside the available booking schedule.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(mytDayKey(input.iso))) return { error: 'Please choose a valid appointment date.' }
  return { ok: true }
}

/** Combine a YYYY-MM-DD date + HH:MM (Malaysia time) into a UTC ISO string. */
export function slotIso(dateYMD: string, time: string): string {
  return new Date(`${dateYMD}T${time}:00+08:00`).toISOString()
}

/** Earliest bookable date (tomorrow, Malaysia) as YYYY-MM-DD — the 1-day buffer. */
export function minBookableDate(now: Date = new Date()): string {
  const start = new Date(`${mytDayKey(now)}T00:00:00+08:00`)
  start.setDate(start.getDate() + 1)
  return mytDayKey(start)
}
