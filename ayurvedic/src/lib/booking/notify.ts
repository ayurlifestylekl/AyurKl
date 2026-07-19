import 'server-only'
import { sendEmail } from '@/lib/email/send'
import { sendTelegram } from '@/lib/integrations/telegram'
import { fmtMY } from '@/lib/datetime'
import type { BookingKind } from '@/types/booking'
import { confirmationCopy } from './confirmation-copy'

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

/** Escape user-supplied text for Telegram HTML parse mode. */
function esc(s: string | null | undefined): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function when(iso: string | null | undefined): string {
  return fmtMY(iso, { dateStyle: 'full', timeStyle: 'short' })
}

function shell(heading: string, lines: string[], cta?: { label: string; url: string }): { html: string; text: string } {
  const para = lines.map((l) => `<p style="margin:0 0 12px;color:#3a3a3a;font-size:15px;line-height:1.6">${l}</p>`).join('')
  const button = cta
    ? `<a href="${cta.url}" style="display:inline-block;margin-top:8px;background:#1e5b4b;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:14px">${cta.label}</a>`
    : ''
  const html = `<div style="max-width:520px;margin:0 auto;font-family:Georgia,serif">
    <h1 style="color:#5b0f1c;font-size:22px;margin:0 0 16px">${heading}</h1>${para}${button}
    <p style="margin:20px 0 0;color:#b08a3e;font-size:12.5px">Don&rsquo;t see this in your inbox next time? Please check your Spam / Junk folder — some mail providers file us there.</p>
    <p style="margin:8px 0 0;color:#9a9a9a;font-size:12px">Kerala Ayurvedic Lifestyle · Brickfields, Kuala Lumpur</p>
  </div>`
  const text = `${heading}\n\n${lines.join('\n')}\n${cta ? `\n${cta.label}: ${cta.url}\n` : ''}\nDon't see this in your inbox next time? Please check your Spam / Junk folder — some mail providers file us there.\nKerala Ayurvedic Lifestyle · Brickfields, Kuala Lumpur`
  return { html, text }
}

export interface NotifyBase {
  to: string | null | undefined
  name?: string | null
  treatmentName?: string | null
}

export async function notifyGuestManagementOtp({ to, code }: { to: string; code: string }): Promise<boolean> {
  const { html, text } = shell('Your booking access code', [
    `Use this six-digit code to recover access to your bookings: <strong>${esc(code)}</strong>.`,
    'This code expires in 10 minutes. If you did not request it, you can ignore this email.',
  ])
  const result = await sendEmail({
    to,
    category: 'transactional',
    subject: 'Your booking access code — Kerala Ayurvedic Lifestyle',
    html,
    text,
  })
  return result.sent
}

/** One guest in a group booking, as shown in group emails. */
export interface GuestLine {
  name: string | null
  age: number | null
  treatmentName: string | null
  /** This guest's own slot — guests in a group may book different times. */
  whenISO?: string | null
}

function guestListLines(guests: GuestLine[]): string[] {
  return guests.map((g) => {
    const who = `${esc(g.name ?? 'Guest')}${g.age != null ? `, ${g.age}` : ''}`
    const slot = g.whenISO ? ` — ${fmtMY(g.whenISO, { dateStyle: 'medium', timeStyle: 'short' })}` : ''
    return `• <strong>${who}</strong> — ${esc(g.treatmentName ?? 'Treatment')}${slot}`
  })
}

/**
 * Mirror a staff Telegram alert to the clinic inbox (STAFF_NOTIFY_EMAIL).
 * Fire-and-forget: a missing config or mail failure never blocks a booking.
 */
async function sendStaffEmail(subject: string, lines: string[]): Promise<void> {
  const to = process.env.STAFF_NOTIFY_EMAIL
  if (!to) return
  try {
    const { html, text } = shell(subject, lines, { label: 'Open booking console', url: `${SITE}/console` })
    await sendEmail({ to, category: 'transactional', subject: `${subject} — Kerala Ayurvedic bookings`, html, text })
  } catch (e) {
    console.error('[notify] staff email failed:', e)
  }
}

