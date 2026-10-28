'use server'

import { revalidatePath } from 'next/cache'
import { requireStaff } from '@/lib/staff/guard'
import { notifyPackagePurchased } from '@/lib/booking/notify'
import { isOnSale, searchPackagePurchases, type PackagePurchaseRow } from '@/lib/packages/queries'

type Ok = { ok: true }
type Err = { error: string }

export async function searchPackagePurchasesAction(query: string): Promise<PackagePurchaseRow[]> {
  const { db } = await requireStaff(['admin', 'front_desk'])
  return searchPackagePurchases(db, query)
}

export interface LogPackageSaleInput {
  packageId: string
  ownerName: string
  ownerPhone: string
  ownerEmail?: string | null
  notes?: string | null
}

/**
 * Staff logs a manual sale (WhatsApp enquiry → payment collected in person/
 * by transfer). Snapshots the package's current name/price/sessions/treatment
 * so later catalog edits never change an already-sold package.
 */
export async function createManualPackagePurchase(input: LogPackageSaleInput): Promise<Ok | Err> {
  const { userId, db } = await requireStaff(['admin', 'front_desk'])

  const ownerName = input.ownerName?.trim()
  const ownerPhone = input.ownerPhone?.trim()
  if (!ownerName) return { error: 'Enter the customer’s name.' }
  if (!ownerPhone) return { error: 'Enter the customer’s phone number.' }
  if (!input.packageId) return { error: 'Pick a package.' }

  const { data: pkg, error: pkgErr } = await db
    .from('packages')
    .select('id, name, price_rm, session_count, treatment_id, validity_days, is_active, available_until')
    .eq('id', input.packageId)
    .maybeSingle()
  if (pkgErr) return { error: pkgErr.message }
  if (!pkg) return { error: 'Package not found.' }
  if (!isOnSale(pkg.is_active, pkg.available_until ?? null)) {
    return { error: 'This package is no longer on sale.' }
  }

  const purchasedAt = new Date()
  const expiresAt = new Date(purchasedAt.getTime() + pkg.validity_days * 24 * 60 * 60 * 1000)

  const ownerEmail = input.ownerEmail?.trim() || null
  const { data: inserted, error } = await db.from('package_purchases').insert({
    package_id: pkg.id,
    owner_name: ownerName,
    owner_phone: ownerPhone,
    owner_email: ownerEmail,
    package_name_snapshot: pkg.name,
    price_rm_snapshot: pkg.price_rm,
    session_count_snapshot: pkg.session_count,
    treatment_id_snapshot: pkg.treatment_id,
    validity_days_snapshot: pkg.validity_days,
    purchased_at: purchasedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    status: 'active',
    source: 'whatsapp_manual',
    created_by_staff_id: userId,
    notes: input.notes?.trim() || null,
  }).select('id').single()
  if (error) return { error: error.message }

  if (ownerEmail) {
    try {
      await notifyPackagePurchased({
        to: ownerEmail,
        name: ownerName,
        phone: ownerPhone,
        packageName: pkg.name,
        priceRm: Number(pkg.price_rm),
        sessions: pkg.session_count,
        expiresISO: expiresAt.toISOString(),
        purchaseId: inserted.id,
        notifyStaff: false,
      })
    } catch (e) {
      console.error('[packages/actions] receipt email failed', e)
    }
  }

  revalidatePath('/console/packages')
  return { ok: true }
}

/** Marks one session used against a purchase. Atomic — see redeem_package_session RPC. */
export async function redeemPackageSession(packagePurchaseId: string, notes?: string | null): Promise<Ok | Err> {
  const { userId, db } = await requireStaff(['admin', 'front_desk'])

  const { error } = await db.rpc('redeem_package_session', {
    p_package_purchase_id: packagePurchaseId,
    p_staff_id: userId,
    p_notes: notes?.trim() || null,
  })
  if (error) return { error: error.message }

  revalidatePath('/console/packages')
  return { ok: true }
}

/** Staff can cancel a purchase (e.g. sold in error, customer refunded off-system). */
export async function cancelPackagePurchase(packagePurchaseId: string): Promise<Ok | Err> {
  const { db } = await requireStaff(['admin', 'front_desk'])
  const { error } = await db
    .from('package_purchases')
    .update({ status: 'cancelled' })
    .eq('id', packagePurchaseId)
  if (error) return { error: error.message }
  revalidatePath('/console/packages')
  return { ok: true }
}
