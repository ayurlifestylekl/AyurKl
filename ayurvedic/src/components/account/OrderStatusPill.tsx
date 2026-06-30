import type { Database } from '@/lib/database.types'

type FulfillmentStatus = Database['public']['Tables']['orders']['Row']['fulfillment_status']
type PaymentStatus = Database['public']['Tables']['orders']['Row']['payment_status']

interface OrderStatusPillProps {
  fulfillmentStatus: FulfillmentStatus
  paymentStatus: PaymentStatus
}

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string; label: string }> = {
  // Payment overrides fulfillment when payment hasn't cleared
  pending: {
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    label: 'Awaiting payment',
  },
  failed: {
    dot: 'bg-red-500',
    text: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    label: 'Payment failed',
  },
  // Fulfillment-side states (assumes payment is paid)
  processing: {
    dot: 'bg-[#6E1023]',
    text: 'text-[#6E1023]',
    bg: 'bg-[#6E1023]/8 border-[#6E1023]/25',
    label: 'Processing',
  },
  shipped: {
    dot: 'bg-[#D4AF37]',
    text: 'text-[#9c7544]',
    bg: 'bg-[#D4AF37]/10 border-[#D4AF37]/35',
    label: 'Shipped',
  },
  delivered: {
    dot: 'bg-[#6E1023]',
    text: 'text-[#6E1023]',
    bg: 'bg-[#6E1023]/8 border-[#6E1023]/25',
    label: 'Delivered',
  },
}

export default function OrderStatusPill({
  fulfillmentStatus,
  paymentStatus,
}: OrderStatusPillProps) {
  // If payment hasn't cleared, that takes precedence
  const key =
    paymentStatus === 'pending' || paymentStatus === 'failed'
      ? paymentStatus
      : fulfillmentStatus

  const style = STATUS_STYLES[key] ?? STATUS_STYLES.processing

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-heading text-[10.5px] font-semibold tracking-[0.06em] ${style.bg} ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  )
}
