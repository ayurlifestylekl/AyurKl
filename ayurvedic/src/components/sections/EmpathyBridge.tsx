'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { slideIn, inViewOnce, EASE_OUT_PREMIUM } from '@/lib/motion'

/* ── Palette (section-local; mirrors the hero so the homepage reads as one piece) ── */
const EMERALD      = '#163F33'   // dark base, matches hero ink
const EMERALD_DEEP = '#0F2C24'   // slight gradient depth
const SAFFRON      = '#D4AF37'   // vivid turmeric accent
const SAFFRON_SOFT = '#D4AF37'   // eyebrow on dark
const SAFFRON_DEEP = '#D4AF37'   // eyebrow on cream
const CREAM        = '#F7F2E8'   // matches hero cream
const CREAM_WARM   = '#E9CBA6'   // gradient destination

const painPoints = ['Burnout', 'Insomnia', 'Joint Pain', 'Brain Fog']

/**
 * Editorial split-screen — Modern Life (dark emerald) vs Ancient Healing (warm cream).
 * Palette synced to the new hero: emerald + saffron, no muted tan.
 */
export default function EmpathyBridge() {
  return (
    <section
      aria-labelledby="empathy-heading"
      className="relative flex flex-col overflow-hidden lg:min-h-[600px] lg:max-h-[760px] lg:flex-row"
    >
      <h2 id="empathy-heading" className="sr-only">
        From modern stress to ancient healing
      </h2>

      {/* ── LEFT: Dark panel — Modern Life (45%) ─────────── */}
      <motion.div
        variants={slideIn('left', 0)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="relative flex w-full flex-col justify-center px-6 py-14 sm:px-10 sm:py-16 lg:w-[45%] lg:px-16 lg:py-12 xl:px-20"
        style={{
          background: `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_DEEP} 100%)`,
        }}
      >
        {/* Subtle photographic texture overlay */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[0.07]"
          style={{
            backgroundImage: "url('/hero-spices.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden
        />

        {/* Warm saffron glow — adds energy, breaks the flat dark */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 55% 70% at 15% 30%, rgba(232,148,26,0.22) 0%, transparent 65%), radial-gradient(ellipse 50% 60% at 85% 80%, rgba(232,148,26,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Hairline gold edge on the right (only on desktop split) */}
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 hidden w-px lg:block"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${SAFFRON}44 50%, transparent 100%)`,
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-lg lg:ml-auto lg:mr-8 xl:mr-16">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span
              className="h-[1px] w-8"
              style={{ backgroundColor: SAFFRON_SOFT, opacity: 0.7 }}
              aria-hidden
            />
            <span
              className="font-heading text-[11px] font-bold uppercase tracking-[0.36em]"
              style={{ color: SAFFRON_SOFT }}
            >
              Modern Life
            </span>
          </div>

          <h3 className="mt-6 flex flex-col gap-3">
            <span
              className="font-heading font-extrabold leading-[1.02] tracking-tight text-white"
              style={{ fontSize: 'clamp(2rem, 4.2vw, 3.5rem)' }}
            >
              Quick fixes mute the symptom.
            </span>
            <span
              className="font-display italic leading-[1.1]"
              style={{
                color: SAFFRON,
                fontSize: 'clamp(1.75rem, 3.6vw, 3rem)',
                letterSpacing: '-0.01em',
                textShadow: '0 2px 18px rgba(232,148,26,0.25)',
              }}
            >
              The cause keeps returning.
            </span>
          </h3>

          {/* Pain points — refreshed as chip row, more youthful than a numbered list */}
          <ul className="mt-9 flex flex-wrap gap-2.5">
            {painPoints.map((p) => (
              <li key={p}>
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-heading text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85 transition-all duration-200 hover:text-white sm:text-[12px]"
                  style={{
                    borderColor: `${SAFFRON}40`,
                    backgroundColor: 'rgba(232,148,26,0.06)',
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: SAFFRON }}
                  />
                  {p}
                </span>
              </li>
            ))}
          </ul>

          {/* Quiet supporting line */}
          <p className="mt-7 max-w-md font-body text-[14px] leading-[1.65] text-white/55 sm:text-[15px]">
            The body keeps the score. When the cause stays untreated, the same
            symptoms keep coming back.
          </p>
        </div>
      </motion.div>

      {/* ── RIGHT: Cream panel — Ancient Healing (55%) ──── */}
      <motion.div
        variants={slideIn('right', 0.15)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="relative flex w-full flex-col justify-center px-6 py-14 sm:px-10 sm:py-16 lg:w-[55%] lg:px-20 lg:py-12 xl:px-32"
        style={{
          background: `linear-gradient(135deg, ${CREAM} 0%, ${CREAM_WARM} 100%)`,
        }}
      >
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
          style={{
            backgroundImage: "url('/hero-spices.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
          }}
          aria-hidden
        />

        {/* Warm saffron glow corners */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-multiply"
          style={{
            background:
              'radial-gradient(ellipse 45% 60% at 90% 20%, rgba(232,148,26,0.10) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 15% 85%, rgba(194,65,12,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Elegant vertical divider on desktop */}
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={inViewOnce}
          transition={{ duration: 1.0, ease: EASE_OUT_PREMIUM, delay: 0.4 }}
          className="absolute bottom-16 left-0 top-16 hidden w-px origin-center lg:block"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${SAFFRON}66 50%, transparent 100%)`,
          }}
        />

        <div className="relative z-10 max-w-xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span
              className="h-[1px] w-8"
              style={{ backgroundColor: SAFFRON_DEEP, opacity: 0.6 }}
              aria-hidden
            />
            <span
              className="font-heading text-[11px] font-bold uppercase tracking-[0.36em]"
              style={{ color: SAFFRON_DEEP }}
            >
              5,000-Year-Old Answer
            </span>
          </div>

          {/* Headline — Playfair italic for a magazine-quote feel */}
          <h3 className="mt-6 flex flex-col">
            <span
              className="font-display italic"
              style={{
                color: EMERALD,
                fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.015em',
              }}
            >
              &ldquo;Kerala Ayurveda treats the
            </span>
            <span
              className="font-display italic"
              style={{
                color: EMERALD,
                fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.015em',
              }}
            >
              <span
                className="relative inline-block"
                style={{ color: SAFFRON }}
              >
                root
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-[6px] rounded-full"
                  style={{ backgroundColor: `${SAFFRON}30` }}
                />
              </span>
              , not the symptom.&rdquo;
            </span>
          </h3>

          <p
            className="mt-7 font-body leading-[1.7]"
            style={{
              color: 'rgba(26,59,46,0.78)',
              fontSize: 'clamp(15px, 1.1vw, 17px)',
            }}
          >
            At Kerala Ayurvedic Lifestyle, we don&apos;t guess. We start with your{' '}
            <strong
              className="font-semibold"
              style={{
                color: EMERALD,
                backgroundImage: `linear-gradient(transparent 65%, ${SAFFRON}33 65%)`,
              }}
            >
              dosha
            </strong>{' '}
            — your unique mind-body constitution. Then our certified vaidyas build a
            highly personalised protocol that meets your body exactly where it is.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link
              href="/book"
              className="group inline-flex items-center gap-3 rounded-full px-7 py-3.5 font-heading text-[12px] font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                backgroundColor: EMERALD,
                boxShadow: `0 18px 40px -18px ${EMERALD}99`,
              }}
            >
              Discover Your Dosha
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/treatments"
              className="font-heading text-[11px] font-bold uppercase tracking-[0.22em] underline decoration-1 underline-offset-[6px] transition-colors hover:opacity-80"
              style={{
                color: SAFFRON_DEEP,
                textDecorationColor: `${SAFFRON}80`,
              }}
            >
              Browse Therapies →
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
