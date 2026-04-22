'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'

import { EASE_OUT_PREMIUM, fadeUp, inViewOnce } from '@/lib/motion'
import { contactFaqs } from '@/data/contactFaqs'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

/**
 * Zone 6 — "The Footnotes"
 * Pinned handwritten note (left, sticky, tilted) + compact accordion of
 * frequently asked questions (right, single-open). Closes with a trimmed
 * letter-style sign-off rather than a centred banner.
 */
export default function Footnotes() {
  const [open, setOpen] = useState<string | null>(contactFaqs[0]?.id ?? null)

  return (
    <section
      id="footnotes"
      aria-labelledby="footnotes-heading"
      className="relative overflow-hidden bg-cream py-14 sm:py-16 lg:py-20"
    >
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 900px 700px at 88% 0%, rgba(212,163,115,0.1) 0%, transparent 55%), radial-gradient(ellipse 700px 500px at 12% 100%, rgba(122,157,84,0.06) 0%, transparent 60%)',
        }}
      />
      <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0" />

      <div className="relative mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-8">
        {/* Eyebrow */}
        <motion.div
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="flex items-center justify-center gap-4 text-center"
        >
          <span
            aria-hidden
            className="h-px w-14 sm:w-20"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(212,163,115,0.7))',
            }}
          />
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.4em] text-accent">
            The Footnotes
          </span>
          <span
            aria-hidden
            className="h-px w-14 sm:w-20"
            style={{
              background: 'linear-gradient(to left, transparent, rgba(212,163,115,0.7))',
            }}
          />
        </motion.div>

        {/* 2-column body */}
        <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-10 lg:mt-10">
          {/* LEFT — pinned note */}
          <motion.aside
            variants={fadeUp(0)}
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="md:col-span-5 lg:col-span-4"
          >
            <div className="md:sticky md:top-28">
              <NoteCard />
            </div>
          </motion.aside>

          {/* RIGHT — accordion */}
          <motion.div
            variants={fadeUp(0.05)}
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="md:col-span-7 lg:col-span-8"
          >
            {/* Section title */}
            <div className="flex items-baseline justify-between gap-4">
              <h2
                id="footnotes-heading"
                className="font-heading font-extrabold leading-[1.05] tracking-[-0.025em] text-primary"
                style={{ fontSize: 'clamp(1.4rem, 2.4vw, 1.75rem)' }}
              >
                Questions,{' '}
                <span className="font-body italic font-normal text-accent">answered.</span>
              </h2>
              <span className="hidden shrink-0 font-body text-[11px] italic text-dark/45 sm:inline">
                Tap to read
              </span>
            </div>

            <span
              aria-hidden
              className="mt-3 block h-px w-full"
              style={{
                background:
                  'linear-gradient(to right, rgba(212,163,115,0.7) 0%, rgba(212,163,115,0.1) 100%)',
              }}
            />

            {/* Accordion list */}
            <ul className="mt-1 flex flex-col">
              {contactFaqs.map((faq, idx) => {
                const isOpen = open === faq.id
                const isLast = idx === contactFaqs.length - 1
                return (
                  <li key={faq.id}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${faq.id}`}
                      className="group flex w-full items-center gap-4 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                    >
                      {/* Footnote mark — tiny superscript numeral */}
                      <span
                        aria-hidden
                        className="flex w-7 shrink-0 items-start justify-center pt-1"
                      >
                        <span
                          className="font-body italic leading-none"
                          style={{
                            fontSize: '12px',
                            letterSpacing: '-0.02em',
                            color: isOpen
                              ? 'rgb(212,163,115)'
                              : 'rgba(212,163,115,0.55)',
                          }}
                        >
                          {ROMAN[idx] ?? idx + 1}.
                        </span>
                      </span>

                      {/* Question */}
                      <span
                        className="flex-1 font-heading font-semibold leading-[1.4] tracking-[-0.01em] transition-colors duration-300"
                        style={{
                          fontSize: '14.5px',
                          color: isOpen
                            ? 'rgb(47,93,80)'
                            : 'rgba(43,43,43,0.85)',
                        }}
                      >
                        {faq.question}
                      </span>

                      {/* Plus / minus indicator */}
                      <motion.span
                        aria-hidden
                        className="shrink-0 text-accent"
                        initial={false}
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT_PREMIUM }}
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="answer"
                          id={`faq-panel-${faq.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.32, ease: EASE_OUT_PREMIUM }}
                          className="overflow-hidden"
                        >
                          <div className="relative ml-7 border-l border-accent/40 pb-4 pl-4 pr-2">
                            <p className="max-w-[58ch] font-body text-[13px] leading-[1.7] text-dark/75">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Asterism divider */}
                    {!isLast && (
                      <div
                        aria-hidden
                        className="flex items-center justify-center py-0.5 text-[7px] tracking-[0.8em] text-accent/40"
                      >
                        * * *
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>

            {/* Letter-style sign-off */}
            <div className="mt-6 flex flex-col items-end gap-0.5 text-right">
              <p className="font-body text-[13px] italic text-primary/75">
                Yours in wellness,
              </p>
              <p
                className="font-body italic text-accent"
                style={{ fontSize: '18px', letterSpacing: '-0.02em', lineHeight: 1.1 }}
              >
                — Kerala Ayurvedic Lifestyle
              </p>
              <p className="mt-1 max-w-[42ch] font-body text-[10px] italic leading-[1.5] text-dark/40">
                Ayurvedic Lifestyle (KL) Sdn Bhd · Reg. 847466-D · 37 Jalan Thamby
                Abdullah 1, Brickfields 50470 KL
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────── */

function NoteCard() {
  return (
    <div
      className="relative mx-auto max-w-[320px] bg-white px-6 py-6 shadow-elevated md:mx-0 md:-rotate-[1.5deg]"
      style={{ transformOrigin: 'center' }}
    >
      {/* Washi-tape corners — top-left + bottom-right */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-3 -top-2 h-3.5 w-12 rotate-[-18deg]"
        style={{
          background:
            'linear-gradient(135deg, rgba(212,163,115,0.65) 0%, rgba(212,163,115,0.35) 60%, rgba(212,163,115,0.55) 100%)',
          boxShadow:
            'inset 0 0 0 1px rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.08)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-2 -right-3 h-3.5 w-12 rotate-[-18deg]"
        style={{
          background:
            'linear-gradient(135deg, rgba(212,163,115,0.65) 0%, rgba(212,163,115,0.35) 60%, rgba(212,163,115,0.55) 100%)',
          boxShadow:
            'inset 0 0 0 1px rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.08)',
        }}
      />

      {/* Inner paper hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-2 border border-accent/15"
      />

      <span className="relative font-heading text-[9.5px] font-bold uppercase tracking-[0.3em] text-primary/55">
        Before you write
      </span>

      <h3
        className="relative mt-2 font-heading font-extrabold leading-[1.05] tracking-[-0.025em] text-primary"
        style={{ fontSize: '1.35rem' }}
      >
        A few things{' '}
        <span className="font-body italic font-normal text-accent">worth knowing.</span>
      </h3>

      <span
        aria-hidden
        className="relative my-3 block h-px w-16"
        style={{
          background:
            'linear-gradient(to right, rgba(212,163,115,0.85), rgba(212,163,115,0.15))',
        }}
      />

      <blockquote className="relative">
        <p
          className="font-body italic leading-[1.55] text-dark/80"
          style={{ fontSize: '13px' }}
        >
          Therapies are strictly same-gender. All bookings carry a 48-hour cancellation
          notice; the advance deposit is non-refundable.
        </p>
      </blockquote>

      {/* Signed — uses same scripted flourish motif as the Nameplate */}
      <div className="relative mt-4 flex items-end gap-2">
        <span
          className="font-body italic text-accent"
          style={{ fontSize: '26px', letterSpacing: '-0.02em', lineHeight: 0.9 }}
        >
          — Akhil
        </span>
        <span className="mb-1 font-heading text-[8.5px] font-bold uppercase tracking-[0.28em] text-primary/50">
          B.A.M.S
        </span>
      </div>

      <svg
        aria-hidden
        viewBox="0 0 180 14"
        className="relative mt-1 h-3 w-[120px] text-accent/70"
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
    </div>
  )
}
