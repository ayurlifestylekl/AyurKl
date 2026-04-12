'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'
import { categories } from '@/data/categories'

/**
 * Rectangular image tiles with category label overlaid at bottom.
 * Single horizontal row on desktop, snap carousel on mobile.
 */
export default function ShopByCategory() {
  return (
    <section
      id="shop-by-category"
      aria-labelledby="category-heading"
      className="relative bg-background"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 md:py-20 lg:px-12">
        {/* Header */}
        <motion.div
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="mb-10 lg:mb-14"
        >
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">
            Our Apothecary
          </span>
          <h2
            id="category-heading"
            className="mt-3 font-heading text-3xl font-extrabold leading-[1.1] text-primary sm:text-4xl"
          >
            Shop by Concern
          </h2>
        </motion.div>

        {/* Tiles — horizontal scroll on mobile, full row on desktop */}
        <motion.div
          variants={staggerParent(0.06, 0.1)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6 snap-x snap-mandatory sm:-mx-0 sm:px-0 lg:grid lg:grid-cols-8 lg:gap-3 lg:overflow-visible"
        >
          {categories.map(cat => (
            <motion.div
              key={cat.slug}
              variants={fadeUp(0)}
              className="w-[42vw] flex-shrink-0 snap-start sm:w-[28vw] lg:w-auto"
            >
              <Link
                href={cat.href}
                aria-label={`Shop ${cat.label}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                {/* Image */}
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 12.5vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                />

                {/* Dark gradient overlay */}
                <div
                  className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-90"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(43,43,43,0.75) 0%, rgba(43,43,43,0.15) 40%, transparent 65%)',
                    opacity: 0.8,
                  }}
                  aria-hidden
                />

                {/* Green tint */}
                <div
                  className="absolute inset-0 mix-blend-multiply"
                  style={{ backgroundColor: 'rgba(47,93,80,0.06)' }}
                  aria-hidden
                />

                {/* Label */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <span className="block font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-transform duration-500 group-hover:-translate-y-1 sm:text-[11px]">
                    {cat.label}
                  </span>
                  {/* Gold underline on hover */}
                  <span
                    className="mt-1.5 block h-px w-0 bg-accent transition-all duration-500 group-hover:w-8"
                    aria-hidden
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
