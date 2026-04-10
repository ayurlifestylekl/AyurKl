'use client'

import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import { BotanicalMandala, FloatingLeaf } from '@/components/ui/Decorations'
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion'
import type { Treatment, TreatmentCategory } from '@/types/treatments'

import CategoryTabs, { buildTabs } from './CategoryTabs'
import FreeConsultationBanner from './FreeConsultationBanner'
import TreatmentCard from './TreatmentCard'

interface TreatmentsMenuProps {
  categories: TreatmentCategory[]
  treatments: Treatment[]
}

/**
 * Top-level client component for /treatments.
 *
 * Renders an editorial section header, a sticky horizontal tab bar for the
 * 12 treatment categories, a responsive grid of TreatmentCards that filters
 * based on the active tab, and finally a Free Consultation banner.
 *
 * Animation: scroll-in fadeUp on first paint, then AnimatePresence + layout
 * transitions on tab switch. Transform + opacity only — no `transition-all`.
 */
export default function TreatmentsMenu({ categories, treatments }: TreatmentsMenuProps) {
  const [activeId, setActiveId] = useState<string>('all')

  // Pre-compute counts per category so the tab bar shows totals.
  const countByCategoryId = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of treatments) {
      counts[t.categoryId] = (counts[t.categoryId] ?? 0) + 1
    }
    return counts
  }, [treatments])

  const tabs = useMemo(
    () => buildTabs(categories, countByCategoryId, treatments.length),
    [categories, countByCategoryId, treatments.length],
  )

  // Filter treatments based on active tab. Memoised so the array reference
  // is stable when nothing changed — keeps AnimatePresence happy.
  const visibleTreatments = useMemo(() => {
    if (activeId === 'all') return treatments
    return treatments.filter((t) => t.categoryId === activeId)
  }, [activeId, treatments])

  // For the per-card "01 / 13" indexing we need the total in the visible
  // category, not the global total. When viewing All, fall back to the
  // treatment's own category size so the index still feels meaningful.
  const totalForIndex = (t: Treatment): number =>
    activeId === 'all' ? countByCategoryId[t.categoryId] ?? 0 : visibleTreatments.length

  // Per-card index within the *currently visible* slice when filtered;
  // when on "All", index within its own category instead.
  const indexInCategoryFor = (t: Treatment, visibleIdx: number): number => {
    if (activeId !== 'all') return visibleIdx + 1
    // On "All": find this treatment's position within its own category
    const sameCat = treatments.filter((x) => x.categoryId === t.categoryId)
    const localIdx = sameCat.findIndex((x) => x._id === t._id)
    return localIdx + 1
  }

  return (
    <section
      aria-labelledby="treatments-heading"
      className="relative overflow-hidden bg-[#FAF6EE]"
    >
      {/* Atmospheric backdrop layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 8% 12%, rgba(212,163,115,0.12) 0%, transparent 50%), radial-gradient(ellipse at 92% 88%, rgba(122,157,84,0.10) 0%, transparent 55%)',
        }}
      />

      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Decorative mandalas */}
      <div className="pointer-events-none absolute -left-32 top-32 hidden h-[460px] w-[460px] md:block">
        <BotanicalMandala opacity={0.13} />
      </div>
      <div className="pointer-events-none absolute -right-32 bottom-48 hidden h-[480px] w-[480px] md:block">
        <BotanicalMandala opacity={0.11} />
      </div>

      {/* Floating leaves */}
      <FloatingLeaf
        className="pointer-events-none absolute"
        style={{ left: '6%', top: '8%', width: 36, height: 48, transform: 'rotate(-22deg)' }}
        opacity={0.18}
      />
      <FloatingLeaf
        className="pointer-events-none absolute"
        style={{ right: '7%', top: '14%', width: 42, height: 56, transform: 'rotate(18deg)' }}
        opacity={0.15}
      />

      {/* ── Section header ───────────────── */}
      <div className="relative mx-auto max-w-7xl px-6 pt-20 sm:px-8 md:pt-28 lg:px-12">
        <motion.div
          variants={staggerParent(0.1, 0.05)}
          initial="initial"
          whileInView="animate"
          viewport={inViewOnce}
          className="flex flex-col items-start gap-6"
        >
          {/* Section marker */}
          <div className="flex w-full items-center justify-between">
            <motion.span
              variants={fadeUp(0)}
              className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent/80"
            >
              <span className="text-primary/40">006</span> &nbsp;/&nbsp; The Treatment Library
            </motion.span>
            <motion.span
              variants={fadeUp(0)}
              className="hidden font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40 md:inline"
            >
              {treatments.length} therapies · {categories.length} categories
            </motion.span>
          </div>

          <motion.div
            variants={fadeUp(0)}
            aria-hidden
            className="h-px w-full bg-gradient-to-r from-accent/60 via-primary/15 to-transparent"
          />

          {/* Eyebrow chip */}
          <motion.span
            variants={fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-white/60 px-4 py-1.5 backdrop-blur"
          >
            <Sparkles className="h-3 w-3 text-accent" strokeWidth={2.4} />
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
              Authentic Kerala Protocols
            </span>
          </motion.span>

          {/* Headline */}
          <motion.h1
            id="treatments-heading"
            variants={fadeUp(0)}
            className="font-heading text-balance text-[44px] font-extrabold leading-[0.98] tracking-[-0.025em] text-primary sm:text-[60px] md:text-[76px]"
          >
            Sixty-two therapies.
            <br />
            <span className="font-body italic font-normal text-accent">
              One thousand years
            </span>{' '}
            of practice.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp(0)}
            className="max-w-2xl font-body text-[16px] leading-[1.85] text-dark/70 md:text-[17px]"
          >
            Each protocol has been refined across generations of Kerala Vaidyas.
            Browse the library by category, or message us to design something
            personal to you. Pricing is shared on enquiry — every body is
            different, every treatment is calibrated.
          </motion.p>
        </motion.div>
      </div>

      {/* ── Tab bar (sticky) ───────────────── */}
      <div className="relative mx-auto mt-14 max-w-7xl px-6 sm:px-8 lg:px-12">
        <CategoryTabs tabs={tabs} activeId={activeId} onChange={setActiveId} />
      </div>

      {/* ── Grid panel ───────────────── */}
      <div
        id="treatments-panel"
        role="tabpanel"
        aria-labelledby={`tab-${activeId}`}
        className="relative mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8 lg:px-12"
      >
        {visibleTreatments.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-[22px] border border-dashed border-primary/20 bg-white/40 px-8 text-center">
            <p className="font-body text-[15px] italic text-dark/55">
              No treatments under this category yet — please check back shortly.
            </p>
          </div>
        ) : (
          <motion.div
            key={activeId}
            variants={staggerParent(0.06, 0.02)}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {visibleTreatments.map((t, idx) => (
                <TreatmentCard
                  key={t._id}
                  treatment={t}
                  indexInCategory={indexInCategoryFor(t, idx)}
                  totalInCategory={totalForIndex(t)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Free consultation banner ───────────────── */}
      <div className="relative mx-auto max-w-7xl px-6 pb-24 sm:px-8 md:pb-32 lg:px-12">
        <FreeConsultationBanner />
      </div>
    </section>
  )
}
