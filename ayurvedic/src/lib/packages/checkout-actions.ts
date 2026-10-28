'use server'

import { z } from 'zod'
import { createClient as createSb } from '@supabase/supabase-js'
import { getProviderForMethod, isCardPaymentEnabled, type PaymentMethod } from '@/lib/payments'
import { PACKAGE_TERMS_VERSION } from '@/lib/packages/terms'

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

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'
}

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

const PurchaseInputSchema = z.object({
  packageSlug: z.string().min(1),
  ownerName: z.string().min(1, 'Full name is required.'),
  ownerPhone: z.string().min(1, 'Phone number is required.'),
  ownerEmail: z.string().email('A valid email is required.'),
  agreedToTerms: z.literal(true, { errorMap: () => ({ message: 'You must agree to the terms and conditions.' }) }),
  method: z.enum(['fpx', 'card']).default('fpx'),
  idempotencyKey: z.string().uuid(),
})

export interface CreatePackageOrderInput {
  packageSlug: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  agreedToTerms: boolean
  method: PaymentMethod
  idempotencyKey: string
}

export interface PackageOrderResult {
  purchaseId: string
  billUrl: string
}

/**
 * Public self-checkout for a package. Creates an 'awaiting_payment' purchase
 * row (snapshotting the package so later catalog edits can't change what was
 * sold) and a payment bill. Confirmed by markPackageBillPaid once the
 * provider calls back — see src/lib/packages/payment.ts.
 */
export async function createPackageOrder(raw: unknown): Promise<ActionResult<PackageOrderResult>> {
  const parsed = PurchaseInputSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Invalid input.' }
  }
  const { packageSlug, ownerName, ownerPhone, ownerEmail, method, idempotencyKey } = parsed.data
  const sb = admin()

  if (method === 'card' && !isCardPaymentEnabled()) {
    return { ok: false, error: 'Card payment is not available right now. Please pay by online banking.' }
  }

  // Idempotent: a retried submit returns the existing bill instead of double-charging.
  const { data: existing } = await sb
    .from('package_purchases')
    .select('id, status, payment_url')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle()
  if (existing) {
    if (existing.status !== 'awaiting_payment') {
      return { ok: true, data: { purchaseId: existing.id, billUrl: `${siteUrl()}/packages/purchase/success?id=${existing.id}` } }
    }
    if (existing.payment_url) {
      return { ok: true, data: { purchaseId: existing.id, billUrl: existing.payment_url } }
    }
    await sb.from('package_purchases').delete().eq('id', existing.id)
  }

  const { data: pkg, error: pkgErr } = await sb
    .from('packages')
    .select('id, name, price_rm, session_count, treatment_id, validity_days')
    .eq('slug', packageSlug)
    .eq('is_active', true)
    .maybeSingle()
  if (pkgErr || !pkg) return { ok: false, error: 'This package is no longer available.' }

  let purchaseId: string | null = null
  try {
    const { data: purchase, error: insertErr } = await sb
      .from('package_purchases')
      .insert({
        package_id: pkg.id,
        owner_name: ownerName,
        owner_phone: ownerPhone,
        owner_email: ownerEmail,
        package_name_snapshot: pkg.name,
        price_rm_snapshot: pkg.price_rm,
        session_count_snapshot: pkg.session_count,
        treatment_id_snapshot: pkg.treatment_id,
        validity_days_snapshot: pkg.validity_days,
        status: 'awaiting_payment',
        source: 'website_self_checkout',
        idempotency_key: idempotencyKey,
        terms_accepted_at: new Date().toISOString(),
        terms_version: PACKAGE_TERMS_VERSION,
      })
      .select('id')
      .single()
    if (insertErr || !purchase) throw insertErr ?? new Error('Purchase insert failed')
    purchaseId = purchase.id

    const provider = getProviderForMethod(method)
    const { billId, url } = await provider.createBill({
      appointmentId: purchase.id,
      amountRm: Number(pkg.price_rm),
      name: ownerName,
      email: ownerEmail,
      phone: ownerPhone,
      description: `${pkg.name} package`,
      callbackUrl: `${siteUrl()}/api/payments/callback`,
      redirectUrl: `${siteUrl()}/packages/purchase/success?id=${purchase.id}`,
    })

    const { error: updateErr } = await sb
      .from('package_purchases')
      .update({
        payment_method: provider.name,
        payment_bill_id: billId,
        payment_url: url,
      })
      .eq('id', purchase.id)
    if (updateErr) throw updateErr

    return { ok: true, data: { purchaseId: purchase.id, billUrl: url } }
  } catch (err) {
    console.error('[packages/checkout-actions] createPackageOrder failed', err)
    if (purchaseId) {
      await sb.from('package_purchases').delete().eq('id', purchaseId).then(
        () => {},
        () => {},
      )
    }
    return { ok: false, error: 'Could not start checkout. Please try again or WhatsApp us.' }
  }
}
