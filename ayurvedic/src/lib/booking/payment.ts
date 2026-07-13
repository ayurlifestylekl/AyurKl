import 'server-only'
import { createClient as createSb } from '@supabase/supabase-js'
import { getPaymentProvider } from '@/lib/payments'
import { canTransition } from './status'
import { canAccessBooking } from './access'
import { notifyConfirmed, notifyPaymentProblem } from './notify'
import type { BookingStatus } from '@/types/booking'

function admin() {
  return createSb(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      // Payment decisions must always read the live row — never Next's fetch
      // cache. A stale row once re-sent an already-corrected invalid phone to
      // Billplz and kept the pay page failing after the data was fixed.
      global: { fetch: (i, init) => fetch(i, { ...init, cache: 'no-store' }) },
    },
  )
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'
}

/**
 * Create a bill for an approved (awaiting_payment) appointment and return the
 * URL to send the customer to. Server-only — never exposed as a client action.
 */
export async function startPaymentForAppointment(
  id: string,
  token?: string | null,
): Promise<{ url: string } | { error: string }> {
  const sb = admin()
  const { data: a } = await sb
    .from('appointments')
    .select('id, status, payable_amount_rm, patient_name, patient_email, patient_phone, treatment_name, customer_id, payment_bill_id, payment_url')
    .eq('id', id)
    .maybeSingle()
  if (!a) return { error: 'Booking not found.' }
  if (!(await canAccessBooking(id, a.customer_id ?? null, token))) {
    return { error: 'Not authorised.' }
  }
  if (a.status !== 'awaiting_payment') return { error: 'This booking is not awaiting payment.' }
  // Best-effort expiry check (separate query so a missing column can't break pay).
  const { data: exp } = await sb.from('appointments').select('payment_expires_at').eq('id', id).maybeSingle()
  if (exp?.payment_expires_at && new Date(exp.payment_expires_at).getTime() < Date.now()) {
    return { error: 'This payment link has expired and the slot was released. Please book again.' }
  }
  if (a.payable_amount_rm == null) return { error: 'No amount is payable for this booking.' }

  // Re-use the bill from an earlier "Pay" click while it's still open — minting
  // a new bill per click leaves multiple payable bills (double-charge risk).
  const provider = getPaymentProvider()
  if (a.payment_bill_id && a.payment_url && provider.fetchBillStatus) {
    const existing = await provider.fetchBillStatus(a.payment_bill_id).catch(() => null)
    if (existing && !existing.paid) return { url: a.payment_url }
    if (existing?.paid) {
      // Paid but the webhook hasn't landed — confirm now instead of re-billing.
      await markBillPaid(a.payment_bill_id)
      return { error: 'This booking is already paid — please check your email for the confirmation.' }
    }
    // Bill deleted/unreachable → fall through and mint a fresh one.
  }

  // Group bookings: one combined bill across all guests (best-effort group lookup).
  let amountRm = Number(a.payable_amount_rm)
  let description = `${a.treatment_name ?? 'Treatment'} booking`
  const { data: g } = await sb.from('appointments').select('group_id').eq('id', id).maybeSingle()
  const groupId: string | null = g?.group_id ?? null
  if (groupId) {
    const { data: members } = await sb.from('appointments').select('status, payable_amount_rm').eq('group_id', groupId)
    const list = members ?? []
    if (list.some((m) => m.status !== 'awaiting_payment')) {
      return { error: 'All guests must be approved by the clinic before payment.' }
    }
    amountRm = list.reduce((sum, m) => sum + Number(m.payable_amount_rm ?? 0), 0)
    description = `${a.treatment_name ?? 'Treatment'} — group of ${list.length}`
  }

  const base = siteUrl()
  // A provider rejection must degrade to a friendly message on the status page,
  // never a 500 — the customer is mid-payment and needs a way forward.
  let billId: string
  let url: string
  try {
    ;({ billId, url } = await provider.createBill({
      appointmentId: a.id,
      amountRm,
      name: a.patient_name ?? 'Guest',
      email: a.patient_email ?? '',
      phone: a.patient_phone ?? '',
      description,
      callbackUrl: `${base}/api/payments/callback`,
      redirectUrl: `${base}/book/request/${a.id}${token ? `?t=${token}` : ''}`,
    }))
  } catch (e) {
    console.error('[payment] createBill failed for', a.id, e)
    return { error: 'The payment could not be started — please try again shortly, or WhatsApp us and we will send you a payment link.' }
  }

  await sb
    .from('appointments')
    .update({ payment_bill_id: billId, payment_url: url, payment_provider: provider.name, payment_status: 'pending' })
    .eq('id', a.id)

  return { url }
}

/**
 * Void an open bill after its booking is cancelled, so the customer can never
 * pay for a booking that no longer exists. Never throws — a delete failure
 * usually means the bill was JUST paid, so we reconcile instead: either the
 * payment confirms the booking, or staff get the payment-problem alert.
 */
