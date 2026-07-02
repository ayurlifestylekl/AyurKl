/**
 * Therapist capacity: a therapist is occupied for an appointment's duration
 * plus a buffer (default 30 min) before they can take the next customer.
 */
export const THERAPIST_BUFFER_MINS = 30

export interface Slot {
  startISO: string
  durationMins: number
}

const MIN = 60 * 1000

/** End of the occupied window (treatment end + buffer). */
function occupiedEnd(s: Slot, buffer: number): number {
  return new Date(s.startISO).getTime() + (s.durationMins + buffer) * MIN
}

/**
 * Returns the first busy slot that clashes with `candidate` (their occupied
 * windows overlap), or null if the therapist is free. Buffer applies after
 * each session.
 */
export function findClash(
  candidate: Slot,
  busy: Slot[],
  buffer: number = THERAPIST_BUFFER_MINS,
): Slot | null {
  const cStart = new Date(candidate.startISO).getTime()
  const cEnd = occupiedEnd(candidate, buffer)
  for (const b of busy) {
    const bStart = new Date(b.startISO).getTime()
    const bEnd = occupiedEnd(b, buffer)
    // Overlap if each window starts before the other ends.
    if (cStart < bEnd && bStart < cEnd) return b
  }
  return null
}

/** When a clashing therapist next becomes free (treatment end + buffer). */
export function freeAtLabel(clash: Slot, buffer: number = THERAPIST_BUFFER_MINS): string {
  return new Date(occupiedEnd(clash, buffer)).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })
}

/**
 * Can every guest of one gender in a group get a DISTINCT therapist who is free
 * for that guest's own treatment length, all starting at the same slot?
 *
 * Because every guest starts together, a therapist free for a longer treatment
 * is necessarily free for any shorter one — so assigning the longest treatments
 * first (to any therapist that can take them) is an optimal greedy match: if it
 * fails, no assignment exists.
 *
 * @param therapistCodes  distinct therapist codes of the relevant gender
 * @param memberDurations each guest's treatment length, in minutes
 * @param canServe        whether a therapist is free for a treatment of `durationMins`
 */
export function canMatchParty(
  therapistCodes: string[],
  memberDurations: number[],
  canServe: (code: string, durationMins: number) => boolean,
): boolean {
  const durations = [...memberDurations].sort((a, b) => b - a)
  const used = new Set<string>()
  for (const d of durations) {
    const pick = therapistCodes.find((code) => !used.has(code) && canServe(code, d))
    if (!pick) return false
    used.add(pick)
  }
  return true
}
