'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Award, BadgeCheck, Leaf } from 'lucide-react'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'

const credentials = [
  { text: 'Since 2008', icon: Award },
  { text: 'Vaidya AKHIL HS (B.A.M.S)', icon: BadgeCheck },
  { text: 'Authentic Kerala Formulas', icon: Leaf },
]

/**
 * Seamless credential strip — sits naturally between Hero and EmpathyBridge.
 * Edge-to-edge, cream background, gold hairlines. No floating pill.
 */
export default function TrustStrip() {
  return (
    <section
      aria-labelledby="trust-heading"
      className="relative bg-primary"
    >
      <h2 id="trust-heading" className="sr-only">
        Why Kerala Ayurvedic Lifestyle
      </h2>

      {/* Top gold hairline */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 5%, rgba(212,163,115,0.25) 30%, rgba(212,163,115,0.25) 70%, transparent 95%)',
        }}
      />

      {/* Bottom gold hairline */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 5%, rgba(212,163,115,0.25) 30%, rgba(212,163,115,0.25) 70%, transparent 95%)',
        }}
      />

      <motion.div
        variants={staggerParent(0.08, 0.05)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="mx-auto flex max-w-5xl items-center justify-center gap-6 px-6 py-5 sm:gap-10 sm:px-8 sm:py-6 lg:px-12"
      >
        {credentials.map((cred, i) => (
          <React.Fragment key={cred.text}>
            <motion.div
              variants={fadeUp(0)}
              className="flex items-center gap-2.5 sm:gap-3"
            >
              <cred.icon
                className="h-4 w-4 shrink-0 text-accent sm:h-[18px] sm:w-[18px]"
                strokeWidth={1.8}
              />
              <span className="font-heading text-[9px] font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-[11px] sm:tracking-[0.22em]">
                {cred.text}
              </span>
            </motion.div>

            {/* Gold vertical divider */}
            {i < credentials.length - 1 && (
              <div
                aria-hidden
                className="h-4 w-px shrink-0 bg-white/20 sm:h-5"
              />
            )}
          </React.Fragment>
        ))}
      </motion.div>
    </section>
  )
}
