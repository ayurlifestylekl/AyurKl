'use client'

import { useSearchParams } from 'next/navigation'
import { Sparkles, MessageCircle } from 'lucide-react'

import type { Treatment, TreatmentCategory } from '@/types/treatments'

import BookingRequestForm from './BookingRequestForm'
import ConsultationRequiredNotice from './ConsultationRequiredNotice'
import TreatmentPicker from './TreatmentPicker'

interface BookingTreatmentOrchestratorProps {
  categories: TreatmentCategory[]
  treatments: Treatment[]
  account?: { email: string | null; signedIn: boolean } | null
}

export default function BookingTreatmentOrchestrator({
  categories,
  treatments,
  account,
}: BookingTreatmentOrchestratorProps) {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const fromConsultation = searchParams.get('from') // set when a cleared consultation unlocks a treatment
  const selected = id ? treatments.find((t) => t._id === id) ?? null : null

  const formTreatment = selected
    ? {
        id: selected._id,
        title: selected.title,
        duration: selected.duration,
        price: selected.price,
        priceLabel: selected.priceLabel,
        bookingLeadTimeHours: selected.bookingLeadTimeHours,
      }
    : null

  const isEnquiry = selected?.bookingType === 'enquiry'
  // A consultation is required first UNLESS this booking follows a cleared one.
  const needsConsult =
    !!selected &&
    (selected.requiresConsultation || selected.bookingType === 'consultation') &&
    !fromConsultation

  return (
    <div className="flex flex-col gap-10">
      <TreatmentPicker categories={categories} treatments={treatments} selected={selected} />

      {!selected && <PickerPlaceholder hasCatalog={treatments.length > 0} />}

      {selected && isEnquiry && <EnquiryNotice title={selected.title} />}

      {selected && !isEnquiry && needsConsult && (
        <div className="flex flex-col gap-6">
          <ConsultationRequiredNotice treatment={selected} />
          <BookingRequestForm bookingKind="consultation" treatment={formTreatment} account={account} />
        </div>
      )}

      {selected && !isEnquiry && !needsConsult && (
        <BookingRequestForm
          key={selected._id}
          bookingKind="treatment"
          treatment={formTreatment}
          account={account}
          parentConsultationId={fromConsultation}
        />
      )}
    </div>
  )
}

function EnquiryNotice({ title }: { title: string }) {
  const href = `https://wa.me/601165043436?text=${encodeURIComponent(`Hi, I'd like to enquire about ${title}.`)}`
  return (
    <div className="rounded-2xl border border-accent/30 bg-white/70 px-8 py-10 text-center">
      <MessageCircle className="mx-auto h-6 w-6 text-accent" strokeWidth={2} aria-hidden />
      <h2 className="mt-3 font-heading text-[20px] font-extrabold text-primary">{title} is enquiry-only</h2>
      <p className="mx-auto mt-2 max-w-md font-body text-[14px] leading-relaxed text-dark/65">
        This therapy is arranged after a consultation with our Vaidya. Message us on WhatsApp and we&apos;ll guide you through it.
      </p>
      <a
        href={href}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-accent/90"
      >
        Enquire on WhatsApp
      </a>
    </div>
  )
}

function PickerPlaceholder({ hasCatalog }: { hasCatalog: boolean }) {
  return (
    <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-dashed border-primary/15 bg-white/60 px-8 py-14 text-center backdrop-blur sm:py-20">
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
        {hasCatalog ? 'Pick a treatment to start your booking.' : 'Our catalogue is being prepared.'}
      </h2>
      <p className="relative max-w-md font-body text-[14px] leading-[1.7] text-dark/60 sm:text-[15px]">
        {hasCatalog
          ? 'Search by name, condition, or category, then request your preferred time.'
          : 'While we finish wiring up the treatment index, message us on WhatsApp and our team will get you booked.'}
      </p>
    </div>
  )
}
