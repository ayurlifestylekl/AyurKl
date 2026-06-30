'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const SEGMENTS = [
  { value: 'requests', label: 'Requests' },
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No-show' },
  { value: 'all', label: 'All' },
] as const

export default function AppointmentsFilters({ requestCount = 0 }: { requestCount?: number }) {
  const router = useRouter()
  const sp = useSearchParams()
  const active = sp.get('segment') ?? 'requests'

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
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#6E1023]/10 bg-white p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {SEGMENTS.map((s) => {
          const isActive = active === s.value
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => set('segment', s.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                isActive
                  ? 'bg-[#6E1023] text-white'
                  : 'border border-[#6E1023]/15 bg-white text-[#6E1023] hover:bg-[#F7F2E8]/60'
              }`}
            >
              {s.label}
              {s.value === 'requests' && requestCount > 0 && (
                <span
                  className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-[#D4AF37] text-[#1F1F1F]'
                  }`}
                >
                  {requestCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <input
        type="search"
        placeholder="Search customer, treatment, vaidya…"
        defaultValue={sp.get('q') ?? ''}
        onChange={(e) => set('q', e.target.value || null)}
        className="ml-auto min-w-[220px] flex-1 rounded-lg border border-[#6E1023]/10 bg-white px-3 py-1.5 text-sm placeholder:text-[#1F1F1F]/40 focus:border-[#6E1023] focus:outline-none"
      />
    </div>
  )
}
