import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Landmark, CreditCard } from 'lucide-react'

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
      <div className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
        <Link href={statusHref} className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary/55 hover:text-primary">
          ← Back to booking status
        </Link>

        <div className="mt-6 rounded-2xl border border-accent/30 bg-white p-7 shadow-elevated sm:p-9">
          <div className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-accent">Checkout</div>
          <h1 className="mt-1 font-heading text-[26px] font-extrabold leading-tight text-primary">
            {isGroup ? `Group of ${members.length}` : b.treatmentName ?? 'Your appointment'}
          </h1>

          {/* Order summary */}
          <div className="mt-6 rounded-xl border border-accent/15 bg-cream/40 p-4">
            {isGroup ? (
              <ul className="space-y-2">
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
              <div className="flex items-center justify-between gap-2 font-body text-[13.5px]">
                <span className="text-dark/70">
                  {fmtMY(b.appointmentDatetime ?? b.requestedDatetime, { dateStyle: 'full', timeStyle: 'short' })}
                </span>
                <span className="font-heading text-[15px] font-bold text-accent">RM{amount}</span>
              </div>
            )}
            {isGroup && (
              <div className="mt-3 flex items-center justify-between border-t border-accent/15 pt-3 font-heading text-[12px] font-bold uppercase tracking-[0.1em] text-primary">
                <span>Total</span>
                <span className="text-accent">RM{amount}</span>
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
          <div className="mt-2 space-y-3">
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-dark/50">Choose how to pay</p>

            <Link
              href={`/book/request/${b.id}/pay${tokenQuery}`}
              className="flex items-center gap-4 rounded-xl border-2 border-accent bg-white p-4 transition-colors hover:bg-accent/5"
            >
              <Landmark className="h-7 w-7 flex-none text-accent" />
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-[13.5px] font-bold text-primary">Online Banking (FPX)</span>
                <span className="block font-body text-[12px] text-dark/55">For Malaysian bank accounts — instant confirmation.</span>
              </span>
              <span className="flex-none font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-accent">RM{amount} →</span>
            </Link>

            {isCardPaymentEnabled() ? (
              <Link
                href={`/book/request/${b.id}/pay${tokenQuery ? `${tokenQuery}&` : '?'}method=card`}
                className="flex items-center gap-4 rounded-xl border border-accent/30 bg-white p-4 transition-colors hover:bg-accent/5"
              >
                <CreditCard className="h-7 w-7 flex-none text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-[13.5px] font-bold text-primary">Credit / Debit Card</span>
                  <span className="block font-body text-[12px] text-dark/55">No Malaysian bank account? Any international card works.</span>
                </span>
                <span className="flex-none font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-primary">RM{amount} →</span>
              </Link>
            ) : (
              <div className="flex items-center gap-4 rounded-xl border border-dashed border-accent/25 bg-white/60 p-4 opacity-60">
                <CreditCard className="h-7 w-7 flex-none text-dark/35" />
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-[13.5px] font-bold text-dark/50">Credit / Debit Card</span>
                  <span className="block font-body text-[12px] text-dark/45">Coming soon.</span>
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-accent/15 pt-4">
            <CancelBookingButton id={b.id} token={token} />
          </div>
        </div>
      </div>
    </section>
  )
}
