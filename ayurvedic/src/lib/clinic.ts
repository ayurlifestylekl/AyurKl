/**
 * Single source of truth for Kerala Ayurvedic Lifestyle's contact info.
 * Used by the Messages page, OrderActions, AppointmentListCard, and more.
 *
 * The codebase has 27 inline hardcodings of the WhatsApp number — those
 * are replaced opportunistically as we touch them. This module is the
 * canonical location going forward.
 */

export const CLINIC_NAME = 'Kerala Ayurvedic Lifestyle'
export const CLINIC_LONG_NAME = 'Kerala Ayurvedic Lifestyle Vaidyasalai'

/** Bare digits, used in `wa.me/…` deep links. */
export const CLINIC_WHATSAPP = '601165043436'

/** Human format for tel: + display. */
export const CLINIC_PHONE_PRIMARY = '+60 11-6504 3436'
export const CLINIC_PHONE_ALT_1 = '+60 3-2260 3436'
export const CLINIC_PHONE_ALT_2 = '+60 3-2260 4436'

export const CLINIC_EMAIL = 'info@keralaayurvediclifestyle.com.my'

export const CLINIC_ADDRESS = 'Brickfields, Kuala Lumpur, Malaysia'
export const CLINIC_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Kerala+Ayurvedic+Lifestyle+Brickfields+Kuala+Lumpur'

/** Display-only opening hours. Update when the clinic's hours change. */
export const CLINIC_HOURS: ReadonlyArray<{ day: string; hours: string }> = [
  { day: 'Mon – Fri', hours: '9:00 am – 7:00 pm' },
  { day: 'Saturday', hours: '9:00 am – 5:00 pm' },
  { day: 'Sunday', hours: 'By appointment' },
]

/**
 * Build a wa.me deep link with optional prefilled message body.
 * Always returns a full https URL — safe to drop into href.
 */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${CLINIC_WHATSAPP}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

/** Strip the leading "+" and spaces for tel: links. */
export function telLink(phone: string = CLINIC_PHONE_PRIMARY): string {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

export function mailtoLink(subject?: string): string {
  const base = `mailto:${CLINIC_EMAIL}`
  if (!subject) return base
  return `${base}?subject=${encodeURIComponent(subject)}`
}
