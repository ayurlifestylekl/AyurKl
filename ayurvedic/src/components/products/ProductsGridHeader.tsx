'use client'

import React from 'react'
import SortMenu, { type SortOption } from './SortMenu'

interface ProductsGridHeaderProps {
  count: number
  categoryLabel: string
  sort: SortOption
  onSortChange: (s: SortOption) => void
}

export default function ProductsGridHeader({
  count, categoryLabel, sort, onSortChange,
}: ProductsGridHeaderProps) {
  return (
    <div className="relative mb-8 flex items-center justify-between gap-4 pb-4">
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: 'linear-gradient(to right, rgba(212,175,55,0.55), rgba(212,175,55,0.08) 55%, transparent)' }}
      />
      <p className="flex items-center gap-2 font-heading text-[10px] font-semibold uppercase tracking-[0.28em] text-dark/55">
        <span className="font-bold text-primary">{count}</span>
        Formula{count === 1 ? '' : 'e'}
        <span aria-hidden className="h-[3px] w-[3px] rounded-full bg-accent" />
        <span className="text-primary/70">{categoryLabel}</span>
      </p>
      <SortMenu value={sort} onChange={onSortChange} />
    </div>
  )
}
