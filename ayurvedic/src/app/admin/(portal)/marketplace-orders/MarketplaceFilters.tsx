'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const STATUSES = [
  { value: 'pending_payment', label: 'Awaiting agent payment' },
  { value: 'pending', label: 'Pending review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
] as const

const CHANNELS = [
  { value: '', label: 'Any channel' },
  { value: 'shopee', label: 'Shopee' },
  { value: 'tiktok_shop', label: 'TikTok Shop' },
  { value: 'lazada', label: 'Lazada' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'other', label: 'Other' },
]

export default function MarketplaceFilters({
  basePath = '/admin/marketplace-orders',
}: {
  basePath?: string
}) {
  const router = useRouter()
  const sp = useSearchParams()
  const active = sp.get('status') ?? 'pending'

  const set = useCallback(
    (k: string, v: string | null) => {
      const next = new URLSearchParams(sp.toString())
      if (!v) next.delete(k)
      else next.set(k, v)
      router.push(`${basePath}?${next.toString()}`)
    },
    [router, sp, basePath],
  )

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#1e3d32]/10 bg-white p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUSES.map((s) => {
          const isActive = active === s.value
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => set('status', s.value)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                isActive
                  ? 'bg-[#2F5D50] text-white'
                  : 'border border-[#1e3d32]/15 bg-white text-[#1e3d32] hover:bg-[#FAF6EE]/60'
              }`}
            >
              {s.label}
            </button>
          )
        })}
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search customer, phone, marketplace ref…"
          defaultValue={sp.get('q') ?? ''}
          onChange={(e) => set('q', e.target.value || null)}
          className="min-w-[220px] rounded-lg border border-[#1e3d32]/10 bg-white px-3 py-1.5 text-sm placeholder:text-[#2B2B2B]/40 focus:border-[#2F5D50] focus:outline-none"
        />
        <select
          value={sp.get('channel') ?? ''}
          onChange={(e) => set('channel', e.target.value || null)}
          className="rounded-lg border border-[#1e3d32]/10 bg-white px-3 py-1.5 text-sm"
        >
          {CHANNELS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
