import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Landmark, CreditCard, ArrowLeft, ShieldCheck } from 'lucide-react'

import { getBookingForPayment, getGroupMembers } from '@/lib/storefront/booking'
import { reconcileAppointment } from '@/lib/booking/payment'
import { sweepExpiredBookingsSafe } from '@/lib/booking/expiry'
import { isCardPaymentEnabled } from '@/lib/payments'
import { canAccessBooking } from '@/lib/booking/access'
import { fmtMY } from '@/lib/datetime'
import CancelBookingButton from '@/components/booking/CancelBookingButton'
import HoldCountdown from '@/components/booking/HoldCountdown'

export const metadata: Metadata = {
  title: 'Checkout — Kerala Ayurvedic Lifestyle',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({
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
  const statusHref = `/book/request/${b.id}${tokenQuery}`

  // Self-heal, same as the status page: catch a missed webhook, and release
  // an overdue hold, before deciding what to show.
  if (b.status === 'awaiting_payment') {
    const reconciled = await reconcileAppointment(params.id)
    if (reconciled === 'confirmed') {
      b = (await getBookingForPayment(params.id)) ?? b
    } else {
      const swept = await sweepExpiredBookingsSafe()
      if (swept && swept.expired > 0) b = (await getBookingForPayment(params.id)) ?? b
    }
  }

  const members = b.groupId ? await getGroupMembers(b.groupId) : []
  const isGroup = members.length > 1
  const groupTotal = isGroup ? members.reduce((s, m) => s + (m.payableAmountRm ?? 0), 0) : null
  const groupAllAwaiting = isGroup && members.every((m) => m.status === 'awaiting_payment')

  // Nothing to check out — already paid, cancelled, still under review, or a
  // group that isn't fully approved yet. Send them to the full status page.
  if (b.status !== 'awaiting_payment' || (isGroup && !groupAllAwaiting)) {
    redirect(statusHref)
  }

  const amount = isGroup ? groupTotal : b.payableAmountRm

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-cream">
      {/* Ambient warmth — a quiet gold/burgundy glow, not a flat flood of colour. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 42% at 18% 0%, rgba(212,175,55,0.10) 0%, transparent 60%), radial-gradient(50% 38% at 100% 100%, rgba(110,16,35,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="relative mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <Link
          href={statusHref}
          className="group inline-flex items-center gap-1.5 font-heading text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary/55 transition-colors duration-300 hover:text-primary"
        >
          <ArrowLeft className="h-3 w-3 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-0.5" />
          Back to booking status
        </Link>

        <div className="relative mt-7 overflow-hidden rounded-[28px] border border-accent/25 bg-white p-8 shadow-luxe sm:p-11">
          {/* A hairline of gold along the top edge — the one flourish, kept singular. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.9), transparent)' }}
          />

          <div className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />
            <div className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent">Checkout</div>
          </div>
          <h1 className="mt-2 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.01em] text-primary sm:text-[34px]">
            {isGroup ? `Group of ${members.length}` : b.treatmentName ?? 'Your appointment'}
          </h1>

          {/* Order summary — a quiet, recessed tray rather than a flat box. */}
          <div
            className="mt-7 rounded-2xl border border-accent/15 bg-cream/50 p-5"
            style={{ boxShadow: 'inset 0 1px 3px rgba(74,12,24,0.05)' }}
          >
            {isGroup ? (
              <ul className="space-y-3">
                {members.map((m) => (
                  <li key={m.id} className="flex items-start justify-between gap-2 font-body text-[13px]">
                    <span className="min-w-0">
                      <span className="text-dark/80">{m.patientName ?? '—'}</span>
                      <span className="block text-[12px] text-dark/55">{m.treatmentName ?? ''}</span>
                      <span className="block text-[12px] font-semibold text-dark/75">
                        {fmtMY(m.appointmentDatetime ?? m.requestedDatetime, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </span>
                    <span className="flex-none font-heading text-[12px] text-dark/70">
                      {m.payableAmountRm != null ? `RM${m.payableAmountRm}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-between gap-3 font-body text-[13.5px]">
                <span className="text-dark/70">
                  {fmtMY(b.appointmentDatetime ?? b.requestedDatetime, { dateStyle: 'full', timeStyle: 'short' })}
                </span>
                <span className="font-display text-[19px] font-bold text-accent">RM{amount}</span>
              </div>
            )}
            {isGroup && (
              <div className="mt-4 flex items-center justify-between border-t border-accent/15 pt-4 font-heading text-[12px] font-bold uppercase tracking-[0.1em] text-primary">
                <span>Total</span>
                <span className="font-display text-[19px] text-accent">RM{amount}</span>
              </div>
            )}
          </div>

          {searchParams.payerror && (
            <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-body text-[13.5px] text-red-800">
              The payment couldn&apos;t be started just now. Please try again below — if it keeps happening, message us on WhatsApp and we&apos;ll send you a payment link directly.
            </p>
          )}

          {b.paymentExpiresAt && <div className="mt-5"><HoldCountdown expiresAt={b.paymentExpiresAt} /></div>}

          {/* Payment method picker */}
          <div className="mt-3 space-y-3">
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-dark/50">Choose how to pay</p>

            <Link
              href={`/book/request/${b.id}/pay${tokenQuery}`}
              className="group flex items-center gap-4 rounded-2xl border-2 border-accent bg-white p-4.5 shadow-gold-glow/0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-floating sm:p-5"
            >
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-accent/10 transition-colors duration-300 group-hover:bg-accent/15">
                <Landmark className="h-5 w-5 text-accent" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-[13.5px] font-bold text-primary">Online Banking (FPX)</span>
                <span className="block font-body text-[12px] text-dark/55">For Malaysian bank accounts — instant confirmation.</span>
              </span>
              <span className="flex-none font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-accent">RM{amount} →</span>
            </Link>

            {isCardPaymentEnabled() ? (
              <Link
                href={`/book/request/${b.id}/pay${tokenQuery ? `${tokenQuery}&` : '?'}method=card`}
                className="group flex items-center gap-4 rounded-2xl border border-accent/25 bg-white p-4.5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-floating sm:p-5"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary/5 transition-colors duration-300 group-hover:bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-[13.5px] font-bold text-primary">Credit / Debit Card</span>
                  <span className="block font-body text-[12px] text-dark/55">No Malaysian bank account? Any international card works.</span>
                </span>
                <span className="flex-none font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-primary">RM{amount} →</span>
              </Link>
            ) : (
              <div className="flex items-center gap-4 rounded-2xl border border-dashed border-accent/25 bg-white/60 p-4.5 opacity-60 sm:p-5">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-dark/5">
                  <CreditCard className="h-5 w-5 text-dark/35" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-[13.5px] font-bold text-dark/50">Credit / Debit Card</span>
                  <span className="block font-body text-[12px] text-dark/45">Coming soon.</span>
                </span>
              </div>
            )}

            <p className="flex items-center justify-center gap-1.5 pt-1 font-body text-[11px] text-dark/40">
              <ShieldCheck className="h-3.5 w-3.5 text-accent/70" />
              Secured checkout — your payment is processed by a licensed provider.
            </p>
          </div>

          <div className="mt-6 border-t border-accent/15 pt-4">
            <CancelBookingButton id={b.id} token={token} />
          </div>
        </div>
      </div>
    </section>
  )
}
