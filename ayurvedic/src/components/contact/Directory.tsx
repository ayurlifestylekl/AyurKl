'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'

import { EASE_OUT_PREMIUM, fadeUp, inViewOnce } from '@/lib/motion'

type Channel = {
  serial: string
  kicker: string
  title: string
  description: string
  meta: string
  href: string
  external?: boolean
  pill?: string
}

const CHANNELS: Channel[] = [
  {
    serial: 'I',
    kicker: 'For treatment',
    title: 'Consult',
    description:
      'Begin with a consultation. Vaidya\u2019s chamber, Monday through Saturday — by appointment only.',
    meta: 'Same-day reply · Cal.com booking',
    href: '/treatments#booking',
    pill: 'Booking',
  },
  {
    serial: 'II',
    kicker: 'For orders',
    title: 'Ayur-Store',
    description:
      'Bundles, refills and single herbs — couriered anywhere in Malaysia. Tracked by WhatsApp.',
    meta: 'Klang Valley 1\u20132d · East Malaysia 4\u20137d',
    href: '/contact?intent=product#letterhead',
    pill: 'Shipping',
  },
  {
    serial: 'III',
    kicker: 'For notes',
    title: 'General correspondence',
    description:
      'Every note read personally. Write to us about anything — we\u2019re slow in all the right ways.',
    meta: 'Reply within one working day',
    href: '#letterhead',
  },
  {
    serial: 'IV',
    kicker: 'Editorial · Events · Corporate',
    title: 'Press & Partnerships',
    description:
      'Journalists, brand collaborators and corporate wellness programs — we reply to serious enquiries.',
    meta: 'Editorial · Events · Corporate wellness',
    href: 'mailto:info@keralaayurvedic.com?subject=Press%20or%20Partnership%20Enquiry',
    external: true,
  },
]

const ROW_HEIGHT = 84
const PANE_PAD_TOP = 32 // py-8 on the selector column

/**
 * Zone 2 — "The Switchboard"
 * Cream section. Interactive two-pane console — vertical channel-switch
 * selector on the left, a live detail plate on the right. A small gold
 * connector line travels between panes whenever a channel is activated
 * (the "line has been opened" motif). Collapses to an inline accordion
 * on mobile.
 */
