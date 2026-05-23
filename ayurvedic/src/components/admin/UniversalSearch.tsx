'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { Search, User, Package, ShoppingBag, X, type LucideIcon } from 'lucide-react'
import { adminSearch, type SearchHit } from '@/lib/admin/search'

const ICONS: Record<SearchHit['kind'], LucideIcon> = {
  customer: User,
  order: ShoppingBag,
  product: Package,
}

export default function UniversalSearch() {
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    if (q.trim().length < 2) {
      setHits([])
      return
    }
    debounce.current = setTimeout(() => {
      startTransition(async () => {
        const r = await adminSearch(q)
        setHits(r)
      })
    }, 200)
    return () => {
      if (debounce.current) clearTimeout(debounce.current)
    }
  }, [q])

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1e3d32]/40" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Find a customer, order #, or product…"
          className="h-10 w-full rounded-full border border-[#1e3d32]/15 bg-white pl-9 pr-9 font-body text-[13px] text-[#1e3d32] placeholder:text-[#2B2B2B]/40 focus:border-[#D4A373] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ('')
              setHits([])
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5 text-[#1e3d32]/40" />
          </button>
        )}
      </div>
      {open && q.length >= 2 && (
        <>
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30"
          />
          <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-[#1e3d32]/8 bg-white shadow-2xl shadow-black/8">
            {hits.length === 0 ? (
              <p className="px-4 py-6 text-center font-body text-[12.5px] italic text-[#2B2B2B]/55">
                No matches.
              </p>
            ) : (
              <ul className="divide-y divide-[#1e3d32]/6">
                {hits.map((h) => {
                  const Icon = ICONS[h.kind]
                  return (
                    <li key={`${h.kind}:${h.id}`}>
                      <Link
                        href={h.href}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#FAF6EE]/40"
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#1e3d32]/[0.06]">
                          <Icon className="h-3.5 w-3.5 text-[#2F5D50]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-heading text-[12.5px] font-semibold text-[#1e3d32]">
                            {h.title}
                          </p>
                          <p className="truncate font-body text-[11px] text-[#2B2B2B]/65">
                            {h.subtitle}
                          </p>
                        </div>
                        <span className="font-heading text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#1e3d32]/45">
                          {h.kind}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
