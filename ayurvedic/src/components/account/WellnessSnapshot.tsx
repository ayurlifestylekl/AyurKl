import Link from 'next/link'
import { Compass, Calendar, Package, ArrowUpRight } from 'lucide-react'
import { prakritiQuiz } from '@/data/quizzes/prakriti'
import type { ArchetypeKey } from '@/types/quiz'

interface WellnessSnapshotProps {
  archetypeKey: ArchetypeKey | null
  upcomingCount: number
  totalAppointments: number
  totalOrders: number
  totalSpentRm: number
}

export default function WellnessSnapshot({
  archetypeKey,
  upcomingCount,
  totalAppointments,
  totalOrders,
  totalSpentRm,
}: WellnessSnapshotProps) {
  const archetype = archetypeKey ? prakritiQuiz.archetypes[archetypeKey] : null

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Dosha */}
      <Link
        href={archetype ? '/account/assessments/prakriti/results' : '/account/assessments/prakriti'}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#163F33]/8 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#D4AF37]/35"
        style={{
          boxShadow:
            '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
        }}
      >
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/15">
            <Compass className="h-4 w-4 text-[#D4AF37]" strokeWidth={1.8} />
          </span>
          <ArrowUpRight
            className="h-3.5 w-3.5 text-[#163F33]/35 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#D4AF37]"
            strokeWidth={2}
          />
        </div>
        <p className="mt-4 font-heading text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#163F33]/55">
          Your dosha
        </p>
        {archetype ? (
          <>
            <p
              className="mt-1 italic text-[13px] text-[#D4AF37]"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {archetype.sanskrit}
            </p>
            <p
              className="font-heading text-[20px] font-bold text-[#163F33]"
              style={{ letterSpacing: '-0.015em' }}
            >
              {archetype.name}
            </p>
            <p className="mt-1 font-body text-[12px] italic text-[#1F1F1F]/55">
              {archetype.title}
            </p>
          </>
        ) : (
          <>
            <p
              className="mt-1 font-heading text-[20px] font-bold text-[#163F33]"
              style={{ letterSpacing: '-0.015em' }}
            >
              Take the quiz
            </p>
            <p className="mt-1 font-body text-[12px] italic text-[#1F1F1F]/55">
              24 questions · ~ 5 minutes
            </p>
          </>
        )}
      </Link>

      {/* Visits */}
      <Link
        href="/account/appointments"
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#163F33]/8 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#D4AF37]/35"
        style={{
          boxShadow:
            '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
        }}
      >
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E5B4B]/10">
            <Calendar className="h-4 w-4 text-[#1E5B4B]" strokeWidth={1.8} />
          </span>
          <ArrowUpRight
            className="h-3.5 w-3.5 text-[#163F33]/35 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#D4AF37]"
            strokeWidth={2}
          />
        </div>
        <p className="mt-4 font-heading text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#163F33]/55">
          Visits
        </p>
        <p
          className="mt-1 font-heading text-[28px] font-bold leading-none text-[#163F33]"
          style={{ letterSpacing: '-0.025em' }}
        >
          {totalAppointments}
        </p>
        <p className="mt-1.5 font-body text-[12px] text-[#1F1F1F]/55">
          {upcomingCount === 0
            ? 'No upcoming visits'
            : `${upcomingCount} upcoming`}
        </p>
      </Link>

      {/* Orders */}
      <Link
        href="/account/orders"
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#163F33]/8 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#D4AF37]/35"
        style={{
          boxShadow:
            '0 1px 0 0 rgba(22, 63, 51,0.04), 0 12px 30px -16px rgba(22, 63, 51,0.18)',
        }}
      >
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2E7D5A]/15">
            <Package className="h-4 w-4 text-[#2E7D5A]" strokeWidth={1.8} />
          </span>
          <ArrowUpRight
            className="h-3.5 w-3.5 text-[#163F33]/35 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#D4AF37]"
            strokeWidth={2}
          />
        </div>
        <p className="mt-4 font-heading text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#163F33]/55">
          Orders
        </p>
        <p
          className="mt-1 font-heading text-[28px] font-bold leading-none text-[#163F33]"
          style={{ letterSpacing: '-0.025em' }}
        >
          {totalOrders}
        </p>
        <p className="mt-1.5 font-body text-[12px] text-[#1F1F1F]/55">
          RM {totalSpentRm.toFixed(2)} lifetime
        </p>
      </Link>
    </section>
  )
}
