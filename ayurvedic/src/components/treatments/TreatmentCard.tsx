'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Clock, MessageCircle, ShieldAlert } from 'lucide-react'

import { fadeUp } from '@/lib/motion'
import type { Treatment } from '@/types/treatments'

interface TreatmentCardProps {
  treatment: Treatment
  indexInCategory: number
  totalInCategory: number
}

/**
 * Premium spa menu card — rich surface with warm golden atmosphere,
 * visible gold accents, strong hover depth with gold border glow.
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

  const bookHref = `/book?treatment=${encodeURIComponent(treatment._id)}`

  return (
    <motion.article
      variants={fadeUp(0)}
      layout
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10 transition-[transform,box-shadow,ring-color] duration-500 ease-out hover:-translate-y-2 hover:ring-accent/20"
      style={{
        boxShadow:
          '0 2px 4px rgba(47,93,80,0.04), 0 18px 44px -16px rgba(47,93,80,0.16)',
      }}
    >
      {/* Gold accent bar */}
      <div
        aria-hidden
        className="h-[2px] w-full opacity-70 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(to right, rgba(212,163,115,0.4), rgba(212,163,115,0.9) 50%, rgba(212,163,115,0.4))',
        }}
      />

      {/* Warm inner atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 90% 0%, rgba(212,163,115,0.07) 0%, transparent 55%), radial-gradient(ellipse at 10% 100%, rgba(47,93,80,0.03) 0%, transparent 50%)',
        }}
      />

      <div className="relative flex flex-1 flex-col gap-4 p-7 sm:p-8">
        {/* Eyebrow: index + category */}
        <div className="flex items-start justify-between gap-4">
          <span className="font-heading text-[11px] font-bold tracking-[0.08em]">
            <span className="text-accent">
              {String(indexInCategory).padStart(2, '0')}
            </span>
            <span className="mx-1.5 text-primary/20">/</span>
            <span className="text-primary/25">
              {String(totalInCategory).padStart(2, '0')}
            </span>
          </span>
          <span className="max-w-[55%] text-right font-heading text-[9px] font-semibold uppercase tracking-[0.18em] text-primary/40">
            {categoryTitle}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading text-[22px] font-extrabold leading-[1.12] tracking-[-0.02em] text-primary sm:text-[24px]">
          {title}
        </h3>

        {/* Duration */}
        {duration && (
          <div className="flex items-center gap-2 text-dark/55">
            <Clock className="h-3.5 w-3.5 text-accent/80" strokeWidth={2.2} />
            <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em]">
              {duration}
            </span>
          </div>
        )}

        {/* Expanding gold hairline */}
        <div
          aria-hidden
          className="h-px w-14 transition-all duration-500 group-hover:w-28"
          style={{
            background:
              'linear-gradient(to right, rgba(212,163,115,0.65), rgba(212,163,115,0.15))',
          }}
        />

        {/* Description */}
        {description && (
          <p className="font-body text-[14px] leading-[1.7] text-dark/65">
            {description}
          </p>
        )}

        {/* Consultation badge */}
        {requiresConsultation && (
          <div
            role="note"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/35 bg-accent/8 px-3 py-1.5"
          >
            <ShieldAlert className="h-3 w-3 text-accent" strokeWidth={2.2} />
            <span className="font-heading text-[9px] font-bold uppercase tracking-[0.14em] text-accent">
              Practitioner Consultation Required
            </span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA area */}
        <div className="mt-2 flex flex-col gap-3">
          <div
            aria-hidden
            className="h-px"
            style={{
              background:
                'linear-gradient(to right, rgba(212,163,115,0.25), rgba(212,163,115,0.08) 70%, transparent)',
            }}
          />

          <div className="flex items-center gap-2.5 pt-1.5">
            <Link
              href={bookHref}
              className="group/cta inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-dark transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97]"
              style={{
                boxShadow: '0 8px 24px -10px rgba(212,163,115,0.75)',
              }}
              aria-label={`Inquire or book ${title}`}
            >
              <span>Inquire / Book</span>
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                strokeWidth={2.4}
              />
            </Link>

            <Link
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full border border-primary/15 bg-white text-primary/45 transition-[transform,border-color,color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:text-primary hover:shadow-[0_6px_18px_-8px_rgba(47,93,80,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.97]"
              aria-label={`Inquire about ${title} on WhatsApp`}
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
