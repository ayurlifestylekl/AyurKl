'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ArrowUpRight } from 'lucide-react'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'
import { featuredProducts } from '@/data/featuredProducts'
import type { FeaturedProduct, ProductBadge } from '@/types/content'
import { LotusMark } from '@/components/ui/Ornament'
import NocturneFrame from '@/components/products/atmosphere/NocturneFrame'

/* ── Palette (section-local; matches hero language) ── */
const EMERALD       = '#6E3420'
const SAFFRON       = '#D4AF37'
const SAFFRON_DEEP  = '#D4AF37'
const TERRACOTTA    = '#D4AF37'
const CREAM         = '#F7F2E8'
const CARD_INK      = '#6E1023'   // burgundy text/price on the blush card (surface #F3E2CE set inline)

const badgeStyles: Record<ProductBadge, { bg: string; color: string }> = {
  NEW:        { bg: EMERALD,                       color: '#FFFFFF' },
  BESTSELLER: { bg: SAFFRON,                       color: '#FFFFFF' },
  SALE:       { bg: TERRACOTTA,                    color: '#FFFFFF' },
  COMBO:      { bg: 'rgba(110,52,32,0.85)',         color: SAFFRON   },
}

interface FeaturedProductsProps {
  initialProducts?: FeaturedProduct[]
}

export default function FeaturedProducts({ initialProducts }: FeaturedProductsProps) {
  const products = initialProducts && initialProducts.length > 0 ? initialProducts : featuredProducts
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)))
    return ['All', ...cats]
  }, [products])

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products
    return products.filter(p => p.category === activeCategory)
  }, [activeCategory, products])

  return (
    <section
      id="curated-collection"
      aria-labelledby="collection-heading"
      className="relative overflow-hidden pb-16 pt-12 lg:pb-24 lg:pt-16"
      style={{
        background: 'linear-gradient(160deg, #6E3420 0%, #4E2416 55%, #38190E 100%)',
      }}
    >
      {/* Atmospheric glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(45% 40% at 90% 5%, rgba(212, 175, 55,0.16) 0%, transparent 65%), radial-gradient(40% 50% at 8% 92%, rgba(110,52,32,0.08) 0%, transparent 60%)',
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
        {filteredProducts.length === 0 ? (
          <p
            className="py-16 text-center font-display italic"
            style={{ color: 'rgba(247, 242, 232,0.55)', fontSize: 'clamp(16px, 2vw, 20px)' }}
          >
            New formulations are on their way — check back soon.
          </p>
        ) : (
          <motion.div
            variants={staggerParent(0.1, 0.05)}
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6"
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
        )}
      </div>
    </section>
  )
}

function ProductCard({ product }: { product: FeaturedProduct }) {
  const reviewScore = (4.5 + (product.id.length % 5) * 0.1).toFixed(1)
  const reviewCount = 120 + product.id.length * 14
  const badge = product.badge ? badgeStyles[product.badge] : null
  const hasDiscount = !!product.oldPriceRm && product.oldPriceRm > product.priceRm

  return (
    <Link
      href={`/products/${product.id}`}
      aria-label={`${product.name} — ${product.tagline}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-[#F3E2CE] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#D4AF37]/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2"
      style={{
        boxShadow: '0 10px 38px -18px rgba(53,7,16,0.30), 0 2px 8px rgba(53,7,16,0.08)',
      }}
    >
      {/* ── Image ── */}
      <NocturneFrame
        src={product.image}
        alt={`${product.name} — ${product.tagline}`}
        aspectRatio="1 / 1"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        className="relative shrink-0"
      >
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between">
          {badge && product.badge ? (
            <span
              className="rounded-full px-3 py-1 font-heading text-[9px] font-bold uppercase tracking-[0.22em]"
              style={{ backgroundColor: badge.bg, color: badge.color }}
            >
              {product.badge}
            </span>
          ) : (
            <span />
          )}
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(247,242,232,0.9)' }}
          >
            <LotusMark className="h-4 w-4" />
          </span>
        </div>
      </NocturneFrame>

      {/* ── INFO ── */}
      <div className="flex flex-grow flex-col justify-between px-5 pb-5 pt-4">
        <div className="flex flex-col">
          <span
            className="font-heading text-[9px] font-bold uppercase tracking-[0.24em]"
            style={{ color: 'rgba(110,16,35,0.5)' }}
          >
            {product.category}
          </span>
          <h3
            className="mt-1.5 font-heading text-[16px] font-extrabold leading-tight transition-colors duration-300"
            style={{ color: CARD_INK, letterSpacing: '-0.005em' }}
          >
            {product.name}
          </h3>
          <p
            className="mt-1 font-display italic line-clamp-1"
            style={{
              color: 'rgba(110,16,35,0.62)',
              fontSize: '13px',
            }}
          >
            {product.tagline}
          </p>

          {/* Star rating — saffron */}
          <div className="mt-2.5 flex items-center gap-1.5">
            <div className="flex" style={{ color: SAFFRON }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-3 w-3 fill-current" />
              ))}
            </div>
            <span className="font-body text-[10.5px] font-medium" style={{ color: 'rgba(110,16,35,0.55)' }}>
              {reviewScore} · {reviewCount}
            </span>
          </div>
        </div>

        {/* Price + Shop Now */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-[16px] font-bold" style={{ color: CARD_INK }}>
              RM{product.priceRm}
            </span>
            {hasDiscount && (
              <span
                className="font-body text-[11px] line-through"
                style={{ color: 'rgba(110,16,35,0.4)' }}
              >
                RM{product.oldPriceRm}
              </span>
            )}
          </div>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-105"
            style={{
              backgroundColor: CARD_INK,
              color: '#F7F2E8',
              boxShadow: '0 10px 22px -10px rgba(110,16,35,0.6)',
            }}
            aria-hidden
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
