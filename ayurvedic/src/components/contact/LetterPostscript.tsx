'use client'

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

import { EASE_OUT_PREMIUM } from '@/lib/motion'
import type { FAQ } from '@/data/faqs'
import SignatureStroke from './SignatureStroke'
import WaxSeal from './WaxSeal'

interface LetterPostscriptProps {
  items: FAQ[]
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

/**
 * The folded sheet — closing leaf of the letter. A single 100dvh composition
 * that binds the P.S. FAQ (as a numeraled index margin) to the sign-off
 * (signature + wax seal + address) via a paper fold and a gold stitched
 * thread drawn from the active question to the seal.
 */
export default function LetterPostscript({ items }: LetterPostscriptProps) {
  const reduced = useReducedMotion() ?? false
  const [activeIndex, setActiveIndex] = useState(0)
  const active = items[activeIndex] ?? items[0]

  const sheetRef = useRef<HTMLDivElement>(null)
  const qRefs = useRef<(HTMLButtonElement | null)[]>([])
  const sealRef = useRef<HTMLDivElement>(null)
  const [thread, setThread] = useState<{ d: string; width: number; height: number } | null>(null)

  const measureThread = useCallback(() => {
    if (!sheetRef.current || !sealRef.current) return
    const activeBtn = qRefs.current[activeIndex]
    if (!activeBtn) return

    const sheetBox = sheetRef.current.getBoundingClientRect()
    const qBox = activeBtn.getBoundingClientRect()
    const sealBox = sealRef.current.getBoundingClientRect()

    const startX = qBox.right - sheetBox.left + 6
    const startY = qBox.top + qBox.height / 2 - sheetBox.top
    const endX = sealBox.left - sheetBox.left + 8
    const endY = sealBox.top + sealBox.height / 2 - sheetBox.top

    const cpX = startX + (endX - startX) * 0.55
    const cpY1 = startY
    const cpY2 = endY

    setThread({
      d: `M ${startX} ${startY} C ${cpX} ${cpY1} ${cpX} ${cpY2} ${endX} ${endY}`,
      width: sheetBox.width,
      height: sheetBox.height,
    })
  }, [activeIndex])

  useLayoutEffect(() => {
    measureThread()
  }, [measureThread])

  useEffect(() => {
    if (!sheetRef.current) return
    const ro = new ResizeObserver(() => measureThread())
    ro.observe(sheetRef.current)
    window.addEventListener('resize', measureThread)
    const t = window.setTimeout(measureThread, 120)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measureThread)
      window.clearTimeout(t)
    }
  }, [measureThread])

  const selectAndFocus = useCallback((i: number) => {
    setActiveIndex(i)
    qRefs.current[i]?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
      const last = items.length - 1
      let next: number | null = null
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          next = i === last ? 0 : i + 1
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          next = i === 0 ? last : i - 1
          break
        case 'Home':
          next = 0
          break
        case 'End':
          next = last
          break
      }
      if (next !== null) {
        e.preventDefault()
        selectAndFocus(next)
      }
    },
    [items.length, selectAndFocus],
  )

  const SHORT_LABELS: Record<string, string> = {
    'appointment-needed': 'Appointment',
    'shipping-time': 'Shipping time',
    'pregnancy-safety': 'Pregnancy & safety',
    'payment-methods': 'Payment methods',
    'walk-in': 'Walk-in policy',
  }

  const questionShort = useMemo(() => {
    return items.map(
      (item) => SHORT_LABELS[item.id] ?? item.question.replace(/\?$/, '').split(' ').slice(0, 4).join(' '),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  return (
    <section
      aria-labelledby="letter-postscript-heading"
      className="postscript-sheet relative isolate overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #FAF6EE 0%, #F0EAD7 60%, #EAE0C4 100%)',
      }}
    >
      {/* ── Atmosphere layers ─────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at 92% 96%, rgba(212,163,115,0.24) 0%, transparent 55%), radial-gradient(ellipse at 8% 4%, rgba(47,93,80,0.09) 0%, transparent 52%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.055] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 z-[1] h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(212,163,115,0.55) 20%, rgba(212,163,115,0.85) 50%, rgba(212,163,115,0.55) 80%, transparent 100%)',
        }}
      />

      {/* ── Header strip ─────────────────────────────────────── */}
      <header className="relative z-[2] flex items-center justify-between gap-6 px-6 pt-6 sm:px-10 lg:px-12 lg:pt-5">
        <div className="flex items-baseline gap-3">
          <span className="font-body text-[28px] italic leading-none text-accent sm:text-[32px]">
            P.S.
          </span>
          <span className="hidden font-heading text-[9.5px] font-bold uppercase tracking-[0.3em] text-primary/55 sm:inline">
            Postscript · Answered before you ask
          </span>
          <span className="font-heading text-[9.5px] font-bold uppercase tracking-[0.3em] text-primary/55 sm:hidden">
            Answered before you ask
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className="hidden font-body text-[10.5px] italic tracking-[0.22em] text-primary/55 md:inline">
            FOLIO · XVIII
          </span>
          <a
            href="#contact-hero-heading"
            className="group inline-flex items-center gap-2 font-heading text-[9.5px] font-bold uppercase tracking-[0.22em] text-primary/70 transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
              Top of the letter
            </span>
            <span aria-hidden className="text-accent">↑</span>
          </a>
        </div>
      </header>

      {/* ── The Sheet ────────────────────────────────────────── */}
      <motion.div
        ref={sheetRef}
        initial="initial"
        animate="animate"
        variants={{
          initial: {},
          animate: {
            transition: { delayChildren: 0.1, staggerChildren: 0.06 },
          },
        }}
        className="relative z-[2] mx-auto w-full max-w-[1180px] px-6 pb-8 pt-4 sm:px-10 lg:grid lg:grid-cols-[minmax(280px,320px)_1px_minmax(0,1fr)] lg:gap-0 lg:px-12 lg:pb-6 lg:pt-4"
      >
        {/* ── Left: index margin ─────────────────────────────── */}
        <div
          className="relative flex flex-col gap-0 lg:py-4 lg:pr-8 xl:pr-10"
          role="presentation"
        >
          {/* Mobile chip strip — horizontal scroll-snap */}
          <ol
            role="radiogroup"
            aria-labelledby="letter-postscript-heading"
            className="-mx-1 mb-5 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 lg:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {items.map((item, i) => (
              <li key={`chip-${item.id}`} className="snap-start">
                <button
                  type="button"
                  role="radio"
                  aria-checked={activeIndex === i}
                  tabIndex={activeIndex === i ? 0 : -1}
                  onClick={() => setActiveIndex(i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
                    activeIndex === i
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-primary/20 text-primary/55'
                  }`}
                >
                  <span className="font-body italic tracking-normal">№ {ROMAN[i]}</span>
                </button>
              </li>
            ))}
          </ol>

          {/* Desktop Q index */}
          <h2
            id="letter-postscript-heading"
            className="sr-only"
          >
            Answered before you ask
          </h2>

          <ol
            role="radiogroup"
            aria-labelledby="letter-postscript-heading"
            className="hidden flex-col lg:flex"
          >
            {items.map((item, i) => {
              const isActive = activeIndex === i
              return (
                <li
                  key={item.id}
                  role="presentation"
                  className="relative flex items-stretch"
                >
                  <motion.button
                    ref={(el) => {
                      qRefs.current[i] = el
                    }}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    aria-controls="letter-postscript-answer"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveIndex(i)}
                    onFocus={() => setActiveIndex(i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    data-active={isActive}
                    variants={{
                      initial: { opacity: 0, x: -12 },
                      animate: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE_OUT_PREMIUM } },
                    }}
                    className="group relative flex w-full items-center gap-4 py-3.5 text-left focus-visible:outline-none"
                  >
                    <span
                      aria-hidden
                      className="flex w-10 shrink-0 items-baseline gap-1.5 leading-none"
                    >
                      <span
                        className="font-body text-[10px] uppercase tracking-[0.24em] text-primary/40 transition-colors duration-300"
                        style={{ color: isActive ? 'rgba(212,163,115,0.95)' : undefined }}
                      >
                        №
                      </span>
                      <span
                        className="font-body text-[17px] italic leading-none transition-colors duration-300"
                        style={{
                          color: isActive ? '#D4A373' : 'rgba(47,93,80,0.55)',
                          textShadow: isActive
                            ? '0 0 6px rgba(212,163,115,0.35), 0 0 1.5px rgba(43,43,43,0.28), 0.5px 0.5px 0 rgba(47,93,80,0.18)'
                            : '0 0 1.5px rgba(43,43,43,0.22), 0.5px 0.5px 0 rgba(47,93,80,0.14)',
                        }}
                      >
                        {ROMAN[i]}
                      </span>
                    </span>

                    <span
                      className="flex-1 font-heading text-[13.5px] font-bold leading-[1.25] tracking-[-0.005em] transition-colors duration-300"
                      style={{
                        color: isActive ? '#2F5D50' : 'rgba(43,43,43,0.62)',
                      }}
                    >
                      {questionShort[i]}
                    </span>

                    <span
                      aria-hidden
                      className="relative flex h-4 w-4 shrink-0 items-center justify-center"
                    >
                      <motion.span
                        className="block h-[2px] w-[2px] rounded-full"
                        animate={{
                          scale: isActive ? 1.8 : 1,
                          backgroundColor: isActive ? '#D4A373' : 'rgba(47,93,80,0.35)',
                        }}
                        transition={{ duration: 0.4, ease: EASE_OUT_PREMIUM }}
                      />
                      {isActive && !reduced && (
                        <motion.span
                          aria-hidden
                          className="absolute inset-0 rounded-full"
                          initial={{ scale: 0.4, opacity: 0.55 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 1.4, ease: 'easeOut', repeat: Infinity }}
                          style={{ border: '1px solid rgba(212,163,115,0.55)' }}
                        />
                      )}
                    </span>
                  </motion.button>

                  {/* Dotted divider between rows */}
                  {i < items.length - 1 && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute bottom-0 left-0 right-4 h-px"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, rgba(47,93,80,0.22) 0%, rgba(47,93,80,0.22) 50%, transparent 50%, transparent 100%)',
                        backgroundSize: '6px 1px',
                        backgroundRepeat: 'repeat-x',
                      }}
                    />
                  )}
                </li>
              )
            })}
          </ol>

          {/* WhatsApp fallback — bottom of index */}
          <motion.div
            variants={{
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_PREMIUM } },
            }}
            className="mt-5 flex flex-col items-start gap-1.5 lg:mt-4"
          >
            <span className="font-heading text-[9px] font-bold uppercase tracking-[0.3em] text-primary/45">
              Still wondering?
            </span>
            <a
              href="https://wa.me/601165043436"
              className="group inline-flex items-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-primary transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <MessageCircle
                className="h-3.5 w-3.5 text-accent transition-transform duration-300 group-hover:rotate-12"
                strokeWidth={2.4}
              />
              <span>Ask on WhatsApp · within the hour</span>
              <span
                aria-hidden
                className="inline-block text-accent transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          </motion.div>
        </div>

        {/* ── Center: engraved fold + brass pin ───────────────── */}
        <div
          aria-hidden
          className="relative my-6 h-px w-full lg:my-4 lg:h-auto lg:w-px lg:self-stretch"
        >
          {/* Desktop vertical fold */}
          <span
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(43,43,43,0.16) 8%, rgba(43,43,43,0.28) 50%, rgba(43,43,43,0.16) 92%, transparent 100%)',
              boxShadow: '0.5px 0 0 rgba(255,252,240,0.6)',
            }}
          />
          {/* Mobile horizontal dotted rule */}
          <span
            className="absolute inset-0 lg:hidden"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(47,93,80,0.22) 0%, rgba(47,93,80,0.22) 50%, transparent 50%, transparent 100%)',
              backgroundSize: '6px 1px',
              backgroundRepeat: 'repeat-x',
            }}
          />
          {/* Brass paper-pin (top) */}
          <span
            className="absolute left-1/2 top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-500 ease-out hover:rotate-[6deg] lg:top-4 lg:-translate-y-0"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, #F3D9A8 0%, #D4A373 45%, #A5753F 92%)',
              boxShadow:
                '0 1px 2px rgba(64,36,14,0.55), 0 0 0 0.5px rgba(64,36,14,0.35), inset 0 1px 0.5px rgba(255,240,214,0.7)',
            }}
          />
          {/* Mirror pin at bottom on desktop only */}
          <span
            aria-hidden
            className="absolute left-1/2 hidden h-[10px] w-[10px] -translate-x-1/2 rounded-full lg:block"
            style={{
              bottom: '16px',
              background:
                'radial-gradient(circle at 35% 30%, #F3D9A8 0%, #D4A373 45%, #A5753F 92%)',
              boxShadow:
                '0 1px 2px rgba(64,36,14,0.55), 0 0 0 0.5px rgba(64,36,14,0.35), inset 0 1px 0.5px rgba(255,240,214,0.7)',
            }}
          />
        </div>

        {/* ── Right: answer leaf + sign-off footer ────────────── */}
        <div className="relative flex flex-col lg:py-4 lg:pl-8 xl:pl-10">
          {/* Watermark farewell */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 top-3 hidden select-none font-body italic leading-[1.05] lg:block"
            style={{
              fontSize: 'clamp(36px, 4.2vw, 58px)',
              color: 'rgba(47,93,80,0.08)',
              letterSpacing: '-0.01em',
              textAlign: 'right',
            }}
          >
            With warmth,
            <br />
            from Brickfields.
          </span>

          {/* Answer body */}
          <div
            id="letter-postscript-answer"
            role="region"
            aria-live="polite"
            aria-atomic="true"
            className="relative flex flex-col justify-start"
          >
            <motion.span
              variants={{
                initial: { opacity: 0, y: 8 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_PREMIUM } },
              }}
              className="mb-3 inline-flex items-center gap-2 font-heading text-[9px] font-bold uppercase tracking-[0.3em] text-accent"
            >
              <span>On answering №</span>
              <span className="font-body text-[11px] italic tracking-normal">{ROMAN[activeIndex]}</span>
            </motion.span>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.26, ease: EASE_OUT_PREMIUM }}
                className="flex flex-col gap-3"
              >
                <h3
                  className="font-heading font-extrabold leading-[1.08] tracking-[-0.022em] text-primary"
                  style={{ fontSize: 'clamp(22px, 2.4vw, 32px)' }}
                >
                  {active.question}
                </h3>
                <p
                  className="max-w-[52ch] font-body text-dark/75"
                  style={{
                    fontSize: 'clamp(14px, 1.05vw, 16.5px)',
                    lineHeight: 1.72,
                  }}
                >
                  {active.answer}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sign-off footer — permanent resident */}
          <motion.div
            variants={{
              initial: { opacity: 0, y: 14 },
              animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.3, ease: EASE_OUT_PREMIUM } },
            }}
            className="mt-5 flex items-end justify-between gap-6 pt-4"
            style={{
              borderTop: '1px solid rgba(212,163,115,0.28)',
            }}
          >
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="font-body text-[10.5px] italic tracking-[0.08em] text-primary/60">
                — A.H.
              </span>
              <SignatureStroke color="#2F5D50" width={200} strokeWidth={1.55} />
              <span className="mt-0.5 font-heading text-[9.5px] font-bold uppercase tracking-[0.24em] text-primary/75">
                Vaidya AKHIL HS, B.A.M.S
              </span>
              <span className="mt-1 font-body text-[10.5px] italic leading-[1.5] text-dark/55">
                Kerala Ayurvedic Lifestyle · 37 Jalan Thamby Abdullah 1 · Brickfields · KL · Est. 2011
              </span>
            </div>

            <div ref={sealRef} className="shrink-0">
              <div className="hidden lg:block">
                <WaxSeal
                  size="lg"
                  label="KAL"
                  subLabel="FOLIO · XVIII · SEALED"
                  rotate
                  tiltOnHover
                />
              </div>
              <div className="block lg:hidden">
                <WaxSeal
                  size="md"
                  label="KAL"
                  subLabel="FOLIO · XVIII · SEALED"
                  rotate
                  tiltOnHover
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Gold thread overlay (desktop only) ──────────────── */}
        {thread && (
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[3] hidden lg:block"
            width={thread.width}
            height={thread.height}
            viewBox={`0 0 ${thread.width} ${thread.height}`}
            style={{ overflow: 'visible' }}
          >
            <AnimatePresence mode="wait">
              <motion.path
                key={activeIndex}
                d={thread.d}
                fill="none"
                stroke="rgba(212,163,115,0.55)"
                strokeWidth={1}
                strokeLinecap="round"
                strokeDasharray="2 3"
                initial={reduced ? { opacity: 0.55 } : { opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.45, ease: EASE_OUT_PREMIUM }}
              />
            </AnimatePresence>
          </svg>
        )}
      </motion.div>

      {/* ── Envelope-flap footer ─────────────────────────────── */}
      <footer className="relative z-[2] flex items-center justify-center px-6 pb-5 pt-2 sm:px-10 lg:px-12 lg:pb-5">
        <div className="flex w-full max-w-[1100px] items-center gap-4">
          <span
            aria-hidden
            className="font-body text-[12px] italic text-primary/40"
          >
            ✕
          </span>
          <span
            aria-hidden
            className="h-px flex-1"
            style={{
              background:
                'linear-gradient(to right, transparent 0%, rgba(47,93,80,0.28) 20%, rgba(47,93,80,0.28) 80%, transparent 100%)',
            }}
          />
          <span className="font-heading text-[9px] font-bold uppercase text-primary/55" style={{ letterSpacing: '0.42em' }}>
            Sealed
          </span>
          <span
            aria-hidden
            className="h-px flex-1"
            style={{
              background:
                'linear-gradient(to right, transparent 0%, rgba(47,93,80,0.28) 20%, rgba(47,93,80,0.28) 80%, transparent 100%)',
            }}
          />
          <span
            aria-hidden
            className="font-body text-[12px] italic text-primary/40"
          >
            ✕
          </span>
        </div>
      </footer>

      {/* ── Height floors ───────────────────────────────────── */}
      <style jsx>{`
        .postscript-sheet { min-height: 520px; }
        @media (min-width: 1024px) { .postscript-sheet { min-height: 600px; } }
      `}</style>
    </section>
  )
}
