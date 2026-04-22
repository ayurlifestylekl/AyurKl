'use client'

import React from 'react'
import { motion } from 'framer-motion'

import { fadeUp, inViewOnce } from '@/lib/motion'

/**
 * Zone 3 — "The Nameplate"
 * A compact dark-green band spans the page between Directory and Letterhead.
 * Mounted on the band is a landscape correspondence plaque — monogram on
 * the left, name + credentials in the centre, a trimmed italic quote on
 * the right — finished with a scripted signature flourish.
 */
export default function CallingCard() {
  return (
    <section
      id="calling-card"
      aria-labelledby="calling-card-heading"
      className="relative overflow-hidden bg-primary"
    >
      {/* Faint gold grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,163,115,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,163,115,1) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      {/* Atmospheric warm corner wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 900px 520px at 50% 50%, rgba(212,163,115,0.14) 0%, transparent 65%)',
        }}
      />

      {/* Edge hairlines — top + bottom */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(212,163,115,0.5) 25%, rgba(212,163,115,0.5) 75%, transparent)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(212,163,115,0.5) 25%, rgba(212,163,115,0.5) 75%, transparent)',
        }}
      />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-12 sm:px-10 sm:py-14 lg:px-12 lg:py-16">
        {/* Eyebrow — small caps on dark */}
        <motion.div
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="flex items-center justify-center gap-4"
        >
          <span
            aria-hidden
            className="h-px w-14 sm:w-20"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(212,163,115,0.7))',
            }}
          />
          <span className="font-heading text-[9.5px] font-semibold uppercase tracking-[0.42em] text-accent">
            Correspondent of Record
          </span>
          <span
            aria-hidden
            className="h-px w-14 sm:w-20"
            style={{
              background: 'linear-gradient(to left, transparent, rgba(212,163,115,0.7))',
            }}
          />
        </motion.div>

        {/* The plaque */}
        <motion.div
          variants={fadeUp(0.08)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="relative mt-6 w-full max-w-3xl"
        >
          <div className="relative rounded-[4px] bg-cream px-6 py-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.55)] sm:px-10 sm:py-7">
            {/* Inner gold hairline frame */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[8px] rounded-[3px] border border-accent/40"
            />
            {/* L-bracket corner mitres */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-[4px] top-[4px] h-3 w-3 border-l-2 border-t-2 border-accent"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute right-[4px] top-[4px] h-3 w-3 border-r-2 border-t-2 border-accent"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-[4px] left-[4px] h-3 w-3 border-b-2 border-l-2 border-accent"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-[4px] right-[4px] h-3 w-3 border-b-2 border-r-2 border-accent"
            />

            {/* Wax-seal dot */}
            <span
              aria-hidden
              className="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_0_4px_rgba(212,163,115,0.18),0_0_0_8px_rgba(212,163,115,0.06)]"
            />

            {/* Interior — 3 zones (stacks on mobile) */}
            <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-stretch sm:gap-7">
              {/* Zone 1 — Monogram */}
              <div className="flex shrink-0 items-center justify-center sm:w-[112px]">
                <span
                  className="font-body font-normal italic leading-none text-accent"
                  style={{
                    fontSize: 'clamp(4.5rem, 10vw, 6.5rem)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  AH
                </span>
              </div>

              {/* Divider (vertical on desktop, horizontal on mobile) */}
              <span
                aria-hidden
                className="hidden w-px self-stretch sm:block"
                style={{
                  background:
                    'linear-gradient(to bottom, transparent, rgba(212,163,115,0.55), transparent)',
                }}
              />
              <span
                aria-hidden
                className="block h-px w-16 sm:hidden"
                style={{
                  background:
                    'linear-gradient(to right, transparent, rgba(212,163,115,0.7), transparent)',
                }}
              />

              {/* Zone 2 — Name + credentials */}
              <div className="flex flex-1 flex-col justify-center text-center sm:text-left">
                <p
                  id="calling-card-heading"
                  className="font-heading text-[9.5px] font-semibold uppercase tracking-[0.42em] text-primary/55"
                >
                  Vaidya
                </p>
                <p
                  className="mt-1.5 font-heading font-extrabold leading-[1.02] tracking-[-0.02em] text-primary"
                  style={{ fontSize: 'clamp(1.55rem, 2.6vw, 1.85rem)' }}
                >
                  Akhil HS
                </p>
                <p className="mt-1 font-body text-[12.5px] italic text-dark/65">
                  B.A.M.S · 14+ years in Ayurvedic practice
                </p>
              </div>

              {/* Divider */}
              <span
                aria-hidden
                className="hidden w-px self-stretch sm:block"
                style={{
                  background:
                    'linear-gradient(to bottom, transparent, rgba(212,163,115,0.55), transparent)',
                }}
              />
              <span
                aria-hidden
                className="block h-px w-16 sm:hidden"
                style={{
                  background:
                    'linear-gradient(to right, transparent, rgba(212,163,115,0.7), transparent)',
                }}
              />

              {/* Zone 3 — Quote */}
              <div className="relative max-w-[26ch] shrink-0 text-center sm:w-[220px] sm:text-left">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-1 -top-1 font-body text-accent/70 sm:-left-2"
                  style={{ fontSize: '28px', lineHeight: 1 }}
                >
                  &ldquo;
                </span>
                <blockquote className="relative pl-3 font-body italic leading-[1.5] text-primary/80 sm:pl-2">
                  <span style={{ fontSize: '13px' }}>
                    Every consultation begins with a long conversation.
                  </span>
                </blockquote>
              </div>
            </div>

            {/* Signature flourish — scripted underline */}
            <div className="relative mt-5 flex items-center justify-center">
              <svg
                aria-hidden
                viewBox="0 0 220 20"
                className="h-4 w-[180px] text-accent/75"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M2 14 C 18 6, 40 18, 62 10 S 110 2, 134 12 S 176 18, 200 8 L 214 12"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M208 8 L 218 12 L 210 16"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
