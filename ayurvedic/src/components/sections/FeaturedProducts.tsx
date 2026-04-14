'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Star } from 'lucide-react'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'
import { featuredProducts } from '@/data/featuredProducts'
import type { FeaturedProduct, ProductBadge } from '@/types/content'

const badgeColors: Record<ProductBadge, string> = {
  NEW: 'bg-secondary text-white',
  BESTSELLER: 'bg-accent text-white',
  SALE: 'bg-primary text-white',
  COMBO: 'bg-[#7A9D54] text-white',
}

export default function FeaturedProducts() {
  const [activeCategory, setActiveCategory] = useState<string>('All')

  // Generate unique categories dynamically from products
  const categories = useMemo(() => {
    const cats = Array.from(new Set(featuredProducts.map(p => p.category)))
    return ['All', ...cats]
  }, [])

  // Filter products
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return featuredProducts
    return featuredProducts.filter(p => p.category === activeCategory)
  }, [activeCategory])

  return (
    <section
      id="curated-collection"
      aria-labelledby="collection-heading"
      className="relative bg-[#f8f6f0] pb-14 pt-8 lg:pb-20 lg:pt-10"
    >
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        
        {/* ── HEADER ── */}
        <motion.div
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="mb-10 flex flex-col items-center text-center lg:mb-16"
        >
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
            Curated Collection
          </span>
          <h2
            id="collection-heading"
            className="mt-4 font-heading text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold leading-[1.05] tracking-tight text-primary"
          >
            Our Best Sellers
          </h2>
        </motion.div>

        {/* ── LUXURY FILTER TABS ── */}
        <motion.div
          variants={fadeUp(0.1)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="no-scrollbar mb-12 flex items-center justify-start gap-3 overflow-x-auto pb-4 sm:justify-center lg:mb-16 lg:pb-0"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap rounded-full px-6 py-2.5 font-heading text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-primary text-white shadow-lg'
                    : 'border border-primary/15 text-primary/70 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </motion.div>

        {/* ── PRODUCT GRID ── */}
        <motion.div
          variants={staggerParent(0.1, 0.05)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <SecondaryProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

function SecondaryProductCard({ product }: { product: FeaturedProduct }) {
  // Generate a random-looking but consistent review count/score based on the ID length
  const reviewScore = (4.5 + (product.id.length % 5) * 0.1).toFixed(1)
  const reviewCount = 120 + product.id.length * 14

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-shadow duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
      
      {/* ── IMAGE CONTAINER ── */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream">
        <Image
          src={product.image}
          alt={`${product.name} — ${product.tagline}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-[2s] ease-out group-hover:scale-[1.05]"
        />
        
        {/* Soft luxury vignette */}
        <div
          className="absolute inset-0 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0"
          style={{ backgroundColor: 'rgba(47,93,80,0.04)' }}
          aria-hidden
        />

        {/* Floating Badge */}
        {product.badge && (
          <span
            className={`absolute left-4 top-4 rounded-sm px-2.5 py-1 font-heading text-[8px] font-bold uppercase tracking-[0.25em] shadow-sm ${badgeColors[product.badge]}`}
          >
            {product.badge}
          </span>
        )}
      </div>

      {/* ── INFO & ACTION ── */}
      <div className="flex flex-grow flex-col justify-between p-6">
        
        <div className="flex flex-col">
          <h3 className="font-heading text-[18px] font-extrabold leading-tight text-primary transition-colors duration-300 group-hover:text-accent">
            {product.name}
          </h3>
          <p className="mt-1.5 font-body text-[14px] italic text-dark/60 line-clamp-1">
            {product.tagline}
          </p>

          {/* Elegant Star Rating */}
          <div className="mt-3 flex items-center gap-1.5">
            <div className="flex text-accent">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-3 w-3 fill-current" />
              ))}
            </div>
            <span className="font-body text-[11px] font-medium text-dark/50">
              {reviewScore} | {reviewCount} reviews
            </span>
          </div>

          {/* Pricing */}
          <div className="mt-5 flex items-end gap-2">
            {product.oldPriceRm && (
              <span className="mb-[2px] font-body text-[12px] text-dark/30 line-through">
                RM{product.oldPriceRm}
              </span>
            )}
            <div className="flex items-baseline gap-0.5">
              <span className="font-body text-[11px] font-medium tracking-widest text-primary/40 uppercase">
                RM
              </span>
              <data
                value={product.priceRm}
                className="font-heading text-[1.4rem] font-extrabold tracking-tight text-primary"
              >
                {product.priceRm}
              </data>
            </div>
          </div>
        </div>

        {/* Add to Bag Button (Full Width, pinned to bottom) */}
        <button
          type="button"
          aria-label={`Add ${product.name} to bag`}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary/5 px-4 py-3.5 font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(47,93,80,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} />
          Add to Bag
        </button>

      </div>
    </article>
  )
}
