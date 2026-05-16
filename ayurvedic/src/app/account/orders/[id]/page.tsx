import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { getOrderById } from '@/lib/dashboard/order-queries'

import OrderTimeline from '@/components/account/OrderTimeline'
import OrderItemsTable from '@/components/account/OrderItemsTable'
import TrackingPanel from '@/components/account/TrackingPanel'
import PaymentPanel from '@/components/account/PaymentPanel'
import PractitionerNoteChip from '@/components/account/PractitionerNoteChip'
import OrderActions from '@/components/account/OrderActions'

export const metadata = {
  title: 'Order Details',
}

const dateFormat = new Intl.DateTimeFormat('en-MY', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function shortId(id: string): string {
  return id.slice(-6).toUpperCase()
}

function titleForStatus(
  payment: 'pending' | 'paid' | 'failed',
  fulfillment: 'processing' | 'shipped' | 'delivered' | 'cancelled'
): string {
  if (fulfillment === 'cancelled') return 'Cancelled.'
  if (payment === 'failed') return 'Order cancelled.'
  if (payment === 'pending') return 'Awaiting payment.'
  if (fulfillment === 'delivered') return 'Delivered.'
  if (fulfillment === 'shipped') return 'On the way.'
  return 'Being prepared.'
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const me = await getCurrentUser()
  const customerId = me?.authId ?? ''

  // UUID-ish guard — short-circuit obviously bad IDs before hitting the DB
  if (!params.id || params.id.length < 8) {
    notFound()
  }

  const supabase = await createClient()
  const order = await getOrderById(supabase, customerId, params.id)

  if (!order) {
    notFound()
  }

  const title = titleForStatus(order.payment_status, order.fulfillment_status)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:gap-5">
      {/* ── Back link ─────────────────────────────────────────────── */}
      <Link
        href="/account/orders"
        className="group inline-flex w-fit items-center gap-1.5 font-heading text-[11.5px] font-semibold uppercase tracking-[0.18em] text-[#1e3d32]/55 transition-colors hover:text-[#D4A373]"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        All orders
      </Link>

      {/* ── Header ────────────────────────────────────────────────── */}
      <header>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[#1e3d32]/60">
          Order #{shortId(order.id)}
        </span>
        <h1
          className="mt-1.5 font-heading text-[26px] font-bold leading-tight text-[#1e3d32] sm:text-[30px]"
          style={{ letterSpacing: '-0.02em' }}
        >
          {title}
        </h1>
        <p className="mt-1.5 font-body text-[12.5px] text-[#2B2B2B]/55">
          Placed on {dateFormat.format(new Date(order.created_at))}
        </p>
      </header>

      {/* ── Practitioner note (only renders when Vaidya has added one) ── */}
      <PractitionerNoteChip note={order.practitioner_note} />

      {/* ── Timeline ───────────────────────────────────────────── */}
      <OrderTimeline
        paymentStatus={order.payment_status}
        fulfillmentStatus={order.fulfillment_status}
      />

      {/* ── Items + side column (Tracking + Payment) ──────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <div className="lg:col-span-7">
          <OrderItemsTable
            items={order.items}
            orderTotal={Number(order.total_amount_rm)}
          />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-5 lg:gap-5">
          <TrackingPanel
            courier={order.courier_service}
            trackingNumber={order.tracking_number}
            fulfillmentStatus={order.fulfillment_status}
          />
          <PaymentPanel
            paymentStatus={order.payment_status}
            total={Number(order.total_amount_rm)}
          />
        </div>
      </div>

      {/* ── Actions ───────────────────────────────────────────────── */}
      <OrderActions
        orderId={order.id}
        orderShortId={shortId(order.id)}
        paymentStatus={order.payment_status}
        fulfillmentStatus={order.fulfillment_status}
        items={order.items}
      />
    </div>
  )
}
