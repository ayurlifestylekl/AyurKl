'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'
import { BotanicalMandala, FloatingLeaf } from '@/components/ui/Decorations'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'

interface ProductsHeroProps {
  productCount: number
}

export default function ProductsHero({ productCount }: ProductsHeroProps) {
  return (
    <section
      aria-labelledby="products-hero-heading"
      className="relative overflow-hidden bg-[#FAF6EE]"
    >
      {/* Atmospheric layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 12% 20%, rgba(212,163,115,0.14) 0%, transparent 50%), radial-gradient(ellipse at 88% 80%, rgba(122,157,84,0.10) 0%, transparent 55%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Decorative elements */}
      <div className="pointer-events-none absolute -left-32 top-16 hidden h-[420px] w-[420px] md:block">
        <BotanicalMandala opacity={0.11} />
      </div>
      <div className="pointer-events-none absolute -right-28 bottom-8 hidden h-[380px] w-[380px] md:block">
        <BotanicalMandala opacity={0.09} />
      </div>
      <FloatingLeaf
        className="pointer-events-none absolute"
        style={{
          left: '5%',
          top: '18%',
          width: 32,
          height: 44,
          transform: 'rotate(-18deg)',
        }}
        opacity={0.16}
      />
      <FloatingLeaf
        className="pointer-events-none absolute"
        style={{
          right: '8%',
          top: '28%',
          width: 38,
          height: 50,
          transform: 'rotate(22deg)',
        }}
        opacity={0.13}
      />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-10 sm:px-8 md:pb-14 md:pt-14 lg:px-12">
        <motion.div
          variants={staggerParent(0.1, 0.05)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="flex flex-col items-start gap-6"
        >
          {/* Section marker */}
          <div className="flex w-full items-center justify-between">
            <motion.span
              variants={fadeUp(0)}
              className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent/85"
            >
              <span className="text-primary/40">005</span> &nbsp;/&nbsp; The
              Apothecary
            </motion.span>
            <motion.span
              variants={fadeUp(0)}
              className="hidden font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40 md:inline"
            >
              {productCount} formulas
            </motion.span>
          </div>

          {/* Gold hairline */}
          <motion.div
            variants={fadeUp(0)}
            aria-hidden
            className="h-px w-full bg-gradient-to-r from-accent/55 via-primary/15 to-transparent"
          />

          {/* Breadcrumb */}
          <motion.nav
            variants={fadeUp(0)}
            aria-label="Breadcrumb"
            className="flex items-center gap-1 font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-dark/40"
          >
            <Link
              href="/"
              className="transition-colors duration-300 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Home
            </Link>
            <ChevronRight className="h-3 w-3" strokeWidth={2} />
            <span className="text-primary/70">Products</span>
          </motion.nav>

          {/* Eyebrow chip */}
          <motion.span
            variants={fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-white/60 px-4 py-1.5 backdrop-blur"
          >
            <Sparkles className="h-3 w-3 text-accent" strokeWidth={2.4} />
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
              Hand-Blended Kerala Formulas
            </span>
          </motion.span>

          {/* Headline */}
          <motion.h1
            id="products-hero-heading"
            variants={fadeUp(0)}
            className="font-heading text-balance text-[44px] font-extrabold leading-[0.98] tracking-[-0.025em] text-primary sm:text-[60px] md:text-[72px]"
          >
            The
            <br />
            <span className="font-body italic font-normal text-accent">
              Apothecary.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp(0)}
            className="max-w-2xl font-body text-[16px] leading-[1.85] text-dark/70 md:text-[17px]"
          >
            Authentic herbal oils, churnas and wellness kits — sourced from
            Kerala&apos;s finest Ayurvedic pharmacies and hand-blended by
            practising Vaidyas. Every formula follows classical texts, nothing
            is mass-produced.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
