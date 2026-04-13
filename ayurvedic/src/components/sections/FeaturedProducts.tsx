'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { clipReveal, fadeUp, staggerParent, inViewOnce } from '@/lib/motion'
import { featuredProducts } from '@/data/featuredProducts'
import type { FeaturedProduct, ProductBadge } from '@/types/content'

const badgeColors: Record<ProductBadge, string> = {
  NEW: 'text-secondary',
  BESTSELLER: 'text-accent',
  SALE: 'text-primary',
  COMBO: 'text-[#7A9D54]',
}

/**
 * Editorial lookbook layout:
 * Hero product = large horizontal band (image 50% + info 50%)
 * Secondary products = 4-column frameless grid
 */
export default function FeaturedProducts() {
  const [hero, ...rest] = featuredProducts

  return (
    <section
      id="featured-products"
      aria-labelledby="products-heading"
      className="relative bg-background"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 md:py-20 lg:px-12">
        {/* Header */}
        <motion.div
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between lg:mb-16"
        >
          <div>
            <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">
              Bestsellers
            </span>
            <h2
              id="products-heading"
              className="mt-3 font-heading text-3xl font-extrabold leading-[1.1] text-primary sm:text-4xl"
            >
              What Our Community Loves
            </h2>
          </div>
          <Link
            href="#"
            className="group inline-flex items-center gap-2 font-heading text-[12px] font-bold uppercase tracking-[0.18em] text-primary transition-colors duration-300 hover:text-accent"
          >
            View All
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Hero product — horizontal band */}
        <div className="mb-12 grid grid-cols-1 items-center gap-8 lg:mb-16 lg:grid-cols-2 lg:gap-14">
          {/* Image */}
          <motion.div
            variants={clipReveal('left', 0)}
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="relative aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[3/4]"
          >
            <Image
              src={hero.image}
              alt={`${hero.name} — ${hero.tagline}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
            />
            <div
              className="absolute inset-0 mix-blend-multiply"
              style={{ backgroundColor: 'rgba(47,93,80,0.06)' }}
              aria-hidden
            />
          </motion.div>

          {/* Info */}
          <motion.div
            variants={fadeUp(0.15)}
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="flex flex-col"
          >
            {/* Badge */}
            {hero.badge && (
              <span
                className={`font-heading text-[10px] font-bold uppercase tracking-[0.2em] ${badgeColors[hero.badge]}`}
              >
                {hero.badge}
              </span>
            )}
            <span className="mt-2 font-heading text-[10px] font-semibold uppercase tracking-[0.25em] text-accent/70">
              {hero.category}
            </span>
            <h3 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-primary lg:text-4xl">
              {hero.name}
            </h3>
            <p className="mt-2 font-body text-[15px] italic text-dark/55">
              {hero.tagline}
            </p>
            {hero.description && (
              <p className="mt-4 max-w-md font-body text-[14px] leading-[1.7] text-dark/60">
                {hero.description}
              </p>
            )}

            {/* Price */}
            <data
              value={hero.priceRm}
              className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-primary"
            >
              RM{hero.priceRm}
            </data>

            {/* Add to Bag */}
            <button
              type="button"
              aria-label={`Add ${hero.name} to bag`}
              className="mt-5 inline-flex w-fit items-center gap-2.5 rounded-full border border-accent/40 bg-transparent px-7 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.15em] text-primary transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97]"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={2} />
              Add to Bag
            </button>
          </motion.div>
        </div>

        {/* Secondary products — frameless grid */}
        <motion.div
          variants={staggerParent(0.1, 0.05)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8"
        >
          {rest.map(p => (
            <SecondaryProductCard key={p.id} product={p} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function SecondaryProductCard({ product }: { product: FeaturedProduct }) {
  return (
    <motion.article
      variants={fadeUp(0)}
      className="group flex flex-col"
    >
      {/* Image — no card frame */}
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <Image
          src={product.image}
          alt={`${product.name} — ${product.tagline}`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{ backgroundColor: 'rgba(47,93,80,0.05)' }}
          aria-hidden
        />

        {/* Badge as text label */}
        {product.badge && (
          <span
            className={`absolute left-3 top-3 font-heading text-[9px] font-bold uppercase tracking-[0.18em] ${badgeColors[product.badge]}`}
          >
            {product.badge}
          </span>
        )}
      </div>

      {/* Text */}
      <span className="mt-3 font-heading text-[9px] font-semibold uppercase tracking-[0.22em] text-dark/35">
        {product.category}
      </span>
      <h3 className="mt-1 font-heading text-[15px] font-bold text-dark/80 transition-colors duration-300 group-hover:text-primary">
        {product.name}
      </h3>
      <p className="mt-0.5 font-body text-[12px] italic text-dark/45">
        {product.tagline}
      </p>

      {/* Price */}
      <div className="mt-2 flex items-baseline gap-2">
        {product.oldPriceRm && (
          <span className="font-body text-[12px] text-dark/35 line-through">
            RM{product.oldPriceRm}
          </span>
        )}
        <data
          value={product.priceRm}
          className="font-heading text-lg font-extrabold text-primary"
        >
          RM{product.priceRm}
        </data>
      </div>

      {/* Gold underline on hover */}
      <span
        className="mt-2 block h-px w-0 bg-accent transition-all duration-500 group-hover:w-10"
        aria-hidden
      />
    </motion.article>
  )
}
