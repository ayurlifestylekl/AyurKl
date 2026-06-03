'use client'

import { useEffect, useState } from 'react'
import Cal, { getCalApi } from '@calcom/embed-react'

import {
  calLink,
  calNamespace,
  calPublicUrl,
  calUiConfig,
} from '@/lib/cal'

/**
 * Cal.com embed for the free 30-minute consultation with Vaidya Akhil.
 * Configured once per mount via `getCalApi` — namespaced so it cannot
 * collide with the treatment embed if both ever render on the same page.
 *
 * Renders a small fallback link if the embed fails to mount (ad blocker,
 * network, etc.) after a short grace period.
 */
export default function ConsultationBooking() {
  const [embedReady, setEmbedReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const cal = await getCalApi({ namespace: calNamespace.consultation })
      if (cancelled) return
      cal('ui', calUiConfig)
      setEmbedReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10"
      style={{
        boxShadow:
          '0 2px 6px rgba(30, 91, 75,0.04), 0 30px 60px -28px rgba(30, 91, 75,0.22)',
      }}
    >
      {/* Gold accent bar */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-10 h-[2px]"
        style={{
          background:
            'linear-gradient(to right, rgba(212, 175, 55,0.4), rgba(212, 175, 55,0.9) 50%, rgba(212, 175, 55,0.4))',
        }}
      />

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
        namespace={calNamespace.consultation}
        calLink={calLink('consultation')}
        style={{
          width: '100%',
          height: '100%',
          minHeight: 620,
          overflow: 'scroll',
        }}
        config={{
          layout: 'month_view',
          theme: 'light',
        }}
      />

      {/* Fallback open-in-new-tab link */}
      <div className="border-t border-primary/5 bg-primary/[0.02] px-5 py-3 text-center">
        <a
          href={calPublicUrl('consultation')}
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
