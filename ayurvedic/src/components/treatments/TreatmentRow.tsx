'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'

import { fadeUp } from '@/lib/motion'
import { mantraFor, type Mantra } from '@/lib/treatment-mantras'
import type { Treatment } from '@/types/treatments'

interface TreatmentRowProps {
  treatment: Treatment
  chapterNumber: number
  specimenNumber: number
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/**
 * V1 — "The Broadsheet"
 * A single horizontal row per treatment: marginalia serial · title + description · meta + CTA.
 * No cards, no panels, no images. Gold hairline separator below each row.
 */
export default function TreatmentRow({
  treatment,
  chapterNumber,
  specimenNumber,
}: TreatmentRowProps) {
  const t = treatment
  const chapter = pad2(chapterNumber)
  const specimen = `.${pad2(specimenNumber)}`

  const bookHref = `/book?treatment=${encodeURIComponent(t._id)}`
  const whatsappHref = `https://wa.me/601165043436?text=${encodeURIComponent(
    `Hi, I'd like to inquire about the "${t.title}" treatment.`
  )}`

  return (
    <motion.article
      variants={fadeUp(0)}
      className="group relative grid grid-cols-1 gap-5 border-b border-accent/15 py-9 lg:grid-cols-[72px_1fr_240px] lg:gap-10 lg:py-14"
    >
      {/* Warm hover wash — blooms from the right */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse 55% 90% at 100% 50%, rgba(212,163,115,0.07) 0%, transparent 70%)',
        }}
      />

      {/* ── Marginalia serial (desktop only) */}
      <div
        className="relative hidden select-none flex-col items-start pt-1 lg:flex"
        aria-hidden
      >
        <span className="font-body text-[12px] italic leading-none text-accent/60">
          N°
        </span>
        <span className="mt-1 font-body text-[36px] italic leading-none text-accent/70">
          {chapter}
        </span>
        <span className="mt-1 font-body text-[26px] italic leading-none text-accent/55">
          {specimen}
        </span>
      </div>

      {/* ── Content column */}
      <div className="relative flex flex-col gap-4">
        {/* Inline mobile serial */}
        <span
          aria-hidden
          className="font-body text-[11px] italic tracking-wide text-accent/70 lg:hidden"
        >
          N°{chapter}{specimen}
        </span>

        {/* Title + inline consultation pill */}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h3
            className="font-body font-normal italic text-primary"
            style={{
              fontSize: 'clamp(1.6rem, 3.2vw, 2.6rem)',
              letterSpacing: '-0.02em',
              lineHeight: '1.05',
            }}
          >
            {t.title}
            <span className="text-accent/80">.</span>
          </h3>

          {t.requiresConsultation && (
            <span
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-accent/40 bg-accent/[0.08] px-2.5 py-1 font-heading text-[9px] font-semibold uppercase tracking-[0.18em] text-accent"
              title="Practitioner consultation required before booking"
            >
              <span aria-hidden className="text-accent/80">◊</span>
              Consultation
            </span>
          )}
        </div>

        {/* Title flourish */}
        <span
          aria-hidden
          className="block h-px w-10 transition-[width] duration-500 group-hover:w-20"
          style={{
            background:
              'linear-gradient(to right, rgba(212,163,115,0.85), rgba(212,163,115,0.15))',
          }}
        />

        {/* Description */}
        {t.description && (
          <p className="max-w-[56ch] font-body text-[15.5px] leading-[1.65] text-dark/75 transition-colors duration-500 group-hover:text-dark/95 line-clamp-3">
            {t.description}
          </p>
        )}
      </div>

      {/* ── Meta + CTA column */}
      <div className="relative flex flex-col gap-5 lg:items-start lg:pt-2">
        {/* Dot-leader duration */}
        {t.duration && (
          <div className="flex w-full items-baseline gap-3">
            <span className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.22em] text-primary/55">
              Duration
            </span>
            <span
              aria-hidden
              className="mb-1 flex-1 border-b border-dotted border-primary/25"
            />
            <span className="font-body text-[13px] italic text-primary/85">
              {t.duration}
            </span>
          </div>
        )}

        {/* CTA cluster — stacked */}
        <div className="flex flex-col gap-3">
          <Link
            href={bookHref}
            aria-label={`Read protocol for ${t.title}`}
            className="group/link inline-flex w-fit items-center gap-2 border-b border-accent/50 pb-1 font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-primary transition-colors duration-300 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            Read Protocol
            <ArrowRight
              className="h-3 w-3 transition-transform duration-300 group-hover/link:translate-x-1"
              strokeWidth={2.2}
            />
          </Link>

          <Link
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp inquiry about ${t.title}`}
            className="inline-flex w-fit items-center gap-2 text-primary/60 transition-[color,transform] duration-300 hover:scale-[1.02] hover:text-primary focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
            <span className="font-body text-[13px] italic">Inquire via WhatsApp</span>
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

/**
 * Centered pull-quote interstitial — Sanskrit mantra + English translation.
 * Inserted every 5 rows within a chapter (not at chapter-end).
 */
export function Interstitial({ mantra }: { mantra: Mantra }) {
  return (
    <motion.blockquote
      variants={fadeUp(0.15)}
      className="relative flex flex-col items-center gap-3 border-b border-accent/15 py-12 text-center lg:py-16"
    >
      <span
        aria-hidden
        className="h-px w-12"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(212,163,115,0.7), transparent)',
        }}
      />
      <p
        lang="sa"
        className="font-body font-normal italic text-accent"
        style={{
          fontSize: 'clamp(1.2rem, 2.2vw, 1.6rem)',
          letterSpacing: '0.02em',
          lineHeight: '1.3',
        }}
      >
        {mantra.devanagari}
      </p>
      <span
        aria-hidden
        className="h-px w-6"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(212,163,115,0.5), transparent)',
        }}
      />
      <p className="max-w-[38ch] font-body text-[14.5px] italic leading-[1.55] text-primary/70">
        {mantra.english}
      </p>
      <cite className="mt-1 not-italic font-body text-[10.5px] italic tracking-wide text-accent/60">
        — classical Ayurvedic texts
      </cite>
    </motion.blockquote>
  )
}

export { mantraFor }
