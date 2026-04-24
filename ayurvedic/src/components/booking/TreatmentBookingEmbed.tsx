'use client'

import { useEffect, useState } from 'react'
import Cal, { getCalApi } from '@calcom/embed-react'

import {
  calLink,
  calNamespace,
  calPublicUrl,
  calUiConfig,
} from '@/lib/cal'
import type { Treatment } from '@/types/treatments'

interface TreatmentBookingEmbedProps {
  treatment: Treatment
}

/**
 * Cal.com embed for a specific treatment booking. The treatment title is
 * passed into:
 *   - the booking `notes` (visible on the confirmation + internal email)
 *   - the custom "Treatment" question (identifier `treatment` — must exist
 *     on the Cal.com event type or this silently falls through)
 *
 * The component is keyed on `treatment._id` at the call site, so switching
 * treatments remounts the iframe with fresh prefill.
 */
export default function TreatmentBookingEmbed({
  treatment,
}: TreatmentBookingEmbedProps) {
  const [embedReady, setEmbedReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const cal = await getCalApi({ namespace: calNamespace.treatment })
      if (cancelled) return
      cal('ui', calUiConfig)
      setEmbedReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const notes = [
    treatment.title,
    treatment.duration ?? null,
    treatment.categoryTitle
      ? `category: ${treatment.categoryTitle}`
      : null,
  ]
    .filter(Boolean)
    .join(' — ')

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10"
      style={{
        boxShadow:
          '0 2px 6px rgba(47,93,80,0.04), 0 30px 60px -28px rgba(47,93,80,0.22)',
      }}
    >
      {/* Gold accent bar */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-10 h-[2px]"
        style={{
          background:
            'linear-gradient(to right, rgba(212,163,115,0.4), rgba(212,163,115,0.9) 50%, rgba(212,163,115,0.4))',
        }}
      />

      {/* Treatment marker — so the booker sees what they're about to book */}
      <div className="relative z-10 flex flex-col gap-2 border-b border-primary/5 bg-primary/[0.02] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-accent">
            Booking
          </span>
          <span className="font-heading text-[15px] font-extrabold leading-tight tracking-[-0.01em] text-primary sm:text-[16px]">
            {treatment.title}
          </span>
        </div>
        {treatment.duration && (
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/55">
            {treatment.duration}
          </span>
        )}
      </div>

      {!embedReady && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
        >
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/40">
            Loading calendar…
          </span>
        </div>
      )}

      <Cal
        namespace={calNamespace.treatment}
        calLink={calLink('treatment')}
        style={{
          width: '100%',
          height: '100%',
          minHeight: 620,
          overflow: 'scroll',
        }}
        config={{
          layout: 'month_view',
          theme: 'light',
          notes,
          // Custom question identifier on the Cal.com event type.
          // If the identifier differs on the dashboard this key is ignored.
          treatment: treatment.title,
        }}
      />

      <div className="border-t border-primary/5 bg-primary/[0.02] px-5 py-3 text-center">
        <a
          href={calPublicUrl('treatment')}
          target="_blank"
          rel="noopener noreferrer"
          className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/55 transition-colors hover:text-accent focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Having trouble? Open the calendar in a new tab →
        </a>
      </div>
    </div>
  )
}
