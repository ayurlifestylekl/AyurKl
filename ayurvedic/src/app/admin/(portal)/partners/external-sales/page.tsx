import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  listExternalSales,
  summarizeExternalSales,
  listAgentsForPicker,
  EXTERNAL_CHANNEL_LABEL,
} from '@/lib/admin/external-sales/queries'
import LogSaleDialog from './LogSaleDialog'

export const metadata = { title: 'External Sales · Admin' }
export const dynamic = 'force-dynamic'

const CHANNEL_CLASS: Record<string, string> = {
  tiktok_shop: 'bg-pink-50 text-pink-700 border-pink-200',
  shopee:      'bg-orange-50 text-orange-700 border-orange-200',
  lazada:      'bg-blue-50 text-blue-700 border-blue-200',
  instagram:   'bg-purple-50 text-purple-700 border-purple-200',
  whatsapp:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  other:       'bg-slate-100 text-slate-700 border-slate-300',
}

export default async function ExternalSalesPage() {
  const supabase = await createClient()
  const [{ items, total }, summary, agents] = await Promise.all([
    listExternalSales(supabase, { limit: 200 }),
    summarizeExternalSales(supabase),
    listAgentsForPicker(supabase),
  ])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <Link
        href="/admin/partners"
        className="text-[11px] uppercase tracking-wider text-[#6E1023]/55 hover:text-[#D4AF37]"
      >
        ← Back to partners
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
            Affiliate program
          </span>
          <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight text-[#6E1023]">
            External sales
          </h1>
          <p className="mt-1 font-body text-[13px] text-[#1F1F1F]/65">
            {total} logged sale{total === 1 ? '' : 's'} · RM {summary.totalGross.toFixed(2)}{' '}
            gross · RM {summary.totalCommission.toFixed(2)} commission
          </p>
        </div>
        <LogSaleDialog agents={agents} />
      </header>

      <section className="rounded-2xl border border-[#6E1023]/10 bg-white p-4 text-[12.5px] text-[#1F1F1F]/70">
        <p className="font-semibold text-[#6E1023]">How this works</p>
        <p className="mt-1">
          Affiliates send proof of external sales (TikTok Shop, Shopee, Instagram DM, WhatsApp,
          etc.) via WhatsApp. You key those in here. The system uses their current commission
          rate to compute the commission, and the entry shows up in the payouts queue alongside
          web-order commissions.
        </p>
      </section>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#6E1023]/15 p-12 text-center font-body text-sm italic text-[#1F1F1F]/55">
          No external sales logged yet. Click <strong>Log external sale</strong> when an affiliate sends proof.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#6E1023]/8 bg-white">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#F7F2E8]/40 text-[11px] font-semibold uppercase tracking-wider text-[#6E1023]/70">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Affiliate</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3 text-right">Gross</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Commission</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#6E1023]/6">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-[#F7F2E8]/30">
                  <td className="px-4 py-3 text-[11.5px] text-[#1F1F1F]/65">
                    {new Date(s.createdAt).toLocaleDateString('en-MY')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/partners/${s.agentId}`}
                      className="font-semibold text-[#6E1023] hover:text-[#D4AF37]"
                    >
                      {s.agentName ?? '—'}
                    </Link>
                    <div className="text-[11px] text-[#1F1F1F]/55">{s.referralCode}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${CHANNEL_CLASS[s.channel] ?? ''}`}
                    >
                      {EXTERNAL_CHANNEL_LABEL[s.channel]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">RM {s.grossAmountRm.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-[12px] text-[#1F1F1F]/65">
                    {s.ratePercent}%
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#D4AF37]">
                    RM {s.commissionRm.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#1F1F1F]/65">
                    {s.customerName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#1F1F1F]/55">
                    {s.marketplaceOrderRef ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
