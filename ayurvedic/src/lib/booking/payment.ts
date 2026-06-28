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
    const { error: gErr } = await sb
      .from('appointments')
      .update({ payment_status: 'paid', paid_at: paidAt, status: 'confirmed' })
      .eq('group_id', g.group_id)
      .eq('status', 'awaiting_payment')
    if (gErr) return { error: gErr.message }
    await notifyConfirmed({
      to: a.patient_email,
      name: a.patient_name,
      treatmentName: a.treatment_name,
      whenISO: a.appointment_date_time,
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
