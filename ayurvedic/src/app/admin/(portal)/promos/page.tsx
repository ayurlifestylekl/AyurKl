import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { listPromos } from '@/lib/admin/promos/queries'

export const metadata = { title: 'Vouchers · Admin' }
export const dynamic = 'force-dynamic'

const KIND_LABEL: Record<string, string> = {
  percentage: '% off',
  fixed: 'RM off',
  'free-shipping': 'Free shipping',
}

export default async function AdminPromosPage() {
  const supabase = await createClient()
  const promos = await listPromos(supabase)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
            Marketing
          </span>
          <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight text-[#163F33]">
            Vouchers
          </h1>
          <p className="mt-1 font-body text-[13px] text-[#1F1F1F]/65">
            {promos.length} promo template{promos.length === 1 ? '' : 's'} · public codes +
            private vouchers pushed to customer wallets
          </p>
        </div>
        <Link
          href="/admin/promos/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E5B4B] px-3 py-2 text-[12.5px] font-semibold text-white hover:bg-[#163F33]"
        >
          <Plus className="h-3.5 w-3.5" />
          Create promo
        </Link>
      </header>

      {promos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#163F33]/15 p-12 text-center font-body text-sm italic text-[#1F1F1F]/55">
          No promos yet. Create one to use it as a template for voucher push.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#163F33]/8 bg-white">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#F7F2E8]/40 text-[11px] font-semibold uppercase tracking-wider text-[#163F33]/70">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Used</th>
                <th className="px-4 py-3">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#163F33]/6">
              {promos.map((p) => (
                <tr key={p.id} className="hover:bg-[#F7F2E8]/30">
                  <td className="px-4 py-3 font-mono font-semibold text-[#163F33]">
                    <Link
                      href={`/admin/promos/${p.id}`}
                      className="hover:text-[#D4AF37]"
                    >
                      {p.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{p.title}</td>
                  <td className="px-4 py-3 text-[12px]">{KIND_LABEL[p.kind] ?? p.kind}</td>
                  <td className="px-4 py-3 text-right">
                    {p.valueAmount != null
                      ? p.kind === 'percentage'
                        ? `${p.valueAmount}%`
                        : `RM ${p.valueAmount.toFixed(2)}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-[12px]">
                    {p.isPublic ? (
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10.5px] font-semibold text-blue-700">
                        Public
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10.5px] font-semibold text-slate-700">
                        Private
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[12px]">
                    {p.isActive ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10.5px] font-semibold text-slate-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">{p.usageCount}</td>
                  <td className="px-4 py-3 text-[11.5px] text-[#1F1F1F]/55">
                    {p.expiresAt
                      ? new Date(p.expiresAt).toLocaleDateString('en-MY')
                      : 'No expiry'}
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
