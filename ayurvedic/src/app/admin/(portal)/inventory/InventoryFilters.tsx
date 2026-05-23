'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const CHIPS = [
  { value: '', label: 'All' },
  { value: 'low-stock', label: 'Low stock' },
  { value: 'out-of-stock', label: 'Out of stock' },
  { value: 'expiring-soon', label: 'Expiring ≤60d' },
] as const

export default function InventoryFilters({ categories }: { categories: string[] }) {
  const router = useRouter()
  const sp = useSearchParams()
  const active = sp.get('filter') ?? ''

  const set = useCallback(
    (k: string, v: string | null) => {
      const next = new URLSearchParams(sp.toString())
      if (!v) next.delete(k)
      else next.set(k, v)
      router.push(`/admin/inventory?${next.toString()}`)
    },
    [router, sp],
  )

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#1e3d32]/10 bg-white p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {CHIPS.map((c) => {
          const isActive = active === c.value
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => set('filter', c.value || null)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                isActive
                  ? 'bg-[#2F5D50] text-white'
                  : 'border border-[#1e3d32]/15 bg-white text-[#1e3d32] hover:bg-[#FAF6EE]/60'
              }`}
            >
              {c.label}
            </button>
          )
        })}
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search name or SKU…"
          defaultValue={sp.get('q') ?? ''}
          onChange={(e) => set('q', e.target.value || null)}
          className="min-w-[180px] rounded-lg border border-[#1e3d32]/10 bg-white px-3 py-1.5 text-sm placeholder:text-[#2B2B2B]/40 focus:border-[#2F5D50] focus:outline-none"
        />
        <select
          value={sp.get('category') ?? ''}
          onChange={(e) => set('category', e.target.value || null)}
          className="rounded-lg border border-[#1e3d32]/10 bg-white px-3 py-1.5 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
