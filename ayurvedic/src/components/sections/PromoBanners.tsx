'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { EASE_OUT_PREMIUM } from '@/lib/motion'

/**
 * Single-line benefits bar — Net-a-Porter style.
 * No colored pills, no icons, no shimmer. Just clean information.
 */
export default function PromoBanners() {
  return (
    <section aria-label="Promotional offers" className="bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: EASE_OUT_PREMIUM }}
        className="mx-auto max-w-5xl px-6 py-5 sm:px-8 lg:px-12"
      >
        {/* Desktop: single horizontal line */}
        <div className="hidden items-center justify-center gap-0 sm:flex">
          <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70">
            Free Shipping Over RM150
          </span>
          <span
            className="mx-5 inline-block h-3.5 w-px bg-accent/40"
            aria-hidden
          />
          <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70">
            First-Time 10% Off:{' '}
            <span className="rounded-sm bg-accent/15 px-1.5 py-0.5 text-accent">
              WELCOME10
            </span>
          </span>
          <span
            className="mx-5 inline-block h-3.5 w-px bg-accent/40"
            aria-hidden
          />
          <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70">
            Bundle &amp; Save 25%
          </span>
        </div>

        {/* Mobile: stacked */}
        <div className="flex flex-col items-center gap-2.5 sm:hidden">
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">
            Free Shipping Over RM150
          </span>
          <span className="text-[6px] text-accent/50">&#9679;</span>
          <span className="text-center font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">
            First-Time 10% Off:{' '}
            <span className="rounded-sm bg-accent/15 px-1.5 py-0.5 text-accent">
              WELCOME10
            </span>
          </span>
          <span className="text-[6px] text-accent/50">&#9679;</span>
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">
            Bundle &amp; Save 25%
          </span>
        </div>
      </motion.div>
    </section>
  )
}
