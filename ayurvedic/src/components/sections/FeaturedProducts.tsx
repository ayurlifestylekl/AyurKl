'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Star } from 'lucide-react'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'
import { featuredProducts } from '@/data/featuredProducts'
import type { FeaturedProduct, ProductBadge } from '@/types/content'
import { LotusMark } from '@/components/ui/Ornament'

/* ── Palette (section-local; matches hero language) ── */
const EMERALD       = '#163F33'
const SAFFRON       = '#D4AF37'
const SAFFRON_DEEP  = '#D4AF37'
const TERRACOTTA    = '#D4AF37'
const CREAM         = '#F7F2E8'

const badgeStyles: Record<ProductBadge, { bg: string; color: string }> = {
  NEW:        { bg: EMERALD,                       color: '#FFFFFF' },
  BESTSELLER: { bg: SAFFRON,                       color: '#FFFFFF' },
  SALE:       { bg: TERRACOTTA,                    color: '#FFFFFF' },
  COMBO:      { bg: 'rgba(22, 63, 51,0.85)',         color: SAFFRON   },
}

export default function FeaturedProducts() {
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const categories = useMemo(() => {
    const cats = Array.from(new Set(featuredProducts.map(p => p.category)))
    return ['All', ...cats]
  }, [])

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return featuredProducts
    return featuredProducts.filter(p => p.category === activeCategory)
  }, [activeCategory])

  return (
    <section
      id="curated-collection"
      aria-labelledby="collection-heading"
      className="relative overflow-hidden pb-16 pt-12 lg:pb-24 lg:pt-16"
      style={{
        background: 'linear-gradient(160deg, #163F33 0%, #0F2C24 55%, #0A1F19 100%)',
      }}
    >
      {/* Atmospheric glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(45% 40% at 90% 5%, rgba(212, 175, 55,0.16) 0%, transparent 65%), radial-gradient(40% 50% at 8% 92%, rgba(22, 63, 51,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Paper grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-multiply"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />

      {/* Top saffron hairline */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 4%, rgba(212, 175, 55,0.45) 50%, transparent 96%)',
        }}
      />
      {/* Centered lotus medallion on the top hairline */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full p-2.5"
        style={{ backgroundColor: CREAM, border: '1px solid rgba(212, 175, 55,0.5)' }}
      >
        <LotusMark className="h-5 w-5" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">

        {/* ── HEADER ── Asymmetric: title left / sub line + filter intro right */}
        <motion.div
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-12"
        >
          {/* Title block */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3">
              <span
                className="h-px w-12"
                style={{ backgroundColor: SAFFRON_DEEP, opacity: 0.55 }}
                aria-hidden
              />
              <span
                className="font-heading text-[11px] font-bold uppercase tracking-[0.36em] sm:text-[12px]"
                style={{ color: SAFFRON_DEEP }}
              >
                Curated Collection
              </span>
            </div>

            <h2
              id="collection-heading"
              className="mt-5 flex flex-col items-start"
            >
              <span
                className="font-heading font-extrabold tracking-tight"
                style={{
                  color: '#F7F2E8',
                  fontSize: 'clamp(2.25rem, 4.4vw, 3.75rem)',
                  lineHeight: 1.02,
                  letterSpacing: '-0.02em',
                }}
              >
                Our Best
              </span>
              <span
                className="-mt-1 font-display italic"
                style={{
                  color: SAFFRON,
                  fontSize: 'clamp(2.5rem, 5.2vw, 4.25rem)',
                  lineHeight: 1.0,
                  letterSpacing: '-0.015em',
                  textShadow: '0 3px 22px rgba(212, 175, 55,0.25)',
                }}
              >
                Sellers
              </span>
            </h2>
          </div>

          {/* Right intro + tagline */}
          <div className="lg:col-span-6 lg:border-l lg:pl-12" style={{ borderColor: `${SAFFRON}33` }}>
            <p
              className="font-body leading-[1.7]"
              style={{
                color: 'rgba(247, 242, 232,0.82)',
                fontSize: 'clamp(15px, 1.1vw, 17px)',
              }}
            >
              Hand-blended in small batches, prescribed by our Vaidyas and bottled
              fresh at our apothecary in Brickfields.
            </p>
            <p
              className="mt-3 font-display italic leading-[1.55]"
              style={{
                color: 'rgba(247, 242, 232,0.6)',
                fontSize: 'clamp(14px, 1.05vw, 16px)',
              }}
            >
              Loved by 5,000+ patients across Malaysia.
            </p>
          </div>
        </motion.div>

        {/* ── FILTER TABS ── */}
        <motion.div
          variants={fadeUp(0.1)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="no-scrollbar mt-10 mb-10 flex items-center gap-2.5 overflow-x-auto pb-2 lg:mt-12 lg:mb-14"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="whitespace-nowrap rounded-full px-5 py-2.5 font-heading text-[11px] font-bold uppercase tracking-[0.22em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={
                  isActive
                    ? {
                        backgroundColor: SAFFRON,
                        color: '#1F1F1F',
                        boxShadow: `0 14px 30px -14px ${SAFFRON}cc`,
                        border: `1px solid ${SAFFRON}`,
                      }
                    : {
                        backgroundColor: 'rgba(247, 242, 232,0.06)',
                        color: 'rgba(247, 242, 232,0.85)',
                        border: `1px solid ${SAFFRON}55`,
                      }
                }
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
                <ProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

function ProductCard({ product }: { product: FeaturedProduct }) {
  const reviewScore = (4.5 + (product.id.length % 5) * 0.1).toFixed(1)
  const reviewCount = 120 + product.id.length * 14
  const badge = product.badge ? badgeStyles[product.badge] : null

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#FCFAF4] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#D4AF37]/45"
      style={{
        boxShadow: '0 10px 38px -18px rgba(22, 63, 51,0.20), 0 2px 8px rgba(22, 63, 51,0.05)',
      }}
    >
      {/* ── IMAGE ── */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden"
        style={{ backgroundColor: CREAM }}
      >
        <Image
          src={product.image}
          alt={`${product.name} — ${product.tagline}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-[2s] ease-out group-hover:scale-[1.05]"
        />

        {/* Subtle emerald wash, fades on hover */}
        <div
          aria-hidden
          className="absolute inset-0 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0"
          style={{ backgroundColor: 'rgba(22, 63, 51,0.04)' }}
        />

        {/* Saffron glow appears on hover */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 100%, rgba(212, 175, 55,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Badge */}
        {badge && product.badge && (
          <span
            className="absolute left-4 top-4 rounded-full px-3 py-1 font-heading text-[9px] font-bold uppercase tracking-[0.25em] shadow-sm"
            style={{
              backgroundColor: badge.bg,
              color: badge.color,
              letterSpacing: '0.22em',
            }}
          >
            {product.badge}
          </span>
        )}
      </div>

      {/* ── INFO ── */}
      <div className="flex flex-grow flex-col justify-between p-6">

        <div className="flex flex-col">
          <h3
            className="font-heading text-[18px] font-extrabold leading-tight transition-colors duration-300"
            style={{ color: EMERALD, letterSpacing: '-0.005em' }}
          >
            {product.name}
          </h3>
          <p
            className="mt-1.5 font-display italic line-clamp-1"
            style={{
              color: 'rgba(22, 63, 51,0.6)',
              fontSize: '14px',
            }}
          >
            {product.tagline}
          </p>

          {/* Star rating — saffron */}
          <div className="mt-3 flex items-center gap-1.5">
            <div className="flex" style={{ color: SAFFRON }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-3 w-3 fill-current" />
              ))}
            </div>
            <span className="font-body text-[11px] font-medium" style={{ color: 'rgba(22, 63, 51,0.5)' }}>
              {reviewScore} · {reviewCount} reviews
            </span>
          </div>

          {/* Pricing */}
          <div className="mt-5 flex items-end gap-2">
            {product.oldPriceRm && (
              <span
                className="mb-[2px] font-body text-[12px] line-through"
                style={{ color: 'rgba(22, 63, 51,0.3)' }}
              >
                RM{product.oldPriceRm}
              </span>
            )}
            <div className="flex items-baseline gap-0.5">
              <span
                className="font-body text-[11px] font-medium uppercase tracking-widest"
                style={{ color: 'rgba(22, 63, 51,0.4)' }}
              >
                RM
              </span>
              <data
                value={product.priceRm}
                className="font-heading text-[1.5rem] font-extrabold tracking-tight"
                style={{ color: EMERALD }}
              >
                {product.priceRm}
              </data>
            </div>
          </div>
        </div>

        {/* Add to Bag */}
        <button
          type="button"
          aria-label={`Add ${product.name} to bag`}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 font-heading text-[10px] font-bold uppercase tracking-[0.22em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            backgroundColor: 'rgba(22, 63, 51,0.06)',
            color: EMERALD,
            border: `1px solid ${EMERALD}1a`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = EMERALD
            e.currentTarget.style.color = '#FFFFFF'
            e.currentTarget.style.boxShadow = `0 14px 32px -16px ${EMERALD}99`
            e.currentTarget.style.borderColor = EMERALD
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(22, 63, 51,0.06)'
            e.currentTarget.style.color = EMERALD
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = `${EMERALD}1a`
          }}
        >
          <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} />
          Add to Bag
        </button>
      </div>
    </article>
  )
}
