'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

import CTAButton from '@/components/ui/CTAButton'
import WaxSeal from './WaxSeal'
import { EASE_OUT_PREMIUM } from '@/lib/motion'

/**
 * The hero — an envelope laid open across the page. Asymmetric 7/5 split
 * but populated end-to-end: letterhead block on the left, addressed-to
 * panel on the right with postmark + wax seal + sender's crest. No
 * empty margins — every column carries content or a deliberate mark.
 */
export default function EnvelopeOpening() {
  return (
    <section
      aria-labelledby="contact-hero-heading"
      className="relative overflow-hidden bg-cream pb-12 pt-14 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20"
    >
      {/* Parchment atmospherics */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(212,163,115,0.14) 0%, transparent 55%), radial-gradient(ellipse at 92% 100%, rgba(47,93,80,0.08) 0%, transparent 55%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 22%, rgba(122,80,36,0.75) 0%, transparent 6%), radial-gradient(circle at 82% 78%, rgba(122,80,36,0.65) 0%, transparent 5%), radial-gradient(circle at 88% 18%, rgba(122,80,36,0.5) 0%, transparent 3%), radial-gradient(circle at 18% 82%, rgba(122,80,36,0.5) 0%, transparent 4%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        {/* Top letterhead strip — metadata runs full-width like a real envelope header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT_PREMIUM }}
          className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-accent/30 pb-4"
        >
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/65">
            Folio XII · The First Step
          </span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/55">
            Sender · Vaidya AKHIL HS, B.A.M.S
          </span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/55">
            Postmarked · Brickfields · 18 APR 2026
          </span>
          <span className="ml-auto font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
            A Private Correspondence
          </span>
        </motion.div>

        {/* Main editorial split */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
          {/* LEFT — the letter itself (7 cols) */}
          <div className="relative lg:col-span-7">
            {/* KAL watermark — behind headline only, not stretched across empty page */}
            <span
              aria-hidden
              className="pointer-events-none absolute -left-2 top-10 select-none font-heading font-extrabold text-primary/[0.035]"
              style={{
                fontSize: 'clamp(180px, 28vw, 340px)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}
            >
              KAL
            </span>

            {/* Salutation */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: EASE_OUT_PREMIUM }}
              className="relative mb-5 font-body text-[15px] italic leading-[1.6] text-primary/70 sm:text-[16px]"
            >
              To the reader seeking healing,
            </motion.p>

            <HeadingStaggered />

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.95, ease: EASE_OUT_PREMIUM }}
              className="relative mt-6 max-w-[540px] font-body text-[16px] leading-[1.75] text-dark/70 md:text-[17px]"
            >
              Whether you have questions about our treatments, need help with
              the Ayur-Store, or want to book a consultation — we are here
              for you. Every message is read personally, not routed through
              a bot.
            </motion.p>

            {/* WhatsApp + supporting line */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.15, ease: EASE_OUT_PREMIUM }}
              className="relative mt-7 flex flex-wrap items-center gap-x-5 gap-y-3"
            >
              <CTAButton
                variant="primary"
                size="md"
                icon={<MessageCircle className="h-4 w-4" strokeWidth={2.4} />}
                href="https://wa.me/601165043436?text=Hello%2C%20I%20would%20like%20to%20book%20a%20consultation"
                shimmer
              >
                Write on WhatsApp
              </CTAButton>
              <span className="font-body text-[13px] italic leading-[1.45] text-dark/55">
                or scroll on — three doors, one letterhead desk.
              </span>
            </motion.div>

            {/* Triple column foot */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.3, ease: EASE_OUT_PREMIUM }}
              className="relative mt-8 grid grid-cols-3 gap-4 border-t border-accent/25 pt-4"
            >
              <FootCell label="Hours" value="Mon – Sat · 9 – 19" />
              <FootCell label="Quarter" value="Brickfields, KL" />
              <FootCell label="Cadence" value="~1 day reply" />
            </motion.div>
          </div>

          {/* RIGHT — addressed-to / envelope detail (5 cols) */}
          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, delay: 0.4, ease: EASE_OUT_PREMIUM }}
            className="relative self-stretch lg:col-span-5"
          >
            <AddressedToPanel />
          </motion.aside>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────── */

