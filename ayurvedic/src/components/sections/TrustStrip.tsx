'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { EASE_OUT_PREMIUM } from '@/lib/motion'

const credentials = [
  'Since 2008',
  'Certified Vaidya AKHIL HS (B.A.M.S)',
  'Authentic Kerala Formulas',
]

/**
 * Thin credential bar — floats between Hero and EmpathyBridge.
 * Single line of text, no icons. Inspired by luxury hotel credential strips.
 */
export default function TrustStrip() {
  return (
    <section
      aria-labelledby="trust-heading"
      className="relative z-20 -mt-4 px-6 sm:px-8 lg:px-12"
    >
      <h2 id="trust-heading" className="sr-only">
        Why Kerala Ayurvedic Lifestyle
      </h2>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: EASE_OUT_PREMIUM }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-primary/[0.97] px-6 py-4 shadow-[0_20px_50px_-20px_rgba(47,93,80,0.5)] sm:px-10 sm:py-5"
      >
        {/* Top gold hairline */}
        <div
          aria-hidden
          className="absolute inset-x-6 top-0 h-px"
          style={{
            background:
              'linear-gradient(to right, transparent, rgba(212,163,115,0.4), transparent)',
          }}
        />
        {/* Bottom gold hairline */}
        <div
          aria-hidden
          className="absolute inset-x-6 bottom-0 h-px"
          style={{
            background:
              'linear-gradient(to right, transparent, rgba(212,163,115,0.4), transparent)',
          }}
        />

        {/* Desktop: single horizontal line */}
        <div className="hidden items-center justify-center gap-0 sm:flex">
          {credentials.map((text, i) => (
            <React.Fragment key={text}>
              <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80">
                {text}
              </span>
              {i < credentials.length - 1 && (
                <span className="mx-5 text-[8px] text-accent/70">&#9670;</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile: stacked */}
        <div className="flex flex-col items-center gap-2 sm:hidden">
          {credentials.map((text, i) => (
            <React.Fragment key={text}>
              <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80 text-center">
                {text}
              </span>
              {i < credentials.length - 1 && (
                <span className="text-[7px] text-accent/60">&#9670;</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
