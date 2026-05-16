import { CreditCard } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type PaymentStatus = Database['public']['Tables']['orders']['Row']['payment_status']

interface PaymentPanelProps {
  paymentStatus: PaymentStatus
  total: number
}

const STATUS_LABEL: Record<PaymentStatus, { label: string; tone: string }> = {
  paid:    { label: 'Paid',    tone: 'text-[#2F5D50] bg-[#2F5D50]/[0.08] border-[#2F5D50]/25' },
  pending: { label: 'Pending', tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  failed:  { label: 'Failed',  tone: 'text-red-700 bg-red-50 border-red-200' },
}

export default function PaymentPanel({ paymentStatus, total }: PaymentPanelProps) {
  const status = STATUS_LABEL[paymentStatus]
  return (
    <section
      className="overflow-hidden rounded-3xl border border-[#1e3d32]/8 bg-white"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(30,61,50,0.04), 0 12px 30px -16px rgba(30,61,50,0.18)',
      }}
    >
      <div className="flex items-center gap-2.5 border-b border-[#1e3d32]/6 px-5 py-3 sm:px-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#1e3d32]/[0.06]">
          <CreditCard className="h-3.5 w-3.5 text-[#2F5D50]" strokeWidth={1.8} />
        </span>
        <h2 className="font-heading text-[13px] font-semibold text-[#1e3d32]">
          Payment
        </h2>
      </div>

      <div className="space-y-3 px-5 py-4 sm:px-6">
        {/* Status row */}
        <div className="flex items-center justify-between gap-3">
          <span className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#1e3d32]/55">
            Status
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-heading text-[10.5px] font-semibold ${status.tone}`}
          >
            {status.label}
          </span>
        </div>

        {/* Method row */}
        <div className="flex items-center justify-between gap-3 border-t border-[#1e3d32]/6 pt-3">
          <span className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#1e3d32]/55">
            Method
          </span>
          <span className="font-heading text-[13px] font-semibold text-[#1e3d32]">
            Billplz
          </span>
        </div>

        {/* Total row */}
        <div className="flex items-center justify-between gap-3 border-t border-[#1e3d32]/6 pt-3">
          <span className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#1e3d32]/55">
            Total
          </span>
          <span
            className="font-heading text-[16px] font-bold text-[#1e3d32]"
            style={{ letterSpacing: '-0.01em' }}
          >
            RM {Number(total).toFixed(2)}
          </span>
        </div>

      </div>
    </section>
  )
}
