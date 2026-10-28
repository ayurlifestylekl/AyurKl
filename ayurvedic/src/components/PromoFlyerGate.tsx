import { createClient as createSb } from '@supabase/supabase-js'
import { onSaleNowFilter } from '@/lib/packages/queries'
import PromoFlyerPopup from './PromoFlyerPopup'

/**
 * Renders the Deepawali flyer popup only while at least one package is on sale
 * (active and before its available_until) — the same rule that takes the
 * packages off the rest of the site, so the flyer ends with the promo.
 */
export default async function PromoFlyerGate() {
  const sb = createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 300, tags: ['packages'] } }) },
  })
  const { count, error } = await sb
    .from('packages')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .or(onSaleNowFilter())
  if (error || !count) return null

  return <PromoFlyerPopup />
}