/**
 * Send a customer-facing transactional email. `sendEmail` swallows SMTP
 * failures internally (so a mail outage never blocks a booking), which means
 * a genuinely failed send was previously silent — nobody found out until the
 * customer complained that they never got their approval email. Any failure
 * here now alerts staff on Telegram immediately so they can follow up by
 * WhatsApp instead.
 */
async function sendCustomerEmail(args: {
  to: string
  subject: string
  html: string
  text: string
  context: string
  name?: string | null
}): Promise<void> {
  const res = await sendEmail({ to: args.to, category: 'transactional', subject: args.subject, html: args.html, text: args.text })
  if (!res.sent) {
    await sendTelegram(
      `📧⚠️ <b>Email to customer FAILED to send</b>\n${esc(args.name ?? 'Guest')} — ${esc(args.to)}\nCouldn't send: ${esc(args.context)}\nPlease follow up directly on WhatsApp.`,
    )
  }
}

export async function notifyRequestReceived(p: NotifyBase & { kind: string; whenISO: string | null; guests?: GuestLine[] }) {
  const isGroup = (p.guests?.length ?? 0) > 1
  await sendTelegram(
    isGroup
      ? `🆕 <b>New group request — ${p.guests!.length} guests</b>\n${p.guests!
          .map((g) => `${esc(g.name ?? 'Guest')} — ${esc(g.treatmentName ?? '')} — ${esc(fmtMY(g.whenISO ?? null, { dateStyle: 'medium', timeStyle: 'short' }))}`)
          .join('\n')}`
      : `🆕 <b>New ${esc(p.kind)} request</b>\n${esc(p.name ?? 'Guest')} — ${esc(p.treatmentName ?? '')}\nPreferred: ${esc(when(p.whenISO))}`,
  )
  await sendStaffEmail(
    isGroup ? `New group request — ${p.guests!.length} guests` : `New ${p.kind} request`,
    isGroup
      ? guestListLines(p.guests!)
      : [`<strong>${esc(p.name ?? 'Guest')}</strong> — ${esc(p.treatmentName ?? '')}`, `Preferred: <strong>${when(p.whenISO)}</strong>`],
  )
  if (!p.to) return
  const lines = isGroup
    ? [
        `Hi ${esc(p.name ?? 'there')}, thank you for your group booking request for <strong>${p.guests!.length} guests</strong>:`,
        ...guestListLines(p.guests!),
        'Our team will review it shortly and confirm each slot.',
      ]
    : [
        `Hi ${esc(p.name ?? 'there')}, thank you for your ${esc(p.kind)} request for <strong>${esc(p.treatmentName ?? 'your appointment')}</strong>.`,
        `Preferred time: <strong>${when(p.whenISO)}</strong>.`,
        'Our team will review it shortly and confirm your slot.',
      ]
  const { html, text } = shell('We’ve received your request', lines)
  await sendCustomerEmail({ to: p.to, subject: 'Your booking request — Kerala Ayurvedic Lifestyle', html, text, context: 'request received', name: p.name })
}

export async function notifyApproved(
  p: NotifyBase & { kind: string; whenISO: string | null; amountRm: number | null; payUrl: string | null; guests?: GuestLine[] },
) {
  if (!p.to) return
  const isTreatment = p.kind === 'treatment'
  const isGroup = (p.guests?.length ?? 0) > 1
  const intro = isGroup
    ? [
        `Hi ${esc(p.name ?? 'there')}, your group booking for <strong>${p.guests!.length} guests</strong> has been approved:`,
        ...guestListLines(p.guests!),
      ]
    : [`Hi ${esc(p.name ?? 'there')}, your ${esc(p.kind)} for <strong>${esc(p.treatmentName ?? '')}</strong> on <strong>${when(p.whenISO)}</strong> has been approved.`]
  const { html, text } = shell(
    isTreatment ? 'Approved — please complete payment' : 'Your consultation is confirmed',
    [
      ...intro,
      isTreatment && p.amountRm != null
        ? `Please pay <strong>RM${p.amountRm}</strong>${isGroup ? ' (total for the group)' : ''} to secure your appointment.`
        : 'We look forward to seeing you.',
    ],
    isTreatment && p.payUrl ? { label: `Pay RM${p.amountRm}`, url: p.payUrl } : undefined,
  )
  await sendCustomerEmail({
    to: p.to,
    subject: isTreatment ? 'Approved — pay to confirm your appointment' : 'Your consultation is confirmed',
    html,
    text,
    context: isTreatment ? 'approval + payment link' : 'consultation confirmed',
    name: p.name,
  })
}

