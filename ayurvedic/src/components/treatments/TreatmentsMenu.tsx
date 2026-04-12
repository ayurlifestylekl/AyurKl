'use client'

import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDown, ChevronLeft, ChevronRight, Clock, MessageCircle, ShieldAlert, Calendar } from 'lucide-react'

import CTAButton from '@/components/ui/CTAButton'
import { staggerParent, fadeUp, inViewOnce, EASE_OUT_PREMIUM } from '@/lib/motion'
import type { Treatment, TreatmentCategory } from '@/types/treatments'

/* ── CSS pattern: subtle diamond dot grid ───────────────── */
const diamondPattern = {
  backgroundImage: `
    radial-gradient(circle, rgba(47,93,80,0.028) 1px, transparent 1px),
    radial-gradient(circle, rgba(47,93,80,0.028) 1px, transparent 1px)
  `,
  backgroundSize: '32px 32px',
  backgroundPosition: '0 0, 16px 16px',
}

/* ── CSS pattern: hero diamond in gold ──────────────────── */
const heroDiamondPattern = {
  backgroundImage: `
    radial-gradient(circle, rgba(212,163,115,0.04) 1px, transparent 1px),
    radial-gradient(circle, rgba(212,163,115,0.04) 1px, transparent 1px)
  `,
  backgroundSize: '28px 28px',
  backgroundPosition: '0 0, 14px 14px',
}

interface TreatmentsMenuProps {
  categories: TreatmentCategory[]
  treatments: Treatment[]
}

/**
 * V5 — "The Gilt Manuscript"
 * Deep green hero with gold geometric border frame (no photograph).
 * Category chapters with enriched menu rows + dot leaders.
 * Subtle diamond pattern overlay on cream background.
 */
