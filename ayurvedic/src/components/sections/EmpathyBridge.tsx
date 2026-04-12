'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { slideIn, inViewOnce, EASE_OUT_PREMIUM } from '@/lib/motion'
import { BotanicalMandala } from '@/components/ui/Decorations'

const painPoints = ['Burnout.', 'Insomnia.', 'Joint Pain.', 'Brain Fog.']

/**
 * Editorial split-screen — dark panel (burnout) vs cream panel (healing).
 * Color communicates emotion. No images needed.
 */
export default function EmpathyBridge() {
  return (
    <section
      aria-labelledby="empathy-heading"
      className="relative overflow-hidden"
    >
      <h2 id="empathy-heading" className="sr-only">
        From modern stress to ancient healing
      </h2>

      <div className="grid min-h-[85vh] grid-cols-1 lg:grid-cols-[2fr_3fr]">
        {/* ── LEFT: Dark panel — Modern Life ─────────── */}
        <motion.div
          variants={slideIn('left', 0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="relative flex flex-col justify-center bg-nearBlackGreen px-6 py-16 sm:px-10 lg:px-14 lg:py-20"
        >
          {/* Subtle radial glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 30% 70%, rgba(47,93,80,0.2) 0%, transparent 60%)',
            }}
          />

          <div className="relative z-10">
            <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40">
              Modern Life
            </span>

            <h3 className="mt-5 font-heading text-2xl font-bold leading-[1.15] text-white/80 sm:text-3xl lg:text-[2rem]">
              Quick fixes mute the symptom.
              <br />
              <span className="text-white/50">
                The same fog returns every morning.
              </span>
            </h3>

            {/* Pain points stacked */}
            <div className="mt-8 flex flex-col gap-2">
              {painPoints.map(p => (
                <span
                  key={p}
                  className="font-heading text-[13px] font-semibold tracking-[0.08em] text-white/30"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT: Cream panel — Ancient Healing ──── */}
        <motion.div
          variants={slideIn('right', 0.15)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="relative flex flex-col justify-center bg-cream px-6 py-16 sm:px-10 lg:px-16 lg:py-20"
        >
          {/* Vertical gold divider (desktop only) */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.0, ease: EASE_OUT_PREMIUM }}
            className="absolute bottom-12 left-0 top-12 hidden w-px origin-center lg:block"
            style={{
              background:
                'linear-gradient(to bottom, transparent, rgba(212,163,115,0.5), transparent)',
            }}
            aria-hidden
          />

          {/* Mandala on divider */}
          <div
            className="absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
            style={{ width: 48, height: 48 }}
            aria-hidden
          >
            <BotanicalMandala opacity={0.35} />
          </div>

          {/* Mobile horizontal divider */}
          <div
            className="absolute inset-x-6 top-0 h-px lg:hidden"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(212,163,115,0.4), transparent)',
            }}
            aria-hidden
          />

          <div className="relative z-10 max-w-lg">
            <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">
              5,000-Year-Old Answer
            </span>

            <h3 className="mt-5 font-heading text-2xl font-extrabold leading-[1.1] text-primary sm:text-3xl lg:text-[2.2rem]">
              Kerala Ayurveda treats
              <br />
              the root, not the symptom.
            </h3>

            <p className="mt-5 max-w-md font-body text-[15px] leading-[1.75] text-dark/60">
              At Kerala Ayurvedic Lifestyle, we start with your dosha — your
              unique mind-body constitution. Then Vaidya AKHIL HS builds a
              personalised protocol that meets your body where it actually is.
            </p>

            <div className="mt-8">
              <Link
                href="#booking"
                className="group inline-flex items-center gap-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.18em] text-primary transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Discover Your Dosha
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
