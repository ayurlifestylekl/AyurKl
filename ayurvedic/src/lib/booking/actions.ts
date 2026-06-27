'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSb } from '@supabase/supabase-js'
import type { BookingRequestInput, Gender } from '@/types/booking'
import { genderRequirementValue, canCancel } from './policy'
import { createBookingToken } from './token'
import { canAccessBooking } from './access'
import { notifyRequestReceived, notifyCancelled } from './notify'
import { parseDurationMins } from './duration'
import { slotsForDuration, slotIso } from './slots'
import { findClash, type Slot } from './scheduling'
import { fetchBlocksOnOrAfter, blockedIntervalsForDate, isBlocked } from './blocks'
import { therapistsForGender } from '@/lib/staff/therapists'

/** Service-role client — bypasses RLS for guest bookings + server writes. */
function admin() {
  return createSb(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

export type CreateBookingResult = { id: string; token: string } | { error: string }

/**
 * Create a booking or consultation request. Writes an appointment in
 * `pending` status (awaiting staff approval). Works for guests and
 * signed-in customers. Treatment requests carry the full payable price;
 * consultations are free.
 */
export async function createBookingRequest(
  input: BookingRequestInput,
): Promise<CreateBookingResult> {
  if (!input.acceptedPolicies) return { error: 'Please accept the booking policies to continue.' }
  if (!input.patientName?.trim()) return { error: 'Please enter the patient name.' }
  if (!input.patientPhone?.trim()) return { error: 'Please enter a contact number.' }
  if (!input.preferredAt) return { error: 'Please choose a preferred date and time.' }
  if (input.patientGender !== 'male' && input.patientGender !== 'female') {
    return { error: 'Please select a gender for therapist matching.' }
  }

  const sb = admin()

  const isTreatment = input.bookingKind === 'treatment'
  if (isTreatment && !input.treatmentId) {
    return { error: 'Please choose a treatment.' }
  }

  // Look up the treatment for price/name/category when one is provided.
  // A standalone consultation has no treatment attached.
  let t: {
    id: string; title: string; price_rm: number | null
    booking_type: string | null; category_id: string | null; duration: string | null
  } | null = null
  if (input.treatmentId) {
    const { data, error: tErr } = await sb
      .from('treatments')
      .select('id, title, price_rm, booking_type, category_id, duration')
      .eq('id', input.treatmentId)
      .maybeSingle()
    if (tErr) return { error: tErr.message }
    if (!data) return { error: 'Treatment not found.' }
    if (data.booking_type === 'enquiry') {
      return { error: 'This therapy is enquiry-only — please WhatsApp us to arrange it.' }
    }
    t = data
  }

  // Attach the signed-in user when not booking as guest.
  let userId: string | null = null
  if (!input.isGuest) {
    const ssr = await createServerClient()
    const { data: auth } = await ssr.auth.getUser()
    userId = auth.user?.id ?? null
  }

  const payable = isTreatment ? (t?.price_rm ?? null) : null
  const treatmentName = t?.title ?? (isTreatment ? 'Treatment' : 'Free Consultation')
  // Length the therapist is occupied (used for double-booking checks). Consultations ≈ 30 min.
  const durationMins = t ? parseDurationMins(t.duration) : 30

  const { data, error } = await sb
    .from('appointments')
    .insert({
      customer_id: userId,
      is_guest: input.isGuest || !userId,
      booking_kind: input.bookingKind,
      treatment_id: t?.id ?? null,
      treatment_category_id: t?.category_id ?? null,
      treatment_name: treatmentName,
      duration_mins: durationMins,
      status: 'pending',
      requested_datetime: input.preferredAt,
      requested_datetime_alt: input.preferredAtAlt ?? null,
      // appointment_date_time is NOT NULL; seed it with the requested time.
      // Staff overwrite it with the confirmed slot at approval.
      appointment_date_time: input.preferredAt,
      patient_name: input.patientName.trim(),
      patient_phone: input.patientPhone.trim(),
      patient_email: input.patientEmail?.trim() || null,
      patient_gender: input.patientGender,
      gender_requirement: genderRequirementValue(input.patientGender),
      pre_visit_form: input.healthIntake ?? {},
      payable_amount_rm: payable,
      payment_status: 'unpaid',
      parent_consultation_id: input.parentConsultationId ?? null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  const id = data.id as string
  await notifyRequestReceived({
    to: input.patientEmail,
    name: input.patientName,
    treatmentName,
    kind: input.bookingKind,
    whenISO: input.preferredAt,
  })
  return { id, token: createBookingToken(id) }
}

export type CancelResult = { ok: true; refundable: boolean } | { error: string }

/**
 * Customer-initiated cancellation. Enforces the 12-hour rule: cancellations
 * within 12h of the appointment are non-refundable. Refunds (when eligible)
 * are processed manually for now.
 */
export async function cancelBooking(id: string, token?: string | null): Promise<CancelResult> {
  const sb = admin()
  const { data: a } = await sb
    .from('appointments')
    .select('id, status, appointment_date_time, payment_status, customer_id, patient_email, patient_name, treatment_name')
    .eq('id', id)
    .maybeSingle()
  if (!a) return { error: 'Booking not found.' }
  if (!(await canAccessBooking(id, a.customer_id ?? null, token))) {
    return { error: 'Not authorised to cancel this booking.' }
  }
  if (['cancelled', 'completed', 'no_show'].includes(a.status)) {
    return { error: 'This booking can no longer be cancelled.' }
  }

  const within12h = a.appointment_date_time
    ? !canCancel(a.appointment_date_time, new Date())
    : false
  const wasPaid = a.payment_status === 'paid'
  const refundable = wasPaid && !within12h

  const { error } = await sb
    .from('appointments')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: 'Cancelled by customer',
      internal_notes: wasPaid
        ? refundable
          ? 'Customer cancelled >12h before — refund eligible.'
          : 'Customer cancelled within 12h — non-refundable.'
        : null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  await notifyCancelled({ to: a.patient_email, name: a.patient_name, treatmentName: a.treatment_name, refundable })
  return { ok: true, refundable }
}

export type SlotInfo = { time: string; iso: string; available: boolean }

/**
 * Available 30-min booking slots for a date, treatment and guest gender.
 * A slot is available when at least one same-gender therapist is free for the
 * therapy length + 30-min buffer (based on already-assigned appointments).
 * Therapist identity is never returned — only whether a time is bookable.
 */
export async function getAvailableSlots(
  dateYMD: string,
  treatmentId: string | null,
  gender: Gender,
): Promise<SlotInfo[]> {
  if (gender !== 'male' && gender !== 'female') return []
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateYMD)) return []
  const sb = admin()

  let durationMins = 30
  if (treatmentId) {
    const { data: t } = await sb.from('treatments').select('duration').eq('id', treatmentId).maybeSingle()
    durationMins = t ? parseDurationMins(t.duration) : 60
  }

  const therapists = therapistsForGender(gender)
  if (therapists.length === 0) return []
  const codes = therapists.map((t) => t.code)

  const dayStartMs = new Date(`${dateYMD}T00:00:00+08:00`).getTime()
  const dayStart = new Date(dayStartMs).toISOString()
  const dayEnd = new Date(dayStartMs + 86_400_000).toISOString()

  const { data: appts } = await sb
    .from('appointments')
    .select('appointment_date_time, duration_mins, assigned_therapist_code')
    .in('assigned_therapist_code', codes)
    .in('status', ['scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress'])
    .gte('appointment_date_time', dayStart)
    .lt('appointment_date_time', dayEnd)

  const busyByCode = new Map<string, Slot[]>()
  for (const a of appts ?? []) {
    if (!a.assigned_therapist_code || !a.appointment_date_time) continue
    const arr = busyByCode.get(a.assigned_therapist_code) ?? []
    arr.push({ startISO: a.appointment_date_time, durationMins: a.duration_mins ?? 60 })
    busyByCode.set(a.assigned_therapist_code, arr)
  }

  // Leave / blocked windows remove therapists from availability.
  const blocks = await fetchBlocksOnOrAfter(sb, dateYMD)
  const intervals = blockedIntervalsForDate(blocks, dateYMD)

  const now = Date.now()
  return slotsForDuration(durationMins).map((time) => {
    const iso = slotIso(dateYMD, time)
    const available =
      new Date(iso).getTime() > now &&
      therapists.some(
        (t) =>
          findClash({ startISO: iso, durationMins }, busyByCode.get(t.code) ?? []) === null &&
          !isBlocked(intervals, t.code, iso, durationMins),
      )
    return { time, iso, available }
  })
}
