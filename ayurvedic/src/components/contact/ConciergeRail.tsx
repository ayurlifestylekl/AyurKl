'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { EASE_OUT_PREMIUM, inViewOnce } from '@/lib/motion'

interface Panel {
  numeral: 'I' | 'II' | 'III'
  roman: string
  label: string
  body: string
  cta: string
  href: string
  icon: React.ReactNode
}

const PANELS: Panel[] = [
  {
    numeral: 'I',
    roman: 'Primo',
    label: 'Book a consultation',
    body: 'Meet Vaidya AKHIL in person for a full case-history reading and a treatment plan tailored to your constitution.',
    cta: 'Book now',
    href: '/treatments#booking',
    icon: <BellIcon />,
  },
  {
    numeral: 'II',
    roman: 'Secundo',
    label: 'Ayur-Store support',
    body: 'Track an order, ask about product ingredients, or check stock before you buy.',
    cta: 'Store support',
    href: '/contact?intent=product#inquiry',
    icon: <ParcelIcon />,
  },
  {
    numeral: 'III',
    roman: 'Tertio',
    label: 'Write to us',
    body: 'General questions, partnerships, press — anything that needs a longer conversation.',
    cta: 'Go to message form',
    href: '#inquiry',
    icon: <QuillIcon />,
  },
]

/**
 * The concierge bell-desk — a full-bleed dark rail separating the hero
 * letter from the letterhead form. Three letterpress-inset panels, NOT
 * cards; divided by gold rules. No rounded corners, no translate-Y
 * hover. The dark bar is the first visual "turn of the page."
 */