function HeadingStaggered() {
  const reduced = useReducedMotion()
  const words: Array<{ text: string; italic?: boolean }> = [
    { text: 'Begin' },
    { text: 'your' },
    { text: 'healing' },
    { text: 'journey.', italic: true },
  ]

  return (
    <h1
      id="contact-hero-heading"
      className="relative font-heading font-extrabold leading-[0.98] tracking-[-0.028em] text-primary"
      style={{ fontSize: 'clamp(46px, 7.2vw, 92px)' }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: reduced ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: reduced ? 0 : 0.4 + i * 0.09,
            ease: EASE_OUT_PREMIUM,
          }}
          className={`inline-block ${
            w.italic ? 'font-body italic font-normal text-accent' : ''
          } ${i < words.length - 1 ? 'mr-[0.22em]' : ''}`}
          style={{ willChange: 'transform' }}
        >
          {w.text}
        </motion.span>
      ))}
    </h1>
  )
}

function FootCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-heading text-[9px] font-bold uppercase tracking-[0.26em] text-primary/50">
        {label}
      </span>
      <span className="font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
        {value}
      </span>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────── */
/* Right aside — a full addressed-to panel with postmark + seal   */
/* ──────────────────────────────────────────────────────────── */

function AddressedToPanel() {
  return (
    <div
      className="relative h-full"
      style={{
        background:
          'linear-gradient(180deg, #FAF6EE 0%, #f0ede5 100%)',
        border: '1px solid rgba(212,163,115,0.5)',
        boxShadow:
          '0 28px 60px -20px rgba(47,93,80,0.35), 0 8px 18px rgba(47,93,80,0.08)',
      }}
    >
      {/* Deckled top edge — scalloped stamp border */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-2.5"
        style={{
          backgroundImage:
            'radial-gradient(circle at 8px 12px, #FAF6EE 4px, transparent 4.6px)',
          backgroundSize: '16px 12px',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: '0 -4px',
        }}
      />
      {/* Deckled bottom edge */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2.5"
        style={{
          backgroundImage:
            'radial-gradient(circle at 8px 0px, #FAF6EE 4px, transparent 4.6px)',
          backgroundSize: '16px 12px',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: '0 4px',
        }}
      />

      {/* Postmark — top-right, tilted */}
      <div
        className="absolute right-4 top-4 sm:right-6 sm:top-6"
        style={{ transform: 'rotate(-12deg)' }}
      >
        <Postmark />
      </div>

      {/* Ruled baseline texture (low opacity) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0, transparent 27px, rgba(47,93,80,0.05) 27px, rgba(47,93,80,0.05) 28px)',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 14%, black 92%, transparent 100%)',
        }}
      />

      <div className="relative flex h-full flex-col gap-5 px-7 py-8 sm:px-9 sm:py-10">
        {/* Section marker */}
        <div className="flex items-baseline gap-3">
          <span className="font-body text-[36px] italic leading-none text-accent/70">
            №
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-[9px] font-bold uppercase tracking-[0.3em] text-primary/55">
              Envelope
            </span>
            <span className="font-heading text-[13px] font-bold uppercase tracking-[0.18em] text-primary">
              012 · Addressed to
            </span>
          </div>
        </div>

        {/* Recipient detail — "you" */}
        <div className="flex flex-col gap-1.5 pt-2">
          <span className="font-heading text-[9px] font-bold uppercase tracking-[0.3em] text-primary/50">
            The recipient
          </span>
          <span className="font-body text-[20px] italic leading-[1.3] text-primary sm:text-[22px]">
            Whoever is reading this,
            <br />
            in their own quiet hour.
          </span>
        </div>

        {/* Dotted leader row — "c/o the clinic" */}
        <div className="flex items-baseline gap-2 font-heading text-[10px] font-bold uppercase tracking-[0.2em]">
          <span className="text-primary/55">c/o</span>
          <span
            aria-hidden
            className="flex-1 translate-y-[-2px] border-b border-dotted border-primary/30"
          />
          <span className="text-primary">Kerala Ayurvedic Lifestyle</span>
        </div>
        <div className="flex items-baseline gap-2 font-heading text-[10px] font-bold uppercase tracking-[0.2em]">
          <span className="text-primary/55">Quarter</span>
          <span
            aria-hidden
            className="flex-1 translate-y-[-2px] border-b border-dotted border-primary/30"
          />
          <span className="text-primary">Brickfields · KL · 50470</span>
        </div>
        <div className="flex items-baseline gap-2 font-heading text-[10px] font-bold uppercase tracking-[0.2em]">
          <span className="text-primary/55">Est.</span>
          <span
            aria-hidden
            className="flex-1 translate-y-[-2px] border-b border-dotted border-primary/30"
          />
          <span className="text-primary">MMXI · Since 2011</span>
        </div>

        {/* Sender-seal row */}
        <div className="mt-auto flex items-center gap-4 border-t border-primary/15 pt-5">
          <WaxSeal size="md" label="KAL" subLabel="SEALED · KUALA LUMPUR" rotate />
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-[9px] font-bold uppercase tracking-[0.3em] text-primary/50">
              Sealed & sent by hand
            </span>
            <span className="font-body text-[13px] italic leading-[1.4] text-primary/75">
              Most replies within
              <br />
              one working day.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────── */

function Postmark() {
  const size = 104
  const radius = size / 2
  const outerR = radius - 3
  const innerR = radius - 18
  const labelR = radius - 9

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <path
          id="postmark-top"
          d={`M ${radius},${radius} m -${labelR},0 a ${labelR},${labelR} 0 1,1 ${labelR * 2},0`}
        />
        <path
          id="postmark-bottom"
          d={`M ${radius},${radius} m -${labelR - 8},0 a ${labelR - 8},${labelR - 8} 0 1,0 ${
            (labelR - 8) * 2
          },0`}
        />
      </defs>

      <circle
        cx={radius}
        cy={radius}
        r={outerR}
        fill="none"
        stroke="#7A4A22"
        strokeWidth="1.4"
        strokeDasharray="60 4 30 3 90 2 40 3"
        opacity="0.78"
      />
      <circle
        cx={radius}
        cy={radius}
        r={innerR}
        fill="none"
        stroke="#7A4A22"
        strokeWidth="0.9"
        opacity="0.72"
      />

      <text
        fontFamily="var(--font-montserrat), sans-serif"
        fontWeight="700"
        fontSize="6.5"
        letterSpacing="2.2"
        fill="#7A4A22"
        opacity="0.85"
      >
        <textPath href="#postmark-top" startOffset="50%" textAnchor="middle">
          BRICKFIELDS · KUALA LUMPUR
        </textPath>
      </text>

      <text
        fontFamily="var(--font-montserrat), sans-serif"
        fontWeight="700"
        fontSize="5.5"
        letterSpacing="2.2"
        fill="#7A4A22"
        opacity="0.7"
      >
        <textPath href="#postmark-bottom" startOffset="50%" textAnchor="middle">
          THE FIRST STEP · 012
        </textPath>
      </text>

      <g transform={`translate(${radius} ${radius})`}>
        <text
          y="-4"
          fontFamily="var(--font-montserrat), sans-serif"
          fontWeight="800"
          fontSize="9"
          letterSpacing="0.4"
          fill="#7A4A22"
          textAnchor="middle"
          opacity="0.9"
        >
          APR 18
        </text>
        <line x1="-18" x2="18" y1="2" y2="2" stroke="#7A4A22" strokeWidth="0.6" opacity="0.55" />
        <text
          y="12"
          fontFamily="var(--font-montserrat), sans-serif"
          fontWeight="700"
          fontSize="7"
          letterSpacing="1.2"
          fill="#7A4A22"
          textAnchor="middle"
          opacity="0.78"
        >
          2026
        </text>
      </g>
    </svg>
  )
}
