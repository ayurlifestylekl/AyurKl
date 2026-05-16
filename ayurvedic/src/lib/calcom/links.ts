/**
 * Cal.com deep-link builders. We store the `calcom_booking_uid` on each
 * appointment when a booking is created; these URLs open Cal.com's native
 * UI in a new tab for reschedule, cancel, and view-booking flows.
 *
 * Why not the Cal.com API? — These flows require no auth token, no API
 * integration, and stay current with whatever UI Cal.com ships. The
 * trade-off is that the customer briefly leaves our domain, which is
 * acceptable for a low-frequency action.
 */

const BASE = 'https://cal.com'

export function getRescheduleUrl(uid: string): string {
  return `${BASE}/reschedule/${encodeURIComponent(uid)}`
}

export function getCancelUrl(uid: string): string {
  return `${BASE}/cancel/${encodeURIComponent(uid)}`
}

export function getBookingUrl(uid: string): string {
  return `${BASE}/booking/${encodeURIComponent(uid)}`
}
