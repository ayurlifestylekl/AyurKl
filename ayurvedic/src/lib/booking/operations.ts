import type { BookingKind, BookingStatus } from '@/types/booking'

interface OperationalTransitionInput {
  bookingKind: BookingKind
  assignedTherapistCode: string | null
  to: BookingStatus
}

export const ASSIGN_THERAPIST_FIRST = 'Assign a therapist first'
export const OPERATIONAL_ASSIGNMENT_ERROR = 'Assign a therapist before checking in or starting this treatment.'
export const OPERATIONAL_ASSIGNMENT_INVARIANT = 'treatment_operational_assignment_required'
export const OPERATIONAL_STATUS_CONFLICT_ERROR = 'Appointment status changed. Refresh and try again.'

export function validateOperationalTransition(input: OperationalTransitionInput): { ok: true } | { error: string } {
  if (
    input.bookingKind === 'treatment'
    && (input.to === 'checked_in' || input.to === 'in_progress')
    && !input.assignedTherapistCode?.trim()
  ) {
    return { error: OPERATIONAL_ASSIGNMENT_ERROR }
  }
  return { ok: true }
}

export function getOperationalTransitionOffer(input: OperationalTransitionInput):
  | { offered: true; message: null }
  | { offered: false; message: string } {
  const transition = validateOperationalTransition(input)
  if ('error' in transition) return { offered: false, message: ASSIGN_THERAPIST_FIRST }
  return { offered: true, message: null }
}

export function mapOperationalTransitionWriteFailure(input: {
  error: { code?: string; message: string } | null
  updated: boolean
}): string | null {
  if (input.error?.message.includes(OPERATIONAL_ASSIGNMENT_INVARIANT)) {
    return OPERATIONAL_ASSIGNMENT_ERROR
  }
  if (input.error) return input.error.message
  if (!input.updated) return OPERATIONAL_STATUS_CONFLICT_ERROR
  return null
}
