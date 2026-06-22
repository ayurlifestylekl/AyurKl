import type { Gender } from '@/types/booking'

/** Cancellation cutoff: appointments cancelled within 12h are non-refundable. */
export const CANCEL_WINDOW_MS = 12 * 60 * 60 * 1000

/** Clinic WhatsApp number for rescheduling (no self-serve reschedule). */
export const CLINIC_WHATSAPP = '601165043436'

/**
 * Same-gender therapist policy: a patient is only ever matched with a
 * therapist of the same gender. The required therapist gender therefore
 * equals the patient's gender.
 */
export function requiredTherapistGender(patientGender: Gender): Gender {
  return patientGender
}

/** Full treatment price is payable. Throws for consultation/enquiry (no fixed price). */
export function payableAmount(priceRm: number | null): number {
  if (priceRm == null) throw new Error('No fixed price; not directly payable')
  return priceRm
}

/** The latest moment a booking can be cancelled with a refund (apptTime − 12h). */
export function cancellationDeadline(apptISO: string): Date {
  return new Date(new Date(apptISO).getTime() - CANCEL_WINDOW_MS)
}

/** True if `now` is on/before the 12h cancellation deadline. */
export function canCancel(apptISO: string, now: Date): boolean {
  return now.getTime() <= cancellationDeadline(apptISO).getTime()
}

/** Pre-filled WhatsApp reschedule link (reschedules go through WhatsApp, 12–24h notice). */
export function whatsappRescheduleLink(name: string, apptISO: string): string {
  const when = new Date(apptISO).toLocaleString('en-MY')
  const msg = `Hi, this is ${name}. I'd like to reschedule my appointment on ${when}. I understand at least 12–24 hours' notice is required.`
  return `https://wa.me/${CLINIC_WHATSAPP}?text=${encodeURIComponent(msg)}`
}