export default function TreatmentsMenu({ categories, treatments }: TreatmentsMenuProps) {
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())
  const catalogueRef = useRef<HTMLElement>(null)

  const grouped = useMemo(() => {
    const map = new Map<string, { category: TreatmentCategory; treatments: Treatment[] }>()
    for (const cat of categories) {
      map.set(cat._id, { category: cat, treatments: [] })
    }
    for (const t of treatments) {
      const group = map.get(t.categoryId)
      if (group) group.treatments.push(t)
    }
    return Array.from(map.values())
      .filter(g => g.treatments.length > 0)
      .sort((a, b) => (a.category.order ?? 99) - (b.category.order ?? 99))
  }, [categories, treatments])

  const scrollToCategory = useCallback((id: string) => {
    const el = sectionRefs.current.get(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }, [])

  const scrollToCatalogue = useCallback(() => {
    if (catalogueRef.current) {
      const y = catalogueRef.current.getBoundingClientRect().top + window.scrollY - 20
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }, [])

  const therapyCount = treatments.length || 62

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          HERO — "The Manuscript Cover"
          Deep green with gold geometric border frame.
          No photograph. Pure typographic luxury.
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-primary"
        style={{ minHeight: '90vh' }}
      >
        {/* Diamond pattern texture */}
        <div
          className="pointer-events-none absolute inset-0"
          style={heroDiamondPattern}
          aria-hidden
        />

        {/* Warm atmospheric radials */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(212,163,115,0.06) 0%, transparent 40%), radial-gradient(ellipse at 20% 80%, rgba(26,46,38,0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(26,46,38,0.2) 0%, transparent 50%)',
          }}
          aria-hidden
        />

        {/* Grain */}
        <div className="grain-overlay-dark pointer-events-none absolute inset-0" aria-hidden />

        {/* ── Gold double-line border frame ────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: EASE_OUT_PREMIUM }}
          className="absolute inset-4 sm:inset-8 md:inset-10 lg:inset-12"
          aria-hidden
        >
          {/* Outer frame */}
          <div className="absolute inset-0 rounded-sm border border-accent/20" />
          {/* Inner frame */}
          <div className="absolute inset-2.5 rounded-sm border border-accent/12 sm:inset-3" />

          {/* Corner accents — small gold squares at corners */}
          <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-accent/30" />
          <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-accent/30" />
          <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-accent/30" />
          <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-accent/30" />
        </motion.div>

        {/* ── Content ─────────────────────────────────── */}
        <div
          className="relative z-10 flex flex-col items-center justify-center px-8 text-center sm:px-16 md:px-20"
          style={{ minHeight: '90vh' }}
        >
          {/* Eyebrow */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE_OUT_PREMIUM }}
            className="font-heading text-[9px] font-medium uppercase tracking-[0.45em] text-accent/45 sm:text-[10px]"
          >
            Kerala Ayurvedic Lifestyle · Brickfields
          </motion.span>

          {/* Gold accent rule */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.0, delay: 0.6, ease: EASE_OUT_PREMIUM }}
            className="mt-5 h-px w-16 origin-center bg-accent/30"
          />

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.7, ease: EASE_OUT_PREMIUM }}
            className="mt-7 font-heading font-extrabold leading-[0.92] text-white"
            style={{
              fontSize: 'clamp(2.8rem, 8vw, 6rem)',
              letterSpacing: '-0.045em',
            }}
            id="treatments-heading"
          >
            The Treatment
            <br />
            <span className="font-body italic font-normal text-accent/80">Library</span>
          </motion.h1>

          {/* Stats line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-5 font-heading text-[10px] font-medium uppercase tracking-[0.25em] text-white/25"
          >
            {therapyCount}+ therapies
            <span className="mx-2.5 inline-block h-0.5 w-0.5 rounded-full bg-accent/40 align-middle" />
            Free consultation
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: EASE_OUT_PREMIUM }}
            className="mt-6 max-w-[420px] font-body text-[16px] italic leading-[1.6] text-white/35"
          >
            Protocols refined across generations of Kerala Vaidyas.
            Each one calibrated to your body.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.3, ease: EASE_OUT_PREMIUM }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <button
              type="button"
              onClick={scrollToCatalogue}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-7 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-dark transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.97]"
              style={{ boxShadow: '0 10px 30px -10px rgba(212,163,115,0.6)' }}
            >
              Browse Treatments
              <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.2} />
            </button>
            <CTAButton
              href="/book"
              variant="outlineLight"
              icon={<Calendar className="h-4 w-4" />}
            >
              Book Consultation
            </CTAButton>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.8 }}
            className="mt-14"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="h-8 w-px bg-gradient-to-b from-accent/25 to-transparent"
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CATALOGUE — Category chapters with enriched menu rows
      ══════════════════════════════════════════════════════ */}
      <section
        ref={catalogueRef}
        aria-labelledby="treatments-heading"
        className="relative overflow-hidden bg-cream"
      >
        {/* Diamond pattern texture — stronger */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            ...diamondPattern,
            opacity: 0.8,
          }}
          aria-hidden
        />
        {/* Layered warm atmosphere — multiple radials for depth */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 5% 0%, rgba(212,163,115,0.14) 0%, transparent 35%), radial-gradient(ellipse at 95% 15%, rgba(212,163,115,0.08) 0%, transparent 30%), radial-gradient(ellipse at 50% 50%, rgba(47,93,80,0.03) 0%, transparent 40%), radial-gradient(ellipse at 10% 90%, rgba(212,163,115,0.1) 0%, transparent 35%), radial-gradient(ellipse at 85% 80%, rgba(47,93,80,0.04) 0%, transparent 30%)',
          }}
          aria-hidden
        />
        {/* Subtle vertical gradient — warmer at top, cooler at bottom */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(212,163,115,0.04) 0%, transparent 30%, rgba(47,93,80,0.02) 100%)',
          }}
          aria-hidden
        />

        {/* ── Sticky category navigation with arrow buttons ── */}
        <CategoryNav grouped={grouped} onSelect={scrollToCategory} />

        {/* ── Category chapters with 2-col card grid ──── */}
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-6 sm:px-8 md:pb-28 lg:px-12">
          {grouped.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-accent/20 bg-white/50 px-8 text-center">
              <div>
                <p className="font-heading text-[15px] font-semibold text-primary/50">No treatments listed yet</p>
                <p className="mt-1 font-body text-[14px] italic text-dark/35">Treatments are being added from our clinic catalogue.</p>
              </div>
            </div>
          ) : (
            grouped.map((group, groupIdx) => (
              <motion.div
                key={group.category._id}
                ref={(el) => { if (el) sectionRefs.current.set(group.category._id, el) }}
                variants={staggerParent(0.04, 0.02)}
                initial="initial"
                whileInView="animate"
                viewport={inViewOnce}
                className={`scroll-mt-20 ${groupIdx % 2 === 1 ? 'rounded-2xl bg-white/40 px-5 py-4 sm:px-7 sm:py-5' : ''}`}
              >
                {/* Category header */}
                <motion.div
                  variants={fadeUp(0)}
                  className={`flex items-end justify-between gap-4 pb-6 ${groupIdx > 0 && groupIdx % 2 !== 1 ? 'pt-14 md:pt-18' : 'pt-6'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-[28px] font-black leading-none tracking-tight text-accent/15 sm:text-[36px]">
                      {String(groupIdx + 1).padStart(2, '0')}
                    </span>
                    <h2 className="font-heading text-[1.3rem] font-extrabold leading-tight tracking-[-0.02em] text-primary sm:text-[1.6rem]">
                      {group.category.title}
                    </h2>
                  </div>
                  <span className="hidden font-heading text-[10px] font-medium uppercase tracking-[0.15em] text-dark/20 sm:block">
                    {group.treatments.length} {group.treatments.length === 1 ? 'therapy' : 'therapies'}
                  </span>
                </motion.div>

                {/* Gold category divider */}
                <motion.div
                  variants={fadeUp(0)}
                  className="mb-6 h-px"
                  style={{ background: 'linear-gradient(to right, rgba(212,163,115,0.45), rgba(212,163,115,0.1) 60%, transparent)' }}
                  aria-hidden
                />

                {/* ── 2-COLUMN CARD GRID ──────────────── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  {group.treatments.map((t) => {
                    const whatsappHref = `https://wa.me/601165043436?text=${encodeURIComponent(`Hi, I'd like to inquire about the "${t.title}" treatment.`)}`
                    const bookHref = `/book?treatment=${encodeURIComponent(t._id)}`

                    return (
                      <motion.article
                        key={t._id}
                        variants={fadeUp(0)}
                        className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-primary/8 transition-[transform,box-shadow,ring-color] duration-500 ease-out hover:-translate-y-1.5 hover:ring-accent/20"
                        style={{
                          boxShadow: '0 2px 4px rgba(47,93,80,0.03), 0 14px 36px -14px rgba(47,93,80,0.14)',
                        }}
                      >
                        {/* Gold top accent */}
                        <div
                          className="h-[2px] w-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                          style={{ background: 'linear-gradient(to right, rgba(212,163,115,0.3), rgba(212,163,115,0.8) 50%, rgba(212,163,115,0.3))' }}
                          aria-hidden
                        />

                        {/* Inner warmth */}
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{ background: 'radial-gradient(ellipse at 90% 0%, rgba(212,163,115,0.06) 0%, transparent 50%)' }}
                          aria-hidden
                        />

                        <div className="relative flex flex-1 flex-col gap-3 p-6 sm:p-7">
                          {/* Title + consultation badge */}
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-heading text-[17px] font-extrabold leading-[1.15] tracking-[-0.01em] text-primary transition-colors duration-300 group-hover:text-accent sm:text-[19px]">
                              {t.title}
                            </h3>
                            {t.requiresConsultation && (
                              <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent/50" strokeWidth={2} />
                            )}
                          </div>

                          {/* Duration */}
                          {t.duration && (
                            <div className="flex items-center gap-1.5 text-dark/35">
                              <Clock className="h-3 w-3 text-accent/55" strokeWidth={2} />
                              <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.12em]">
                                {t.duration}
                              </span>
                            </div>
                          )}

                          {/* Gold hairline */}
                          <div
                            className="h-px w-12 transition-all duration-500 group-hover:w-24"
                            style={{ background: 'linear-gradient(to right, rgba(212,163,115,0.55), transparent)' }}
                            aria-hidden
                          />

                          {/* Description */}
                          {t.description && (
                            <p className="font-body text-[13px] leading-[1.65] text-dark/50">
                              {t.description}
                            </p>
                          )}

                          {/* Spacer */}
                          <div className="flex-1" />

                          {/* CTA row */}
                          <div className="mt-2 flex items-center gap-2.5 border-t border-primary/6 pt-4">
                            <Link
                              href={bookHref}
                              className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2 font-heading text-[10px] font-bold uppercase tracking-[0.14em] text-dark transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97]"
                              style={{ boxShadow: '0 6px 18px -8px rgba(212,163,115,0.6)' }}
                              aria-label={`Inquire about ${t.title}`}
                            >
                              Inquire / Book
                              <ArrowUpRight className="h-3 w-3" strokeWidth={2.2} />
                            </Link>
                            <Link
                              href={whatsappHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full border border-primary/12 bg-white text-primary/35 transition-[transform,border-color,color] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.97]"
                              aria-label={`WhatsApp about ${t.title}`}
                            >
                              <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
                            </Link>
                          </div>
                        </div>
                      </motion.article>
                    )
                  })}
                </div>
              </motion.div>
            ))
          )}

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ZONE 3 — FULL-WIDTH CTA SECTION
          Same visual weight as the hero. Dark green + gold frame.
          Page rhythm: dark hero → cream menu → dark CTA
      ══════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="free-consult-heading"
        className="relative overflow-hidden bg-primary"
      >
        {/* Rich layered atmosphere */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 5% 0%, rgba(212,163,115,0.25) 0%, transparent 45%), radial-gradient(ellipse at 95% 100%, rgba(26,46,38,0.4) 0%, transparent 50%), radial-gradient(ellipse at 50% 40%, rgba(212,163,115,0.06) 0%, transparent 35%)',
          }}
          aria-hidden
        />
        {/* Diamond pattern — matches hero */}
        <div className="pointer-events-none absolute inset-0" style={heroDiamondPattern} aria-hidden />
        {/* Grain */}
        <div className="grain-overlay-dark pointer-events-none absolute inset-0" aria-hidden />

        {/* Gold border frame — manuscript bookend matching hero */}
        <div className="pointer-events-none absolute inset-3 border border-accent/12 sm:inset-6 md:inset-8" aria-hidden />
        <div className="pointer-events-none absolute inset-5 border border-accent/6 sm:inset-8 md:inset-10" aria-hidden />

        {/* Corner accents */}
        <div className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-accent/20 sm:left-6 sm:top-6 md:left-8 md:top-8" aria-hidden />
        <div className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-accent/20 sm:right-6 sm:top-6 md:right-8 md:top-8" aria-hidden />
        <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-accent/20 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8" aria-hidden />
        <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-accent/20 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8" aria-hidden />

        <motion.div
          variants={staggerParent(0.1, 0.05)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-8 py-20 sm:px-14 md:py-28 lg:grid-cols-[3fr_2fr] lg:gap-16 lg:px-16 lg:py-32"
        >
          {/* ── LEFT: Content ─────────────────────── */}
          <div className="flex flex-col gap-5">
            <motion.div variants={fadeUp(0)} className="flex items-center gap-3">
              <span className="h-[2px] w-14 rounded-full bg-accent" aria-hidden />
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
                Free Consultation
              </span>
            </motion.div>

            <motion.h2
              id="free-consult-heading"
              variants={fadeUp(0)}
              className="max-w-xl font-heading font-extrabold leading-[0.98] text-white"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', letterSpacing: '-0.035em' }}
            >
              A free consultation
              <br />
              with a{' '}
              <span className="font-body italic text-accent">Kerala Vaidya.</span>
            </motion.h2>

            <motion.p variants={fadeUp(0)} className="max-w-md font-body text-[16px] leading-[1.75] text-white/50">
              We provide free consultations with our KKM-registered Ayurveda practitioner from Kerala,
              who holds a B.A.M.S degree and specialises in personalised treatment protocols.
            </motion.p>

            {/* Trust credentials */}
            <motion.div variants={fadeUp(0)} className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {['KKM-Registered', 'B.A.M.S Kerala', 'Vaidya AKHIL HS'].map((cred, i, arr) => (
                <React.Fragment key={cred}>
                  <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                    {cred}
                  </span>
                  {i < arr.length - 1 && (
                    <span className="h-3 w-px bg-accent/25" aria-hidden />
                  )}
                </React.Fragment>
              ))}
            </motion.div>

            {/* Gold divider */}
            <motion.div
              variants={fadeUp(0)}
              className="h-px w-20"
              style={{ background: 'linear-gradient(to right, rgba(212,163,115,0.45), transparent)' }}
              aria-hidden
            />

            {/* CTAs */}
            <motion.div variants={fadeUp(0)} className="mt-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <CTAButton href="/book" variant="primary" size="lg" icon={<Calendar className="h-4 w-4" />}>
                Book Free Consultation
              </CTAButton>
              <CTAButton
                href="https://wa.me/601165043436?text=Hi%2C%20I%27d%20like%20to%20book%20a%20free%20Ayurveda%20consultation."
                variant="outlineLight"
                size="lg"
                icon={<MessageCircle className="h-4 w-4" />}
              >
                WhatsApp Us
              </CTAButton>
            </motion.div>
          </div>

          {/* ── RIGHT: Conditions panel ─────────── */}
          <motion.aside variants={fadeUp(0.1)} className="relative w-full">
            <div className="rounded-xl bg-white/[0.06] p-7 ring-1 ring-white/12 sm:p-8">
              <div className="mb-4 h-px w-10" style={{ background: 'linear-gradient(to right, rgba(212,163,115,0.5), transparent)' }} aria-hidden />
              <span className="font-heading text-[11px] font-bold uppercase tracking-[0.25em] text-accent">We treat</span>

              <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3.5 font-body text-[14px] leading-[1.5] text-white/75">
                {['Chronic back pain', 'Joint stiffness', 'Sciatica', 'Skin conditions', 'Eczema & psoriasis', 'Gastric issues', 'Stress & anxiety', 'Sleep disorders', 'Migraine & headache', 'Hair fall'].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5">
                <span className="h-px w-6 bg-accent/40" aria-hidden />
                <span className="font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-white/45">
                  Consultation is always free
                </span>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      </section>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   CategoryNav — sticky bar with left/right arrow buttons
   for easy laptop scrolling. Arrows hidden on touch devices.
═══════════════════════════════════════════════════════════ */
function CategoryNav({
  grouped,
  onSelect,
}: {
  grouped: { category: TreatmentCategory; treatments: Treatment[] }[]
  onSelect: (id: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll, grouped])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' })
  }

  return (
    <div className="sticky top-0 z-30 bg-cream/95 backdrop-blur-lg">
      <div className="h-px bg-accent/10" aria-hidden />
      <div className="mx-auto max-w-7xl px-6 py-3 sm:px-8 lg:px-12">
        <div className="relative flex items-center gap-2">
          {/* Left arrow — desktop only */}
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll categories left"
            className={`hidden flex-shrink-0 items-center justify-center rounded-full border border-primary/12 bg-white p-2 text-primary/40 transition-[opacity,color,border-color,transform] duration-300 hover:border-accent/40 hover:text-accent active:scale-95 md:flex ${
              canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
          </button>

          {/* Scrollable tabs */}
          <div className="relative min-w-0 flex-1">
            {/* Fade edges */}
            <div
              className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-cream/95 to-transparent transition-opacity duration-200 ${
                canScrollLeft ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden
            />
            <div
              className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-cream/95 to-transparent transition-opacity duration-200 ${
                canScrollRight ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden
            />

            <div
              ref={scrollRef}
              className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth px-1 py-1"
            >
              {grouped.map((g, i) => (
                <button
                  key={g.category._id}
                  type="button"
                  onClick={() => onSelect(g.category._id)}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 py-2.5 font-heading text-[10px] font-bold uppercase tracking-[0.14em] text-primary/50 ring-1 ring-primary/10 transition-[color,background-color,transform,ring-color,box-shadow] duration-300 hover:text-primary hover:ring-accent/40 hover:shadow-[0_4px_14px_-6px_rgba(47,93,80,0.12)] active:scale-[0.97] sm:px-5 sm:text-[11px]"
                >
                  <span className="text-accent/50 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{g.category.title}</span>
                  <span className="ml-0.5 rounded-full bg-accent/10 px-1.5 py-0.5 text-[8px] font-extrabold tabular-nums text-accent/60">
                    {g.treatments.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right arrow — desktop only */}
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll categories right"
            className={`hidden flex-shrink-0 items-center justify-center rounded-full border border-primary/12 bg-white p-2 text-primary/40 transition-[opacity,color,border-color,transform] duration-300 hover:border-accent/40 hover:text-accent active:scale-95 md:flex ${
              canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>
      <div className="h-px bg-accent/15" aria-hidden />
    </div>
  )
}
