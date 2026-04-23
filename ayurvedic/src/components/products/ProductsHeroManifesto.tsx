'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'
import GoldRule from './atmosphere/GoldRule'
import BotanicalSprig from './atmosphere/BotanicalSprig'

interface ProductsHeroManifestoProps {
  productCount: number
}

/**
 * Zero-photography editorial hero. Cream background, Playfair italic
 * headline in deep primary green with a gold italic accent, vertical
 * gold rule on the left, botanical line-art in the bottom-right.
 * Sets a reading-mode tone before the photographic product grid below.
 */
export default function ProductsHeroManifesto({ productCount }: ProductsHeroManifestoProps) {
  return (
    <section
      aria-labelledby="products-hero-heading"
      className="relative overflow-hidden bg-cream"
    >
      {/* soft atmospheric wash — same family as home / about */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 10% 20%, rgba(212,163,115,0.10) 0%, transparent 55%), radial-gradient(ellipse at 88% 85%, rgba(122,157,84,0.08) 0%, transparent 60%)',
        }}
      />
      {/* paper grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Bottom-right botanical watermark */}
      <BotanicalSprig
        color="#2F5D50"
        opacity={0.12}
        className="pointer-events-none absolute -right-10 bottom-0 hidden h-[340px] w-[240px] md:block"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-14 pt-16 sm:px-8 md:pb-20 md:pt-20 lg:px-12">
        <motion.div
          variants={staggerParent(0.08, 0.05)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="flex flex-col items-start"
        >
          {/* Top utility row */}
          <motion.div
            variants={fadeUp(0)}
            className="flex w-full items-center gap-4"
          >
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.35em] text-accent">
              Vol II
            </span>
            <span
              aria-hidden
              className="h-px flex-1"
              style={{
                background:
                  'linear-gradient(to right, rgba(212,163,115,0.55), rgba(212,163,115,0.1), transparent)',
              }}
            />
            <span className="hidden font-display text-[13px] italic text-primary/55 md:inline">
              — The Apothecary. Hand-blended, classical.
            </span>
          </motion.div>

          {/* Two-column body — rail + headline */}
          <div className="mt-12 grid w-full grid-cols-1 gap-8 md:mt-16 md:grid-cols-[auto_1fr] md:gap-12">
            <GoldRule orientation="vertical" length="100%" className="hidden md:block" />

            <motion.div variants={fadeUp(0)} className="relative">
              <h1
                id="products-hero-heading"
                className="font-display text-primary"
                style={{
                  fontSize: 'clamp(3rem, 8vw, 7.5rem)',
                  fontWeight: 400,
                  lineHeight: 0.95,
                  letterSpacing: '-0.035em',
                }}
              >
                Hand-
                <span className="italic text-accent">blended.</span>
              </h1>

              <p
                className="mt-8 max-w-[44ch] font-display text-dark/65"
                style={{
                  fontStyle: 'italic',
                  fontSize: '16px',
                  lineHeight: 1.7,
                }}
              >
                Every oil, churna and wellness kit in this index is prepared from
                classical Kerala texts. No fillers, no perfumes, no shortcuts —
                only what is written on the label.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/50">
                  {productCount} Formulae
                </span>
                <span aria-hidden className="h-px w-8 bg-accent/60" />
                <Link
                  href="#products"
                  className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent transition-colors duration-300 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  Begin Reading ↓
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