export async function voidBill(billId: string | null | undefined): Promise<void> {
  if (!billId || billId.startsWith('stub_')) return
  try {
    const provider = getPaymentProvider()
    if (!provider.deleteBill) return
    await provider.deleteBill(billId)
  } catch (e) {
    console.error('[payment] voidBill failed (bill may be paid) —', billId, e)
    try {
      await reconcileByBill(billId)
    } catch (e2) {
      console.error('[payment] voidBill reconcile also failed —', billId, e2)
    }
  }
}

/**
 * Authoritatively reconcile a bill against the provider's API and confirm the
 * booking if the provider reports it paid. Safety net for a webhook that was
 * missed or failed signature verification. Idempotent; a no-op if the provider
 * can't be queried or the bill isn't paid.
 */
export async function reconcileByBill(
  billId: string,
): Promise<{ appointmentId: string } | { error: string } | { skipped: true }> {
  if (!billId) return { skipped: true }
  const provider = getPaymentProvider()
  if (!provider.fetchBillStatus) return { skipped: true }
  const status = await provider.fetchBillStatus(billId)
  if (!status?.paid) return { skipped: true }
  return markBillPaid(billId)
}

/**
 * Reconcile a single appointment that's awaiting payment — used when the
 * customer returns from the gateway, so a paid booking self-heals even if the
 * webhook never landed. Returns 'confirmed' when it flips, else 'noop'.
 */
export async function reconcileAppointment(appointmentId: string): Promise<'confirmed' | 'noop'> {
  const sb = admin()
  const { data: a } = await sb
    .from('appointments')
    .select('status, payment_bill_id')
    .eq('id', appointmentId)
    .maybeSingle()
  if (!a || a.status !== 'awaiting_payment' || !a.payment_bill_id) return 'noop'
  const res = await reconcileByBill(a.payment_bill_id)
  return 'appointmentId' in res ? 'confirmed' : 'noop'
}

/** Mark a bill paid and confirm its appointment. Idempotent. */
export async function markBillPaid(billId: string): Promise<{ appointmentId: string } | { error: string }> {
  const sb = admin()
  const { data: a } = await sb
    .from('appointments')
    .select('id, status, patient_email, patient_name, treatment_name, appointment_date_time')
    .eq('payment_bill_id', billId)
    .maybeSingle()
  if (!a) return { error: 'Bill not found.' }
  if (a.status === 'confirmed') return { appointmentId: a.id } // already done
  if (!canTransition(a.status as BookingStatus, 'confirmed')) {
    // Money arrived for a booking that can't be confirmed (e.g. cancelled while
    // the customer was mid-payment). Staff must review + refund — never silent.
    await notifyPaymentProblem({ billId, name: a.patient_name, treatmentName: a.treatment_name, bookingStatus: a.status })
    return { error: `Cannot confirm from ${a.status}.` }
  }
  const paidAt = new Date().toISOString()

  // Group booking: one payment confirms every guest (best-effort group lookup).
  const { data: g } = await sb.from('appointments').select('group_id').eq('id', a.id).maybeSingle()
  if (g?.group_id) {
    const { data: flipped, error: gErr } = await sb
      .from('appointments')
      .update({ payment_status: 'paid', paid_at: paidAt, status: 'confirmed' })
      .eq('group_id', g.group_id)
      .eq('status', 'awaiting_payment')
      .select('id, patient_name, guest_age, treatment_name, appointment_date_time')
    if (gErr) return { error: gErr.message }
    if (!flipped || flipped.length === 0) {
      // Payment landed but no guest was awaiting confirmation — the group was
      // cancelled/rejected mid-payment. Alert staff for a refund and do NOT
      // send the customer a (false) confirmation email.
      console.error(`[payment] GROUP CONFIRM MISMATCH billId=${billId} group=${g.group_id}: paid but 0 guests confirmed.`)
      await notifyPaymentProblem({ billId, name: a.patient_name, treatmentName: `${a.treatment_name ?? 'Treatment'} (group)`, bookingStatus: 'cancelled' })
      return { error: 'Payment received but the group was no longer awaiting payment.' }
    }
    await notifyConfirmed({
      to: a.patient_email,
      name: a.patient_name,
      treatmentName: a.treatment_name,
      whenISO: a.appointment_date_time,
      guests: (flipped ?? []).map((m) => ({
        name: m.patient_name,
        age: m.guest_age != null ? Number(m.guest_age) : null,
        treatmentName: m.treatment_name,
        whenISO: m.appointment_date_time,
      })),
    })
    return { appointmentId: a.id }
  }

  const { error } = await sb
    .from('appointments')
    .update({ payment_status: 'paid', paid_at: paidAt, status: 'confirmed' })
    .eq('id', a.id)
  if (error) return { error: error.message }
  await notifyConfirmed({
    to: a.patient_email,
    name: a.patient_name,
    treatmentName: a.treatment_name,
    whenISO: a.appointment_date_time,
  })
  return { appointmentId: a.id }
}