export default function ConciergeRail() {
  return (
    <section
      aria-labelledby="concierge-heading"
      className="relative overflow-hidden"
      style={{ background: '#1a2e26' }}
    >
      {/* Top + bottom gold hairlines */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(212,163,115,0.55) 20%, rgba(212,163,115,0.85) 50%, rgba(212,163,115,0.55) 80%, transparent 100%)',
        }}
      />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(212,163,115,0.5) 20%, rgba(212,163,115,0.75) 50%, rgba(212,163,115,0.5) 80%, transparent 100%)',
        }}
      />

      {/* Ambient gold radial — top left corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 10% 0%, rgba(212,163,115,0.12) 0%, transparent 48%), radial-gradient(ellipse at 92% 110%, rgba(122,157,84,0.09) 0%, transparent 50%)',
        }}
      />

      {/* Subtle grain for felt */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-10 sm:px-10 md:py-12 lg:px-12">
        {/* Ledger header */}
        <div className="flex flex-col items-start gap-3 pb-7 sm:flex-row sm:items-baseline sm:justify-between sm:pb-8">
          <div className="flex items-baseline gap-4">
            <span className="font-body text-[48px] italic leading-none text-accent/60 sm:text-[56px]">
              ¶
            </span>
            <h2
              id="concierge-heading"
              className="font-heading text-[22px] font-extrabold uppercase leading-none tracking-[0.18em] text-white sm:text-[26px]"
            >
              The concierge rail
            </h2>
          </div>
          <p className="max-w-md font-body text-[14px] italic leading-[1.6] text-white/55 sm:text-right">
            Three doors for three kinds of errand — ring the one that fits,
            and someone at the desk replies.
          </p>
        </div>

        {/* Clip-reveal strip containing three panels */}
        <motion.div
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
          viewport={inViewOnce}
          transition={{ duration: 1.1, ease: EASE_OUT_PREMIUM }}
          className="relative grid grid-cols-1 md:grid-cols-3"
          style={{ willChange: 'clip-path' }}
        >
          {PANELS.map((p, i) => (
            <Panel key={p.numeral} panel={p} index={i} isLast={i === PANELS.length - 1} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────── */

function Panel({
  panel,
  index,
  isLast,
}: {
  panel: Panel
  index: number
  isLast: boolean
}) {
  return (
    <Link
      href={panel.href}
      className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden px-6 py-8 sm:px-8 sm:py-9 md:min-h-[260px] focus-visible:outline-none"
      style={{ willChange: 'transform' }}
    >
      {/* Right-edge gold rule between panels — skipped on last */}
      {!isLast && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-8 right-0 hidden w-px md:block"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(212,163,115,0.4) 20%, rgba(212,163,115,0.7) 50%, rgba(212,163,115,0.4) 80%, transparent 100%)',
          }}
        />
      )}
      {/* Mobile — bottom rule between stacked panels */}
      {!isLast && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-8 bottom-0 h-px md:hidden"
          style={{
            background:
              'linear-gradient(to right, transparent 0%, rgba(212,163,115,0.4) 20%, rgba(212,163,115,0.7) 50%, rgba(212,163,115,0.4) 80%, transparent 100%)',
          }}
        />
      )}

      {/* Brass corner pin — top-right */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-6 top-6 h-[7px] w-[7px] rounded-full"
        style={{
          background:
            'radial-gradient(circle at 35% 30%, #F3D9A8 0%, #D4A373 55%, #8A5A2B 100%)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,230,200,0.6)',
        }}
      />

      {/* Large italic roman numeral background */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 bottom-4 select-none font-body italic leading-none text-white/[0.07] transition-[color,transform] duration-500 ease-out group-hover:text-accent/20"
        style={{
          fontSize: 'clamp(120px, 15vw, 200px)',
          letterSpacing: '-0.02em',
        }}
      >
        {panel.numeral}
      </span>

      {/* Hover glow — radial that brightens outside-in */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(212,163,115,0.18) 0%, transparent 60%)',
        }}
      />

      {/* Top row: icon + ordinal */}
      <div className="relative z-10 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.6, delay: 0.3 + index * 0.12, ease: EASE_OUT_PREMIUM }}
          className="flex items-center gap-3 text-accent"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-accent/35">
            {panel.icon}
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-heading text-[9px] font-bold uppercase tracking-[0.28em] text-white/45">
              Path {panel.numeral}
            </span>
            <span className="mt-1 font-body text-[12px] italic text-accent/75">
              {panel.roman}
            </span>
          </div>
        </motion.div>

        {/* Hairline chevron, penned in SVG */}
        <ChevronHairline />
      </div>

      {/* Bottom block */}
      <div className="relative z-10 flex flex-col gap-5 pt-10">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.65, delay: 0.4 + index * 0.12, ease: EASE_OUT_PREMIUM }}
          className="font-heading text-[24px] font-extrabold leading-[1.08] tracking-[-0.018em] text-white sm:text-[26px]"
        >
          {panel.label}
        </motion.h3>

        {/* Thin gold rule that widens on hover */}
        <span
          aria-hidden
          className="h-px w-10 bg-accent/80 transition-[width] duration-500 ease-out group-hover:w-24 group-focus-visible:w-24"
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.7, delay: 0.5 + index * 0.12, ease: EASE_OUT_PREMIUM }}
          className="font-body text-[14px] leading-[1.75] text-white/65"
        >
          {panel.body}
        </motion.p>

        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={inViewOnce}
          transition={{ duration: 0.6, delay: 0.65 + index * 0.12, ease: EASE_OUT_PREMIUM }}
          className="mt-1 inline-flex items-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-accent transition-[letter-spacing] duration-500 ease-out group-hover:tracking-[0.28em]"
        >
          {panel.cta}
          <span
            aria-hidden
            className="inline-block transition-transform duration-500 ease-out group-hover:translate-x-1"
          >
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
              <path
                d="M 0 5 L 16 5 M 11 1 L 16 5 L 11 9"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </motion.span>
      </div>

      {/* Gold thread that sweeps across on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 overflow-hidden"
      >
        <span
          className="gold-thread-sweep-on-hover block h-full w-full"
          style={{
            background:
              'linear-gradient(to right, transparent 0%, rgba(212,163,115,0.95) 45%, rgba(255,235,200,1) 50%, rgba(212,163,115,0.95) 55%, transparent 100%)',
            transform: 'translateX(-110%)',
          }}
        />
      </span>
    </Link>
  )
}

/* ────────────── Iconography (engraved SVG) ────────────── */

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M 8 1.5 V 2.6 M 4 12 Q 4 6.5, 8 6.5 Q 12 6.5, 12 12 M 3 12 H 13 M 7 13.4 Q 8 14.3, 9 13.4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ParcelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M 2.5 4.5 L 8 2 L 13.5 4.5 L 13.5 11.5 L 8 14 L 2.5 11.5 Z M 2.5 4.5 L 8 7 L 13.5 4.5 M 8 7 V 14 M 5.5 3.25 L 10.8 5.7"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function QuillIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M 13 3 Q 8 3, 5 8 Q 3 11, 3 13 L 5 13 Q 7 13, 8 11.5 M 8 9 L 11 9 M 10.5 5.5 Q 12 6.5, 13 8 M 2 14 L 4 12"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronHairline() {
  return (
    <svg
      aria-hidden
      width="32"
      height="14"
      viewBox="0 0 32 14"
      fill="none"
      className="text-accent/60 transition-transform duration-500 ease-out group-hover:translate-x-1.5"
    >
      <path
        d="M 2 7 L 28 7 M 22 2 L 28 7 L 22 12"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
