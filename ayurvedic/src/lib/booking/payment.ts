import 'server-only'
import { createClient as createSb } from '@supabase/supabase-js'
import { getPaymentProvider } from '@/lib/payments'
import { canTransition } from './status'
import { canAccessBooking } from './access'
import { notifyConfirmed } from './notify'
import type { BookingStatus } from '@/types/booking'

function admin() {
  return createSb(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
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
    .select('id, status, payable_amount_rm, patient_name, patient_email, patient_phone, treatment_name, customer_id')
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

  const provider = getPaymentProvider()
  const base = siteUrl()
  const { billId, url } = await provider.createBill({
    appointmentId: a.id,
    amountRm,
    name: a.patient_name ?? 'Guest',
    email: a.patient_email ?? '',
    phone: a.patient_phone ?? '',
    description,
    callbackUrl: `${base}/api/payments/callback`,
    redirectUrl: `${base}/book/request/${a.id}${token ? `?t=${token}` : ''}`,
  })

  await sb
    .from('appointments')
    .update({ payment_bill_id: billId, payment_url: url, payment_provider: provider.name, payment_status: 'pending' })
    .eq('id', a.id)

  return { url }
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
      .select('id, patient_name, guest_age, treatment_name')
    if (gErr) return { error: gErr.message }
    if (!flipped || flipped.length === 0) {
      // Payment landed but no guest was awaiting confirmation — surface for manual review/refund.
      console.error(`[payment] GROUP CONFIRM MISMATCH billId=${billId} group=${g.group_id}: paid but 0 guests confirmed.`)
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
