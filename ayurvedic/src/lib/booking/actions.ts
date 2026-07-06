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
import { findClash, canMatchParty, type Slot } from './scheduling'
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
  if (!input.patientEmail?.trim()) return { error: 'Please enter an email so we can send booking updates.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.patientEmail.trim())) return { error: 'Please enter a valid email address.' }
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
      // Consultations are conducted by the Vaidya — no same-gender therapist
      // matching applies, so they never carry a gender requirement.
      gender_requirement: isTreatment ? genderRequirementValue(input.patientGender) : 'any',
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
    .select('id, status, appointment_date_time, payment_status, customer_id, patient_email, patient_name, treatment_name, group_id')
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

  const cancelPatch = {
    status: 'cancelled' as const,
    cancelled_at: new Date().toISOString(),
    cancellation_reason: 'Cancelled by customer',
    internal_notes: wasPaid
      ? refundable
        ? 'Customer cancelled >12h before — refund eligible.'
        : 'Customer cancelled within 12h — non-refundable.'
      : null,
  }
  // A group booking cancels as one unit — never leave a single guest behind.
  const q = sb.from('appointments').update(cancelPatch)
  const { error } = a.group_id
    ? await q
        .eq('group_id', a.group_id)
        .in('status', ['pending', 'scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress'])
    : await q.eq('id', id)
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
  if (need.male + need.female === 0) return []

  let durationMins = 30
  if (treatmentId) {
    const { data: t } = await admin().from('treatments').select('duration').eq('id', treatmentId).maybeSingle()
    durationMins = t ? parseDurationMins(t.duration) : 60
  }

  // A same-treatment party is just a mixed party where every member of a gender
  // shares one duration — delegate so there's a single availability engine.
  const members: PartyMemberResolved[] = [
    ...Array.from({ length: need.male }, () => ({ gender: 'male' as Gender, durationMins })),
    ...Array.from({ length: need.female }, () => ({ gender: 'female' as Gender, durationMins })),
  ]
  return computeMixedSlots(dateYMD, members)
}

/** One guest of a group and the treatment they've chosen. */
export interface PartyMember {
  gender: Gender
  treatmentId: string | null
}
interface PartyMemberResolved {
  gender: Gender
  durationMins: number
}

/**
 * Slots for a mixed party — each guest may pick a DIFFERENT treatment. The whole
 * group starts at the same slot (shorter therapies simply finish earlier); a slot
 * is bookable only if every guest can be matched to a distinct same-gender
 * therapist who is free for that guest's own treatment length.
 */
export async function getAvailableSlotsForMixedParty(
  dateYMD: string,
  members: PartyMember[],
): Promise<SlotInfo[]> {
  const clean = members.filter((m) => m.gender === 'male' || m.gender === 'female')
  if (clean.length === 0) return []

  const ids = Array.from(new Set(clean.map((m) => m.treatmentId).filter((id): id is string => !!id)))
  const durById = new Map<string, number>()
  if (ids.length) {
    const { data } = await admin().from('treatments').select('id, duration').in('id', ids)
    for (const t of data ?? []) durById.set(t.id, parseDurationMins(t.duration))
  }
  const resolved: PartyMemberResolved[] = clean.map((m) => ({
    gender: m.gender,
    durationMins: m.treatmentId ? durById.get(m.treatmentId) ?? 60 : 60,
  }))
  return computeMixedSlots(dateYMD, resolved)
}

