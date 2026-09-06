import { getTodaysOrderStats, getLowStockCount, listPendingCancellations } from '@/lib/product-management/queries'

export const metadata = { title: 'Reports · Product Management' }
export const dynamic = 'force-dynamic'

export default async function ProductManagementReportsPage() {
  const [stats, lowStock, pendingCancellations] = await Promise.all([
    getTodaysOrderStats(),
    getLowStockCount(),
    listPendingCancellations(),
  ])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
          Analytics
        </span>
        <h1 className="mt-2 font-heading text-[28px] font-bold text-[#6E1023]">Reports</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportCard label="Today’s orders" value={String(stats.orders)} />
        <ReportCard label="Paid orders today" value={String(stats.paidOrders)} />
        <ReportCard label="Revenue today" value={`RM ${stats.revenue.toFixed(2)}`} />
        <ReportCard label="Pending refunds" value={String(pendingCancellations.length)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#6E1023]/10 bg-white p-5">
          <h2 className="font-heading text-[16px] font-bold text-[#6E1023]">Low-stock SKUs</h2>
          <p className="mt-1 text-[13px] text-[#1F1F1F]/65">
            {lowStock} product{lowStock === 1 ? '' : 's'} currently at or below the low-stock threshold.
          </p>
          <a
            href="/admin/inventory"
            className="mt-4 inline-flex rounded-md bg-[#6E1023] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#6E1023]/90"
          >
            Review inventory
          </a>
        </div>

        <div className="rounded-2xl border border-[#6E1023]/10 bg-white p-5">
          <h2 className="font-heading text-[16px] font-bold text-[#6E1023]">Pending refunds</h2>
          <p className="mt-1 text-[13px] text-[#1F1F1F]/65">
            {pendingCancellations.length} cancellation request{pendingCancellations.length === 1 ? '' : 's'} awaiting a decision.
          </p>
          <a
            href="/product-management/cancellations"
            className="mt-4 inline-flex rounded-md bg-[#6E1023] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#6E1023]/90"
          >
            Review requests
          </a>
        </div>
      </div>
    </div>
  )
}

function ReportCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#6E1023]/8 bg-white p-4">
      <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-[#1F1F1F]/55">{label}</p>
      <p className="mt-2 font-heading text-[24px] font-bold text-[#6E1023]">{value}</p>
    </div>
  )
}
