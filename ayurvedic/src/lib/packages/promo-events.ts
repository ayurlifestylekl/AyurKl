/**
 * Which promo buttons are counted. Shared by the browser helper, the tracking
 * route and the /console/packages stats, so all three agree on the same list.
 */
export const DEEPAWALI_PROMO = 'deepawali-2026'

/** Same moment the packages come off sale (see available_until). */
export const DEEPAWALI_PROMO_ENDS_AT = '2026-11-30T23:59:59+08:00'

export const DEEPAWALI_PACKAGE_SLUGS = [
  'abhyangam-package',
  'complete-relaxing-package',
  'deepawali-special-udwarthanam',
  'sirodhaara-package',
] as const

export type PromoEvent = 'view' | 'open' | 'buy' | 'whatsapp'
export type PromoPlacement = 'flyer' | 'homepage' | 'therapy' | 'packages' | 'banner'

const ALLOWED_EVENTS: Record<PromoPlacement, PromoEvent[]> = {
  flyer: ['view', 'open'],
  homepage: ['open', 'buy', 'whatsapp'],
  therapy: ['buy', 'whatsapp'],
  packages: ['view', 'buy', 'whatsapp'],
  banner: ['open'],
}

export const PROMO_PLACEMENT_LABELS: Record<PromoPlacement, string> = {
  flyer: 'Flyer pop-up',
  homepage: 'Homepage section',
  therapy: 'Therapy pages',
  packages: 'Packages page',
  banner: 'Top banner',
}

export interface PromoEventInput {
  event: PromoEvent
  placement: PromoPlacement
  packageSlug?: string | null
}

/** Validates a beacon body. Anything that isn't a real promo button is dropped. */
export function parsePromoEvent(raw: unknown): PromoEventInput | null {
  if (typeof raw !== 'object' || raw === null) return null
  const { event, placement, packageSlug } = raw as Record<string, unknown>

  if (typeof placement !== 'string' || !Object.hasOwn(ALLOWED_EVENTS, placement)) return null
  const allowed = ALLOWED_EVENTS[placement as PromoPlacement]
  if (!allowed.includes(event as PromoEvent)) return null

  // Buy and WhatsApp buttons always belong to a package; nothing else does.
  const needsPackage = event === 'buy' || event === 'whatsapp'
  if (needsPackage) {
    if (!(DEEPAWALI_PACKAGE_SLUGS as readonly unknown[]).includes(packageSlug)) return null
  } else if (packageSlug != null) {
    return null
  }

  return {
    event: event as PromoEvent,
    placement: placement as PromoPlacement,
    packageSlug: needsPackage ? (packageSlug as string) : null,
  }
}

export function isPromoTrackingOpen(now: Date = new Date()): boolean {
  return now.getTime() <= new Date(DEEPAWALI_PROMO_ENDS_AT).getTime()
}
