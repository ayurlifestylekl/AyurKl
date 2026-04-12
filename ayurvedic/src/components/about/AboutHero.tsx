'use client'

import React from 'react'
import Image from 'next/image'
import { Leaf } from 'lucide-react'
import { motion } from 'framer-motion'
import { EASE_OUT_PREMIUM } from '@/lib/motion'

/* ── Animation helpers ──────────────────────────────────── */
const fadeIn = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay, ease: EASE_OUT_PREMIUM },
  },
})

const scaleReveal = {
  initial: { scale: 1.15, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 1.8, delay: 0, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

const stats = [
  { value: '17+', label: 'Years in Brickfields' },
  { value: '5,000+', label: 'Patients Healed' },
  { value: '20+', label: 'Traditional Therapies' },
]

/**
 * About Hero — Full-bleed cinematic immersive.
 * Background image fills entire viewport with deep overlay.
 * Centered editorial text with dramatic typography.
 * Anchored stat bar at bottom with gold hairline.
 */
export default function AboutHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: 'calc(100vh - 108px)' }}
    >
      {/* ── Full-bleed background image ──────────────── */}
      <motion.div
        {...scaleReveal}
        className="absolute inset-0"
      >
        <Image
          src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1800&q=80"
          alt="Interior of Kerala Ayurvedic Lifestyle clinic in Brickfields"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>

      {/* ── Deep overlay stack ────────────────────────── */}
      {/* Base dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(26,46,38,0.82)' }}
        aria-hidden
      />
      {/* Green tint blend */}
      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{ backgroundColor: 'rgba(47,93,80,0.45)' }}
        aria-hidden
      />
      {/* Radial vignette — darker edges, subtle light in center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(10,20,16,0.5) 100%)',
        }}
        aria-hidden
      />
      {/* Warm gold atmosphere — barely visible glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 55%, rgba(212,163,115,0.08) 0%, transparent 50%)',
        }}
        aria-hidden
      />
      {/* Grain texture */}
      <div className="grain-overlay-dark pointer-events-none absolute inset-0" aria-hidden />

      {/* ── Content ──────────────────────────────────── */}
      <div
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-6 text-center sm:px-8"
        style={{ minHeight: 'calc(100vh - 108px)' }}
      >
        {/* Main content — pushed up slightly to leave room for stat bar */}
        <div className="flex flex-col items-center pb-28 pt-16 md:pb-36">
          {/* Eyebrow */}
          <motion.div
            {...fadeIn(0.15)}
            className="flex items-center gap-2"
          >
            <Leaf className="h-3 w-3 text-accent/50" />
            <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-accent/60">
              About Kerala Ayurvedic Lifestyle
            </span>
            <Leaf className="h-3 w-3 -scale-x-100 text-accent/50" />
          </motion.div>

          {/* Gold accent rule — centered */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.0, delay: 0.25, ease: EASE_OUT_PREMIUM }}
            className="mt-5 h-[1px] w-16 origin-center bg-accent/40"
          />

          {/* Headline — dramatic scale */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.3, ease: EASE_OUT_PREMIUM }}
            className="mt-7 font-heading font-extrabold leading-[0.95] text-white"
            style={{
              fontSize: 'clamp(2.8rem, 7vw, 6rem)',
              letterSpacing: '-0.04em',
            }}
          >
            A Sanctuary for
            <br />
            Authentic{' '}
            <span className="font-body italic text-accent">Healing</span>
          </motion.h1>

          {/* Sub-headline — refined serif */}
          <motion.p
            {...fadeIn(0.5)}
            className="mt-6 max-w-[520px] font-body text-[16px] leading-[1.7] text-white/50 md:text-[17px]"
          >
            Since 2008, we have brought the timeless wisdom of Kerala Ayurveda
            to Brickfields — a space where tradition, care, and natural healing
            come together in harmony.
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-10"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="font-heading text-[9px] font-medium uppercase tracking-[0.3em] text-white/25">
                Our Story
              </span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="h-8 w-px bg-gradient-to-b from-accent/40 to-transparent"
              />
            </div>
          </motion.div>
        </div>

        {/* ── Bottom stat bar ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: EASE_OUT_PREMIUM }}
          className="absolute inset-x-0 bottom-0"
        >
          {/* Top gold hairline */}
          <div
            className="h-px"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(212,163,115,0.3), transparent)',
            }}
            aria-hidden
          />

          <div className="mx-auto flex max-w-4xl items-center justify-center px-6 py-6 md:py-8">
            {stats.map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center px-5 sm:px-8 md:px-10">
                  <p className="font-heading text-[1.5rem] font-extrabold leading-none tracking-tight text-white sm:text-[1.75rem] md:text-[2rem]">
                    {s.value}
                  </p>
                  <p className="mt-1.5 font-heading text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 sm:text-[10px]">
                    {s.label}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div className="h-10 w-px bg-accent/15 md:h-12" aria-hidden />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