async function computeMixedSlots(dateYMD: string, members: PartyMemberResolved[]): Promise<SlotInfo[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateYMD)) return []
  const male = members.filter((m) => m.gender === 'male')
  const female = members.filter((m) => m.gender === 'female')
  if (male.length + female.length === 0) return []
  const sb = admin()

  const maleTh = male.length > 0 ? therapistsForGender('male') : []
  const femaleTh = female.length > 0 ? therapistsForGender('female') : []

  // The last bookable slot must respect the LONGEST treatment in the party, so
  // the longest therapy still fits before closing.
  const maxDuration = Math.max(30, ...members.map((m) => m.durationMins))
  const allSlots = slotsForDuration(maxDuration)

  // Can the roster ever satisfy this party? If not, nothing is bookable.
  if (male.length > maleTh.length || female.length > femaleTh.length) {
    return allSlots.map((time) => ({ time, iso: slotIso(dateYMD, time), available: false }))
  }

  const codes = [...maleTh, ...femaleTh].map((t) => t.code)
  const dayStartMs = new Date(`${dateYMD}T00:00:00+08:00`).getTime()
  const now = Date.now()
  const dayStart = new Date(dayStartMs).toISOString()
  const dayEnd = new Date(dayStartMs + 86_400_000).toISOString()
  const occupiedStatuses = ['scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress']

  // Read the payment-hold expiry too, so an approved-but-unpaid slot whose
  // 15-hour window has lapsed reopens immediately — without waiting for the
  // daily cleanup cron. Falls back gracefully if the column isn't there yet.
  type BusyRow = {
    appointment_date_time: string | null
    duration_mins: number | null
    assigned_therapist_code: string | null
    status?: string | null
    payment_expires_at?: string | null
  }
  let appts: BusyRow[] | null = null
  const enriched = await sb
    .from('appointments')
    .select('appointment_date_time, duration_mins, assigned_therapist_code, status, payment_expires_at')
    .in('assigned_therapist_code', codes)
    .in('status', occupiedStatuses)
    .gte('appointment_date_time', dayStart)
    .lt('appointment_date_time', dayEnd)
  if (enriched.error) {
    const basic = await sb
      .from('appointments')
      .select('appointment_date_time, duration_mins, assigned_therapist_code')
      .in('assigned_therapist_code', codes)
      .in('status', occupiedStatuses)
      .gte('appointment_date_time', dayStart)
      .lt('appointment_date_time', dayEnd)
    appts = basic.data
  } else {
    appts = enriched.data
  }

  const busyByCode = new Map<string, Slot[]>()
  for (const a of appts ?? []) {
    if (!a.assigned_therapist_code || !a.appointment_date_time) continue
    // Expired-but-unpaid hold no longer occupies the therapist.
    if (a.status === 'awaiting_payment' && a.payment_expires_at && new Date(a.payment_expires_at).getTime() <= now) continue
    const arr = busyByCode.get(a.assigned_therapist_code) ?? []
    arr.push({ startISO: a.appointment_date_time, durationMins: a.duration_mins ?? 60 })
    busyByCode.set(a.assigned_therapist_code, arr)
  }

  const blocks = await fetchBlocksOnOrAfter(sb, dateYMD)
  const intervals = blockedIntervalsForDate(blocks, dateYMD)

  const canServe = (code: string, durationMins: number, iso: string) =>
    findClash({ startISO: iso, durationMins }, busyByCode.get(code) ?? []) === null &&
    !isBlocked(intervals, code, iso, durationMins)

  const maleCodes = maleTh.map((t) => t.code)
  const femaleCodes = femaleTh.map((t) => t.code)
  const maleDurations = male.map((m) => m.durationMins)
  const femaleDurations = female.map((m) => m.durationMins)

  return allSlots.map((time) => {
    const iso = slotIso(dateYMD, time)
    const available =
      new Date(iso).getTime() > now &&
      canMatchParty(maleCodes, maleDurations, (code, d) => canServe(code, d, iso)) &&
      canMatchParty(femaleCodes, femaleDurations, (code, d) => canServe(code, d, iso))
    return { time, iso, available }
  })
}

/** Slots for a single guest of the given gender. */
export async function getAvailableSlots(dateYMD: string, treatmentId: string | null, gender: Gender): Promise<SlotInfo[]> {
  if (gender !== 'male' && gender !== 'female') return []
  return computeSlots(dateYMD, treatmentId, { male: gender === 'male' ? 1 : 0, female: gender === 'female' ? 1 : 0 })
}

const CONSULTATION_MINS = 30

/**
 * Slots for a free consultation. Consultations are conducted by the Vaidya, not
 * a therapist, so availability does NOT depend on the therapist roster or gender
 * — only on the Vaidya not already being in another consultation at that time.
 */
export async function getConsultationSlots(dateYMD: string): Promise<SlotInfo[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateYMD)) return []
  const sb = admin()
  const allSlots = slotsForDuration(CONSULTATION_MINS)
  const now = Date.now()

  const dayStartMs = new Date(`${dateYMD}T00:00:00+08:00`).getTime()
  const dayStart = new Date(dayStartMs).toISOString()
  const dayEnd = new Date(dayStartMs + 86_400_000).toISOString()
  const occupiedStatuses = ['scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress']

  // Other consultations already on the Vaidya's day — block overlapping starts.
  const { data: busyRows } = await sb
    .from('appointments')
    .select('appointment_date_time, duration_mins')
    .eq('booking_kind', 'consultation')
    .in('status', occupiedStatuses)
    .gte('appointment_date_time', dayStart)
    .lt('appointment_date_time', dayEnd)
  const busy: Slot[] = (busyRows ?? [])
    .filter((r) => r.appointment_date_time)
    .map((r) => ({ startISO: r.appointment_date_time as string, durationMins: r.duration_mins ?? CONSULTATION_MINS }))

  // Centre-wide closures (blocks with therapist_code = null) still apply to the
  // Vaidya. Passing an empty code means only all-therapist closures match.
  const blocks = await fetchBlocksOnOrAfter(sb, dateYMD)
  const intervals = blockedIntervalsForDate(blocks, dateYMD)

  return allSlots.map((time) => {
    const iso = slotIso(dateYMD, time)
    const available =
      new Date(iso).getTime() > now &&
      findClash({ startISO: iso, durationMins: CONSULTATION_MINS }, busy) === null &&
      !isBlocked(intervals, '', iso, CONSULTATION_MINS)
    return { time, iso, available }
  })
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

