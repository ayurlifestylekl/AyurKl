import type { Gender } from '@/types/booking'
import { RESCHEDULE_CUTOFF_MS } from '@/lib/booking/management-policy'

/** @deprecated Compatibility cutoff until callers move to managementEligibility. */
export const CANCEL_WINDOW_MS = RESCHEDULE_CUTOFF_MS / 2

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

/** DB enum value (gender_requirement_enum) for the same-gender policy. */
export function genderRequirementValue(patientGender: Gender): 'men_only' | 'ladies_only' {
  return patientGender === 'male' ? 'men_only' : 'ladies_only'
}

/** True if a therapist of `therapist` gender satisfies the appointment's requirement. */
export function therapistMatchesRequirement(
  therapist: Gender,
  requirement: string | null,
): boolean {
  if (!requirement || requirement === 'any') return true
  return (
    (requirement === 'men_only' && therapist === 'male') ||
    (requirement === 'ladies_only' && therapist === 'female')
  )
}

/** Full treatment price is payable. Throws for consultation/enquiry (no fixed price). */
export function payableAmount(priceRm: number | null): number {
  if (priceRm == null) throw new Error('No fixed price; not directly payable')
  return priceRm
}

/** @deprecated Use managementEligibility with a trusted server clock. */
export function cancellationDeadline(apptISO: string): Date {
  return new Date(new Date(apptISO).getTime() - CANCEL_WINDOW_MS)
}

/** @deprecated Use managementEligibility with a trusted server clock. */
export function canCancel(apptISO: string, now: Date): boolean {
  return now.getTime() <= cancellationDeadline(apptISO).getTime()
}

/** Pre-filled WhatsApp reschedule link (reschedules go through WhatsApp, 12–24h notice). */
export function whatsappRescheduleLink(name: string, apptISO: string): string {
  const when = new Date(apptISO).toLocaleString('en-MY')
  const msg = `Hi, this is ${name}. I'd like to reschedule my appointment on ${when}. I understand at least 12–24 hours' notice is required.`
  return `https://wa.me/${CLINIC_WHATSAPP}?text=${encodeURIComponent(msg)}`
}
