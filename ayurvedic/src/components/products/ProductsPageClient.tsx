'use client'

import React, { useState, useMemo, useCallback } from 'react'
import type { Product } from '@/types/content'
import ProductFilters, { type SortOption } from './ProductFilters'
import ProductGrid from './ProductGrid'

interface ProductsPageClientProps {
  products: Product[]
  initialCategory?: string
}

export default function ProductsPageClient({
  products,
  initialCategory,
}: ProductsPageClientProps) {
  const [category, setCategory] = useState(initialCategory || 'all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')

  const handleCategoryChange = useCallback(
    (cat: string) => {
      setCategory(cat)
      // Sync URL without full navigation
      const url = cat === 'all' ? '/products' : `/products?category=${cat}`
      window.history.replaceState(null, '', url)
    },
    []
  )

  const handleSearchChange = useCallback((q: string) => {
    setSearch(q)
  }, [])

  const handleSortChange = useCallback((s: SortOption) => {
    setSort(s)
  }, [])

  const handleClearFilters = useCallback(() => {
    setCategory('all')
    setSearch('')
    setSort('newest')
    window.history.replaceState(null, '', '/products')
  }, [])

  const filtered = useMemo(() => {
    let result = [...products]

    // Category filter
    if (category === 'combos') {
      result = result.filter(p => p.isBundle)
    } else if (category === 'herbal') {
      result = result.filter(p => !p.isBundle)
    } else if (category !== 'all') {
      result = result.filter(p => p.category === category)
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }

    // Sort
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.priceRm - b.priceRm)
        break
      case 'price-desc':
        result.sort((a, b) => b.priceRm - a.priceRm)
        break
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
    }

    return result
  }, [products, category, search, sort])

  return (
    <>
      <ProductFilters
        activeCategory={category}
        onCategoryChange={handleCategoryChange}
        searchQuery={search}
        onSearchChange={handleSearchChange}
        sortBy={sort}
        onSortChange={handleSortChange}
        products={products}
      />

      <section className="relative bg-background">
        {/* Subtle atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(212,163,115,0.06) 0%, transparent 60%)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-8 md:py-20 lg:px-12">
          <ProductGrid
            products={filtered}
            total={products.length}
            onClearFilters={handleClearFilters}
          />
        </div>
      </section>
    </>
  )
}
