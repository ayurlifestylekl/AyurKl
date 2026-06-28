'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSb } from '@supabase/supabase-js'
import type { BookingRequestInput, Gender, HealthIntake } from '@/types/booking'
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
 * Core slot availability for a party needing `need.male` male + `need.female`
 * female therapists at the same time (single bookings need one of these = 1).
 * A slot is available when enough free same-gender therapists exist for the
 * therapy length + 30-min buffer, respecting bookings and leave/blocks.
 * Therapist identity is never returned.
 */
async function computeSlots(
  dateYMD: string,
  treatmentId: string | null,
  need: { male: number; female: number },
): Promise<SlotInfo[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateYMD)) return []
  if (need.male + need.female === 0) return []
  const sb = admin()

  let durationMins = 30
  if (treatmentId) {
    const { data: t } = await sb.from('treatments').select('duration').eq('id', treatmentId).maybeSingle()
    durationMins = t ? parseDurationMins(t.duration) : 60
  }

  const male = need.male > 0 ? therapistsForGender('male') : []
  const female = need.female > 0 ? therapistsForGender('female') : []
  const allSlots = slotsForDuration(durationMins)

  // Can the roster ever satisfy this party? If not, nothing is bookable.
  if (need.male > male.length || need.female > female.length) {
    return allSlots.map((time) => ({ time, iso: slotIso(dateYMD, time), available: false }))
  }

  const codes = [...male, ...female].map((t) => t.code)
  const dayStartMs = new Date(`${dateYMD}T00:00:00+08:00`).getTime()
  const { data: appts } = await sb
    .from('appointments')
    .select('appointment_date_time, duration_mins, assigned_therapist_code')
    .in('assigned_therapist_code', codes)
    .in('status', ['scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress'])
    .gte('appointment_date_time', new Date(dayStartMs).toISOString())
    .lt('appointment_date_time', new Date(dayStartMs + 86_400_000).toISOString())

  const busyByCode = new Map<string, Slot[]>()
  for (const a of appts ?? []) {
    if (!a.assigned_therapist_code || !a.appointment_date_time) continue
    const arr = busyByCode.get(a.assigned_therapist_code) ?? []
    arr.push({ startISO: a.appointment_date_time, durationMins: a.duration_mins ?? 60 })
    busyByCode.set(a.assigned_therapist_code, arr)
  }

  const blocks = await fetchBlocksOnOrAfter(sb, dateYMD)
  const intervals = blockedIntervalsForDate(blocks, dateYMD)
  const now = Date.now()

  const freeCount = (list: typeof male, iso: string) =>
    list.filter(
      (t) =>
        findClash({ startISO: iso, durationMins }, busyByCode.get(t.code) ?? []) === null &&
        !isBlocked(intervals, t.code, iso, durationMins),
    ).length

  return allSlots.map((time) => {
    const iso = slotIso(dateYMD, time)
    const available =
      new Date(iso).getTime() > now &&
      freeCount(male, iso) >= need.male &&
      freeCount(female, iso) >= need.female
    return { time, iso, available }
  })
}

/** Slots for a single guest of the given gender. */
export async function getAvailableSlots(dateYMD: string, treatmentId: string | null, gender: Gender): Promise<SlotInfo[]> {
  if (gender !== 'male' && gender !== 'female') return []
  return computeSlots(dateYMD, treatmentId, { male: gender === 'male' ? 1 : 0, female: gender === 'female' ? 1 : 0 })
}

/** Slots for a group needing `male` male + `female` female therapists together. */
export async function getAvailableSlotsForParty(
  dateYMD: string,
  treatmentId: string | null,
  male: number,
  female: number,
): Promise<SlotInfo[]> {
  return computeSlots(dateYMD, treatmentId, { male: Math.max(0, male | 0), female: Math.max(0, female | 0) })
}

export interface GroupGuest { name: string; gender: Gender; age?: number | null }

/**
 * Create a group / multi-guest booking — one appointment per guest, linked by a
 * shared group_id. Each guest is later assigned its own same-gender therapist;
 * payment is combined across the group. Treatments only (groups are payable).
 */
export async function createGroupBooking(input: {
  treatmentId: string
  preferredAt: string
  preferredAtAlt?: string | null
  patientPhone: string
  patientEmail?: string | null
  isGuest: boolean
  healthIntake?: HealthIntake | null
  acceptedPolicies: boolean
  guests: GroupGuest[]
}): Promise<CreateBookingResult> {
  if (!input.acceptedPolicies) return { error: 'Please accept the booking policies to continue.' }
  if (!input.patientPhone?.trim()) return { error: 'Please enter a contact number.' }
  if (!input.preferredAt) return { error: 'Please choose a preferred date and time.' }
  if (!input.treatmentId) return { error: 'Please choose a treatment.' }

  const guests = (input.guests ?? []).filter(
    (g) => g.name?.trim() && (g.gender === 'male' || g.gender === 'female'),
  )
  if (guests.length < 2) return { error: 'Add at least two guests (with name and gender) for a group booking.' }
  if (guests.length > 6) return { error: 'Up to 6 guests per group booking.' }

  const sb = admin()
  const { data: t, error: tErr } = await sb
    .from('treatments')
    .select('id, title, price_rm, booking_type, category_id, duration')
    .eq('id', input.treatmentId)
    .maybeSingle()
  if (tErr) return { error: tErr.message }
  if (!t) return { error: 'Treatment not found.' }
  if (t.booking_type === 'enquiry') return { error: 'This therapy is enquiry-only — please WhatsApp us to arrange it.' }

  let userId: string | null = null
  if (!input.isGuest) {
    const ssr = await createServerClient()
    const { data: auth } = await ssr.auth.getUser()
    userId = auth.user?.id ?? null
  }

  const price = t.price_rm ?? null
  const durationMins = parseDurationMins(t.duration)
  const groupId = crypto.randomUUID()

  const rows = guests.map((g) => ({
    customer_id: userId,
    is_guest: input.isGuest || !userId,
    booking_kind: 'treatment',
    treatment_id: t.id,
    treatment_category_id: t.category_id ?? null,
    treatment_name: t.title,
    duration_mins: durationMins,
    status: 'pending',
    requested_datetime: input.preferredAt,
    requested_datetime_alt: input.preferredAtAlt ?? null,
    appointment_date_time: input.preferredAt,
    patient_name: g.name.trim(),
    patient_phone: input.patientPhone.trim(),
    patient_email: input.patientEmail?.trim() || null,
    patient_gender: g.gender,
    gender_requirement: genderRequirementValue(g.gender),
    guest_age: g.age ?? null,
    group_id: groupId,
    pre_visit_form: input.healthIntake ?? {},
    payable_amount_rm: price,
    payment_status: 'unpaid',
  }))

  const { data, error } = await sb.from('appointments').insert(rows).select('id')
  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: 'Could not create the booking.' }

  const leadId = data[0].id as string
  await notifyRequestReceived({
    to: input.patientEmail,
    name: guests[0].name,
    treatmentName: `${t.title} (group of ${guests.length})`,
    kind: 'treatment',
    whenISO: input.preferredAt,
  })
  return { id: leadId, token: createBookingToken(leadId) }
}
