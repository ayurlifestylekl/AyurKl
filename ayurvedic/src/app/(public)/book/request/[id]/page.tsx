import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, Clock, CreditCard, CalendarCheck, XCircle } from 'lucide-react'

import { getBookingForPayment } from '@/lib/storefront/booking'
import { STATUS_LABEL } from '@/lib/booking/status'
import { whatsappRescheduleLink } from '@/lib/booking/policy'

export const metadata: Metadata = {
  title: 'Your booking request — Kerala Ayurvedic Lifestyle',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function BookingRequestPage({ params }: { params: { id: string } }) {
  const b = await getBookingForPayment(params.id)
  if (!b) notFound()

  const isConfirmed = ['confirmed', 'checked_in', 'in_progress', 'completed'].includes(b.status)
  const when = b.appointmentDatetime ?? b.requestedDatetime
  const whenText = when ? new Date(when).toLocaleString('en-MY', { dateStyle: 'full', timeStyle: 'short' }) : '—'
  const amount = b.payableAmountRm != null ? `RM${b.payableAmountRm}` : null

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
                sub={b.status === 'awaiting_payment' ? 'Pay to secure your slot.' : amount ? `${amount} paid` : ''}
              />
            )}
            <Step
              done={['confirmed', 'checked_in', 'in_progress', 'completed'].includes(b.status)}
              icon={CalendarCheck}
              label="Confirmed"
              sub={['confirmed', 'checked_in', 'in_progress', 'completed'].includes(b.status) ? whenText : 'Final confirmation.'}
            />
            {b.status === 'cancelled' && <Step done icon={XCircle} label="Cancelled" sub="This booking was cancelled." tone="danger" />}
          </ol>

          {/* Details */}
          <dl className="mt-7 grid grid-cols-2 gap-y-2 border-t border-accent/15 pt-5 font-body text-[13.5px]">
            <Row label="Preferred time" value={b.requestedDatetime ? new Date(b.requestedDatetime).toLocaleString('en-MY') : '—'} />
            {isConfirmed && b.appointmentDatetime && <Row label="Confirmed time" value={new Date(b.appointmentDatetime).toLocaleString('en-MY')} />}
            <Row label="Patient" value={b.patientName ?? '—'} />
            <Row label="Status" value={STATUS_LABEL[b.status]} />
            {amount && <Row label="Price" value={amount} />}
            {b.assignedTherapistName && <Row label="Therapist" value={b.assignedTherapistName} />}
          </dl>

          {/* Contextual CTA */}
          <div className="mt-7">
            {b.status === 'pending' && (
              <p className="rounded-xl bg-cream px-4 py-3 font-body text-[13.5px] text-dark/70">
                Thanks! We&apos;ll review and confirm shortly. {b.bookingKind === 'treatment' && 'Once approved, you can pay here to secure your slot.'}
              </p>
            )}
            {b.status === 'awaiting_payment' && (
              <Link
                href={`/book/request/${b.id}/pay`}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-7 font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-accent/90"
              >
                Pay {amount} to confirm
              </Link>
            )}
            {['confirmed', 'checked_in', 'in_progress', 'completed'].includes(b.status) && when && (
              <div className="space-y-3">
                <p className="rounded-xl border border-green-500/30 bg-green-50 px-4 py-3 font-body text-[13.5px] text-green-800">
                  You&apos;re confirmed for <strong>{whenText}</strong>. Same-gender therapist as requested.
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
          </div>
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
