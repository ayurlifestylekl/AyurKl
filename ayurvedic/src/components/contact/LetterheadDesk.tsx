'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { submitContactMessage, type ContactIntent } from '@/actions/contact'
import { EASE_OUT_PREMIUM, inViewOnce } from '@/lib/motion'
import SignatureStroke from './SignatureStroke'

type Status = 'idle' | 'loading' | 'success' | 'error'

const INTENTS: Array<{ value: ContactIntent; label: string }> = [
  { value: 'treatment', label: 'Treatment' },
  { value: 'product',   label: 'Ayur-Store' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'other',     label: 'Other' },
]

/**
 * The private correspondence card. One hero detail (a debossed KAL
 * monogram behind the headline), typography carrying all other weight.
 * No ruled lines, no perforations, no ribbons, no corner fleurons.
 * Serif-italic headline in Lora. A single refined pill button.
 * A quiet card that feels like bespoke stationery, not school paper.
 */
export default function LetterheadDesk() {
  const [intent, setIntent] = useState<ContactIntent>('treatment')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const reduced = useReducedMotion()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const param = params.get('intent')
    if (
      param === 'treatment' ||
      param === 'product' ||
      param === 'corporate' ||
      param === 'other'
    ) {
      setIntent(param)
    }
  }, [])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setErrorMessage(null)
    startTransition(async () => {
      const result = await submitContactMessage({
        intent,
        name,
        phone: phone.startsWith('+60') ? phone : `+60 ${phone}`,
        email,
        message,
      })
      if (result.ok) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMessage(result.error)
      }
    })
  }

  function handleReset() {
    setStatus('idle')
    setIntent('treatment')
    setName('')
    setPhone('')
    setEmail('')
    setMessage('')
    setErrorMessage(null)
  }

  const busy = status === 'loading' || isPending
  const charPct = Math.min(100, (message.length / 2000) * 100)

  return (
    <section
      id="inquiry"
      aria-labelledby="letterhead-heading"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden scroll-mt-24"
      style={{ background: '#1a2e26' }}
    >
      {/* Single quiet spotlight from top-center + faint green wash at bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% -4%, rgba(212,163,115,0.16) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 50% 102%, rgba(47,93,80,0.22) 0%, transparent 60%)',
        }}
      />

      {/* Subtle grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-6 sm:px-10 md:py-8 lg:px-12">
        {/* Quiet section header — one line, centered, above the card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.6, ease: EASE_OUT_PREMIUM }}
          className="mb-3 flex items-center justify-center gap-3 sm:mb-4"
        >
          <span className="font-body text-[26px] italic leading-none text-accent/70">
            §
          </span>
          <h2
            id="letterhead-heading"
            className="font-heading text-[11px] font-bold uppercase tracking-[0.3em] text-accent/75"
          >
            Your message to Brickfields
          </h2>
        </motion.div>

        {/* The card — centered, flat, art-directed */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.75, ease: EASE_OUT_PREMIUM }}
          className="relative mx-auto max-w-[880px]"
        >
          {/* Paper — single cream gradient, soft drop shadow, concave inner shadow */}
          <div
            className="relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #FAF6EE 0%, #f0ede5 100%)',
              borderRadius: '3px',
              boxShadow:
                '0 44px 88px -24px rgba(0,0,0,0.55), 0 14px 28px -8px rgba(47,93,80,0.4), inset 0 24px 60px -20px rgba(47,93,80,0.08), inset 0 -20px 50px -20px rgba(47,93,80,0.06)',
            }}
          >
            {/* Paper grain */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.3' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />

            {/* Debossed KAL monogram — the single hero detail */}
            <DebossedMonogram />

            <div className="relative px-6 py-6 sm:px-12 sm:py-7 md:px-14 md:py-8">
              {/* Top mark: centered hairline + ledger + eyebrow */}
              <div className="mb-4 flex flex-col items-center gap-1.5 text-center sm:mb-5">
                <span aria-hidden className="h-px w-12 bg-accent/70" />
                <p className="font-heading text-[9px] font-semibold uppercase tracking-[0.32em] text-primary/55">
                  Kerala Ayurvedic Lifestyle · Brickfields · Est MMXI
                </p>
                <p className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
                  A Private Correspondence
                </p>
              </div>

              {/* Headline block — asymmetric, left-aligned */}
              <div className="relative mb-4 flex flex-col gap-1.5 sm:mb-5">
                <h3
                  className="relative font-body italic font-normal text-primary"
                  style={{
                    fontSize: 'clamp(28px, 3.2vw, 40px)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.005em',
                  }}
                >
                  Write to the Vaidya<span className="text-accent"> —</span>
                </h3>
                <p className="max-w-[520px] font-body text-[14px] leading-[1.55] text-dark/70 sm:text-[15px]">
                  he will reply to you personally within one working day.
                </p>
              </div>

              {status === 'success' ? (
                <SuccessLetter onReset={handleReset} />
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
                  {/* Intent tab strip */}
                  <fieldset>
                    <legend className="mb-1.5 font-heading text-[9px] font-bold uppercase tracking-[0.28em] text-primary/55">
                      What is this about?
                    </legend>
                    <div
                      role="tablist"
                      className="relative flex flex-wrap items-end border-b border-primary/15"
                    >
                      {INTENTS.map((opt) => (
                        <IntentTab
                          key={opt.value}
                          selected={intent === opt.value}
                          onClick={() => setIntent(opt.value)}
                          label={opt.label}
                          reduced={!!reduced}
                        />
                      ))}
                    </div>
                  </fieldset>

                  {/* Name + Phone — 2-col */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
                    <HairlineField id="contact-name" label="Your name">
                      <input
                        id="contact-name"
                        type="text"
                        required
                        minLength={2}
                        maxLength={120}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Priya Kumar"
                        autoComplete="name"
                        className="hairline-input"
                      />
                    </HairlineField>

                    <HairlineField id="contact-phone" label="Phone (+60)">
                      <div className="relative">
                        <span
                          aria-hidden
                          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 font-heading text-[13px] font-bold text-primary/55"
                        >
                          +60
                        </span>
                        <input
                          id="contact-phone"
                          type="tel"
                          required
                          minLength={8}
                          maxLength={30}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="11 6504 3436"
                          autoComplete="tel"
                          className="hairline-input pl-9"
                        />
                      </div>
                    </HairlineField>
                  </div>

                  {/* Email */}
                  <HairlineField id="contact-email" label="Email address">
                    <input
                      id="contact-email"
                      type="email"
                      required
                      maxLength={200}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya@example.com"
                      autoComplete="email"
                      className="hairline-input"
                    />
                  </HairlineField>

                  {/* Message */}
                  <HairlineField id="contact-message" label="Your message">
                    <textarea
                      id="contact-message"
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell me what's on your mind…"
                      className="hairline-input resize-y"
                    />
                  </HairlineField>

                  {/* Error */}
                  {status === 'error' && errorMessage && (
                    <p
                      role="alert"
                      className="border-l-2 border-[#8E2E26] pl-3 font-body text-[13px] italic leading-[1.55] text-[#8E2E26]"
                    >
                      {errorMessage}
                    </p>
                  )}

                  {/* Footer — signature left, ink-meter + send right */}
                  <div className="mt-1 flex flex-col gap-3 border-t border-primary/15 pt-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                    {/* Left: signature + attribution */}
                    <div className="flex flex-col gap-1">
                      <SignatureStroke color="#2F5D50" width={130} strokeWidth={1.4} />
                      <span className="font-heading text-[9.5px] font-bold uppercase tracking-[0.26em] text-primary/75">
                        — Vaidya AKHIL HS · B.A.M.S
                      </span>
                      <span className="font-body text-[11.5px] italic leading-[1.4] text-primary/50">
                        Every note is read by me personally.
                      </span>
                    </div>

                    {/* Right: ink meter inline with send pill */}
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <div className="flex items-center gap-3">
                        <div className="relative h-[2px] w-[130px] overflow-hidden rounded-full bg-primary/10">
                          <span
                            aria-hidden
                            className="absolute inset-y-0 left-0 block rounded-full"
                            style={{
                              width: `${charPct}%`,
                              background:
                                'linear-gradient(to right, #7A4A22 0%, #D4A373 100%)',
                              transition:
                                'width 260ms cubic-bezier(0.22, 0.92, 0.38, 1.0)',
                            }}
                          />
                        </div>
                        <span className="font-heading text-[9px] font-semibold uppercase tracking-[0.22em] text-primary/50">
                          {message.length}/2000
                        </span>
                        <SealPillButton busy={busy} />
                      </div>
                      <p className="max-w-[260px] font-body text-[10.5px] italic leading-[1.45] text-primary/45 sm:text-right">
                        Your details stay with us. Never shared with third parties.
                      </p>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        :global(.hairline-input) {
          display: block;
          width: 100%;
          appearance: none;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid rgba(47, 93, 80, 0.22);
          padding: 6px 0 9px;
          font-family: var(--font-lora), Georgia, serif;
          font-size: 17px;
          color: #2b2b2b;
          outline: none;
          transition: border-color 260ms cubic-bezier(0.22, 0.92, 0.38, 1),
            border-bottom-width 260ms cubic-bezier(0.22, 0.92, 0.38, 1);
          caret-color: #d4a373;
        }
        :global(.hairline-input::placeholder) {
          color: rgba(43, 43, 43, 0.32);
          font-style: italic;
        }
        :global(.hairline-input:focus) {
          border-bottom-color: #d4a373;
          border-bottom-width: 2px;
          padding-bottom: 8px;
        }
        :global(.hairline-input:focus-visible) {
          outline: none;
        }
      `}</style>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────── */
/* Debossed KAL monogram — the single hero detail                */
/* ──────────────────────────────────────────────────────────── */

function DebossedMonogram() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <span
        className="select-none font-heading font-extrabold leading-none"
        style={{
          fontSize: 'clamp(240px, 36vw, 420px)',
          letterSpacing: '-0.05em',
          color: '#FAF6EE',
          /* Deboss illusion: light highlight above, subtle shadow below */
          filter:
            'drop-shadow(0 1px 0 rgba(255,255,255,0.85)) drop-shadow(0 -1px 0 rgba(47,93,80,0.22)) drop-shadow(0 2px 6px rgba(47,93,80,0.08))',
          opacity: 0.5,
          transform: 'translateY(-2%)',
        }}
      >
        KAL
      </span>
    </span>
  )
}

/* ──────────────────────────────────────────────────────────── */

function HairlineField({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-heading text-[9px] font-bold uppercase tracking-[0.28em] text-primary/55"
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function IntentTab({
  selected,
  onClick,
  label,
  reduced,
}: {
  selected: boolean
  onClick: () => void
  label: string
  reduced: boolean
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`group relative px-4 py-3 transition-colors duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF6EE] sm:px-5 ${
        selected
          ? 'text-primary'
          : 'text-primary/50 hover:text-primary/80'
      }`}
    >
      <span className="font-heading text-[11px] font-bold uppercase tracking-[0.2em]">
        {label}
      </span>
      {/* Animated gold underline — one line across the whole rail */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-3 -bottom-px h-[2px] origin-left sm:inset-x-4"
        style={{
          background:
            'linear-gradient(to right, #D4A373 0%, #7A4A22 100%)',
          transform: selected ? 'scaleX(1)' : 'scaleX(0)',
          transition: reduced
            ? 'none'
            : 'transform 300ms cubic-bezier(0.22, 0.92, 0.38, 1)',
        }}
      />
    </button>
  )
}

/* ──────────────────────────────────────────────────────────── */
/* Refined send pill — no more 108px disc                        */
/* ──────────────────────────────────────────────────────────── */

function SealPillButton({ busy }: { busy: boolean }) {
  return (
    <button
      type="submit"
      disabled={busy}
      aria-label="Seal and send message"
      className="group relative inline-flex min-h-[44px] items-center gap-2.5 overflow-hidden px-6 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-dark transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF6EE] disabled:cursor-wait disabled:opacity-80"
      style={{
        willChange: 'transform',
        borderRadius: '999px',
        background:
          'linear-gradient(180deg, #F3D9A8 0%, #D4A373 50%, #A5753F 100%)',
        boxShadow:
          '0 12px 24px -8px rgba(212,163,115,0.75), 0 3px 8px rgba(110,74,34,0.35), inset 0 1px 0 rgba(255,240,214,0.55), inset 0 -1px 0 rgba(64,36,14,0.25)',
      }}
    >
      {/* Subtle sheen sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'linear-gradient(105deg, transparent 35%, rgba(255,240,214,0.35) 50%, transparent 65%)',
        }}
      />

      {busy ? (
        <>
          <span
            aria-hidden
            className="relative z-10 inline-block h-3 w-3 animate-spin rounded-full border-[1.5px] border-[#2B1A0A]/70 border-r-transparent"
          />
          <span className="relative z-10">Sealing…</span>
        </>
      ) : (
        <>
          <span className="relative z-10">Seal and send</span>
          <WaxDropIcon />
        </>
      )}
    </button>
  )
}

function WaxDropIcon() {
  return (
    <svg
      aria-hidden
      width="12"
      height="14"
      viewBox="0 0 12 14"
      className="relative z-10"
    >
      <defs>
        <radialGradient id="waxdrop-g" cx="35%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#F3D9A8" />
          <stop offset="55%" stopColor="#8A5A2B" />
          <stop offset="100%" stopColor="#4E2F12" />
        </radialGradient>
      </defs>
      <path
        d="M 6 0.5 Q 10.5 6, 10.5 9.2 Q 10.5 12.8, 6 13.3 Q 1.5 12.8, 1.5 9.2 Q 1.5 6, 6 0.5 Z"
        fill="url(#waxdrop-g)"
        stroke="#2B1A0A"
        strokeWidth="0.5"
        opacity="0.9"
      />
      <circle cx="4.6" cy="7" r="1.2" fill="rgba(255,240,214,0.65)" />
    </svg>
  )
}

/* ──────────────────────────────────────────────────────────── */

function SuccessLetter({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT_PREMIUM }}
      className="relative flex flex-col gap-5 py-2"
    >
      <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
        Sealed · Sent
      </span>

      <h3
        className="font-body italic font-normal text-primary"
        style={{
          fontSize: 'clamp(32px, 3.6vw, 44px)',
          lineHeight: 1.08,
          letterSpacing: '-0.005em',
        }}
      >
        Thank you — I will reply<span className="text-accent"> within one working day.</span>
      </h3>

      <p className="max-w-md font-body text-[15px] leading-[1.7] text-primary/70">
        Your note is with me now. If your matter is urgent, WhatsApp is the
        fastest channel — we answer within the hour during clinic hours.
      </p>

      <div className="flex flex-col gap-1.5 pt-1">
        <SignatureStroke color="#2F5D50" width={160} strokeWidth={1.5} inView={false} />
        <span className="font-heading text-[9.5px] font-bold uppercase tracking-[0.26em] text-primary/75">
          — Vaidya AKHIL HS · B.A.M.S
        </span>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-2 inline-flex items-center gap-2 self-start font-heading text-[10.5px] font-bold uppercase tracking-[0.2em] text-primary/70 transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        Send another message
        <span aria-hidden>→</span>
      </button>
    </motion.div>
  )
}