export default function Directory() {
  const [active, setActive] = useState(0)
  const [mobileOpen, setMobileOpen] = useState<number | null>(0)
  const channel = CHANNELS[active]!

  const connectorY = PANE_PAD_TOP + active * ROW_HEIGHT + ROW_HEIGHT / 2

  return (
    <section
      aria-labelledby="directory-heading"
      className="relative overflow-hidden bg-cream py-14 sm:py-16 lg:py-20"
      id="directory"
    >
      {/* Atmospheric warm radials */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 900px 700px at 12% 0%, rgba(212,163,115,0.10) 0%, transparent 55%), radial-gradient(ellipse 700px 500px at 88% 100%, rgba(122,157,84,0.06) 0%, transparent 60%)',
        }}
      />
      <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0" />

      <div className="relative mx-auto w-full max-w-5xl px-5 sm:px-8 lg:px-6">
        {/* Section header */}
        <motion.div
          variants={fadeUp(0)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="flex items-center justify-center gap-4">
            <span
              aria-hidden
              className="h-px w-16 sm:w-24"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(212,163,115,0.7))',
              }}
            />
            <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.4em] text-accent">
              The Switchboard
            </span>
            <span
              aria-hidden
              className="h-px w-16 sm:w-24"
              style={{
                background: 'linear-gradient(to left, transparent, rgba(212,163,115,0.7))',
              }}
            />
          </div>

          <h2
            id="directory-heading"
            className="mt-3 font-heading text-[26px] font-extrabold leading-[1.05] tracking-[-0.025em] text-primary sm:text-[32px]"
          >
            Four ways to{' '}
            <span className="font-body italic font-normal text-accent">reach us.</span>
          </h2>

          <p className="mx-auto mt-2.5 max-w-[44ch] font-body text-[13.5px] italic leading-[1.55] text-dark/70">
            Pick the channel that fits. Each one lands with a real person; none of them
            funnel into a queue.
          </p>
        </motion.div>

        {/* Console frame */}
        <motion.div
          variants={fadeUp(0.1)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="relative mx-auto mt-8 w-full max-w-[960px] rounded-[4px] bg-white/60 shadow-elevated sm:mt-10"
        >
          {/* Outer double hairline */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[8px] rounded-[3px] border border-accent/30"
          />
          {/* L-bracket corner mitres */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-[4px] top-[4px] h-3 w-3 border-l-2 border-t-2 border-accent/80"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute right-[4px] top-[4px] h-3 w-3 border-r-2 border-t-2 border-accent/80"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-[4px] left-[4px] h-3 w-3 border-b-2 border-l-2 border-accent/80"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-[4px] right-[4px] h-3 w-3 border-b-2 border-r-2 border-accent/80"
          />

          {/* ─── DESKTOP — two-pane console ─────────────────── */}
          <div className="relative hidden lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            {/* Vertical divider */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-8 left-[41.666667%] w-px bg-accent/25"
            />

            {/* Animated connector — travels to active row */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-[41.666667%] top-0 z-10 h-px w-10 -translate-x-5 bg-accent"
              initial={false}
              animate={{ y: connectorY }}
              transition={{ duration: 0.38, ease: EASE_OUT_PREMIUM }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-[41.666667%] top-0 z-10 h-2 w-2 -translate-x-1 rounded-full bg-accent shadow-[0_0_0_4px_rgba(212,163,115,0.18)]"
              initial={false}
              animate={{ y: connectorY - 4 }}
              transition={{ duration: 0.38, ease: EASE_OUT_PREMIUM }}
            />

            {/* Left — selector */}
            <ul className="flex flex-col py-8 pl-10 pr-8">
              {CHANNELS.map((c, idx) => (
                <SwitchButton
                  key={c.serial}
                  channel={c}
                  isActive={idx === active}
                  isLast={idx === CHANNELS.length - 1}
                  onSelect={() => setActive(idx)}
                />
              ))}
            </ul>

            {/* Right — detail plate */}
            <div className="relative flex min-h-[336px] items-center px-10 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={channel.serial}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_PREMIUM }}
                  className="w-full"
                >
                  <DetailPlate channel={channel} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ─── MOBILE — inline accordion ──────────────────── */}
          <ul className="flex flex-col p-4 sm:p-5 lg:hidden">
            {CHANNELS.map((c, idx) => (
              <MobileAccordionRow
                key={c.serial}
                channel={c}
                index={idx}
                isOpen={mobileOpen === idx}
                onToggle={() => setMobileOpen(mobileOpen === idx ? null : idx)}
              />
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────── */

function SwitchButton({
  channel,
  isActive,
  isLast,
  onSelect,
}: {
  channel: Channel
  isActive: boolean
  isLast: boolean
  onSelect: () => void
}) {
  return (
    <li
      className="relative"
      style={{ height: ROW_HEIGHT }}
    >
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={onSelect}
        onFocus={onSelect}
        className="group relative flex h-full w-full items-center gap-5 rounded-[2px] pl-4 pr-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        aria-pressed={isActive}
      >
        {/* Pull-tab indicator */}
        <motion.span
          aria-hidden
          className="absolute left-0 top-1/2 w-[3px] -translate-y-1/2 bg-accent"
          initial={false}
          animate={{
            height: isActive ? 40 : 0,
            opacity: isActive ? 1 : 0,
          }}
          transition={{ duration: 0.28, ease: EASE_OUT_PREMIUM }}
        />

        {/* Active row wash */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[2px]"
          initial={false}
          animate={{ opacity: isActive ? 1 : 0 }}
          transition={{ duration: 0.24, ease: EASE_OUT_PREMIUM }}
          style={{
            background:
              'linear-gradient(to right, rgba(212,163,115,0.07) 0%, rgba(212,163,115,0.02) 60%, transparent 100%)',
          }}
        />

        {/* Roman numeral */}
        <span className="relative flex w-10 shrink-0 flex-col items-start leading-none">
          <span className="font-body text-[10px] italic text-accent/65">N°</span>
          <motion.span
            className="mt-0.5 font-body italic leading-none"
            initial={false}
            animate={{
              color: isActive ? 'rgb(212,163,115)' : 'rgba(212,163,115,0.42)',
            }}
            transition={{ duration: 0.28, ease: EASE_OUT_PREMIUM }}
            style={{ fontSize: '30px', letterSpacing: '-0.02em' }}
          >
            {channel.serial}
          </motion.span>
        </span>

        {/* Label stack */}
        <span className="relative flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-heading text-[9.5px] font-semibold uppercase tracking-[0.28em] text-primary/55">
            {channel.kicker}
          </span>
          <motion.span
            className="truncate font-heading text-[16px] font-semibold tracking-[-0.01em]"
            initial={false}
            animate={{
              color: isActive ? 'rgb(47,93,80)' : 'rgba(43,43,43,0.55)',
            }}
            transition={{ duration: 0.28, ease: EASE_OUT_PREMIUM }}
          >
            {channel.title}
          </motion.span>
        </span>
      </button>

      {/* Hairline divider */}
      {!isLast && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-4 right-3 h-px bg-accent/15"
        />
      )}

    </li>
  )
}

/* ─────────────────────────────────────────────────────────── */

function DetailPlate({ channel }: { channel: Channel }) {
  return (
    <div>
      {/* Eyebrow — channel serial */}
      <div className="flex items-center gap-3">
        <span aria-hidden className="h-px w-10 bg-accent/60" />
        <span className="font-heading text-[9.5px] font-semibold uppercase tracking-[0.34em] text-accent">
          Channel · {channel.serial}
        </span>
      </div>

      {/* Title + pill */}
      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h3
          className="font-body font-normal italic text-primary"
          style={{
            fontSize: 'clamp(1.85rem, 3vw, 2.3rem)',
            letterSpacing: '-0.02em',
            lineHeight: '1.05',
          }}
        >
          {channel.title}
          <span className="text-accent">.</span>
        </h3>
        {channel.pill && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/[0.08] px-2.5 py-1 font-heading text-[9px] font-semibold uppercase tracking-[0.22em] text-accent">
            <span aria-hidden>◊</span>
            {channel.pill}
          </span>
        )}
      </div>

      {/* Gold flourish */}
      <span
        aria-hidden
        className="mt-3 block h-px w-20"
        style={{
          background:
            'linear-gradient(to right, rgba(212,163,115,0.85), rgba(212,163,115,0.15))',
        }}
      />

      {/* Description */}
      <p className="mt-4 max-w-[44ch] font-body text-[14px] leading-[1.65] text-dark/80">
        {channel.description}
      </p>

      {/* Dot-leader meta */}
      <div className="mt-5 flex items-baseline gap-3">
        <span aria-hidden className="h-px w-12 border-t border-dotted border-primary/40" />
        <span className="font-body text-[12px] italic text-primary/75">{channel.meta}</span>
      </div>

      {/* CTA — embossed gold plate */}
      <div className="mt-6">
        <BeginButton channel={channel} />
      </div>
    </div>
  )
}

function BeginButton({
  channel,
  full = false,
}: {
  channel: Channel
  full?: boolean
}) {
  const cls = `inline-flex ${
    full ? 'w-full justify-center' : 'w-fit'
  } items-center gap-3 rounded-[2px] border border-accent/60 bg-accent px-5 py-2.5 font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-white shadow-[0_10px_24px_-12px_rgba(212,163,115,0.9)] transition-colors duration-300 hover:bg-primary hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream`

  if (channel.external) {
    return (
      <a href={channel.href} className={cls}>
        Begin
        <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
      </a>
    )
  }

  return (
    <Link href={channel.href} className={cls}>
      Begin
      <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
    </Link>
  )
}

/* ─────────────────────────────────────────────────────────── */

function MobileAccordionRow({
  channel,
  index,
  isOpen,
  onToggle,
}: {
  channel: Channel
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  const isLast = index === CHANNELS.length - 1

  return (
    <li className={isLast ? '' : 'border-b border-accent/15'}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-4 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <span
          aria-hidden
          className="font-body italic leading-none text-accent"
          style={{ fontSize: '22px', letterSpacing: '-0.02em' }}
        >
          {channel.serial}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-heading text-[9px] font-semibold uppercase tracking-[0.26em] text-primary/55">
            {channel.kicker}
          </span>
          <span className="truncate font-heading text-[14.5px] font-semibold text-primary">
            {channel.title}
          </span>
        </span>
        <motion.span
          aria-hidden
          className="shrink-0 text-accent"
          initial={false}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT_PREMIUM }}
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE_OUT_PREMIUM }}
            className="overflow-hidden"
          >
            <div className="pb-5 pl-[38px] pr-1">
              {channel.pill && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/[0.08] px-2 py-0.5 font-heading text-[8.5px] font-semibold uppercase tracking-[0.22em] text-accent">
                  <span aria-hidden>◊</span>
                  {channel.pill}
                </span>
              )}
              <p className="mt-2 font-body text-[13px] leading-[1.6] text-dark/80">
                {channel.description}
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <span
                  aria-hidden
                  className="h-px w-8 border-t border-dotted border-primary/40"
                />
                <span className="font-body text-[11.5px] italic text-primary/70">
                  {channel.meta}
                </span>
              </div>
              <div className="mt-4">
                <BeginButton channel={channel} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}
