'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import SectionWrapper from '@/components/ui/SectionWrapper'
import { featuredProducts } from '@/data/featuredProducts'
import type { FeaturedProduct, ProductBadge } from '@/types/content'
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion'

const badgeStyles: Record<ProductBadge, string> = {
  NEW: 'bg-secondary text-white',
  BESTSELLER: 'bg-accent text-dark',
  SALE: 'bg-primary text-accent',
}

interface ProductCardProps {
  product: FeaturedProduct
  isHero?: boolean
}

function ProductCard({ product, isHero = false }: ProductCardProps) {
  return (
    <motion.article
      variants={fadeUp(0)}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_-28px_rgba(47,93,80,0.4)] ring-1 ring-dark/5 transition-shadow duration-500 hover:shadow-[0_30px_70px_-25px_rgba(47,93,80,0.55)] ${
        isHero ? 'h-full' : ''
      }`}
    >
      {/* Image */}
      <div
        className={`relative w-full overflow-hidden ${
          isHero ? 'aspect-[4/5] md:aspect-auto md:flex-1' : 'aspect-square'
        }`}
      >
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Image
            src={product.image}
            alt={`${product.name} — ${product.tagline}`}
            fill
            sizes={
              isHero
                ? '(max-width: 768px) 100vw, 50vw'
                : '(max-width: 768px) 50vw, 25vw'
            }
            className="object-cover"
          />
        </motion.div>

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 font-heading text-[10px] font-extrabold uppercase tracking-[0.16em] shadow-md ${badgeStyles[product.badge]}`}
          >
            {product.badge}
          </span>
        )}

        {/* Featured ribbon for hero card */}
        {isHero && (
          <div className="absolute right-0 top-6 z-10 -mr-2">
            <div className="relative bg-accent px-4 py-1.5 font-heading text-[10px] font-extrabold uppercase tracking-[0.18em] text-dark shadow-lg">
              Featured
              <span
                aria-hidden
                className="absolute right-0 top-full h-0 w-0 border-r-[8px] border-t-[8px] border-r-transparent border-t-[#a07850]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div
        className={`flex flex-col gap-2 p-6 ${isHero ? 'md:gap-3 md:p-8' : ''}`}
      >
        <span className="font-body text-[10px] uppercase tracking-[0.18em] text-dark/45">
          {product.category}
        </span>
        <h3
          className={`font-heading font-extrabold leading-tight text-primary ${
            isHero ? 'text-2xl md:text-3xl' : 'text-lg'
          }`}
        >
          {product.name}
        </h3>
        <p
          className={`font-body italic text-dark/60 ${
            isHero ? 'text-[15px]' : 'text-[13px]'
          }`}
        >
          {product.tagline}
        </p>

        {isHero && product.description && (
          <p className="mt-2 hidden font-body text-[14px] leading-relaxed text-dark/70 md:block">
            {product.description}
          </p>
        )}

        {/* Price + Add to Bag */}
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="flex flex-col">
            {product.oldPriceRm && (
              <span className="font-body text-[12px] text-dark/40 line-through">
                RM{product.oldPriceRm}
              </span>
            )}
            <data
              value={product.priceRm}
              className={`font-heading font-black text-primary ${
                isHero ? 'text-3xl' : 'text-xl'
              }`}
            >
              RM{product.priceRm}
            </data>
          </div>

          {/* Add-to-Bag: fixed pill on mobile, expanding circle on desktop */}
          <button
            type="button"
            aria-label={`Add ${product.name} to bag`}
            className="group/btn flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-4 text-white shadow-[0_12px_30px_-12px_rgba(47,93,80,0.7)] transition-colors duration-300 hover:bg-accent hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 md:w-11 md:justify-end md:gap-0 md:px-0 md:transition-all md:duration-500 md:hover:w-[140px] md:hover:px-4"
            onMouseEnter={e => {
              if (window.innerWidth >= 768) e.currentTarget.style.width = '140px'
            }}
            onMouseLeave={e => {
              if (window.innerWidth >= 768) e.currentTarget.style.width = '44px'
            }}
            onFocus={e => {
              if (window.innerWidth >= 768) e.currentTarget.style.width = '140px'
            }}
            onBlur={e => {
              if (window.innerWidth >= 768) e.currentTarget.style.width = '44px'
            }}
          >
            <span className="whitespace-nowrap font-heading text-[11px] font-bold uppercase tracking-[0.14em] md:opacity-0 md:transition-opacity md:duration-300 md:group-hover/btn:opacity-100 md:group-focus/btn:opacity-100">
              Add
            </span>
            <span className="flex h-11 w-auto flex-shrink-0 items-center justify-center md:w-11">
              <ShoppingBag className="h-4 w-4" strokeWidth={2.4} />
            </span>
          </button>
        </div>
      </div>
    </motion.article>
  )
}

export default function FeaturedProducts() {
  const [hero, ...rest] = featuredProducts

  return (
    <SectionWrapper
      id="featured-products"
      eyebrow="Bestsellers"
      title="What Our Community Loves"
      subtitle="Hand-blended in small batches at our Brickfields apothecary. Free of fillers, parabens and synthetic shortcuts."
      align="left"
      className="bg-background"
      headerActions={
        <Link
          href="#"
          className="group inline-flex items-center gap-2 font-heading text-[12px] font-bold uppercase tracking-[0.18em] text-primary transition-colors duration-300 hover:text-accent"
        >
          View All
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      }
    >
      <motion.div
        variants={staggerParent(0.1, 0.05)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="grid grid-cols-2 gap-5 md:grid-cols-12 md:grid-rows-2 md:gap-6"
      >
        {/* Hero card — left, spans 6 cols × 2 rows on desktop */}
        <div className="col-span-2 md:col-span-6 md:row-span-2">
          <ProductCard product={hero} isHero />
        </div>

        {/* 4 secondary cards */}
        {rest.map(p => (
          <div key={p.id} className="md:col-span-3 md:row-span-1">
            <ProductCard product={p} />
          </div>
        ))}
      </motion.div>
    </SectionWrapper>
  )
}
