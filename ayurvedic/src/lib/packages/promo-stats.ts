import type { SupabaseClient } from '@supabase/supabase-js'
import { DEEPAWALI_PROMO, PROMO_PLACEMENT_LABELS, type PromoPlacement } from '@/lib/packages/promo-events'
import type { PackageCatalogRow } from '@/lib/packages/queries'

export interface PromoEventRow {
  day: string
  event: string
  placement: string
  package_slug: string | null
  total: number
}

export interface PromoSaleRow {
  source: string
  packageSlug: string | null
}

export interface PromoStats {
  totalClicks: number
  todayClicks: number
  flyerViews: number
  pageViews: number
  onlineSales: number
  counterSales: number
  byPlacement: { placement: string; label: string; clicks: number }[]
  byPackage: { slug: string; name: string; buy: number; whatsapp: number; sales: number }[]
  daily: { day: string; clicks: number }[]
}

/** Views are shown on their own; a "click" is a button someone actually pressed. */
function isClick(event: string): boolean {
  return event !== 'view'
}

export function summarizePromoStats(
  rows: PromoEventRow[],
  sales: PromoSaleRow[],
  catalog: Pick<PackageCatalogRow, 'slug' | 'name'>[],
  today: string,
): PromoStats {
  const sumWhere = (test: (r: PromoEventRow) => boolean) =>
    rows.reduce((n, r) => (test(r) ? n + r.total : n), 0)

  const daily = new Map<string, number>()
  for (const r of rows) {
    if (isClick(r.event)) daily.set(r.day, (daily.get(r.day) ?? 0) + r.total)
  }

  return {
    totalClicks: sumWhere((r) => isClick(r.event)),
    todayClicks: sumWhere((r) => isClick(r.event) && r.day === today),
    flyerViews: sumWhere((r) => r.event === 'view' && r.placement === 'flyer'),
    pageViews: sumWhere((r) => r.event === 'view' && r.placement === 'packages'),
    onlineSales: sales.filter((s) => s.source !== 'whatsapp_manual').length,
    counterSales: sales.filter((s) => s.source === 'whatsapp_manual').length,
    byPlacement: (Object.keys(PROMO_PLACEMENT_LABELS) as PromoPlacement[]).map((placement) => ({
      placement,
      label: PROMO_PLACEMENT_LABELS[placement],
      clicks: sumWhere((r) => isClick(r.event) && r.placement === placement),
    })),
    byPackage: catalog.map((p) => ({
      slug: p.slug,
      name: p.name,
      buy: sumWhere((r) => r.event === 'buy' && r.package_slug === p.slug),
      whatsapp: sumWhere((r) => r.event === 'whatsapp' && r.package_slug === p.slug),
      sales: sales.filter((s) => s.packageSlug === p.slug).length,
    })),
    daily: Array.from(daily, ([day, clicks]) => ({ day, clicks })).sort((a, b) => b.day.localeCompare(a.day)),
  }
}

/** Promo clicks and paid sales for /console/packages. Needs the service-role client. */
export async function getPromoStats(db: SupabaseClient, catalog: PackageCatalogRow[]): Promise<PromoStats> {
  const [{ data: events, error: eventsError }, { data: purchases, error: salesError }] = await Promise.all([
    db.rpc('promo_event_summary', { p_promo: DEEPAWALI_PROMO }),
    db.from('package_purchases').select('source, package:packages(slug)').in('status', ['active', 'expired']),
  ])
  if (eventsError) console.error('[packages/promo-stats] summary:', eventsError.message)
  if (salesError) console.error('[packages/promo-stats] sales:', salesError.message)

  const sales: PromoSaleRow[] = (purchases ?? []).map((p) => ({
    source: p.source,
    packageSlug: (p.package as unknown as { slug: string } | null)?.slug ?? null,
  }))
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' })

  return summarizePromoStats((events ?? []) as PromoEventRow[], sales, catalog, today)
}
