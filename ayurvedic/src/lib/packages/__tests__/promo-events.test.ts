import { describe, it, expect } from 'vitest'
import { isPromoTrackingOpen, parsePromoEvent } from '@/lib/packages/promo-events'
import { summarizePromoStats, type PromoEventRow } from '@/lib/packages/promo-stats'

describe('parsePromoEvent', () => {
  it('accepts real promo buttons', () => {
    expect(parsePromoEvent({ event: 'buy', placement: 'homepage', packageSlug: 'abhyangam-package' })).toEqual({
      event: 'buy',
      placement: 'homepage',
      packageSlug: 'abhyangam-package',
    })
    expect(parsePromoEvent({ event: 'view', placement: 'flyer' })).toEqual({
      event: 'view',
      placement: 'flyer',
      packageSlug: null,
    })
  })

  it('drops anything else', () => {
    expect(parsePromoEvent(null)).toBeNull()
    expect(parsePromoEvent('buy')).toBeNull()
    expect(parsePromoEvent({ event: 'buy', placement: 'nowhere', packageSlug: 'abhyangam-package' })).toBeNull()
    expect(parsePromoEvent({ event: 'view', placement: 'constructor' })).toBeNull()
    expect(parsePromoEvent({ event: 'whatsapp', placement: 'flyer', packageSlug: 'abhyangam-package' })).toBeNull()
    expect(parsePromoEvent({ event: 'buy', placement: 'homepage' })).toBeNull()
    expect(parsePromoEvent({ event: 'buy', placement: 'homepage', packageSlug: 'free-stuff' })).toBeNull()
    expect(parsePromoEvent({ event: 'open', placement: 'flyer', packageSlug: 'abhyangam-package' })).toBeNull()
  })
})

describe('isPromoTrackingOpen', () => {
  it('stops at the end of 30 November, Malaysia time', () => {
    expect(isPromoTrackingOpen(new Date('2026-11-30T15:59:00Z'))).toBe(true)
    expect(isPromoTrackingOpen(new Date('2026-11-30T16:00:00Z'))).toBe(false)
  })
})

describe('summarizePromoStats', () => {
  const rows: PromoEventRow[] = [
    { day: '2026-11-01', event: 'view', placement: 'flyer', package_slug: null, total: 100 },
    { day: '2026-11-01', event: 'view', placement: 'packages', package_slug: null, total: 40 },
    { day: '2026-11-01', event: 'open', placement: 'flyer', package_slug: null, total: 20 },
    { day: '2026-11-01', event: 'buy', placement: 'homepage', package_slug: 'abhyangam-package', total: 5 },
    { day: '2026-11-02', event: 'buy', placement: 'packages', package_slug: 'abhyangam-package', total: 3 },
    { day: '2026-11-02', event: 'whatsapp', placement: 'therapy', package_slug: 'sirodhaara-package', total: 2 },
  ]
  const catalog = [
    { slug: 'abhyangam-package', name: 'Abhyangam Package' },
    { slug: 'sirodhaara-package', name: 'Sirodhaara Package' },
  ]
  const sales = [
    { source: 'website_self_checkout', packageSlug: 'abhyangam-package' },
    { source: 'whatsapp_manual', packageSlug: 'abhyangam-package' },
  ]
  const stats = summarizePromoStats(rows, sales, catalog, '2026-11-02')

  it('keeps views out of the click totals', () => {
    expect(stats.totalClicks).toBe(30)
    expect(stats.todayClicks).toBe(5)
    expect(stats.flyerViews).toBe(100)
    expect(stats.pageViews).toBe(40)
  })

  it('splits clicks and sales by package, location and day', () => {
    expect(stats.byPackage[0]).toEqual({ slug: 'abhyangam-package', name: 'Abhyangam Package', buy: 8, whatsapp: 0, sales: 2 })
    expect(stats.byPackage[1]).toEqual({ slug: 'sirodhaara-package', name: 'Sirodhaara Package', buy: 0, whatsapp: 2, sales: 0 })
    expect(stats.byPlacement.find((p) => p.placement === 'flyer')?.clicks).toBe(20)
    expect(stats.onlineSales).toBe(1)
    expect(stats.counterSales).toBe(1)
    expect(stats.daily).toEqual([
      { day: '2026-11-02', clicks: 5 },
      { day: '2026-11-01', clicks: 25 },
    ])
  })
})
