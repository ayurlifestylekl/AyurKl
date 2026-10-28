/**
 * Package (session-bundle) reads. Backs the public /packages page and the
 * /console/packages staff tool. See supabase/migrations/20261029_deepawali_packages.sql.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SB = SupabaseClient<any, 'public', any>

export interface PublicPackage {
  id: string
  slug: string
  name: string
  priceRm: number
  sessionCount: number
  description: string | null
  validityDays: number
  /** The linked therapy's hero photo — used on package cards. */
  imageUrl: string | null
  treatment: { slug: string; categorySlug: string; title: string } | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPublicPackage(r: any): PublicPackage {
  const t = r.treatment
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    priceRm: Number(r.price_rm),
    sessionCount: r.session_count,
    description: r.description ?? null,
    validityDays: r.validity_days,
    imageUrl: t?.hero_image_url ?? null,
    treatment: t
      ? { slug: t.slug, categorySlug: t.category?.slug ?? '', title: t.title }
      : null,
  }
}

/**
 * PostgREST filter: no end date, or the end date hasn't passed yet. "Now" is
 * rounded down to the minute so cached reads (the flyer gate) share a key.
 */
export function onSaleNowFilter(): string {
  const now = new Date(Math.floor(Date.now() / 60_000) * 60_000).toISOString()
  return `available_until.is.null,available_until.gt.${now}`
}

/** Is a package sellable right now? Active and before its optional end date. */
export function isOnSale(isActive: boolean, availableUntil: string | null): boolean {
  return isActive && (!availableUntil || new Date(availableUntil).getTime() > Date.now())
}

/** Active packages for the public /packages page, ordered by sort_order. */
export async function getActivePackages(sb: SB): Promise<PublicPackage[]> {
  const { data, error } = await sb
    .from('packages')
    .select(
      'id, slug, name, price_rm, session_count, description, validity_days, sort_order, treatment:treatments(slug, title, hero_image_url, category:treatment_categories(slug))',
    )
    .eq('is_active', true)
    .or(onSaleNowFilter())
    .order('sort_order', { ascending: true })
  if (error) {
    console.error('[packages/queries] getActivePackages:', error.message)
    return []
  }
  return (data ?? []).map(rowToPublicPackage)
}

/** One active package by slug — the purchase form's source of truth for price/sessions. */
export async function getPackageBySlug(sb: SB, slug: string): Promise<PublicPackage | null> {
  const { data, error } = await sb
    .from('packages')
    .select(
      'id, slug, name, price_rm, session_count, description, validity_days, sort_order, treatment:treatments(slug, title, hero_image_url, category:treatment_categories(slug))',
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .or(onSaleNowFilter())
    .maybeSingle()
  if (error) {
    console.error('[packages/queries] getPackageBySlug:', error.message)
    return null
  }
  return data ? rowToPublicPackage(data) : null
}

/** The single active package tied to a given treatment (for a treatment-page promo banner). */
export async function getActivePackageForTreatment(sb: SB, treatmentId: string): Promise<PublicPackage | null> {
  const { data, error } = await sb
    .from('packages')
    .select(
      'id, slug, name, price_rm, session_count, description, validity_days, sort_order, treatment:treatments(slug, title, hero_image_url, category:treatment_categories(slug))',
    )
    .eq('is_active', true)
    .or(onSaleNowFilter())
    .eq('treatment_id', treatmentId)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error('[packages/queries] getActivePackageForTreatment:', error.message)
    return null
  }
  return data ? rowToPublicPackage(data) : null
}

export interface PackagePurchaseRow {
  id: string
  packageName: string
  priceRm: number
  sessionCount: number
  sessionsUsed: number
  ownerName: string
  ownerPhone: string
  ownerEmail: string | null
  status: 'active' | 'expired' | 'cancelled' | 'awaiting_payment'
  purchasedAt: string | null
  expiresAt: string | null
  notes: string | null
  redemptions: Array<{ id: string; redeemedAt: string; notes: string | null }>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPurchase(r: any): PackagePurchaseRow {
  return {
    id: r.id,
    packageName: r.package_name_snapshot,
    priceRm: Number(r.price_rm_snapshot),
    sessionCount: r.session_count_snapshot,
    sessionsUsed: r.sessions_used,
    ownerName: r.owner_name,
    ownerPhone: r.owner_phone,
    ownerEmail: r.owner_email ?? null,
    status: r.status,
    purchasedAt: r.purchased_at ?? null,
    expiresAt: r.expires_at ?? null,
    notes: r.notes ?? null,
    redemptions: (r.package_redemptions ?? [])
      .map((x: { id: string; redeemed_at: string; notes: string | null }) => ({
        id: x.id,
        redeemedAt: x.redeemed_at,
        notes: x.notes,
      }))
      .sort((a: { redeemedAt: string }, b: { redeemedAt: string }) => b.redeemedAt.localeCompare(a.redeemedAt)),
  }
}

const PURCHASE_COLUMNS =
  'id, package_name_snapshot, price_rm_snapshot, session_count_snapshot, sessions_used, owner_name, owner_phone, owner_email, status, purchased_at, expires_at, notes, package_redemptions(id, redeemed_at, notes)'

/** Staff search: by owner name, phone, or email (console/packages). */
export async function searchPackagePurchases(sb: SB, query: string): Promise<PackagePurchaseRow[]> {
  // Commas, parentheses, quotes and backslashes would otherwise rewrite the or() filter.
  const q = query.replace(/[,()"\\]/g, ' ').trim().slice(0, 80)
  if (!q) return []
  const { data, error } = await sb
    .from('package_purchases')
    .select(PURCHASE_COLUMNS)
    .or(`owner_name.ilike.%${q}%,owner_phone.ilike.%${q}%,owner_email.ilike.%${q}%`)
    .order('purchased_at', { ascending: false })
    .limit(25)
  if (error) {
    console.error('[packages/queries] searchPackagePurchases:', error.message)
    return []
  }
  return (data ?? []).map(rowToPurchase)
}

/** Most recent sales (console/packages default view). */
export async function getRecentPackagePurchases(sb: SB, limit = 25): Promise<PackagePurchaseRow[]> {
  const { data, error } = await sb
    .from('package_purchases')
    .select(PURCHASE_COLUMNS)
    .order('purchased_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.error('[packages/queries] getRecentPackagePurchases:', error.message)
    return []
  }
  return (data ?? []).map(rowToPurchase)
}

export interface PackageCatalogRow {
  id: string
  slug: string
  name: string
  priceRm: number
  sessionCount: number
  isActive: boolean
}

/** Every package (active or not) for the "log a sale" picker in console/packages. */
export async function getAllPackagesForStaff(sb: SB): Promise<PackageCatalogRow[]> {
  const { data, error } = await sb
    .from('packages')
    .select('id, slug, name, price_rm, session_count, is_active, available_until')
    .order('sort_order', { ascending: true })
  if (error) {
    console.error('[packages/queries] getAllPackagesForStaff:', error.message)
    return []
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    priceRm: Number(r.price_rm),
    sessionCount: r.session_count,
    isActive: isOnSale(r.is_active, r.available_until ?? null),
  }))
}
