'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { trackPromoEvent } from '@/lib/packages/track-promo'

const SEEN_KEY = 'kal-promo-deepawali-2026-seen'

/** Lets WelcomeLeadPopup wait until the flyer is closed instead of stacking on top of it. */
export const PROMO_CLOSED_EVENT = 'kal-promo-closed'
export function isPromoFlyerOpen(): boolean {
  return typeof window !== 'undefined' && (window as unknown as { __kalPromoOpen?: boolean }).__kalPromoOpen === true
}
function setPromoOpen(open: boolean) {
  ;(window as unknown as { __kalPromoOpen?: boolean }).__kalPromoOpen = open
  if (!open) window.dispatchEvent(new Event(PROMO_CLOSED_EVENT))
}

/** Deepawali flyer shown as soon as the site opens — once per browser session. */
export default function PromoFlyerPopup() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (pathname?.startsWith('/packages')) return
    let seen = false
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1'
    } catch {
      /* storage blocked — show it */
    }
    if (seen) return
    setPromoOpen(true)
    setShow(true)
    trackPromoEvent({ event: 'view', placement: 'flyer' })
    // Runs once on first load only; navigating between pages doesn't re-open it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!show) return
    closeRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  function close() {
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* ignore */
    }
    setShow(false)
    setPromoOpen(false)
  }

  function openPackages() {
    trackPromoEvent({ event: 'open', placement: 'flyer' })
    close()
  }

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Deepawali Promo — session packages available till 30 November 2026"
      onClick={close}
    >
      <div className="relative flex max-h-full flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeRef}
          onClick={close}
          aria-label="Close"
          className="absolute -right-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-lg hover:bg-cream sm:-right-4 sm:-top-4"
        >
          <X className="h-5 w-5" />
        </button>

        <Link href="/packages" onClick={openPackages} className="block overflow-hidden rounded-xl shadow-2xl">
          <Image
            src="/promos/deepawali-2026-flyer.jpg"
            alt="Deepawali Promo: Abhyangam Package RM750, Complete Relaxing Package RM1000, Deepawali Special Udwarthanam Package RM1449, Sirodhaara Package RM1000 — 10 sessions each, available till 30 November 2026."
            width={919}
            height={1300}
            priority
            className="h-auto max-h-[calc(100dvh-7.5rem)] w-auto max-w-full"
          />
        </Link>

        <div className="mt-3 flex w-full max-w-sm gap-2">
          <Link
            href="/packages"
            onClick={openPackages}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-accent px-5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-white hover:bg-accent/90"
          >
            See Packages
          </Link>
          <button
            onClick={close}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/40 px-5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-white hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
