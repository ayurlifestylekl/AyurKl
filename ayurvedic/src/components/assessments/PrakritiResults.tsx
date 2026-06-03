import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  RotateCw,
  XCircle,
} from 'lucide-react'
import { prakritiQuiz } from '@/data/quizzes/prakriti'
import { therapies } from '@/data/therapies'
import { scorePercentages } from '@/lib/quizzes/scorer'
import type { Dosha, QuizResultRow } from '@/types/quiz'
import type { Product } from '@/types/content'

interface PrakritiResultsProps {
  result: QuizResultRow
  completedAt: string
  /** Recommended products, resolved upstream from Supabase + fallback. */
  recommendedProducts: Product[]
}

const dateFormat = new Intl.DateTimeFormat('en-MY', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const DOSHA_COLOR: Record<Dosha, { bar: string; tint: string; ink: string }> = {
  vata: { bar: '#2E7D5A', tint: '#2E7D5A', ink: '#1E5B4B' },
  pitta: { bar: '#D4AF37', tint: '#D4AF37', ink: '#163F33' },
  kapha: { bar: '#1E5B4B', tint: '#1E5B4B', ink: '#163F33' },
}

const DOSHA_LABEL: Record<Dosha, string> = {
  vata: 'Vāta',
  pitta: 'Pitta',
  kapha: 'Kapha',
}

export default function PrakritiResults({
  result,
  completedAt,
  recommendedProducts,
}: PrakritiResultsProps) {
  const archetype = prakritiQuiz.archetypes[result.archetypeKey]
  const pct = scorePercentages(result.scores, result.totalPoints)

  const recommendedTherapies = (archetype.recommendations.therapySlugs ?? [])
    .map((slug) => therapies.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 sm:gap-10">
      {/* Back link */}
      <Link
        href="/account/assessments"
        className="group inline-flex w-fit items-center gap-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-[#163F33]/55 transition-colors hover:text-[#D4AF37]"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        All assessments
      </Link>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-3xl border border-[#163F33]/8 bg-white"
        style={{
          boxShadow:
            '0 1px 0 0 rgba(22, 63, 51,0.04), 0 18px 36px -20px rgba(22, 63, 51,0.22)',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Image side */}
          <div className="relative h-56 lg:col-span-2 lg:h-auto lg:min-h-[420px]">
            <Image
              src={archetype.heroImage}
              alt={archetype.imageAlt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
              priority
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#163F33]/30 via-transparent to-transparent lg:bg-gradient-to-r"
            />
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-multiply"
              style={{
                background: `linear-gradient(to bottom right, transparent, ${DOSHA_COLOR[result.dominantDosha].tint}20)`,
              }}
            />
          </div>

          {/* Text side */}
          <div className="flex flex-col gap-5 p-6 sm:p-10 lg:col-span-3">
            <span className="inline-flex items-center gap-2 font-heading text-[11px] font-semibold uppercase tracking-[0.22em] text-[#163F33]/55">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#1E5B4B]" strokeWidth={2.2} />
              Your Prakriti
            </span>
            <div>
              <p
                className="italic text-[17px] text-[#D4AF37]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {archetype.sanskrit}
              </p>
              <h1
                className="mt-1 font-heading text-[36px] font-bold leading-tight text-[#163F33] sm:text-[44px]"
                style={{ letterSpacing: '-0.025em' }}
              >
                {archetype.title}
              </h1>
              <p
                className="mt-2 font-heading text-[14.5px] font-semibold uppercase tracking-[0.16em] text-[#163F33]/55"
              >
                {archetype.name} constitution
              </p>
            </div>

            <p
              className="font-body text-[15px] text-[#1F1F1F]/75"
              style={{ lineHeight: 1.7 }}
            >
              {archetype.essence}
            </p>

            <div className="text-[11.5px] text-[#1F1F1F]/45 font-body italic">
              Completed {dateFormat.format(new Date(completedAt))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DOSHA BREAKDOWN ───────────────────────────────────────── */}
      <section
        className="rounded-3xl border border-[#163F33]/8 bg-white px-6 py-7 sm:px-9"
        style={{
          boxShadow:
            '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
        }}
      >
        <h2 className="font-heading text-[12px] font-semibold uppercase tracking-[0.22em] text-[#163F33]/55">
          Your dosha balance
        </h2>
        <div className="mt-5 space-y-4">
          {(['vata', 'pitta', 'kapha'] as Dosha[]).map((d) => {
            const colors = DOSHA_COLOR[d]
            return (
              <div key={d}>
                <div className="flex items-baseline justify-between">
                  <span
                    className="font-heading text-[13px] font-bold text-[#163F33]"
                    style={{ letterSpacing: '-0.005em' }}
                  >
                    <span
                      className="italic"
                      style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                      {DOSHA_LABEL[d]}
                    </span>
                  </span>
                  <span className="font-mono text-[13px] font-semibold text-[#163F33]">
                    {pct[d]}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#163F33]/[0.06]">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${pct[d]}%`, backgroundColor: colors.bar }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── PROFILE NARRATIVE ─────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <article
          className="rounded-3xl border border-[#163F33]/8 bg-white px-6 py-7 sm:px-9 sm:py-9 lg:col-span-7"
          style={{
            boxShadow:
              '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
          }}
        >
          <h2 className="font-heading text-[12px] font-semibold uppercase tracking-[0.22em] text-[#163F33]/55">
            Your profile
          </h2>
          <p
            className="mt-4 font-body text-[15px] text-[#1F1F1F]/80"
            style={{ lineHeight: 1.75 }}
          >
            {archetype.profile}
          </p>
        </article>

        <aside
          className="rounded-3xl border border-[#163F33]/8 bg-[#F7F2E8]/55 px-6 py-7 sm:px-7 sm:py-8 lg:col-span-5"
          style={{
            boxShadow:
              '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
          }}
        >
          <h2 className="font-heading text-[12px] font-semibold uppercase tracking-[0.22em] text-[#163F33]/55">
            Daily anchors
          </h2>
          <ul className="mt-4 space-y-3">
            {archetype.dailyAnchors.map((anchor, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]" />
                <span
                  className="font-body text-[13.5px] text-[#1F1F1F]/80"
                  style={{ lineHeight: 1.6 }}
                >
                  {anchor}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* ── FOOD LISTS ────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <div
          className="rounded-3xl border border-[#1E5B4B]/15 bg-white px-6 py-6"
          style={{
            boxShadow:
              '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#1E5B4B]" strokeWidth={2.2} />
            <h3 className="font-heading text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1E5B4B]">
              Foods that nourish you
            </h3>
          </div>
          <ul className="mt-3 space-y-2">
            {archetype.foodsThatNourish.map((food, i) => (
              <li
                key={i}
                className="font-body text-[13.5px] text-[#1F1F1F]/80"
                style={{ lineHeight: 1.55 }}
              >
                {food}
              </li>
            ))}
          </ul>
        </div>
        <div
          className="rounded-3xl border border-[#163F33]/8 bg-white px-6 py-6"
          style={{
            boxShadow:
              '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
          }}
        >
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-[#1F1F1F]/55" strokeWidth={2} />
            <h3 className="font-heading text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1F1F1F]/55">
              Foods to limit
            </h3>
          </div>
          <ul className="mt-3 space-y-2">
            {archetype.foodsToLimit.map((food, i) => (
              <li
                key={i}
                className="font-body text-[13.5px] text-[#1F1F1F]/65"
                style={{ lineHeight: 1.55 }}
              >
                {food}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── RECOMMENDED PRODUCTS ─────────────────────────────────── */}
      {recommendedProducts.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="font-heading text-[12px] font-semibold uppercase tracking-[0.22em] text-[#163F33]/55">
              Suggested for your constitution
            </h2>
            <p className="mt-1 font-body text-[12.5px] text-[#1F1F1F]/55">
              Formulas Vaidya Akhil pairs with the {archetype.name} type.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#163F33]/8 bg-white transition-all hover:-translate-y-0.5 hover:border-[#D4AF37]/40"
                style={{
                  boxShadow:
                    '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
                }}
              >
                <div className="relative h-40 w-full overflow-hidden bg-[#163F33]/[0.05]">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col px-5 py-4">
                  <p className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#163F33]/45">
                    {p.category.replace(/-/g, ' ')}
                  </p>
                  <h3
                    className="mt-1 font-heading text-[15px] font-bold text-[#163F33]"
                    style={{ letterSpacing: '-0.005em' }}
                  >
                    {p.name}
                  </h3>
                  <p
                    className="mt-1 font-body text-[12.5px] text-[#1F1F1F]/60"
                    style={{ lineHeight: 1.55 }}
                  >
                    {p.tagline}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="font-heading text-[14px] font-bold text-[#163F33]">
                      RM {p.priceRm}
                    </span>
                    <span className="inline-flex items-center gap-1 font-heading text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#163F33]/45 transition-colors group-hover:text-[#D4AF37]">
                      View
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── RECOMMENDED THERAPIES ────────────────────────────────── */}
      {recommendedTherapies.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="font-heading text-[12px] font-semibold uppercase tracking-[0.22em] text-[#163F33]/55">
              Therapies that balance you
            </h2>
            <p className="mt-1 font-body text-[12.5px] text-[#1F1F1F]/55">
              Clinic-only treatments matched to your constitution.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recommendedTherapies.map((t) => (
              <div
                key={t.slug}
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#163F33]/8 bg-white"
                style={{
                  boxShadow:
                    '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
                }}
              >
                <div className="flex items-stretch gap-4 px-5 py-5 sm:gap-5 sm:px-6">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                    <Image
                      src={t.image}
                      alt={t.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3
                      className="font-heading text-[16px] font-bold text-[#163F33]"
                      style={{ letterSpacing: '-0.005em' }}
                    >
                      {t.name}
                    </h3>
                    <p className="font-body text-[12.5px] text-[#1F1F1F]/60">
                      {t.tagline}
                    </p>
                    <div className="mt-2 flex items-center gap-3 font-heading text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#163F33]/55">
                      <span>{t.durationMin} min</span>
                      <span className="text-[#D4AF37]">·</span>
                      <span>RM {t.priceRm}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── BOOK CTA ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-[#F7F2E8]/55 px-6 py-8 sm:px-10"
        style={{
          boxShadow:
            '0 1px 0 0 rgba(22, 63, 51,0.04), 0 18px 36px -22px rgba(22, 63, 51,0.22)',
        }}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] bg-[#D4AF37]"
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="max-w-lg">
            <h2
              className="font-heading text-[22px] font-bold text-[#163F33] sm:text-[26px]"
              style={{ letterSpacing: '-0.02em' }}
            >
              Build a personal plan with Vaidya Akhil.
            </h2>
            <p
              className="mt-1.5 font-body text-[13.5px] text-[#1F1F1F]/65"
              style={{ lineHeight: 1.6 }}
            >
              Your Prakriti is the starting line. A 45-minute consultation translates it
              into a routine, oils, and treatments built around your life.
            </p>
          </div>
          <Link
            href="/book/consultation"
            className="group inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#1E5B4B] px-6 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-[#163F33] active:scale-[0.98]"
          >
            <Calendar className="h-3.5 w-3.5" />
            Book a consultation
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* ── RETAKE ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center pt-2">
        <Link
          href="/account/assessments/prakriti"
          className="group inline-flex items-center gap-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-[#163F33]/55 transition-colors hover:text-[#D4AF37]"
        >
          <RotateCw className="h-3 w-3" />
          Retake the assessment
        </Link>
      </div>
    </div>
  )
}
