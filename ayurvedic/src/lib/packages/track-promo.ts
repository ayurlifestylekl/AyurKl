import type { PromoEventInput } from '@/lib/packages/promo-events'

/**
 * Counts a promo button from the browser. sendBeacon survives the page
 * navigating away straight after the click, and tracking must never get in the
 * way of the button itself, so every failure is ignored.
 */
export function trackPromoEvent(input: PromoEventInput): void {
  try {
    const body = JSON.stringify(input)
    const sent = navigator.sendBeacon?.('/api/promo/track', new Blob([body], { type: 'application/json' }))
    if (!sent) {
      void fetch('/api/promo/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    /* ignore */
  }
}
