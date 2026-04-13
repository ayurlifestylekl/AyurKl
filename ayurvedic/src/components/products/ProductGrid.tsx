'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { staggerParent, inViewOnce } from '@/lib/motion'
import type { Product } from '@/types/content'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  total: number
  onClearFilters: () => void
}

export default function ProductGrid({
  products,
  total,
  onClearFilters,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/15 px-8 py-20 text-center">
        <Sparkles className="mb-4 h-8 w-8 text-accent/60" strokeWidth={1.6} />
        <h3 className="font-heading text-lg font-bold text-primary/70">
          No formulas found
        </h3>
        <p className="mt-2 max-w-sm font-body text-[14px] leading-relaxed text-dark/50">
          Try adjusting your search or clearing the filters to explore our full
          apothecary.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 rounded-full border border-accent/40 px-6 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-primary transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          Clear All Filters
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Result count */}
      <div className="mb-6 flex items-center gap-3">
        <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-dark/40">
          Showing{' '}
          <span className="text-primary/70">{products.length}</span> of{' '}
          {total} formulas
        </span>
        <span
          className="h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent"
          aria-hidden
        />
      </div>

      {/* Grid */}
      <motion.div
        variants={staggerParent(0.06, 0.05)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6"
      >
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </motion.div>
    </div>
  )
}
