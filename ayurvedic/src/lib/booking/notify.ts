import 'server-only'
import { sendEmail } from '@/lib/email/send'
import { sendTelegram } from '@/lib/integrations/telegram'
import { fmtMY } from '@/lib/datetime'

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
    <p style="margin:24px 0 0;color:#9a9a9a;font-size:12px">Kerala Ayurvedic Lifestyle · Brickfields, Kuala Lumpur</p>
  </div>`
  const text = `${heading}\n\n${lines.join('\n')}\n${cta ? `\n${cta.label}: ${cta.url}\n` : ''}\nKerala Ayurvedic Lifestyle · Brickfields, Kuala Lumpur`
  return { html, text }
}

export interface NotifyBase {
  to: string | null | undefined
  name?: string | null
  treatmentName?: string | null
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
        `Hi ${p.name ?? 'there'}, thank you for your group booking request for <strong>${p.guests!.length} guests</strong>:`,
        ...guestListLines(p.guests!),
        'Our team will review it shortly and confirm each slot.',
      ]
    : [
        `Hi ${p.name ?? 'there'}, thank you for your ${p.kind} request for <strong>${p.treatmentName ?? 'your appointment'}</strong>.`,
        `Preferred time: <strong>${when(p.whenISO)}</strong>.`,
        'Our team will review it shortly and confirm your slot.',
      ]
  const { html, text } = shell('We’ve received your request', lines)
  await sendEmail({ to: p.to, category: 'transactional', subject: 'Your booking request — Kerala Ayurvedic Lifestyle', html, text })
}

export async function notifyApproved(
  p: NotifyBase & { kind: string; whenISO: string | null; amountRm: number | null; payUrl: string | null; guests?: GuestLine[] },
) {
  if (!p.to) return
  const isTreatment = p.kind === 'treatment'
  const isGroup = (p.guests?.length ?? 0) > 1
  const intro = isGroup
    ? [
        `Hi ${p.name ?? 'there'}, your group booking for <strong>${p.guests!.length} guests</strong> has been approved:`,
        ...guestListLines(p.guests!),
      ]
    : [`Hi ${p.name ?? 'there'}, your ${p.kind} for <strong>${p.treatmentName ?? ''}</strong> on <strong>${when(p.whenISO)}</strong> has been approved.`]
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
  await sendEmail({ to: p.to, category: 'transactional', subject: isTreatment ? 'Approved — pay to confirm your appointment' : 'Your consultation is confirmed', html, text })
}

export async function notifyConfirmed(p: NotifyBase & { whenISO: string | null; guests?: GuestLine[] }) {
  const isGroup = (p.guests?.length ?? 0) > 1
  await sendTelegram(
    `✅ <b>Payment received — confirmed</b>\n${esc(p.name ?? 'Guest')} — ${esc(p.treatmentName ?? '')}${isGroup ? ` (group of ${p.guests!.length})` : ''}\n${esc(when(p.whenISO))}`,
  )
  await sendStaffEmail(
    'Payment received — booking confirmed',
    isGroup
      ? [`<strong>${esc(p.name ?? 'Guest')}</strong> paid for a group of ${p.guests!.length}:`, ...guestListLines(p.guests!)]
      : [`<strong>${esc(p.name ?? 'Guest')}</strong> — ${esc(p.treatmentName ?? '')}`, `Appointment: <strong>${when(p.whenISO)}</strong>`],
  )
  if (!p.to) return
  const intro = isGroup
    ? [
        `Hi ${p.name ?? 'there'}, your group booking for <strong>${p.guests!.length} guests</strong> is confirmed:`,
        ...guestListLines(p.guests!),
      ]
    : [`Hi ${p.name ?? 'there'}, your appointment for <strong>${p.treatmentName ?? ''}</strong> is confirmed for <strong>${when(p.whenISO)}</strong>.`]
  const { html, text } = shell('Your appointment is confirmed', [
    ...intro,
    'A same-gender therapist will be assigned as requested. Please arrive 10 minutes early.',
    'To reschedule, message us on WhatsApp at least 12–24 hours beforehand. Cancellations within 12 hours are non-refundable.',
  ])
  await sendEmail({ to: p.to, category: 'transactional', subject: 'Appointment confirmed — Kerala Ayurvedic Lifestyle', html, text })
}

export async function notifyPaymentReminder(p: NotifyBase & { payUrl: string; expiresISO: string | null }) {
  if (!p.to) return
  const { html, text } = shell(
    'Reminder — complete your payment',
    [
      `Hi ${p.name ?? 'there'}, your appointment for <strong>${p.treatmentName ?? ''}</strong> is approved but not yet paid.`,
      p.expiresISO
        ? `Please pay by <strong>${when(p.expiresISO)}</strong> to keep your slot — after that it will be released for others.`
        : 'Please complete payment soon to keep your slot.',
    ],
    { label: 'Pay now', url: p.payUrl },
  )
  await sendEmail({ to: p.to, category: 'transactional', subject: 'Reminder: complete your payment — Kerala Ayurvedic Lifestyle', html, text })
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
    `Hi ${p.name ?? 'there'}, your appointment for <strong>${p.treatmentName ?? ''}</strong> has been cancelled.`,
  ]
  if (p.reason) {
    lines.push(`Reason: <strong>${p.reason}</strong>`)
    lines.push('You’re welcome to choose another time and book again on our website.')
  } else {
    lines.push(
      p.refundable
        ? 'As this was cancelled in good time, any payment is eligible for a refund — our team will be in touch.'
        : 'As this was cancelled within 12 hours of the appointment, it is non-refundable per our policy.',
    )
  }
  const { html, text } = shell('Your appointment was cancelled', lines, { label: 'Book again', url: `${SITE}/book` })
  await sendEmail({ to: p.to, category: 'transactional', subject: 'Appointment cancelled — Kerala Ayurvedic Lifestyle', html, text })
}

export { SITE as BOOKING_SITE_URL }
