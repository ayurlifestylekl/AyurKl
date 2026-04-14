'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { slideIn, inViewOnce, EASE_OUT_PREMIUM } from '@/lib/motion'

const painPoints = ['Burnout', 'Insomnia', 'Joint Pain', 'Brain Fog']

/**
 * Editorial split-screen — dark panel (burnout) vs cream panel (healing).
 * Aman-inspired layout: Central arch image overlapping a 45/55 split,
 * rich typography, and textured dark background.
 */
export default function EmpathyBridge() {
  return (
    <section
      aria-labelledby="empathy-heading"
      className="relative flex flex-col overflow-hidden lg:flex-row"
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
        className="relative flex w-full flex-col justify-center bg-nearBlackGreen px-6 py-20 sm:px-10 lg:w-[45%] lg:px-16 lg:py-32 xl:px-20"
      >
        {/* Subtle photographic texture overlay */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[0.06]"
          style={{
            backgroundImage: "url('/hero-spices.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden
        />
        {/* Soft radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 30% 50%, rgba(47,93,80,0.3) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-lg lg:ml-auto lg:mr-8 xl:mr-16">
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.4em] text-white/50">
            Modern Life
          </span>

          <h3 className="mt-6 flex flex-col gap-3">
            <span className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-white drop-shadow-sm">
              Quick fixes mute the symptom.
            </span>
            <span className="font-body text-[clamp(1.75rem,3.5vw,3rem)] italic leading-[1.1] text-accent/90">
              The same fog returns every morning.
            </span>
          </h3>

          {/* High-end Editorial Pain Points List */}
          <ul className="mt-14 flex flex-col border-t border-white/10">
            {painPoints.map((p, i) => (
              <li
                key={p}
                className="flex items-center justify-between border-b border-white/10 py-5 transition-colors hover:bg-white/5"
              >
                <span className="font-heading text-[11px] font-bold tracking-[0.2em] text-accent/60">
                  0{i + 1}
                </span>
                <span className="font-heading text-[14px] font-medium tracking-[0.1em] text-white/80">
                  {p.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* ── RIGHT: Cream panel — Ancient Healing (55%) ──── */}
      <motion.div
        variants={slideIn('right', 0.15)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="relative flex w-full flex-col justify-center bg-cream px-6 py-20 sm:px-10 lg:w-[55%] lg:px-20 lg:py-32 xl:px-32"
      >
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-multiply"
          style={{
            backgroundImage: "url('/hero-spices.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
          }}
          aria-hidden
        />

        {/* Elegant vertical divider on desktop */}
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={inViewOnce}
          transition={{ duration: 1.0, ease: EASE_OUT_PREMIUM, delay: 0.4 }}
          className="absolute bottom-16 left-0 top-16 hidden w-px origin-center bg-gradient-to-b from-transparent via-accent/40 to-transparent lg:block"
        />

        <div className="relative z-10 max-w-xl">
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent sm:text-[11px]">
            5,000-Year-Old Answer
          </span>

          <h3 className="mt-6 flex flex-col gap-2">
            <span className="font-heading text-[clamp(2.2rem,4vw,3.2rem)] font-extrabold leading-[1.05] tracking-tight text-primary">
              Kerala Ayurveda treats
            </span>
            <span className="font-body text-[clamp(2.2rem,4vw,3.2rem)] italic leading-[1.05] text-primary">
              the root, not the symptom.
            </span>
          </h3>

          <p className="mt-8 font-body text-[16px] leading-[1.85] text-dark/70 sm:text-[17px]">
            At Kerala Ayurvedic Lifestyle, we don't guess. We start with your{' '}
            <strong className="font-semibold text-primary">dosha</strong> — your
            unique mind-body constitution. Then Vaidya AKHIL HS builds a
            highly personalised protocol that meets your body exactly where it is.
          </p>

          <div className="mt-12">
            <Link
              href="#booking"
              className="group inline-flex items-center gap-4 border-b border-primary/20 pb-1 font-heading text-[12px] font-bold uppercase tracking-[0.2em] text-primary transition-all hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Discover Your Dosha
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
