import { createClient as createSb } from '@supabase/supabase-js'
import PromoFlyerPopup from './PromoFlyerPopup'

/** Last moment the flyer is shown: end of 30 November 2026, Malaysia time (matches the flyer). */
const PROMO_ENDS = new Date('2026-12-01T00:00:00+08:00')

/**
 * Renders the Deepawali flyer popup only while the promo is genuinely on:
 * before the flyer's end date AND while at least one package is still active
 * (front desk deactivating the packages takes the flyer down too).
 */
export default async function PromoFlyerGate() {
  if (Date.now() >= PROMO_ENDS.getTime()) return null

  const sb = createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 300, tags: ['packages'] } }) },
  })
  const { count, error } = await sb
    .from('packages')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
  if (error || !count) return null

  return <PromoFlyerPopup />
}