export interface GroupGuest {
  name: string
  gender: Gender
  age?: number | null
  /** Treatment this guest chose. Falls back to the booking's default treatment. */
  treatmentId?: string | null
  /** This guest's own preferred slot (ISO datetime) — guests may pick different times. */
  preferredAt: string
  /** This guest's own health intake. */
  healthIntake?: HealthIntake | null
}

/**
 * Create a group / multi-guest booking — one appointment per guest, linked by a
 * shared group_id. Each guest may choose a DIFFERENT treatment, is later assigned
 * its own same-gender therapist, and shares one combined payment across the group.
 * Treatments only (groups are payable).
 */
export async function createGroupBooking(input: {
  /** Default treatment for guests who didn't pick their own. */
  treatmentId: string
  patientPhone: string
  patientEmail?: string | null
  isGuest: boolean
  acceptedPolicies: boolean
  guests: GroupGuest[]
}): Promise<CreateBookingResult> {
  if (!input.acceptedPolicies) return { error: 'Please accept the booking policies to continue.' }
  if (!input.patientPhone?.trim()) return { error: 'Please enter a contact number.' }
  if (!input.patientEmail?.trim()) return { error: 'Please enter an email so we can send booking updates.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.patientEmail.trim())) return { error: 'Please enter a valid email address.' }
  if (!input.treatmentId) return { error: 'Please choose a treatment.' }

  const guests = (input.guests ?? []).filter(
    (g) => g.name?.trim() && (g.gender === 'male' || g.gender === 'female'),
  )
  if (guests.length < 2) return { error: 'Add at least two guests (with name and gender) for a group booking.' }
  if (guests.length > 6) return { error: 'Up to 6 guests per group booking.' }
  if (guests.some((g) => !g.preferredAt || Number.isNaN(new Date(g.preferredAt).getTime()))) {
    return { error: 'Please choose a date and time for every guest.' }
  }

  const sb = admin()

  // Resolve every treatment the group picked (each guest falls back to the
  // booking's default treatment) in a single lookup.
  const guestTreatmentIds = guests.map((g) => g.treatmentId?.trim() || input.treatmentId)
  const uniqueIds = Array.from(new Set(guestTreatmentIds))
  const { data: treatmentRows, error: tErr } = await sb
    .from('treatments')
    .select('id, title, price_rm, booking_type, category_id, duration')
    .in('id', uniqueIds)
  if (tErr) return { error: tErr.message }
  const byId = new Map((treatmentRows ?? []).map((t) => [t.id, t]))
  for (const id of uniqueIds) {
    const t = byId.get(id)
    if (!t) return { error: 'One of the chosen treatments could not be found.' }
    if (t.booking_type === 'enquiry') {
      return { error: `"${t.title}" is enquiry-only — please WhatsApp us to arrange it.` }
    }
  }

  let userId: string | null = null
  if (!input.isGuest) {
    const ssr = await createServerClient()
    const { data: auth } = await ssr.auth.getUser()
    userId = auth.user?.id ?? null
  }

  const groupId = crypto.randomUUID()

  const rows = guests.map((g, i) => {
    const t = byId.get(guestTreatmentIds[i])!
    return {
      customer_id: userId,
      is_guest: input.isGuest || !userId,
      booking_kind: 'treatment',
      treatment_id: t.id,
      treatment_category_id: t.category_id ?? null,
      treatment_name: t.title,
      duration_mins: parseDurationMins(t.duration),
      status: 'pending',
      requested_datetime: g.preferredAt,
      requested_datetime_alt: null,
      appointment_date_time: g.preferredAt,
      patient_name: g.name.trim(),
      patient_phone: input.patientPhone.trim(),
      patient_email: input.patientEmail?.trim() || null,
      patient_gender: g.gender,
      gender_requirement: genderRequirementValue(g.gender),
      guest_age: g.age ?? null,
      group_id: groupId,
      pre_visit_form: g.healthIntake ?? {},
      payable_amount_rm: t.price_rm ?? null,
      payment_status: 'unpaid',
    }
  })

  const { data, error } = await sb.from('appointments').insert(rows).select('id')
  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: 'Could not create the booking.' }

  // Summarise the therapies for the confirmation email: a single title when the
  // whole group shares one, otherwise "mixed therapies".
  const allSame = uniqueIds.length === 1
  const summary = allSame
    ? `${byId.get(uniqueIds[0])!.title} (group of ${guests.length})`
    : `Group of ${guests.length} · mixed therapies`

  const leadId = data[0].id as string
  await notifyRequestReceived({
    to: input.patientEmail,
    name: guests[0].name,
    treatmentName: summary,
    kind: 'treatment',
    whenISO: guests[0].preferredAt,
    guests: guests.map((g, i) => ({
      name: g.name,
      age: g.age ?? null,
      treatmentName: byId.get(guestTreatmentIds[i])!.title,
      whenISO: g.preferredAt,
    })),
  })
  return { id: leadId, token: createBookingToken(leadId) }
}
