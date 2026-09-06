'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { categories } from '@/data/categories'
import { Flourish } from '@/components/ui/Ornament'
import type { Product } from '@/types/content'

export type PriceTier = 'all' | 'under-75' | '75-150' | '150-300' | 'over-300'

export interface ProductsSidebarProps {
  activeCategory: string
  onCategoryChange: (cat: string) => void
  search: string
  onSearchChange: (q: string) => void
  priceTier: PriceTier
  onPriceTierChange: (t: PriceTier) => void
  onClear: () => void
  products: Product[]
  /** True when any filter is non-default — shows the Clear all link. */
  hasActiveFilters: boolean
}

const PRICE_TIERS: Array<{ value: PriceTier; label: string; test: (p: Product) => boolean }> = [
  { value: 'all',       label: 'All prices',    test: () => true },
  { value: 'under-75',  label: 'Under RM 75',   test: (p) => p.priceRm < 75 },
  { value: '75-150',    label: 'RM 75 – 150',   test: (p) => p.priceRm >= 75 && p.priceRm < 150 },
  { value: '150-300',   label: 'RM 150 – 300',  test: (p) => p.priceRm >= 150 && p.priceRm < 300 },
  { value: 'over-300',  label: 'Over RM 300',   test: (p) => p.priceRm >= 300 },
]

/** Exposed so ProductsPageClient can reuse the tier test logic. */
export function filterByPriceTier(products: Product[], tier: PriceTier): Product[] {
  const entry = PRICE_TIERS.find((t) => t.value === tier)
  if (!entry) return products
  return products.filter(entry.test)
}

function countForCategory(slug: string, products: Product[]): number {
  if (slug === 'all') return products.length
  return products.filter((p) => p.category === slug).length
}

/**
 * Classical contents-page style filter column. Same cream atmosphere as
 * the rest of the page — the darkness belongs to the product cards, not
 * the chrome.
 */
export default function ProductsSidebar({
  activeCategory,
  onCategoryChange,
  search,
  onSearchChange,
  priceTier,
  onPriceTierChange,
  onClear,
  products,
  hasActiveFilters,
}: ProductsSidebarProps) {
  const [localSearch, setLocalSearch] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSearchChange(localSearch), 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [localSearch, onSearchChange])

  // sync external changes (e.g. Clear all)
  useEffect(() => { setLocalSearch(search) }, [search])

  return (
    <aside aria-label="Product filters" className="flex flex-col gap-6">
      {/* Search */}
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent"
          strokeWidth={2}
        />
        <input
          type="search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search the Apothecary…"
          className="w-full rounded-full border border-accent/40 bg-white/80 py-2.5 pl-10 pr-9 font-display italic text-[13px] text-dark shadow-[inset_0_1px_3px_rgba(110,16,35,0.05)] placeholder:text-dark/40 transition-colors duration-300 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-1"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => setLocalSearch('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/35 transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>

      <Flourish width="w-6" />

      {/* Category group */}
      <SidebarGroup label="Category">
        <SidebarOption
          label="All"
          active={activeCategory === 'all'}
          count={countForCategory('all', products)}
          onClick={() => onCategoryChange('all')}
        />
        {categories.map((cat) => (
          <SidebarOption
            key={cat.slug}
            label={cat.label}
            active={activeCategory === cat.slug}
            count={countForCategory(cat.slug, products)}
            onClick={() => onCategoryChange(cat.slug)}
          />
        ))}
      </SidebarGroup>

      {/* Price group */}
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-3 inline-flex items-center gap-2 font-heading text-[9px] font-bold uppercase tracking-[0.32em] text-accent">
          <span aria-hidden className="inline-block h-px w-3 bg-accent" />
          Price
        </legend>
        <div className="flex flex-col">
          {PRICE_TIERS.map((tier) => {
            const active = priceTier === tier.value
            return (
              <label
                key={tier.value}
                className={`flex cursor-pointer items-center gap-2 py-1.5 font-display text-[14px] transition-colors duration-200 ${
                  active ? 'italic text-accent' : 'text-dark/65 hover:text-primary'
                }`}
              >
                <input
                  type="radio"
                  name="price-tier"
                  value={tier.value}
                  checked={active}
                  onChange={() => onPriceTierChange(tier.value)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`inline-block h-[7px] w-[7px] rounded-full border transition-[background-color,border-color] duration-200 ${
                    active ? 'border-accent bg-accent' : 'border-accent/45 bg-transparent'
                  }`}
                />
                {tier.label}
              </label>
            )
          })}
        </div>
      </fieldset>

      {/* Curator's note */}
      <div className="relative rounded-sm bg-blush px-4 py-5">
        <span
          aria-hidden
          className="absolute inset-x-4 top-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.7), transparent)' }}
        />
        <span aria-hidden className="absolute left-3.5 top-0.5 font-display text-[38px] leading-none text-accent/50">
          &ldquo;
        </span>
        <p className="relative z-[1] font-display text-[14px] italic leading-[1.6] text-primary">
          Prescribed from classical Kerala texts — never perfumed, never rushed.
        </p>
        <span className="mt-2.5 block font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-primary/50">
          — Our Vaidyas
        </span>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="self-start font-display text-[12px] italic text-accent underline underline-offset-4 transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Clear all · ×
        </button>
      )}
    </aside>
  )
}

/* ──────────────────────────────────────────────────────────── */

function SidebarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 inline-flex items-center gap-2 font-heading text-[9px] font-bold uppercase tracking-[0.32em] text-accent">
        <span aria-hidden className="inline-block h-px w-3 bg-accent" />
        {label}
      </p>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}

function SidebarOption({
  label, active, count, onClick,
}: {
  label: string; active: boolean; count: number; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-ml-3.5 flex items-baseline justify-between gap-2 rounded-r border-l-2 py-1.5 pl-3 pr-2.5 text-left font-display text-[14px] transition-colors duration-200 focus-visible:outline-none focus-visible:text-primary ${
        active
          ? 'border-accent bg-accent/8 italic text-primary'
          : 'border-transparent text-dark/65 hover:text-primary'
      }`}
    >
      <span>{label}</span>
      <span
        className={`font-heading text-[10px] tracking-[0.15em] ${
          active ? 'font-bold text-accent' : 'text-dark/35'
        }`}
      >
        {count}
      </span>
    </button>
  )
}
