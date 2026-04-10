'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { trustItems } from '@/data/trust'
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion'

/**
 * Thin trust band that bleeds into the bottom of the hero.
 * Three pillars: Heritage / Certified / Authentic.
 */
export default function TrustStrip() {
  return (
    <section
      aria-labelledby="trust-heading"
      className="relative z-20 -mt-6 px-6 sm:px-8 lg:px-12"
    >
      <h2 id="trust-heading" className="sr-only">
        Why Kerala Ayurvedic Lifestyle
      </h2>

      <motion.div
        variants={staggerParent(0.08, 0)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-primary px-6 py-8 shadow-[0_30px_70px_-30px_rgba(47,93,80,0.65)] sm:px-10 md:py-10"
      >
        {/* Subtle gold gradient overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(212,163,115,0.18) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(212,163,115,0.12) 0%, transparent 60%)',
          }}
        />

        {/* Top gold rule */}
        <div
          aria-hidden
          className="absolute left-10 right-10 top-0 h-px"
          style={{
            background:
              'linear-gradient(to right, transparent, rgba(212,163,115,0.5), transparent)',
          }}
        />

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-white/15">
          {trustItems.map(item => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.id}
                variants={fadeUp(0)}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="group flex flex-col items-center gap-3 px-4 text-center md:px-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/8 ring-1 ring-accent/40 transition-all duration-300 group-hover:bg-white/15 group-hover:ring-accent/70">
                  <Icon className="h-6 w-6 text-accent" strokeWidth={1.8} />
                </div>
                <h3 className="font-heading text-[13px] font-bold uppercase tracking-[0.18em] text-white">
                  {item.title}
                </h3>
                <p className="max-w-[260px] font-body text-[13px] leading-relaxed text-white/70">
                  {item.subtitle}
                </p>
                {/* Animated gold underline */}
                <span
                  aria-hidden
                  className="mt-1 block h-px w-6 origin-center scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100"
                />
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
