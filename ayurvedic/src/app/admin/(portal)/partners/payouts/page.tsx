import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { listPendingPayouts } from '@/lib/admin/agents/payouts-queries'
import { DEMO_ADMIN_EMAIL } from '@/lib/admin/agents/mocks'
import { MOCK_PENDING_PAYOUTS } from '@/lib/admin/agents/mocks-payouts'
import PayoutsQueueTable from './PayoutsQueueTable'

export const metadata = { title: 'Payouts · Admin' }
export const dynamic = 'force-dynamic'

export default async function PayoutsQueuePage() {
  const supabase = await createClient()
  const me = await getCurrentUser()
  const real = await listPendingPayouts(supabase)
  const isDemoAdmin = me?.email === DEMO_ADMIN_EMAIL
  const showMocks = isDemoAdmin && real.length === 0
  const rows = showMocks ? MOCK_PENDING_PAYOUTS : real

  const totalAgents = rows.length
  const totalAmount = rows.reduce((s, r) => s + r.pendingTotalRm, 0)
  const totalCommissions = rows.reduce((s, r) => s + r.pendingCount, 0)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <Link
        href="/admin/partners"
        className="text-[11px] uppercase tracking-wider text-[#163F33]/55 hover:text-[#D4AF37]"
      >
        ← Back to partners
      </Link>
      <header>
        <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
          Affiliate program
        </span>
        <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight text-[#163F33]">
          Payouts queue
        </h1>
        <p className="mt-1 font-body text-[13px] text-[#1F1F1F]/65">
          {totalAgents} agent{totalAgents === 1 ? '' : 's'} owed · {totalCommissions} commissions
          · <span className="font-semibold text-[#D4AF37]">RM {totalAmount.toFixed(2)}</span> total
          {showMocks ? ' · demo data' : ''}
        </p>
      </header>

      <PayoutsQueueTable rows={rows} />

      <p className="text-[11.5px] italic text-[#1F1F1F]/55">
        Commissions are auto-created when an order is paid and auto-reversed when the order is
        cancelled or fully refunded. Mark an agent paid here to lock the lump-sum as a payout
        record — actual money transfer happens in your bank portal separately.
      </p>
    </div>
  )
}
