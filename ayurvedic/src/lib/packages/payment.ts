import 'server-only'
import { createClient as createSb } from '@supabase/supabase-js'
import { getPaymentProvider, getProviderByName } from '@/lib/payments'
import { notifyPackagePurchased } from '@/lib/booking/notify'

function admin() {
  return createSb(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (i, init) => fetch(i, { ...init, cache: 'no-store' }) },
    },
  )
}

type PaymentHandlingResult =
  | { ok: true; state: 'confirmed' | 'already_confirmed' | 'not_found' }
  | { ok: false; state: 'error'; message: string }

/**
 * Mark a package purchase as paid by its provider bill id. Idempotent —
 * starts the real 1-year validity clock from the moment payment confirms,
 * not from when the (possibly abandoned) checkout started.
 */
export async function markPackageBillPaid(billId: string): Promise<PaymentHandlingResult> {
  const sb = admin()

  const { data: purchase } = await sb
    .from('package_purchases')
    .select(
      'id, status, validity_days_snapshot, owner_name, owner_phone, owner_email, package_name_snapshot, price_rm_snapshot, session_count_snapshot',
    )
    .eq('payment_bill_id', billId)
    // Counter sales keep a staff-typed reference in payment_bill_id; never let
    // a provider callback match one of those.
    .neq('source', 'whatsapp_manual')
    .maybeSingle()

  if (!purchase) return { ok: true, state: 'not_found' }
  if (purchase.status !== 'awaiting_payment') {
    return { ok: true, state: 'already_confirmed' }
  }

  const purchasedAt = new Date()
  const expiresAt = new Date(purchasedAt.getTime() + purchase.validity_days_snapshot * 24 * 60 * 60 * 1000)

  // Conditional on still being awaiting_payment: Billplz can hit the callback
  // twice (server webhook + browser redirect) — only the call that actually
  // flips the row sends the alerts, so nobody gets a duplicate receipt.
  const { data: flipped, error } = await sb
    .from('package_purchases')
    .update({
      status: 'active',
      purchased_at: purchasedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq('id', purchase.id)
    .eq('status', 'awaiting_payment')
    .select('id')

  if (error) {
    console.error('[packages/payment] mark paid failed', error)
    return { ok: false, state: 'error', message: 'Could not activate package.' }
  }
  if (!flipped || flipped.length === 0) return { ok: true, state: 'already_confirmed' }

  try {
    await notifyPackagePurchased({
      to: purchase.owner_email,
      name: purchase.owner_name,
      phone: purchase.owner_phone,
      packageName: purchase.package_name_snapshot,
      priceRm: Number(purchase.price_rm_snapshot),
      sessions: purchase.session_count_snapshot,
      expiresISO: expiresAt.toISOString(),
      purchaseId: purchase.id,
    })
  } catch (e) {
    console.error('[packages/payment] purchase notification failed', e)
  }

  return { ok: true, state: 'confirmed' }
}

/** Reconcile a package purchase against the provider's API (missed/failed webhook). */
export async function reconcilePackagePurchaseByBill(
  billId: string,
  providerName?: string | null,
): Promise<PaymentHandlingResult> {
  const provider =
    providerName !== undefined && providerName !== null
      ? getProviderByName(providerName)
      : getPaymentProvider()
  if (!provider?.fetchBillStatus) return { ok: false, state: 'error', message: 'Provider not queryable.' }

  const status = await provider.fetchBillStatus(billId).catch(() => null)
  if (!status) return { ok: false, state: 'error', message: 'Provider status unavailable.' }
  if (!status.paid) return { ok: true, state: 'not_found' }
  return markPackageBillPaid(billId)
}
