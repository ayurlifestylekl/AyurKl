'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Search, X, ArrowUpDown } from 'lucide-react'
import { categories } from '@/data/categories'
import type { Product } from '@/types/content'

export type SortOption = 'newest' | 'price-asc' | 'price-desc'

interface ProductFiltersProps {
  activeCategory: string
  onCategoryChange: (cat: string) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  sortBy: SortOption
  onSortChange: (s: SortOption) => void
  products: Product[]
}

/** All filter tabs — "All" + 8 real categories + 2 meta-filters */
const filterTabs = [
  { slug: 'all', label: 'All' },
  ...categories.map(c => ({ slug: c.slug, label: c.label })),
  { slug: 'combos', label: 'Combos' },
  { slug: 'herbal', label: 'Herbal' },
]

function countForCategory(slug: string, products: Product[]): number {
  if (slug === 'all') return products.length
  if (slug === 'combos') return products.filter(p => p.isBundle).length
  if (slug === 'herbal') return products.filter(p => !p.isBundle).length
  return products.filter(p => p.category === slug).length
}

export default function ProductFilters({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  products,
}: ProductFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearchChange(localSearch)
    }, 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [localSearch, onSearchChange])

  // Sync external changes
  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  return (
    <div className="sticky top-0 z-30 border-b border-primary/8 bg-[#FAF6EE]/92 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Row 1 — Search + Sort */}
        <div className="flex items-center gap-3 py-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/35"
              strokeWidth={2}
            />
            <input
              type="search"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search formulas…"
              className="w-full rounded-full border border-primary/12 bg-white/60 py-2.5 pl-10 pr-9 font-heading text-[13px] text-dark placeholder:text-dark/30 backdrop-blur transition-colors duration-300 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-1"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/35 transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 active:scale-[0.92]"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative flex items-center">
            <ArrowUpDown
              className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-primary/40"
              strokeWidth={2}
            />
            <select
              value={sortBy}
              onChange={e => onSortChange(e.target.value as SortOption)}
              className="appearance-none rounded-full border border-primary/12 bg-white/60 py-2.5 pl-9 pr-8 font-heading text-[12px] font-semibold text-dark/70 backdrop-blur transition-colors duration-300 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-1"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
            {/* Custom dropdown arrow */}
            <svg
              className="pointer-events-none absolute right-3 h-3 w-3 text-dark/35"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Row 2 — Category pills */}
        <div className="no-scrollbar -mx-6 flex snap-x gap-2 overflow-x-auto px-6 pb-4 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
          {filterTabs.map(tab => {
            const isActive = activeCategory === tab.slug
            const count = countForCategory(tab.slug, products)
            return (
              <button
                key={tab.slug}
                type="button"
                onClick={() => onCategoryChange(tab.slug)}
                className={`flex shrink-0 snap-start items-center gap-1.5 rounded-full px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.12em] transition-[background-color,color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97] ${
                  isActive
                    ? 'bg-primary text-white shadow-[0_6px_20px_-6px_rgba(47,93,80,0.55)]'
                    : 'bg-white text-primary/55 ring-1 ring-primary/12 hover:bg-primary/5 hover:text-primary/80'
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white/80'
                      : 'bg-primary/6 text-primary/40'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
