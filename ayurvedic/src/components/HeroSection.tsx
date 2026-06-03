'use client'

import React from 'react'
import Image from 'next/image'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { EASE_OUT_PREMIUM } from '@/lib/motion'
import CTAButton from '@/components/ui/CTAButton'

/* ── Palette (hero-local) ───────────────────────────────── */
const SAFFRON      = '#D4AF37'   // vivid turmeric — italic accent
const SAFFRON_SOFT = '#D4AF37'   // eyebrow on dark
const INK          = '#0A1F19'   // deep base for dim

/* ── Animation helpers ──────────────────────────────────── */
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.0, delay, ease: EASE_OUT_PREMIUM },
  },
})

export default function HeroSection() {
  return (
    <section
      className="relative h-[calc(100svh-7.5rem)] min-h-[640px] w-full overflow-hidden"
      style={{ backgroundColor: INK }}
    >
      {/* ── Background photo — dimmed evenly ──────────────── */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: 'easeOut' }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/hero-spices.png"
          alt="Authentic Ayurvedic herbs and spices"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Even dim — slightly darker at top/bottom for navbar + stats bar continuity */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10, 31, 25,0.88) 0%, rgba(10, 31, 25,0.72) 35%, rgba(10, 31, 25,0.68) 60%, rgba(10, 31, 25,0.82) 100%)',
          }}
        />

        {/* Center radial — slightly darker behind the headline area for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 65% 60% at 50% 48%, rgba(10, 31, 25,0.30) 0%, transparent 70%)',
          }}
        />

        {/* Warm saffron glow — richer, directional luxe light */}
        <div
          className="absolute inset-0 mix-blend-overlay"
          style={{
            background:
              'radial-gradient(ellipse 45% 55% at 8% 14%, rgba(212, 175, 55,0.36) 0%, transparent 64%), radial-gradient(ellipse 50% 60% at 92% 86%, rgba(212, 175, 55,0.32) 0%, transparent 66%), radial-gradient(ellipse 70% 45% at 50% -5%, rgba(212, 175, 55,0.20) 0%, transparent 60%)',
          }}
        />
      </motion.div>

      {/* ── Luxe gold frame inset (editorial) ───────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-5 z-[5] hidden sm:block sm:inset-7 lg:inset-9"
      >
        <div className="absolute inset-0" style={{ border: '1px solid rgba(212, 175, 55,0.32)' }} />
        {/* brighter corner accents */}
        <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2" style={{ borderColor: 'rgba(212, 175, 55,0.85)' }} />
        <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2" style={{ borderColor: 'rgba(212, 175, 55,0.85)' }} />
        <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2" style={{ borderColor: 'rgba(212, 175, 55,0.85)' }} />
        <span className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2" style={{ borderColor: 'rgba(212, 175, 55,0.85)' }} />
      </div>

      {/* ── Content — centered, full-width breathing ─────── */}
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 pb-28 pt-20 text-center sm:px-8 sm:pb-32 sm:pt-24 lg:px-12 lg:pt-20">

        {/* Lotus crest */}
        <motion.div {...fadeUp(0.05)} className="mb-5" aria-hidden>
          <svg
            viewBox="0 0 48 48"
            className="h-11 w-11"
            style={{ filter: 'drop-shadow(0 3px 14px rgba(212, 175, 55,0.45))' }}
          >
            <g transform="translate(24 27)" fill="none" stroke={SAFFRON} strokeWidth="1.4" strokeLinejoin="round">
              <path d="M0 -15 C 5 -8, 5 -2, 0 2 C -5 -2, -5 -8, 0 -15 Z" />
              <path d="M0 -11 C 10 -9, 14 -2, 12 5 C 6 3, 1 -3, 0 -11 Z" />
              <path d="M0 -11 C -10 -9, -14 -2, -12 5 C -6 3, -1 -3, 0 -11 Z" />
            </g>
          </svg>
        </motion.div>

        {/* Eyebrow — long lines on both sides, sits well below the navbar */}
        <motion.div {...fadeUp(0.1)} className="mb-9 flex items-center justify-center gap-5 sm:gap-7">
          <span
            className="h-[1px] w-20 sm:w-32 md:w-44"
            style={{ backgroundColor: SAFFRON_SOFT, opacity: 0.7 }}
            aria-hidden
          />
          <span
            className="font-heading text-[11px] font-bold uppercase tracking-[0.36em] sm:text-[13px] whitespace-nowrap"
            style={{ color: SAFFRON_SOFT }}
          >
            Est. 2008 • Brickfields, KL
          </span>
          <span
            className="h-[1px] w-20 sm:w-32 md:w-44"
            style={{ backgroundColor: SAFFRON_SOFT, opacity: 0.7 }}
            aria-hidden
          />
        </motion.div>

        {/* Headline — centered, larger now that it owns the full width */}
        <motion.h1 {...fadeUp(0.25)} className="flex flex-col items-center">
          <span
            className="font-heading font-extrabold text-white"
            style={{
              fontSize: 'clamp(2.75rem, 7.2vw, 6.5rem)',
              lineHeight: 1.0,
              letterSpacing: '-0.025em',
            }}
          >
            Authentic Kerala
          </span>
          <span
            className="mt-2 font-display italic"
            style={{
              color: SAFFRON,
              fontSize: 'clamp(3.25rem, 9vw, 8rem)',
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              textShadow: '0 4px 36px rgba(212, 175, 55,0.32)',
            }}
          >
            Ayurveda
          </span>
        </motion.h1>

        {/* Ornamental gold flourish — centered under headline */}
        <motion.div
          {...fadeUp(0.4)}
          className="mt-7 flex items-center justify-center gap-3"
          aria-hidden
        >
          <span
            className="h-px w-16 sm:w-24"
            style={{ background: `linear-gradient(to right, transparent, ${SAFFRON})` }}
          />
          <svg viewBox="0 0 24 26" className="h-5 w-5" fill="none" stroke={SAFFRON} strokeWidth="1.3" strokeLinejoin="round">
            <path d="M12 2 C 14.5 7, 14.5 11, 12 14 C 9.5 11, 9.5 7, 12 2 Z" />
            <path d="M12 14 C 18 11.5, 21.5 14, 20.5 19 C 16 17.5, 13 16, 12 14 Z" />
            <path d="M12 14 C 6 11.5, 2.5 14, 3.5 19 C 8 17.5, 11 16, 12 14 Z" />
          </svg>
          <span
            className="h-px w-16 sm:w-24"
            style={{ background: `linear-gradient(to left, transparent, ${SAFFRON})` }}
          />
        </motion.div>

        {/* Tagline — wider, centered */}
        <motion.p
          {...fadeUp(0.5)}
          className="mt-7 max-w-3xl font-body leading-[1.6]"
          style={{
            color: 'rgba(247, 242, 232,0.88)',
            fontSize: 'clamp(1.0625rem, 1.45vw, 1.3125rem)', // 17px → 21px
          }}
        >
          Classical Kerala therapies —{' '}
          <strong className="font-semibold text-white">
            prescribed, prepared and performed
          </strong>{' '}
          by our <strong className="font-semibold text-white">certified vaidyas</strong>,
          with the precision of a clinic and the care of a tradition.
        </motion.p>

        {/* CTA row */}
        <motion.div
          {...fadeUp(0.65)}
          className="mt-10 flex flex-wrap items-center justify-center gap-6"
        >
          <CTAButton
            href="/book/consultation"
            variant="primary"
            size="lg"
            shimmer
            icon={<Calendar className="h-4 w-4" />}
            className="px-10 py-4 text-[13px]"
          >
            Book a Consultation
          </CTAButton>

          {/* Secondary link */}
          <a
            href="/treatments"
            className="font-heading text-[12px] font-semibold uppercase tracking-[0.22em] text-white/70 underline decoration-1 underline-offset-[6px] transition-colors hover:text-white"
            style={{ textDecorationColor: 'rgba(212, 175, 55,0.5)' }}
          >
            Explore Treatments →
          </a>
        </motion.div>
      </div>

      {/* ── Floating Stats Bar (Bottom) ────────────────── */}
      <motion.div
        {...fadeUp(0.85)}
        className="absolute bottom-0 left-0 right-0 z-10 border-t backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(10, 31, 25,0.78)',
          borderTopColor: 'rgba(212, 175, 55,0.22)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-5 sm:px-8 lg:px-12">
          {[
            { n: '15+',    l: 'Years Experience'    },
            { n: '5,000+', l: 'Patients Healed'     },
            { n: '20+',    l: 'Authentic Therapies' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.l}>
              <div className="flex flex-col items-start text-left sm:flex-row sm:items-baseline sm:gap-4">
                <span
                  className="font-heading font-extrabold leading-none"
                  style={{ color: SAFFRON, fontSize: 'clamp(1.5rem, 2.6vw, 2rem)' }}
                >
                  {s.n}
                </span>
                <span
                  className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75 sm:mt-0 sm:text-[11px]"
                >
                  {s.l}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className="hidden h-10 w-[1px] bg-white/15 sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
