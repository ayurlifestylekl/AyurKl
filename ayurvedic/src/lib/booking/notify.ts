import 'server-only'
import { sendEmail } from '@/lib/email/send'
import { fmtMY } from '@/lib/datetime'

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

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

export async function notifyRequestReceived(p: NotifyBase & { kind: string; whenISO: string | null }) {
  if (!p.to) return
  const { html, text } = shell('We’ve received your request', [
    `Hi ${p.name ?? 'there'}, thank you for your ${p.kind} request for <strong>${p.treatmentName ?? 'your appointment'}</strong>.`,
    `Preferred time: <strong>${when(p.whenISO)}</strong>.`,
    'Our team will review it shortly and confirm your slot.',
  ])
  await sendEmail({ to: p.to, category: 'transactional', subject: 'Your booking request — Kerala Ayurvedic Lifestyle', html, text })
}

export async function notifyApproved(p: NotifyBase & { kind: string; whenISO: string | null; amountRm: number | null; payUrl: string | null }) {
  if (!p.to) return
  const isTreatment = p.kind === 'treatment'
  const { html, text } = shell(
    isTreatment ? 'Approved — please complete payment' : 'Your consultation is confirmed',
    [
      `Hi ${p.name ?? 'there'}, your ${p.kind} for <strong>${p.treatmentName ?? ''}</strong> on <strong>${when(p.whenISO)}</strong> has been approved.`,
      isTreatment && p.amountRm != null ? `Please pay <strong>RM${p.amountRm}</strong> to secure your appointment.` : 'We look forward to seeing you.',
    ],
    isTreatment && p.payUrl ? { label: `Pay RM${p.amountRm}`, url: p.payUrl } : undefined,
  )
  await sendEmail({ to: p.to, category: 'transactional', subject: isTreatment ? 'Approved — pay to confirm your appointment' : 'Your consultation is confirmed', html, text })
}

export async function notifyConfirmed(p: NotifyBase & { whenISO: string | null }) {
  if (!p.to) return
  const { html, text } = shell('Your appointment is confirmed', [
    `Hi ${p.name ?? 'there'}, your appointment for <strong>${p.treatmentName ?? ''}</strong> is confirmed for <strong>${when(p.whenISO)}</strong>.`,
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
