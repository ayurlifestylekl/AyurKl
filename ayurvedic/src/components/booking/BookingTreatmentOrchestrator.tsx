'use client'

import { useSearchParams } from 'next/navigation'
import { Sparkles } from 'lucide-react'

import type { Treatment, TreatmentCategory } from '@/types/treatments'

import ConsultationRequiredNotice from './ConsultationRequiredNotice'
import TreatmentBookingEmbed from './TreatmentBookingEmbed'
import TreatmentPicker from './TreatmentPicker'

interface BookingTreatmentOrchestratorProps {
  categories: TreatmentCategory[]
  treatments: Treatment[]
}

/**
 * Owns the `?id=` URL param → Treatment resolution. Keeps the picker and
 * the downstream surface (embed / consultation-required notice / empty
 * placeholder) in lockstep so the page stays bookmarkable.
 */
export default function BookingTreatmentOrchestrator({
  categories,
  treatments,
}: BookingTreatmentOrchestratorProps) {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const selected = id ? treatments.find((t) => t._id === id) ?? null : null

  return (
    <div className="flex flex-col gap-10">
      <TreatmentPicker
        categories={categories}
        treatments={treatments}
        selected={selected}
      />

      {!selected && <PickerPlaceholder hasCatalog={treatments.length > 0} />}

      {selected && selected.requiresConsultation && (
        <ConsultationRequiredNotice treatment={selected} />
      )}

      {selected && !selected.requiresConsultation && (
        <TreatmentBookingEmbed
          key={selected._id}
          treatment={selected}
        />
      )}
    </div>
  )
}

function PickerPlaceholder({ hasCatalog }: { hasCatalog: boolean }) {
  return (
    <div
      className="relative flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-dashed border-primary/15 bg-white/60 px-8 py-14 text-center backdrop-blur sm:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55,0.09) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(30, 91, 75,0.04) 0%, transparent 55%)',
        }}
      />
      <span className="relative inline-flex items-center gap-2 rounded-full border border-accent/30 bg-white px-3 py-1.5">
        <Sparkles className="h-3 w-3 text-accent" strokeWidth={2.2} />
        <span className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          {hasCatalog ? 'Start Above' : 'Catalogue Loading'}
        </span>
      </span>
      <h2 className="relative max-w-md font-heading text-[22px] font-extrabold leading-[1.15] tracking-[-0.02em] text-primary sm:text-[26px]">
        {hasCatalog
          ? 'Pick a treatment to open the calendar.'
          : 'Our catalogue is being prepared.'}
      </h2>
      <p className="relative max-w-md font-body text-[14px] leading-[1.7] text-dark/60 sm:text-[15px]">
        {hasCatalog
          ? "Search by name, condition, or category. We'll load the calendar for Vaidya Akhil the moment you choose."
          : 'While we finish wiring up the treatment index, message us on WhatsApp and our team will get you on the calendar.'}
      </p>
    </div>
  )
}
