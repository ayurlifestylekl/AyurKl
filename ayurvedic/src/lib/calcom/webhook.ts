import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

export type CalEventType = 'BOOKING_CREATED' | 'BOOKING_CANCELLED' | 'BOOKING_RESCHEDULED'

export interface CalAttendee { name: string; email: string; timeZone?: string }

export interface CalBookingPayload {
  type: CalEventType
  bookingId?: number
  uid: string                           // matches our appointments.calcom_booking_uid
  startTime: string                     // ISO
  endTime: string                       // ISO
  title?: string                        // event title
  attendees: CalAttendee[]
  organizer?: { name?: string; email?: string }
  eventTypeId?: number
  eventTypeSlug?: string
  metadata?: Record<string, unknown>
  /** Present on cancel/reschedule events */
  status?: 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED'
  cancellationReason?: string
}

export interface CalWebhookEnvelope {
  triggerEvent: CalEventType
  createdAt: string
  payload: CalBookingPayload
}

export function verifyCalSignature(rawBody: string, headerSignature: string | null, secret: string): boolean {
  if (!headerSignature) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  // Length must match before timingSafeEqual or Node throws.
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(headerSignature, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
