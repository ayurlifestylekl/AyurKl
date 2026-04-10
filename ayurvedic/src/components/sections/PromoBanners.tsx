'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { promos } from '@/data/promos'
import type { PromoAccent } from '@/types/content'
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion'

const accentStyles: Record<
  PromoAccent,
  {
    bg: string
    text: string
    sub: string
    iconBg: string
    iconColor: string
  }
> = {
  primary: {
    bg: 'bg-gradient-to-r from-primary to-primary/80',
    text: 'text-white',
    sub: 'text-accent',
    iconBg: 'bg-accent/20 ring-accent/40',
    iconColor: 'text-accent',
  },
  accent: {
    bg: 'bg-gradient-to-r from-accent to-accent/85',
    text: 'text-dark',
    sub: 'text-primary',
    iconBg: 'bg-white/30 ring-white/50',
    iconColor: 'text-primary',
  },
  secondary: {
    bg: 'bg-gradient-to-r from-secondary to-secondary/80',
    text: 'text-white',
    sub: 'text-white/85',
    iconBg: 'bg-white/15 ring-white/30',
    iconColor: 'text-white',
  },
}

export default function PromoBanners() {
  return (
    <section
      aria-labelledby="promos-heading"
      className="bg-background px-6 pb-10 pt-2 sm:px-8 lg:px-12"
    >
      <h2 id="promos-heading" className="sr-only">
        Current offers
      </h2>

      <motion.div
        variants={staggerParent(0.1, 0.05)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3 md:gap-6"
      >
        {promos.map(promo => {
          const Icon = promo.icon
          const styles = accentStyles[promo.accent]
          return (
            <motion.div
              key={promo.id}
              variants={fadeUp(0)}
              whileHover={{ scale: 1.02, y: -3 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className={`group relative flex items-center gap-4 overflow-hidden rounded-3xl px-6 py-5 shadow-[0_18px_45px_-22px_rgba(43,43,43,0.45)] md:rounded-full md:px-7 ${styles.bg}`}
            >
              {/* Icon */}
              <div
                className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ring-2 transition-transform duration-500 group-hover:rotate-[10deg] ${styles.iconBg}`}
              >
                <Icon className={`h-6 w-6 ${styles.iconColor}`} strokeWidth={2} />
              </div>

              {/* Text */}
              <div className="relative z-10 flex flex-col">
                <p
                  className={`font-heading text-[15px] font-extrabold uppercase tracking-[0.08em] ${styles.text}`}
                >
                  {promo.headline}
                </p>
                <p className={`font-body text-[13px] ${styles.sub}`}>
                  {promo.sub}
                </p>
              </div>

              {/* Shimmer sweep — uses globals.css keyframe */}
              <span
                aria-hidden
                className="shimmer-sweep pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)',
                  width: '50%',
                }}
              />
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
