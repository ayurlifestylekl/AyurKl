'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const SEGMENTS = [
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No-show' },
  { value: 'all', label: 'All' },
] as const

export default function AppointmentsFilters() {
  const router = useRouter()
  const sp = useSearchParams()
  const active = sp.get('segment') ?? 'today'

  const set = useCallback(
    (k: string, v: string | null) => {
      const next = new URLSearchParams(sp.toString())
      if (!v) next.delete(k)
      else next.set(k, v)
      router.push(`/admin/appointments?${next.toString()}`)
    },
    [router, sp],
  )

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#163F33]/10 bg-white p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {SEGMENTS.map((s) => {
          const isActive = active === s.value
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => set('segment', s.value)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                isActive
                  ? 'bg-[#1E5B4B] text-white'
                  : 'border border-[#163F33]/15 bg-white text-[#163F33] hover:bg-[#F7F2E8]/60'
              }`}
            >
              {s.label}
            </button>
          )
        })}
      </div>
      <input
        type="search"
        placeholder="Search customer, treatment, vaidya…"
        defaultValue={sp.get('q') ?? ''}
        onChange={(e) => set('q', e.target.value || null)}
        className="ml-auto min-w-[220px] flex-1 rounded-lg border border-[#163F33]/10 bg-white px-3 py-1.5 text-sm placeholder:text-[#1F1F1F]/40 focus:border-[#1E5B4B] focus:outline-none"
      />
    </div>
  )
}
