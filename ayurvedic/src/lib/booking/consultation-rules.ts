import type { BookingKind, BookingStatus } from '@/types/booking'

export function canClearConsultation(input: {
  bookingKind: BookingKind
  status: BookingStatus
  appointmentISO: string | null
  nowMs: number
}): boolean {
  if (input.bookingKind !== 'consultation' || !input.appointmentISO) return false
  if (!['checked_in', 'in_progress', 'completed'].includes(input.status)) return false
  const at = new Date(input.appointmentISO).getTime()
  return Number.isFinite(at) && at <= input.nowMs
}

export function canLinkTreatmentToConsultation(input: {
  bookingKind: BookingKind
  treatmentUnlocked: boolean
  accessGranted: boolean
}): boolean {
  return input.bookingKind === 'consultation' && input.treatmentUnlocked && input.accessGranted
}
