'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { clipReveal, fadeUp, inViewOnce, EASE_OUT_PREMIUM } from '@/lib/motion'

const defaults = {
  eyebrow: 'Our Story',
  headlineLead: "Bringing Kerala's Healing",
  headlineAccent: 'Home.',
  paragraphs: [
    "Kerala Ayurvedic Lifestyle was founded in 2008 by Dato' Dr. V.Shanmughanathan — inspired by the profound healing he witnessed in Kerala, and the conviction that authentic Ayurveda belonged in Malaysia, without compromise. By bringing experienced Ayurveda practitioners and skilled assistant practitioners directly from Kerala, India, Dato' personally established the protocols and patient-care SOPs that every visit still follows today.",
    "With those foundations in place, Dato' has since stepped away from the practice — entrusting it to a family member to carry the work forward. He is no longer involved in the day-to-day. What remains is the vision he began with: every protocol still carrying the authenticity, care, and traditional methods he first brought home from Kerala.",
  ],
  pullQuote:
    'True wellness is not just about therapies, but about restoring balance and harmony within.',
  name: "Dato' Dr. V.Shanmughanathan",
  role: 'Founder',
}

interface FoundersVisionProps {
  eyebrow?: string
  headlineLead?: string
  headlineAccent?: string
  paragraphs?: string[]
  pullQuote?: string
  name?: string
  role?: string
}

/**
 * Founder's story — sticky portrait + editorial text on an apothecary-paper
 * background: paper grain, warm radials, faded Devanagari watermark, and a
 * single botanical sprig. Top + bottom gold hairlines frame the section.
 */
export default function FoundersVision({
  eyebrow,
  headlineLead,
  headlineAccent,
  paragraphs,
  pullQuote,
  name,
  role,
}: FoundersVisionProps = {}) {
  const copy = {
    eyebrow: eyebrow || defaults.eyebrow,
    headlineLead: headlineLead || defaults.headlineLead,
    headlineAccent: headlineAccent || defaults.headlineAccent,
    paragraphs:
      paragraphs && paragraphs.length > 0 ? paragraphs : defaults.paragraphs,
    pullQuote: pullQuote || defaults.pullQuote,
    name: name || defaults.name,
    role: role || defaults.role,
  }
  return (
    <section
      aria-labelledby="founder-heading"
      className="relative overflow-hidden bg-cream"
    >
      {/* PHOTOGRAPHIC BACKDROP — faded warm herbs photo, heavy cream overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'url(/hero-herbs.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          opacity: 0.18,
        }}
      />
      {/* Heavy cream wash to push the photo behind a veil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(250,246,238,0.94) 0%, rgba(250,246,238,0.75) 60%, rgba(250,246,238,0.85) 100%)',
        }}
      />
      {/* Warm gold corner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 92% 12%, rgba(212,163,115,0.18) 0%, transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="grain-overlay pointer-events-none absolute inset-0 opacity-40"
      />

      {/* L6  Top + bottom gold hairlines — frame the section */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(212,163,115,0.45) 50%, transparent 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(212,163,115,0.45) 50%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-10 sm:px-8 md:py-14 lg:px-12">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[5fr_7fr] lg:gap-14">
          {/* ── LEFT: Sticky portrait ──────────────────── */}
          <div className="relative lg:sticky lg:top-32 lg:self-start">
            <div className="relative mx-auto max-w-[420px] lg:mx-0">
              {/* Portrait */}
              <motion.div
                variants={clipReveal('left', 0)}
                initial="initial"
                whileInView="animate"
                viewport={inViewOnce}
                className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_24px_60px_-20px_rgba(47,93,80,0.35),0_8px_20px_rgba(47,93,80,0.1)]"
              >
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
                  alt={`${copy.name} — Founder, Kerala Ayurvedic Lifestyle`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 mix-blend-multiply"
                  style={{ backgroundColor: 'rgba(47,93,80,0.08)' }}
                  aria-hidden
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(26,46,38,0.4) 0%, transparent 40%)',
                  }}
                  aria-hidden
                />

                {/* Washi-tape gold accent — top-left */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-3 -top-2 h-3.5 w-14 rotate-[-18deg]"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(212,163,115,0.7) 0%, rgba(212,163,115,0.4) 60%, rgba(212,163,115,0.6) 100%)',
                    boxShadow:
                      'inset 0 0 0 1px rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.08)',
                  }}
                />
              </motion.div>

              {/* Founder name + signature flourish */}
              <motion.div
                variants={fadeUp(0.3)}
                initial="initial"
                whileInView="animate"
                viewport={inViewOnce}
                className="relative mt-4"
              >
                <p className="font-body text-[18px] font-medium italic text-primary">
                  {copy.name}
                </p>
                <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.25em] text-dark/40">
                  {copy.role}
                </p>
                {/* Signed-by-founder flourish */}
                <svg
                  aria-hidden
                  viewBox="0 0 180 14"
                  className="mt-2 h-3 w-[120px] text-accent/70"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M2 10 C 16 4, 34 12, 54 7 S 96 2, 118 9 S 156 12, 172 6"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>
            </div>
          </div>

          {/* ── RIGHT: Editorial text ──────────────────── */}
          <div className="relative flex flex-col">
            {/* Vertical gold divider (desktop only) */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.0, ease: EASE_OUT_PREMIUM }}
              className="absolute -left-7 bottom-0 top-0 hidden w-px origin-center lg:block"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, rgba(212,163,115,0.35), transparent)',
              }}
              aria-hidden
            />

            {/* Mobile horizontal divider */}
            <div
              className="mb-6 h-px lg:hidden"
              style={{
                background:
                  'linear-gradient(to right, rgba(212,163,115,0.3), transparent)',
              }}
              aria-hidden
            />

            <motion.div
              variants={fadeUp(0)}
              initial="initial"
              whileInView="animate"
              viewport={inViewOnce}
            >
              {/* Eyebrow with hairline */}
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-px w-8"
                  style={{
                    background:
                      'linear-gradient(to right, rgba(212,163,115,0.7), transparent)',
                  }}
                />
                <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">
                  {copy.eyebrow}
                </span>
              </div>
              <h2
                id="founder-heading"
                className="mt-3 font-heading text-3xl font-extrabold leading-[1.08] text-primary sm:text-4xl"
              >
                {copy.headlineLead}
                {copy.headlineAccent ? (
                  <>
                    {' '}
                    <span className="font-body italic text-accent">
                      {copy.headlineAccent}
                    </span>
                  </>
                ) : null}
              </h2>
            </motion.div>

            <motion.div
              variants={fadeUp(0.15)}
              initial="initial"
              whileInView="animate"
              viewport={inViewOnce}
              className="mt-6 flex flex-col gap-4"
            >
              {copy.paragraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="max-w-xl font-body text-[15px] leading-[1.75] text-dark/65"
                >
                  {para}
                </p>
              ))}
            </motion.div>

            {/* Pull quote — thin left border, no oversized quote marks */}
            <motion.blockquote
              variants={fadeUp(0.3)}
              initial="initial"
              whileInView="animate"
              viewport={inViewOnce}
              className="mt-6 border-l-2 border-accent/50 pl-6"
            >
              <p className="max-w-md font-body text-[17px] italic leading-[1.6] text-primary/80">
                &ldquo;{copy.pullQuote}&rdquo;
              </p>
            </motion.blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}
