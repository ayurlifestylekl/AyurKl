'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import SectionWrapper from '@/components/ui/SectionWrapper'
import { categories } from '@/data/categories'
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion'

export default function ShopByCategory() {
  return (
    <SectionWrapper
      id="shop-by-category"
      eyebrow="Our Apothecary"
      title="Shop by Concern"
      subtitle="Authentic Kerala herbal formulas, sourced directly from Kerala, India — hand-picked for your body's needs."
      className="bg-cream"
    >
      <motion.ul
        variants={staggerParent(0.05, 0.05)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-8 lg:gap-6"
      >
        {categories.map(cat => {
          const Icon = cat.icon
          return (
            <motion.li key={cat.slug} variants={fadeUp(0)} className="flex">
              <Link
                href={cat.href}
                aria-label={`Shop ${cat.label}`}
                className="group flex w-full flex-col items-center gap-3 rounded-2xl px-2 py-3 text-center transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                {/* Circular tile */}
                <div className="relative">
                  {/* Floating icon pill — slides down on hover */}
                  <div className="pointer-events-none absolute -top-3 left-1/2 z-20 -translate-x-1/2 -translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/40">
                      <Icon className="h-4 w-4 text-white" strokeWidth={2.4} />
                    </div>
                  </div>
                  <div className="relative aspect-square w-full max-w-[140px] overflow-hidden rounded-full ring-2 ring-accent/20 transition-all duration-500 group-hover:ring-4 group-hover:ring-accent/60">
                    <Image
                      src={cat.image}
                      alt={`${cat.label} category`}
                      fill
                      sizes="140px"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/10"
                    />
                  </div>
                </div>

                {/* Label */}
                <span className="font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-primary transition-colors duration-300 group-hover:text-accent">
                  {cat.label}
                </span>
              </Link>
            </motion.li>
          )
        })}
      </motion.ul>
    </SectionWrapper>
  )
}