export async function notifyConfirmed(p: NotifyBase & { whenISO: string | null; guests?: GuestLine[]; bookingKind: BookingKind; statusUrl?: string | null }) {
  const isGroup = (p.guests?.length ?? 0) > 1
  const copy = confirmationCopy(p.bookingKind)
  await sendTelegram(
    `${copy.telegramHeading}\n${esc(p.name ?? 'Guest')} — ${esc(p.treatmentName ?? '')}${isGroup ? ` (group of ${p.guests!.length})` : ''}\n${esc(when(p.whenISO))}${copy.needsAssignment ? '\n👉 Assign a therapist in the console.' : ''}`,
  )
  await sendStaffEmail(
    copy.staffHeading,
    isGroup
      ? [
          `<strong>${esc(p.name ?? 'Guest')}</strong> — group of ${p.guests!.length}:`,
          ...guestListLines(p.guests!),
          ...(copy.needsAssignment ? ['No therapist is assigned yet — please assign one per guest in the console.'] : []),
        ]
      : [
          `<strong>${esc(p.name ?? 'Guest')}</strong> — ${esc(p.treatmentName ?? '')}`,
          `Appointment: <strong>${when(p.whenISO)}</strong>`,
          ...(copy.needsAssignment ? ['No therapist is assigned yet — please assign one in the console.'] : []),
        ],
  )
  if (!p.to) return
  let lines: string[]
  if (p.bookingKind === 'consultation') {
    lines = copy.customerLines.map((line) =>
      line
        .replaceAll('{name}', esc(p.name ?? 'there'))
        .replaceAll('{treatment}', esc(p.treatmentName ?? 'your appointment'))
        .replaceAll('{when}', when(p.whenISO))
    )
  } else {
    const intro = isGroup
      ? [
          `Hi ${esc(p.name ?? 'there')}, your group booking for <strong>${p.guests!.length} guests</strong> is confirmed:`,
          ...guestListLines(p.guests!),
        ]
      : [`Hi ${esc(p.name ?? 'there')}, your appointment for <strong>${esc(p.treatmentName ?? '')}</strong> is confirmed for <strong>${when(p.whenISO)}</strong>.`]
    lines = [...intro, ...copy.customerLines]
  }
  const { html, text } = shell(
    copy.customerHeading,
    [
      ...lines,
      p.bookingKind === 'consultation'
        ? 'You can manage or reschedule your booking online up to 24 hours beforehand.'
        : 'You can manage or reschedule your booking online. Late cancellations are non-refundable.',
    ],
    p.statusUrl ? { label: 'Manage booking', url: p.statusUrl } : undefined,
  )
  await sendCustomerEmail({
    to: p.to,
    subject: `${copy.customerHeading} — Kerala Ayurvedic Lifestyle`,
    html,
    text,
    context: p.bookingKind === 'consultation' ? 'consultation confirmed' : 'payment confirmed',
    name: p.name,
  })
}

/**
 * URGENT staff alert: money arrived for a booking that can't be confirmed
 * (e.g. it was already cancelled/rejected when the payment settled). Someone
 * must review and refund the same day — this must never be silent.
 */
