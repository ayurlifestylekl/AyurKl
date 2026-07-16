import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, Clock, CreditCard, CalendarCheck, XCircle } from 'lucide-react'

import { getBookingForPayment, getGroupMembers } from '@/lib/storefront/booking'
import { reconcileAppointment } from '@/lib/booking/payment'
import { sweepExpiredBookingsSafe } from '@/lib/booking/expiry'
import { isCardPaymentEnabled } from '@/lib/payments'
import { STATUS_LABEL } from '@/lib/booking/status'
import { whatsappRescheduleLink } from '@/lib/booking/policy'
import { canAccessBooking } from '@/lib/booking/access'
import { fmtMY } from '@/lib/datetime'
import CancelBookingButton from '@/components/booking/CancelBookingButton'

export const metadata: Metadata = {
  title: 'Your booking request — Kerala Ayurvedic Lifestyle',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function BookingRequestPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { t?: string; payerror?: string }
}) {
  let b = await getBookingForPayment(params.id)
  if (!b) notFound()
  const token = searchParams.t
  if (!(await canAccessBooking(b.id, b.customerId, token))) notFound()
  const tokenQuery = token ? `?t=${token}` : ''

  // Self-heal: if the customer is back from the gateway but the webhook hasn't
  // confirmed yet (missed or failed signature), verify with the provider's API
  // and confirm here so a paid booking is never left hanging. Likewise, an
  // overdue hold is expired on view so the page never shows a payable booking
  // whose window has actually closed.
  if (b.status === 'awaiting_payment') {
    const reconciled = await reconcileAppointment(params.id)
    if (reconciled === 'confirmed') {
      b = (await getBookingForPayment(params.id)) ?? b
    } else {
      const swept = await sweepExpiredBookingsSafe()
      if (swept && swept.expired > 0) b = (await getBookingForPayment(params.id)) ?? b
    }
  }

  // Group bookings: load all guests for the combined view + payment.
  const members = b.groupId ? await getGroupMembers(b.groupId) : []
  const isGroup = members.length > 1
  const groupTotal = isGroup ? members.reduce((s, m) => s + (m.payableAmountRm ?? 0), 0) : null
  const groupAllAwaiting = isGroup && members.every((m) => m.status === 'awaiting_payment')

  const isConfirmed = ['confirmed', 'checked_in', 'in_progress', 'completed'].includes(b.status)
  const when = b.appointmentDatetime ?? b.requestedDatetime
  const whenText = fmtMY(when, { dateStyle: 'full', timeStyle: 'short' })
  const amount = isGroup
    ? groupTotal != null
      ? `RM${groupTotal}`
      : null
    : b.payableAmountRm != null
      ? `RM${b.payableAmountRm}`
      : null

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-cream">
      <div className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
        <Link href="/book" className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary/55 hover:text-primary">
          ← Back to booking
        </Link>

        <div className="mt-6 rounded-2xl border border-accent/30 bg-white p-7 shadow-elevated sm:p-9">
          <div className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
            {b.bookingKind === 'consultation' ? 'Consultation request' : 'Treatment request'}
          </div>
          <h1 className="mt-1 font-heading text-[26px] font-extrabold leading-tight text-primary">
            {b.treatmentName ?? 'Your appointment'}
          </h1>

          {/* Status timeline */}
          <ol className="mt-6 space-y-3">
            <Step done icon={CheckCircle2} label="Request received" sub="We have your preferred time." />
            <Step
              done={['awaiting_payment', 'confirmed', 'checked_in', 'in_progress', 'completed'].includes(b.status)}
              icon={Clock}
              label="Clinic approval"
              sub={b.status === 'pending' ? 'Our team is reviewing your request.' : 'Approved by our clinic.'}
            />
            {b.bookingKind === 'treatment' && (
              <Step
                done={['confirmed', 'checked_in', 'in_progress', 'completed'].includes(b.status)}
                icon={CreditCard}
                label="Payment"
                sub={b.status === 'awaiting_payment' ? 'Pay to secure your slot.' : isConfirmed && amount ? `${amount} paid` : amount ? `${amount} due after approval` : ''}
              />
            )}
            <Step
              done={['confirmed', 'checked_in', 'in_progress', 'completed'].includes(b.status)}
              icon={CalendarCheck}
              label="Confirmed"
              sub={['confirmed', 'checked_in', 'in_progress', 'completed'].includes(b.status) ? (isGroup ? 'Each guest’s time is listed below.' : whenText) : 'Final confirmation.'}
            />
            {b.status === 'cancelled' && <Step done icon={XCircle} label="Cancelled" sub={b.cancellationReason || 'This booking was cancelled.'} tone="danger" />}
          </ol>

          {/* Details */}
          <dl className="mt-7 grid grid-cols-2 gap-y-2 border-t border-accent/15 pt-5 font-body text-[13.5px]">
            {!isGroup && <Row label="Preferred time" value={fmtMY(b.requestedDatetime, { dateStyle: 'full', timeStyle: 'short' })} />}
            {!isGroup && isConfirmed && b.appointmentDatetime && <Row label="Confirmed time" value={fmtMY(b.appointmentDatetime, { dateStyle: 'full', timeStyle: 'short' })} />}
            {isGroup ? <Row label="Guests" value={`${members.length} guests`} /> : <Row label="Guest" value={b.patientName ?? '—'} />}
            <Row label="Status" value={STATUS_LABEL[b.status]} />
            {amount && <Row label={isGroup ? 'Total' : 'Price'} value={amount} />}
            {!isGroup && b.assignedTherapistName && <Row label="Therapist" value={b.assignedTherapistName} />}
          </dl>

          {isGroup && (
            <div className="mt-4 rounded-xl border border-accent/15 bg-cream/40 p-4">
              <div className="mb-2 font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-accent">Group guests — each has their own time</div>
              <ul className="space-y-2">
                {members.map((m) => (
                  <li key={m.id} className="flex items-start justify-between gap-2 font-body text-[13px]">
                    <span className="min-w-0">
                      <span className="text-dark/80">{m.patientName ?? '—'} <span className="text-dark/45">· {m.patientGender}</span></span>
                      <span className="block text-[12px] text-dark/55">{m.treatmentName ?? ''}</span>
                      <span className="block text-[12px] font-semibold text-dark/75">
                        {fmtMY(m.appointmentDatetime ?? m.requestedDatetime, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </span>
                    <span className="flex-none font-heading text-[10px] uppercase tracking-[0.1em] text-dark/55">{STATUS_LABEL[m.status]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contextual CTA */}
          <div className="mt-7">
            {searchParams.payerror && b.status === 'awaiting_payment' && (
              <p className="mb-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-body text-[13.5px] text-red-800">
                The payment couldn&apos;t be started just now. Please try again below — if it keeps happening, message us on WhatsApp and we&apos;ll send you a payment link directly.
              </p>
            )}
            {b.status === 'pending' && (
              <p className="rounded-xl bg-cream px-4 py-3 font-body text-[13.5px] text-dark/70">
                Thanks! We&apos;ll review and confirm shortly.{' '}
                {b.bookingKind === 'treatment' && 'Once approved, we’ll email you a payment link to secure your slot — you can also pay right here on this page.'}
                {' '}Bookmark this page and check back — if our email doesn&apos;t reach you (please check Spam/Junk too), you can still see your status and pay right here.
              </p>
            )}
            {b.status === 'awaiting_payment' && (!isGroup || groupAllAwaiting) && (
              <p className="mb-3 font-body text-[12.5px] italic text-dark/55">
                Good news — this has been approved! If our approval email didn&apos;t reach you (do check Spam/Junk), you can pay right here.
              </p>
            )}
            {b.status === 'awaiting_payment' &&
              (isGroup && !groupAllAwaiting ? (
                <p className="rounded-xl bg-cream px-4 py-3 font-body text-[13.5px] text-dark/70">
                  Some guests are still being approved. You&apos;ll be able to pay for the group once every guest is approved.
                </p>
              ) : isCardPaymentEnabled() ? (
                <div className="space-y-2.5">
                  <Link
                    href={`/book/request/${b.id}/pay${tokenQuery}`}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-7 font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-accent/90"
                  >
                    Pay {amount} — Online Banking (FPX)
                  </Link>
                  <Link
                    href={`/book/request/${b.id}/pay${tokenQuery ? `${tokenQuery}&` : '?'}method=card`}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-accent/40 px-7 font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-primary transition-colors hover:bg-accent/5"
                  >
                    Pay {amount} — Credit / Debit Card
                  </Link>
                  <p className="text-center font-body text-[11.5px] italic text-dark/50">
                    No Malaysian bank account? Use the card option — it works with any international card.
                  </p>
                </div>
              ) : (
                <Link
                  href={`/book/request/${b.id}/pay${tokenQuery}`}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-7 font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-accent/90"
                >
                  Pay {amount} to confirm
                </Link>
              ))}
            {['confirmed', 'checked_in', 'in_progress', 'completed'].includes(b.status) && when && (
              <div className="space-y-3">
                {/* The Vaidya cleared this consultation — close the loop by letting
                    the customer book the actual treatment right from here. */}
                {b.bookingKind === 'consultation' && b.treatmentUnlocked && (
                  <div className="rounded-xl border border-accent/40 bg-cream px-4 py-4">
                    <p className="font-body text-[13.5px] text-dark/80">
                      Good news — our Vaidya has cleared you for treatment. You can now book and pay for your therapy.
                    </p>
                    <Link
                      href={`/book/treatment?from=${b.id}&ct=${token ?? ''}${b.treatmentId ? `&id=${b.treatmentId}` : ''}`}
                      className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-accent px-6 font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-accent/90"
                    >
                      Book your treatment →
                    </Link>
                  </div>
                )}
                <p className="rounded-xl border border-green-500/30 bg-green-50 px-4 py-3 font-body text-[13.5px] text-green-800">
                  {isGroup
                    ? <>Your group booking is confirmed — each guest&apos;s time is listed above. Same-gender therapists as requested.</>
                    : <>You&apos;re confirmed for <strong>{whenText}</strong>. Same-gender therapist as requested.</>}
                </p>
                <a
                  href={whatsappRescheduleLink(b.patientName ?? 'there', when)}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-primary/40 px-6 py-3 font-heading text-[10.5px] font-bold uppercase tracking-[0.2em] text-primary hover:bg-primary/5"
                >
                  Reschedule via WhatsApp
                </a>
                <p className="text-center font-body text-[11.5px] italic text-dark/55">
                  Cancellations within 12 hours of your appointment are non-refundable.
                </p>
              </div>
            )}
            {b.status === 'cancelled' && (
              <div className="space-y-3">
                <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-body text-[13.5px] text-red-800">
                  This booking was cancelled.{b.cancellationReason ? ` Reason: ${b.cancellationReason}` : ''}
                </p>
                <Link
                  href="/book"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent px-7 font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-accent/90"
                >
                  Book again
                </Link>
              </div>
            )}
          </div>

          {['pending', 'awaiting_payment', 'confirmed'].includes(b.status) && (
            <div className="mt-4 border-t border-accent/15 pt-4">
              <CancelBookingButton id={b.id} token={token} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Step({
  done, icon: Icon, label, sub, tone = 'normal',
}: { done: boolean; icon: React.ComponentType<{ className?: string }>; label: string; sub?: string; tone?: 'normal' | 'danger' }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className={`mt-0.5 h-5 w-5 flex-none ${tone === 'danger' ? 'text-red-500' : done ? 'text-accent' : 'text-dark/25'}`} />
      <div>
        <div className={`font-heading text-[13px] font-bold ${done || tone === 'danger' ? 'text-primary' : 'text-dark/45'}`}>{label}</div>
        {sub && <div className="font-body text-[12.5px] text-dark/55">{sub}</div>}
      </div>
    </li>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-dark/50">{label}</dt>
      <dd className="text-right font-semibold text-dark">{value}</dd>
    </>
  )
}
