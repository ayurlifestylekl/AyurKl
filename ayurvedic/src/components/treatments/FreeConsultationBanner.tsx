'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, MessageCircle, Stethoscope } from 'lucide-react'

import { BotanicalMandala } from '@/components/ui/Decorations'
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion'

/**
 * Standalone "Free Consultation" callout rendered below the treatments grid.
 *
 * Sourced from page 19 of the official KALS treatments PDF — this offering
 * doesn't fit the standard treatment-card template (no fixed duration, free
 * of charge) so it lives as its own visually distinct surface.
 *
 * Visual identity:
 *   - Deep Herbal Green background to break the cream-coloured grid above
 *   - BotanicalMandala decor on both flanks
 *   - Atmospheric radial gradient + grain overlay (anti-flat per CLAUDE.md)
 *   - Turmeric Gold primary CTA, white outline secondary CTA
 */
export default function FreeConsultationBanner() {
  return (
    <section
      aria-labelledby="free-consult-heading"
      className="relative overflow-hidden rounded-[28px] bg-primary"
    >
      {/* Atmospheric radial gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 12% 0%, rgba(212,163,115,0.28) 0%, transparent 55%), radial-gradient(ellipse at 92% 100%, rgba(122,157,84,0.18) 0%, transparent 55%)',
        }}
      />

      {/* Grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Mandala flanks */}
      <div className="pointer-events-none absolute -left-24 -top-24 hidden h-[420px] w-[420px] md:block">
        <BotanicalMandala opacity={0.08} />
      </div>
      <div className="pointer-events-none absolute -bottom-32 -right-24 hidden h-[460px] w-[460px] md:block">
        <BotanicalMandala opacity={0.07} />
      </div>

      <motion.div
        variants={staggerParent(0.12, 0.05)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="relative grid grid-cols-1 items-center gap-10 px-8 py-16 sm:px-12 md:py-20 lg:grid-cols-12 lg:gap-12 lg:px-16"
      >
        {/* ── LEFT: Headline + body ───────────────── */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <motion.span
            variants={fadeUp(0)}
            className="inline-flex w-fit items-center gap-3 font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent"
          >
            <span aria-hidden className="h-px w-8 bg-accent" />
            13 / Consultation & Treatment
          </motion.span>

          <motion.h2
            id="free-consult-heading"
            variants={fadeUp(0)}
            className="font-heading text-balance text-[36px] font-extrabold leading-[1.0] tracking-[-0.025em] text-white sm:text-[48px] md:text-[58px]"
          >
            A free consultation
            <br />
            with a{' '}
            <span className="font-body italic font-normal text-accent">
              Kerala Vaidya.
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp(0)}
            className="max-w-xl font-body text-[16px] leading-[1.85] text-white/75 md:text-[17px]"
          >
            We provide free consultations with our KKM-registered T&amp;CM
            Ayurveda practitioner from Kerala, who holds a B.A.M.S degree and
            specialises in protocols for chronic pain, skin conditions, gastric
            issues, and more.
          </motion.p>

          {/* Trust row */}
          <motion.div
            variants={fadeUp(0)}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55"
          >
            <span>KKM-Registered</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-accent/70" />
            <span>B.A.M.S Kerala</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-accent/70" />
            <span>Vaidya AKHIL HS</span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={fadeUp(0)}
            className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/book"
              className="group/cta relative inline-flex min-h-[48px] items-center justify-center gap-2 overflow-hidden rounded-full bg-accent px-7 py-3.5 font-heading text-[12px] font-bold uppercase tracking-[0.18em] text-dark shadow-[0_18px_44px_-16px_rgba(212,163,115,0.85)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-14px_rgba(212,163,115,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.97]"
            >
              <Stethoscope className="relative z-10 h-4 w-4" strokeWidth={2.4} />
              <span className="relative z-10">Book Free Consultation</span>
              <ArrowUpRight
                className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                strokeWidth={2.6}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-full"
                style={{ width: '60%' }}
              />
            </Link>

            <Link
              href="https://wa.me/601165043436?text=Hi%2C%20I%27d%20like%20to%20book%20a%20free%20Ayurveda%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/35 bg-white/5 px-7 py-3.5 font-heading text-[12px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur transition-[transform,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.97]"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2.4} />
              WhatsApp Us
            </Link>
          </motion.div>
        </div>

        {/* ── RIGHT: Pull-card with conditions ───────────────── */}
        <motion.aside
          variants={fadeUp(0.1)}
          className="relative mx-auto w-full max-w-md lg:col-span-5"
        >
          {/* Offset frame */}
          <div
            aria-hidden
            className="absolute -right-3 -top-3 h-full w-full rounded-[24px] border border-accent/40"
          />

          <div className="relative rounded-[24px] bg-white/[0.04] p-8 ring-1 ring-white/10 backdrop-blur-sm">
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
              We treat
            </span>

            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 font-body text-[14px] leading-[1.5] text-white/85">
              {[
                'Chronic back pain',
                'Joint stiffness',
                'Sciatica',
                'Skin conditions',
                'Eczema & psoriasis',
                'Gastric issues',
                'Stress & anxiety',
                'Sleep disorders',
                'Migraine & headache',
                'Hair fall',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex items-center gap-3 border-t border-white/15 pt-5">
              <span aria-hidden className="h-px w-6 bg-accent" />
              <span className="font-heading text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/65">
                Consultation is always free
              </span>
            </div>
          </div>
        </motion.aside>
      </motion.div>
    </section>
  )
}