export async function notifyPaymentProblem(p: {
  billId: string
  name?: string | null
  treatmentName?: string | null
  bookingStatus: string
}) {
  await sendTelegram(
    `⚠️ <b>Payment received but NOT confirmed — action needed</b>\n${esc(p.name ?? 'Guest')} — ${esc(p.treatmentName ?? '')}\nBooking status: ${esc(p.bookingStatus)} · Bill: ${esc(p.billId)}\nReview in Billplz and refund or manually confirm.`,
  )
  await sendStaffEmail('Payment received but NOT confirmed — action needed', [
    `<strong>${esc(p.name ?? 'Guest')}</strong> — ${esc(p.treatmentName ?? '')}`,
    `The booking is <strong>${esc(p.bookingStatus)}</strong>, so the payment could not confirm it.`,
    `Billplz bill: <strong>${esc(p.billId)}</strong>. Please review and refund, or contact the customer to rebook.`,
  ])
}

/**
 * A provider bill exists but could not be associated with exactly the expected
 * appointment rows. The URL is never shown to the customer; staff still need
 * the bill ID in case provider-side deactivation did not succeed.
 */
export async function notifyPaymentAssociationProblem(p: {
  billId: string
  name?: string | null
  treatmentName?: string | null
}) {
  await sendTelegram(
    `⚠️ <b>Payment bill was NOT activated — review needed</b>\n${esc(p.name ?? 'Guest')} — ${esc(p.treatmentName ?? '')}\nBill: ${esc(p.billId)}\nThe booking rows could not be linked safely. Confirm the bill is inactive in the provider dashboard.`,
  )
  await sendStaffEmail('Payment bill was NOT activated — review needed', [
    `<strong>${esc(p.name ?? 'Guest')}</strong> — ${esc(p.treatmentName ?? '')}`,
    `Bill <strong>${esc(p.billId)}</strong> could not be linked to exactly the expected booking rows.`,
    'The customer was not shown the payment URL. Confirm the bill is inactive in the provider dashboard.',
  ])
}

export async function notifyPaymentReminder(p: NotifyBase & { payUrl: string; expiresISO: string | null }) {
  if (!p.to) return
  const { html, text } = shell(
    'Reminder — complete your payment',
    [
      `Hi ${esc(p.name ?? 'there')}, your appointment for <strong>${esc(p.treatmentName ?? '')}</strong> is approved but not yet paid.`,
      p.expiresISO
        ? `Please pay by <strong>${when(p.expiresISO)}</strong> to keep your slot — after that it will be released for others.`
        : 'Please complete payment soon to keep your slot.',
    ],
    { label: 'Pay now', url: p.payUrl },
  )
  await sendCustomerEmail({ to: p.to, subject: 'Reminder: complete your payment — Kerala Ayurvedic Lifestyle', html, text, context: 'payment reminder', name: p.name })
}

export async function notifyCancelled(p: NotifyBase & { refundable: boolean; reason?: string }) {
  await sendTelegram(
    `❌ <b>Cancelled</b>\n${esc(p.name ?? 'Guest')} — ${esc(p.treatmentName ?? '')}${p.reason ? `\nReason: ${esc(p.reason)}` : ''}`,
  )
  await sendStaffEmail('Booking cancelled', [
    `<strong>${esc(p.name ?? 'Guest')}</strong> — ${esc(p.treatmentName ?? '')}`,
    ...(p.reason ? [`Reason: ${esc(p.reason)}`] : []),
  ])
  if (!p.to) return
  const lines = [
    `Hi ${esc(p.name ?? 'there')}, your appointment for <strong>${esc(p.treatmentName ?? '')}</strong> has been cancelled.`,
  ]
  if (p.reason) {
    lines.push(`Reason: <strong>${esc(p.reason)}</strong>`)
    lines.push('You’re welcome to choose another time and book again on our website.')
  } else {
    lines.push(
      p.refundable
        ? 'As this was cancelled in good time, any payment is eligible for a refund — our team will be in touch.'
        : 'No automatic refund was issued for this cancellation.',
    )
  }
  const { html, text } = shell('Your appointment was cancelled', lines, { label: 'Book again', url: `${SITE}/book` })
  await sendCustomerEmail({ to: p.to, subject: 'Appointment cancelled — Kerala Ayurvedic Lifestyle', html, text, context: 'cancellation notice', name: p.name })
}

