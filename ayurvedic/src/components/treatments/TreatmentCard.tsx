'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Clock, MessageCircle, ShieldAlert } from 'lucide-react'

import { fadeUp } from '@/lib/motion'
import type { Treatment } from '@/types/treatments'

interface TreatmentCardProps {
  treatment: Treatment
  /** Stable index used for label numbering inside the category, e.g. "01 / 13" */
  indexInCategory: number
  totalInCategory: number
}

/**
 * A single treatment "specimen card" — editorial layout with a top accent
 * strip, oversized index number, title in Montserrat extrabold, Lora body
 * description, optional consultation badge, and a dual CTA stack.
 *
 * Card uses layered, color-tinted shadows (per CLAUDE.md anti-generic
 * guardrails). Hover animates transform + box-shadow only — never `transition-all`.
 */
export default function TreatmentCard({
  treatment,
  indexInCategory,
  totalInCategory,
}: TreatmentCardProps) {
  const { title, duration, description, requiresConsultation, categoryTitle } =
    treatment

  const whatsappHref = `https://wa.me/601165043436?text=${encodeURIComponent(
    `Hi, I'd like to inquire about the "${title}" treatment.`,
  )}`

  // /book is currently a ComingSoon stub but we still pass the treatment id
  // so it's ready when the booking flow lands.
  const bookHref = `/book?treatment=${encodeURIComponent(treatment._id)}`

  return (
    <motion.article
      variants={fadeUp(0)}
      layout
      className="group relative flex h-full flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-primary/10 shadow-[0_1px_2px_rgba(47,93,80,0.04),0_14px_36px_-18px_rgba(47,93,80,0.16)] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_2px_4px_rgba(47,93,80,0.06),0_28px_56px_-18px_rgba(47,93,80,0.22)]"
    >
      {/* Top accent strip */}
      <div
        aria-hidden
        className="h-[3px] w-full bg-gradient-to-r from-primary via-secondary to-accent"
      />

      {/* Subtle inner gradient wash so the white doesn't read as flat */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(212,163,115,0.08) 0%, transparent 55%)',
        }}
      />

      <div className="relative flex flex-1 flex-col gap-5 p-7 sm:p-8">
        {/* ── Eyebrow row: index + category ───────────────── */}
        <div className="flex items-start justify-between gap-4">
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-primary/55">
            <span className="text-accent">
              {String(indexInCategory).padStart(2, '0')}
            </span>
            <span className="mx-1.5 text-primary/30">/</span>
            <span>{String(totalInCategory).padStart(2, '0')}</span>
          </span>
          <span className="max-w-[55%] text-right font-heading text-[9px] font-semibold uppercase tracking-[0.18em] text-primary/45">
            {categoryTitle}
          </span>
        </div>

        {/* ── Title ───────────────── */}
        <h3 className="font-heading text-[22px] font-extrabold leading-[1.15] tracking-[-0.02em] text-primary sm:text-[24px]">
          {title}
        </h3>

        {/* ── Duration ───────────────── */}
        {duration && (
          <div className="flex items-center gap-2 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-dark/65">
            <Clock className="h-3.5 w-3.5 text-accent" strokeWidth={2.4} />
            <span>{duration}</span>
          </div>
        )}

        {/* Hairline divider */}
        <div
          aria-hidden
          className="h-px w-12 bg-gradient-to-r from-accent/70 to-transparent"
        />

        {/* ── Description ───────────────── */}
        {description && (
          <p className="font-body text-[15px] leading-[1.7] text-dark/70">
            {description}
          </p>
        )}

        {/* ── Consultation badge ───────────────── */}
        {requiresConsultation && (
          <div
            role="note"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5"
          >
            <ShieldAlert className="h-3 w-3 text-accent" strokeWidth={2.4} />
            <span className="font-heading text-[9.5px] font-bold uppercase tracking-[0.16em] text-accent">
              Practitioner Consultation Required
            </span>
          </div>
        )}

        {/* Spacer pushes CTAs to the bottom */}
        <div className="flex-1" />

        {/* ── CTA stack ───────────────── */}
        <div className="mt-2 flex flex-col gap-2.5 border-t border-primary/10 pt-5">
          <Link
            href={bookHref}
            className="group/cta relative inline-flex min-h-[44px] items-center justify-center gap-2 overflow-hidden rounded-full bg-accent px-6 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-dark shadow-[0_10px_28px_-12px_rgba(212,163,115,0.85)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-12px_rgba(212,163,115,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97]"
            aria-label={`Inquire or book ${title}`}
          >
            <span className="relative z-10">Inquire / Book</span>
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
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group/wa inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-6 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-primary transition-[transform,background-color,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/55 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.97]"
            aria-label={`Inquire about ${title} on WhatsApp`}
          >
            <MessageCircle className="h-3.5 w-3.5 text-secondary" strokeWidth={2.4} />
            <span>WhatsApp Us</span>
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
