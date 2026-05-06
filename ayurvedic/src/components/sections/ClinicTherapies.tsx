'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'
import { therapies } from '@/data/therapies'
import type { Therapy } from '@/types/content'

/**
 * Editorial Portrait Card Row
 * Five signature therapies in a single row, fits one screen on desktop,
 * snap-scrolls horizontally on mobile. Replaces the previous scroll-spied
 * sticky reveal.
 */
export default function ClinicTherapies() {
  return (
    <section
      id="clinic-therapies"
      aria-labelledby="therapies-heading"
      className="relative overflow-hidden bg-cream lg:h-[calc(100svh-7.5rem)] lg:min-h-[680px] lg:max-h-[820px]"
    >
      {/* Layered atmospheric backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 18% 8%, rgba(212,163,115,0.16) 0%, transparent 65%), radial-gradient(55% 60% at 88% 92%, rgba(47,93,80,0.12) 0%, transparent 60%), radial-gradient(80% 80% at 50% 50%, rgba(255,255,255,0.6) 0%, transparent 75%)',
        }}
      />

      {/* Botanical SVG ornament — left */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute -left-12 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 opacity-[0.05] lg:block"
      >
        <path
          d="M100 20 C 60 60, 60 140, 100 180 C 140 140, 140 60, 100 20 Z"
          stroke="#2F5D50"
          strokeWidth="0.5"
          fill="none"
        />
        <path d="M100 30 C 70 65, 70 135, 100 170" stroke="#2F5D50" strokeWidth="0.4" fill="none" />
        <path d="M100 30 C 130 65, 130 135, 100 170" stroke="#2F5D50" strokeWidth="0.4" fill="none" />
        <line x1="100" y1="20" x2="100" y2="180" stroke="#2F5D50" strokeWidth="0.3" />
        <circle cx="100" cy="100" r="40" stroke="#D4A373" strokeWidth="0.4" fill="none" />
        <circle cx="100" cy="100" r="60" stroke="#D4A373" strokeWidth="0.3" fill="none" />
        <circle cx="100" cy="100" r="80" stroke="#D4A373" strokeWidth="0.2" fill="none" />
      </svg>

      {/* Botanical SVG ornament — right (lotus) */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute -right-16 top-1/3 hidden h-[320px] w-[320px] opacity-[0.04] lg:block"
      >
        <g transform="translate(100 100)">
          {[0, 60, 120, 180, 240, 300].map((rot) => (
            <g key={rot} transform={`rotate(${rot})`}>
              <path
                d="M0 -70 C 20 -45, 25 -15, 0 0 C -25 -15, -20 -45, 0 -70 Z"
                fill="#2F5D50"
              />
            </g>
          ))}
          <circle r="6" fill="#D4A373" />
        </g>
      </svg>

      {/* Paper grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55] mix-blend-multiply"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />

      {/* Top gold hairline */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 4%, rgba(212,163,115,0.35) 28%, rgba(212,163,115,0.55) 50%, rgba(212,163,115,0.35) 72%, transparent 96%)',
        }}
      />
      {/* Bottom gold hairline */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 4%, rgba(212,163,115,0.30) 28%, rgba(212,163,115,0.50) 50%, rgba(212,163,115,0.30) 72%, transparent 96%)',
        }}
      />

      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col px-6 py-12 sm:px-10 lg:px-12 lg:py-14">
        {/* ── Header ── */}
        <motion.header
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-accent/50" aria-hidden />
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.4em] text-accent sm:text-[11px]">
              At The Clinic
            </span>
            <span className="h-px w-10 bg-accent/50" aria-hidden />
          </div>

          <h2
            id="therapies-heading"
            className="mt-5 font-heading text-[clamp(2.25rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight text-primary"
          >
            Signature Therapies
          </h2>

          <p className="mt-5 font-body text-[15px] leading-[1.7] text-dark/70 sm:text-[16px]">
            Administered under the expert guidance of{' '}
            <span className="font-medium text-primary">Vaidya Akhil H.S., B.A.M.S., M.D. (Ayu)</span>{' '}
            and performed by highly experienced Ayurvedic therapists from{' '}
            <span className="font-medium text-primary">Kerala, India</span>.
          </p>

          <div className="mt-4 flex items-center justify-center" aria-hidden>
            <span className="h-1 w-1 rounded-full bg-accent/70" />
          </div>

          <p className="mt-3 font-body text-[14px] italic leading-[1.65] text-primary/65 sm:text-[15px]">
            All treatments are tailored to your dosha — ensuring a deeply restorative and authentic healing experience.
          </p>
        </motion.header>

        {/* ── Card Row ── */}
        <motion.ol
          variants={staggerParent(0.08, 0.15)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:mt-10 lg:grid-cols-5 lg:gap-5 xl:gap-6"
        >
          {therapies.map((therapy, i) => (
            <TherapyCard key={therapy.slug} therapy={therapy} index={i} />
          ))}
        </motion.ol>

        {/* ── Footer link ── */}
        <motion.div
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="mt-6 flex items-center justify-center lg:mt-8"
        >
          <Link
            href="/treatments"
            className="group inline-flex items-center gap-3 border-b border-primary/20 pb-1 font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-primary transition-colors duration-300 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            Explore All Therapies
            <ArrowRight className="h-[14px] w-[14px] transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function TherapyCard({ therapy, index }: { therapy: Therapy; index: number }) {
  const numberLabel = `0${index + 1}`

  return (
    <motion.li variants={fadeUp(0)} className="group relative flex flex-col">
      <Link
        href={`/book/treatment?therapy=${therapy.slug}`}
        aria-label={`Discover ${therapy.name} — ${therapy.tagline}`}
        className="block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm shadow-[0_12px_32px_-16px_rgba(47,93,80,0.35)]">
          <Image
            src={therapy.image}
            alt={`${therapy.name} — ${therapy.tagline}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 18vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />

          {/* Primary tint */}
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: 'rgba(47,93,80,0.10)' }}
          />
          {/* Bottom gradient for legibility */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
          />

          {/* Top metadata: index + duration */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 lg:p-4">
            <span className="card-index inline-flex items-center justify-center rounded-sm bg-black/25 px-2 py-1 font-heading text-[10px] font-bold tracking-[0.18em] text-accent backdrop-blur-sm transition-shadow duration-500 ease-out group-hover:shadow-[0_0_0_1.5px_rgba(212,163,115,0.85),0_8px_22px_-8px_rgba(212,163,115,0.55)] sm:text-[11px]">
              {numberLabel}
            </span>
            <span className="font-body text-[11px] italic tracking-wide text-white/90 sm:text-[12px]">
              {therapy.durationMin} min
            </span>
          </div>

          {/* Bottom: name + tagline */}
          <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5">
            <h3 className="font-heading text-[18px] font-extrabold tracking-tight text-white drop-shadow-sm sm:text-[19px] lg:text-[20px]">
              {therapy.name}
            </h3>
            <p className="mt-1 font-body text-[12px] italic leading-snug text-white/70">
              {therapy.tagline}
            </p>
          </div>
        </div>

        {/* Discover link */}
        <div className="mt-3 flex items-center justify-between">
          <span className="h-px w-8 bg-accent/40 transition-[width,background-color] duration-500 ease-out group-hover:w-14 group-hover:bg-accent/85" />
          <span className="inline-flex items-center gap-1.5 font-heading text-[10.5px] font-bold uppercase tracking-[0.22em] text-primary transition-colors duration-300 group-hover:text-accent">
            Discover
            <ArrowRight className="h-[11px] w-[11px] transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.li>
  )
}