export async function notifyManagedCancellation(p: NotifyBase & {
  refundRequired: boolean
  refundResults?: { appointmentId: string; refundStatus: string }[]
}) {
  const hasRefund = p.refundRequired && (p.refundResults?.length ?? 0) > 0
  const allConfirmed = hasRefund && p.refundResults!.every((r) => r.refundStatus === 'confirmed')
  const anyException = hasRefund && p.refundResults!.some((r) => r.refundStatus === 'exception')

  const refundSummary = !hasRefund
    ? 'No refund required (unpaid booking).'
    : allConfirmed
      ? 'Refund confirmed by provider.'
      : anyException
        ? 'Refund needs staff review.'
        : 'Refund request submitted — pending provider confirmation.'

  await sendTelegram(
    `❌ <b>Managed cancellation</b>\n${esc(p.name ?? 'Guest')} — ${esc(p.treatmentName ?? '')}\n${esc(refundSummary)}`,
  )
  await sendStaffEmail('Managed booking cancellation', [
    `<strong>${esc(p.name ?? 'Guest')}</strong> — ${esc(p.treatmentName ?? '')}`,
    esc(refundSummary),
  ])
  if (!p.to) return
  const lines = [
    `Hi ${esc(p.name ?? 'there')}, your appointment for <strong>${esc(p.treatmentName ?? '')}</strong> has been cancelled.`,
    !hasRefund
      ? 'As this booking was not yet paid, no refund is required.'
      : allConfirmed
        ? 'Your refund has been confirmed and will be returned through the original payment method.'
        : anyException
          ? 'Our team is reviewing your refund and will be in touch shortly.'
          : 'Your refund request is being processed. You will receive a confirmation once it is complete.',
  ]
  const { html, text } = shell('Your appointment has been cancelled', lines, { label: 'Book again', url: `${SITE}/book` })
  await sendCustomerEmail({ to: p.to, subject: 'Appointment cancelled — Kerala Ayurvedic Lifestyle', html, text, context: 'managed cancellation', name: p.name })
}

export async function notifyManagedReschedule(p: NotifyBase & {
  oldISO: string | null
  newISO: string | null
  bookingKind: BookingKind
  statusUrl?: string | null
}) {
  const clearedAssignment = p.bookingKind === 'treatment'

  await sendTelegram(
    `🔁 <b>Rescheduled</b>\n${esc(p.name ?? 'Guest')} — ${esc(p.treatmentName ?? '')}\n${esc(when(p.oldISO))} → ${esc(when(p.newISO))}` +
      (clearedAssignment ? '\nTherapist assignment cleared — back in Needs therapist.' : ''),
  )
  await sendStaffEmail('Managed booking reschedule', [
    `<strong>${esc(p.name ?? 'Guest')}</strong> — ${esc(p.treatmentName ?? '')}`,
    `${esc(when(p.oldISO))} → ${esc(when(p.newISO))}`,
    ...(clearedAssignment ? ['Therapist assignment cleared — booking returned to Needs therapist.'] : []),
  ])
  if (!p.to) return
  const lines = [
    `Hi ${esc(p.name ?? 'there')}, your appointment for <strong>${esc(p.treatmentName ?? '')}</strong> has been rescheduled.`,
    `New time: <strong>${when(p.newISO)}</strong> (previously ${when(p.oldISO)}).`,
    p.bookingKind === 'consultation'
      ? 'Your consultation remains free and confirmed.'
      : 'Your booking remains confirmed and paid — a therapist will be assigned for your new time before your visit.',
  ]
  const { html, text } = shell(
    'Your appointment has been rescheduled',
    lines,
    p.statusUrl ? { label: 'Manage booking', url: p.statusUrl } : undefined,
  )
  await sendCustomerEmail({ to: p.to, subject: 'Appointment rescheduled — Kerala Ayurvedic Lifestyle', html, text, context: 'managed reschedule', name: p.name })
}

export { SITE as BOOKING_SITE_URL }
