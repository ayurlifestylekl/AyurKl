'use client'

import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MessageCircle, Calendar } from 'lucide-react'

import CTAButton from '@/components/ui/CTAButton'
import TreatmentsHero from '@/components/treatments/TreatmentsHero'
import TreatmentRow, { Interstitial } from '@/components/treatments/TreatmentRow'
import { mantraFor } from '@/lib/treatment-mantras'
import { staggerParent, fadeUp, inViewOnce } from '@/lib/motion'
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

/* ── CSS pattern: gold diamond (reused by free-consult banner) ─── */
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
          HERO — V6 "The Apothecary Atlas"
          Editorial asymmetric spread with specimen plate.
      ══════════════════════════════════════════════════════ */}
      <TreatmentsHero
        therapyCount={therapyCount}
        onBrowseTreatments={scrollToCatalogue}
      />

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
            <div className="flex min-h-[320px] flex-col items-center justify-center px-8 py-20 text-center">
              <span
                aria-hidden
                className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_5px_rgba(212,163,115,0.18)]"
              />
              <p className="mt-6 font-body text-[22px] italic leading-[1.3] text-primary">
                Index in preparation.
              </p>
              <p className="mt-3 font-heading text-[10.5px] font-semibold uppercase tracking-[0.24em] text-dark/40">
                Awaiting catalogue entries from the clinic
              </p>
            </div>
          ) : (
            grouped.map((group, groupIdx) => {
              const plateOffset = grouped
                .slice(0, groupIdx)
                .reduce((sum, g) => sum + g.treatments.length, 0)
              return (
                <motion.div
                  key={group.category._id}
                  ref={(el) => { if (el) sectionRefs.current.set(group.category._id, el) }}
                  variants={staggerParent(0.08, 0.05)}
                  initial="initial"
                  whileInView="animate"
                  viewport={inViewOnce}
                  className="scroll-mt-20"
                >
                  {/* Category header */}
                  <motion.div
                    variants={fadeUp(0)}
                    className={`flex items-end justify-between gap-4 pb-6 ${groupIdx === 0 ? 'pt-6' : 'pt-14 md:pt-20'}`}
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
                    className="mb-10 h-px md:mb-14"
                    style={{ background: 'linear-gradient(to right, rgba(212,163,115,0.45), rgba(212,163,115,0.1) 60%, transparent)' }}
                    aria-hidden
                  />

                  {/* ── BROADSHEET ROW FLOW ──────────────── */}
                  <div className="flex flex-col">
                    {group.treatments.map((t, tIdx) => {
                      const plateIndex = plateOffset + tIdx
                      const isLastInChapter = tIdx === group.treatments.length - 1
                      const showInterstitial =
                        plateIndex % 5 === 4 && !isLastInChapter
                      return (
                        <React.Fragment key={t._id}>
                          <TreatmentRow
                            treatment={t}
                            chapterNumber={groupIdx + 1}
                            specimenNumber={tIdx + 1}
                          />
                          {showInterstitial && (
                            <Interstitial mantra={mantraFor(Math.floor(plateIndex / 5))} />
                          )}
                        </React.Fragment>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })
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
