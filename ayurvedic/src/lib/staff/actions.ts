'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import type { BookingKind, BookingStatus } from '@/types/booking'
import { canTransition } from '@/lib/booking/status'
import { mapOperationalTransitionWriteFailure, validateOperationalTransition } from '@/lib/booking/operations'
import { canClearConsultation, CLEARABLE_CONSULTATION_STATUSES } from '@/lib/booking/consultation-rules'
import { therapistMatchesRequirement } from '@/lib/booking/policy'
import { createBookingToken } from '@/lib/booking/token'
import { notifyApproved, notifyCancelled, BOOKING_SITE_URL } from '@/lib/booking/notify'
import { voidBill } from '@/lib/booking/payment'
import { findClash, freeAtLabel, type Slot } from '@/lib/booking/scheduling'
import { fetchBlocksOnOrAfter, blockedIntervalsForDate, isBlocked } from '@/lib/booking/blocks'
import { mytDayKey } from '@/lib/datetime'
import { therapistByCode } from './therapists'
import { requireStaff } from './guard'

type Ok = { ok: true }
type Err = { error: string }

/**
 * Approve a request. Treatments get a same-gender therapist assigned (with
 * clash/leave checks) and move to awaiting_payment. Consultations are conducted
 * by the Vaidya — no therapist is assigned; they move straight to confirmed
 * (free), guarded only against the Vaidya being double-booked.
 */
export async function approveAndAssign(
  id: string,
  p: { therapistCode: string; confirmedAt: string; room?: string },
): Promise<Ok | Err> {
  const { userId, db } = await requireStaff()
  if (!p.confirmedAt) return { error: 'Set the confirmed date & time.' }

  const { data: appt } = await db
    .from('appointments')
    .select('status, booking_kind, gender_requirement, duration_mins, patient_email, patient_name, treatment_name, payable_amount_rm')
    .eq('id', id)
    .maybeSingle()
  if (!appt) return { error: 'Appointment not found.' }

  const isConsultation = appt.booking_kind === 'consultation'
  const durationMins = appt.duration_mins ?? (isConsultation ? 30 : 60)

  // Therapist assignment applies to TREATMENTS only. A consultation is conducted
  // by the Vaidya — no therapist, no same-gender matching, no therapist roster.
  let therapist: ReturnType<typeof therapistByCode>
  if (isConsultation) {
    // Vaidya double-booking guard: no two consultations may overlap (one Vaidya).
    const { data: others } = await db
      .from('appointments')
      .select('appointment_date_time, duration_mins')
      .eq('booking_kind', 'consultation')
      .in('status', ['scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress'])
      .neq('id', id)
    const busy: Slot[] = (others ?? [])
      .filter((o) => o.appointment_date_time)
      .map((o) => ({ startISO: o.appointment_date_time as string, durationMins: o.duration_mins ?? 30 }))
    const clash = findClash({ startISO: p.confirmedAt, durationMins }, busy)
    if (clash) {
      return { error: `The Vaidya already has a consultation until ${freeAtLabel(clash)} — pick another time.` }
    }

    // Centre-wide closures still apply to the Vaidya (empty code = closures only).
    const blocks = await fetchBlocksOnOrAfter(db, mytDayKey(p.confirmedAt))
    const intervals = blockedIntervalsForDate(blocks, mytDayKey(p.confirmedAt))
    if (isBlocked(intervals, '', p.confirmedAt, durationMins)) {
      return { error: 'The centre is closed at that time — pick another slot.' }
    }
  } else {
    therapist = therapistByCode(p.therapistCode)
    if (!therapist) return { error: 'Select a therapist.' }

    if (!therapistMatchesRequirement(therapist.gender, appt.gender_requirement)) {
      const need = appt.gender_requirement === 'men_only' ? 'male' : 'female'
      return { error: `Same-gender policy: this patient must be assigned a ${need} therapist.` }
    }

    // Double-booking check: is this therapist free for the session + 30-min buffer?
    const { data: others } = await db
      .from('appointments')
      .select('appointment_date_time, duration_mins, status, payment_expires_at')
      .eq('assigned_therapist_code', therapist.code)
      .in('status', ['scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress'])
      .neq('id', id)
    const nowMs = Date.now()
    const busy: Slot[] = (others ?? [])
      .filter((o) => o.appointment_date_time)
      // An expired-but-unpaid hold no longer occupies the therapist (matches slot display).
      .filter((o) => !(o.status === 'awaiting_payment' && o.payment_expires_at && new Date(o.payment_expires_at).getTime() <= nowMs))
      .map((o) => ({ startISO: o.appointment_date_time as string, durationMins: o.duration_mins ?? 60 }))
    const clash = findClash({ startISO: p.confirmedAt, durationMins }, busy)
    if (clash) {
      return { error: `${therapist.name} (${therapist.code}) is busy until ${freeAtLabel(clash)} — pick another therapist or time.` }
    }

    // Leave / blocked windows: don't allow assigning a therapist who's off.
    const blocks = await fetchBlocksOnOrAfter(db, mytDayKey(p.confirmedAt))
    const intervals = blockedIntervalsForDate(blocks, mytDayKey(p.confirmedAt))
    if (isBlocked(intervals, therapist.code, p.confirmedAt, durationMins)) {
      return { error: `${therapist.name} (${therapist.code}) is on leave / blocked at that time — pick another therapist or time.` }
    }
  }

  const to: BookingStatus = isConsultation ? 'confirmed' : 'awaiting_payment'
  if (!canTransition(appt.status as BookingStatus, to)) {
    return { error: `Cannot move ${appt.status} → ${to}.` }
  }

  const { error } = await db
    .from('appointments')
    .update({
      // Consultations carry no therapist; treatments get the assigned one.
      assigned_therapist_code: therapist?.code ?? null,
      assigned_therapist_name: therapist?.name ?? null,
      assigned_therapist_gender: therapist?.gender ?? null,
      appointment_date_time: p.confirmedAt,
      duration_mins: durationMins,
      room: p.room?.trim() || null,
      approved_by: userId,
      approved_at: new Date().toISOString(),
      status: to,
    })
    .eq('id', id)
  if (error) {
    // DB exclusion constraint caught a concurrent double-book (23P01).
    if (error.code === '23P01') {
      return { error: 'That therapist was just booked for this time — pick another therapist or time.' }
    }
    return { error: error.message }
  }

  // Treatments get a 15-hour window to pay before the slot is auto-released.
  // Best-effort: harmless no-op until the payment_expiry migration is applied.
  if (to === 'awaiting_payment') {
    const expiresAt = new Date(Date.now() + 15 * 3600_000).toISOString()
    await db.from('appointments').update({ payment_expires_at: expiresAt, payment_reminded: false }).eq('id', id)
  }

  // Link straight to the payment route (one click → Billplz), not the status page.
  const payUrl =
    to === 'awaiting_payment'
      ? `${BOOKING_SITE_URL}/book/request/${id}/pay?t=${createBookingToken(id)}`
      : null
  await notifyApproved({
    to: appt.patient_email,
    name: appt.patient_name,
    treatmentName: appt.treatment_name,
    kind: appt.booking_kind,
    whenISO: p.confirmedAt,
    amountRm: appt.payable_amount_rm != null ? Number(appt.payable_amount_rm) : null,
    payUrl,
  })

  revalidatePath('/console')
  revalidatePath(`/console/${id}`)
  revalidatePath('/doctor')
  revalidatePath(`/doctor/${id}`)
  return { ok: true }
}

/**
 * Approve a whole group booking in ONE action. Each guest gets their OWN
 * confirmed time and a same-gender therapist, and the entire group moves to
 * awaiting_payment together. Payment is combined across the group, so a single
 * payment then confirms everyone. The same therapist may serve two guests as
 * long as their sessions (plus buffer) don't overlap.
 */
export async function approveGroup(
  groupId: string,
  p: { room?: string; assignments: { id: string; therapistCode: string; confirmedAt: string }[] },
): Promise<Ok | Err> {
  const { userId, db } = await requireStaff()
  if (!groupId) return { error: 'Missing group.' }

  const { data: members } = await db
    .from('appointments')
    .select('id, status, gender_requirement, duration_mins, patient_name, patient_email, treatment_name, payable_amount_rm, guest_age')
    .eq('group_id', groupId)
  if (!members || members.length === 0) return { error: 'Group not found.' }

  const pending = members.filter((m) => m.status === 'pending' || m.status === 'scheduled')
  if (pending.length === 0) return { error: 'This group has already been processed.' }

  // Every pending guest must have a therapist AND a confirmed time.
  const byId = new Map(p.assignments.map((a) => [a.id, a]))
  for (const m of pending) {
    const a = byId.get(m.id)
    if (!a?.therapistCode) return { error: 'Assign a therapist for every guest.' }
    if (!a.confirmedAt || Number.isNaN(new Date(a.confirmedAt).getTime())) {
      return { error: `Set the confirmed date & time for ${m.patient_name ?? 'every guest'}.` }
    }
  }

  // A therapist may serve several guests in this group, but their sessions
  // (plus the standard buffer) must not overlap.
  const byTherapist = new Map<string, { name: string | null; slot: Slot }[]>()
  for (const m of pending) {
    const a = byId.get(m.id)!
    const list = byTherapist.get(a.therapistCode) ?? []
    list.push({ name: m.patient_name, slot: { startISO: a.confirmedAt, durationMins: m.duration_mins ?? 60 } })
    byTherapist.set(a.therapistCode, list)
  }
  for (const [code, sessions] of Array.from(byTherapist.entries())) {
    for (let i = 0; i < sessions.length; i++) {
      const clash = findClash(sessions[i].slot, sessions.filter((_, j) => j !== i).map((s) => s.slot))
      if (clash) {
        const t = therapistByCode(code)
        return { error: `${t ? t.name : code} is assigned to two guests whose sessions overlap — stagger the times (30-min gap between sessions) or pick another therapist.` }
      }
    }
  }

  // Schedule blocks from the earliest confirmed day onward cover every guest's own day.
  const earliestAt = p.assignments.map((a) => a.confirmedAt).sort()[0]
  const blocks = await fetchBlocksOnOrAfter(db, mytDayKey(earliestAt))

  // Validate every assignment before writing anything.
  for (const m of pending) {
    const a = byId.get(m.id)!
    const therapist = therapistByCode(a.therapistCode)
    if (!therapist) return { error: 'Unknown therapist selected.' }
    if (!therapistMatchesRequirement(therapist.gender, m.gender_requirement)) {
      const need = m.gender_requirement === 'men_only' ? 'male' : 'female'
      return { error: `${m.patient_name ?? 'A guest'} needs a ${need} therapist.` }
    }
    const durationMins = m.duration_mins ?? 60
    // Busy windows from OTHER bookings (this group's own rows are excluded —
    // within-group overlaps were already checked from the proposed assignments).
    const { data: others } = await db
      .from('appointments')
      .select('appointment_date_time, duration_mins, group_id, status, payment_expires_at')
      .eq('assigned_therapist_code', therapist.code)
      .in('status', ['scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress'])
    const nowMs = Date.now()
    const busy: Slot[] = (others ?? [])
      .filter((o) => o.appointment_date_time && o.group_id !== groupId)
      // An expired-but-unpaid hold no longer occupies the therapist.
      .filter((o) => !(o.status === 'awaiting_payment' && o.payment_expires_at && new Date(o.payment_expires_at).getTime() <= nowMs))
      .map((o) => ({ startISO: o.appointment_date_time as string, durationMins: o.duration_mins ?? 60 }))
    const clash = findClash({ startISO: a.confirmedAt, durationMins }, busy)
    if (clash) return { error: `${therapist.name} (${therapist.code}) is busy until ${freeAtLabel(clash)} — pick another therapist or time.` }
    const intervals = blockedIntervalsForDate(blocks, mytDayKey(a.confirmedAt))
    if (isBlocked(intervals, therapist.code, a.confirmedAt, durationMins)) {
      return { error: `${therapist.name} (${therapist.code}) is on leave / blocked at that time — pick another therapist or time.` }
    }
    if (!canTransition(m.status as BookingStatus, 'awaiting_payment')) {
      return { error: `Cannot move ${m.status} → awaiting_payment.` }
    }
  }

  // All checks passed — assign + confirm every guest. Track the writes so a
  // mid-loop failure can be rolled back (no half-approved, unpayable group).
  const approvedAt = new Date().toISOString()
  const doneIds: string[] = []
  for (const m of pending) {
    const a = byId.get(m.id)!
    const therapist = therapistByCode(a.therapistCode)!
    const { error } = await db
      .from('appointments')
      .update({
        assigned_therapist_code: therapist.code,
        assigned_therapist_name: therapist.name,
        assigned_therapist_gender: therapist.gender,
        appointment_date_time: a.confirmedAt,
        duration_mins: m.duration_mins ?? 60,
        room: p.room?.trim() || null,
        approved_by: userId,
        approved_at: approvedAt,
        status: 'awaiting_payment',
      })
      .eq('id', m.id)
    if (error) {
      // Revert the guests already flipped so the whole group stays pending
      // and can be re-approved cleanly, rather than getting stuck unpayable.
      if (doneIds.length) {
        await db
          .from('appointments')
          .update({
            status: 'pending',
            assigned_therapist_code: null,
            assigned_therapist_name: null,
            assigned_therapist_gender: null,
            approved_by: null,
            approved_at: null,
          })
          .in('id', doneIds)
      }
      if (error.code === '23P01') {
        return { error: 'A therapist was just booked for this time by someone else — please re-assign and try again.' }
      }
      return { error: error.message }
    }
    doneIds.push(m.id)
  }

  // 15-hour payment hold for the whole group. Best-effort: harmless no-op until
  // the payment_expiry migration is applied.
  const expiresAt = new Date(Date.now() + 15 * 3600_000).toISOString()
  await db
    .from('appointments')
    .update({ payment_expires_at: expiresAt, payment_reminded: false })
    .eq('group_id', groupId)
    .eq('status', 'awaiting_payment')

  // One combined approval email — the lead guest pays for the whole group.
  const lead = pending[0]
  const totalRm = pending.reduce((s, m) => s + (m.payable_amount_rm != null ? Number(m.payable_amount_rm) : 0), 0)
  const payUrl = `${BOOKING_SITE_URL}/book/request/${lead.id}/pay?t=${createBookingToken(lead.id)}`
  await notifyApproved({
    to: lead.patient_email,
    name: lead.patient_name,
    treatmentName: `${lead.treatment_name ?? 'Treatment'} (group of ${pending.length})`,
    kind: 'treatment',
    whenISO: byId.get(lead.id)!.confirmedAt,
    amountRm: totalRm || null,
    payUrl,
    guests: pending.map((m) => ({
      name: m.patient_name,
      age: m.guest_age != null ? Number(m.guest_age) : null,
      treatmentName: m.treatment_name,
      whenISO: byId.get(m.id)!.confirmedAt,
    })),
  })

  revalidatePath('/console')
  revalidatePath('/doctor')
  for (const m of pending) {
    revalidatePath(`/console/${m.id}`)
    revalidatePath(`/doctor/${m.id}`)
  }
  return { ok: true }
}

/** Reject every still-open guest in a group, with one reason + one notification. */
export async function rejectGroup(groupId: string, reason?: string): Promise<Ok | Err> {
  const { db } = await requireStaff()
  if (!groupId) return { error: 'Missing group.' }
  const { data: members } = await db
    .from('appointments')
    .select('id, status, patient_email, patient_name, treatment_name, payment_bill_id, payment_status, payment_provider')
    .eq('group_id', groupId)
  if (!members || members.length === 0) return { error: 'Group not found.' }

  const actionable = members.filter((m) => !['cancelled', 'completed', 'no_show'].includes(m.status as string))
  if (actionable.length === 0) return { error: 'Nothing to reject in this group.' }

  const finalReason = reason?.trim() || 'Declined by clinic'
  const { error } = await db
    .from('appointments')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: finalReason })
    .eq('group_id', groupId)
    .in('status', ['pending', 'scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress'])
  if (error) return { error: error.message }

  // Void any open bill so the rejected group can never be paid for.
  const openBills = new Map<string, string | null>()
  for (const m of actionable) {
    if (m.payment_bill_id && m.payment_status !== 'paid') openBills.set(m.payment_bill_id, m.payment_provider)
  }
  for (const [billId, providerName] of Array.from(openBills)) await voidBill(billId, providerName)

  const lead = actionable[0]
  await notifyCancelled({
    to: lead.patient_email,
    name: lead.patient_name,
    treatmentName: `${lead.treatment_name ?? 'Treatment'} (group)`,
    refundable: false,
    reason: finalReason,
  })

  revalidatePath('/console')
  revalidatePath('/doctor')
  return { ok: true }
}

/**
 * Flag a pending request as contacted (e.g. clarified via WhatsApp) so admin can
 * see the centre has already acted on it. Groups are flagged as one unit.
 * Requires the 20260712_contacted_flag migration.
 */
export async function markContacted(id: string): Promise<Ok | Err> {
  const { userId, db } = await requireStaff()
  const { data: appt } = await db.from('appointments').select('status, group_id').eq('id', id).maybeSingle()
  if (!appt) return { error: 'Appointment not found.' }
  if (appt.status !== 'pending' && appt.status !== 'scheduled') {
    return { error: 'Only open requests can be marked as contacted.' }
  }
  const patch = { contacted_at: new Date().toISOString(), contacted_by: userId }
  const q = db.from('appointments').update(patch)
  const { error } = appt.group_id ? await q.eq('group_id', appt.group_id) : await q.eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/console')
  revalidatePath(`/console/${id}`)
  revalidatePath('/doctor')
  revalidatePath(`/doctor/${id}`)
  return { ok: true }
}

/** Generic guarded status change (check-in, complete, no-show, cancel, …). */
export async function setStatus(id: string, to: BookingStatus): Promise<Ok | Err> {
  const { db } = await requireStaff()
  const { data: appt } = await db.from('appointments').select('status, booking_kind, assigned_therapist_code, group_id, payment_bill_id, payment_status, payment_provider').eq('id', id).maybeSingle()
  if (!appt) return { error: 'Appointment not found.' }
  // A group awaiting payment is billed as one unit — removing one guest mid-payment
  // would desync the shared bill. Cancel the whole group instead.
  if (appt.group_id && appt.status === 'awaiting_payment' && (to === 'cancelled' || to === 'no_show')) {
    return { error: 'This guest is part of a group awaiting payment — use “Reject group” to cancel them together.' }
  }
  if (!canTransition(appt.status as BookingStatus, to)) {
    return { error: `Cannot move ${appt.status} → ${to}.` }
  }
  const operationalTransition = validateOperationalTransition({
    bookingKind: appt.booking_kind as BookingKind,
    assignedTherapistCode: appt.assigned_therapist_code,
    to,
  })
  if ('error' in operationalTransition) return { error: operationalTransition.error }
  const stamp: Record<string, string> = {}
  if (to === 'checked_in') stamp.checked_in_at = new Date().toISOString()
  if (to === 'completed') stamp.completed_at = new Date().toISOString()
  if (to === 'cancelled') stamp.cancelled_at = new Date().toISOString()
  // Only checked_in/in_progress can be rejected by the therapist-assignment
  // invariant, so only those re-check status and verify a row changed. Other
  // transitions keep the plain update, matching this task's actual scope.
  if (to === 'checked_in' || to === 'in_progress') {
    const { data: updated, error } = await db
      .from('appointments')
      .update({ status: to, ...stamp })
      .eq('id', id)
      .eq('status', appt.status)
      .select('id')
      .maybeSingle()
    const writeFailure = mapOperationalTransitionWriteFailure({ error, updated: !!updated })
    if (writeFailure) return { error: writeFailure }
  } else {
    const { error } = await db.from('appointments').update({ status: to, ...stamp }).eq('id', id)
    if (error) return { error: error.message }
  }
  if ((to === 'cancelled' || to === 'no_show') && appt.payment_bill_id && appt.payment_status !== 'paid') {
    await voidBill(appt.payment_bill_id, appt.payment_provider)
  }
  revalidatePath('/console')
  revalidatePath('/doctor')
  revalidatePath(`/console/${id}`)
  return { ok: true }
}

/**
 * Reject a request: declines it but keeps the record (status → cancelled with a
 * reason). The customer is notified. Use this for requests you won't fulfil.
 */
export async function rejectBooking(id: string, reason?: string): Promise<Ok | Err> {
  const { db } = await requireStaff()
  const { data: appt } = await db
    .from('appointments')
    .select('status, group_id, patient_email, patient_name, treatment_name, payment_bill_id, payment_status, payment_provider')
    .eq('id', id)
    .maybeSingle()
  if (!appt) return { error: 'Appointment not found.' }
  if (['cancelled', 'completed', 'no_show'].includes(appt.status as string)) {
    return { error: `Cannot reject a ${appt.status} booking.` }
  }
  // Keep group bills consistent — once approved, reject the whole group, not one guest.
  if (appt.group_id && appt.status === 'awaiting_payment') {
    return { error: 'This guest is part of a group awaiting payment — use “Reject group” instead.' }
  }

  const finalReason = reason?.trim() || 'Declined by clinic'
  const { error } = await db
    .from('appointments')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: finalReason,
    })
    .eq('id', id)
  if (error) return { error: error.message }

  if (appt.payment_bill_id && appt.payment_status !== 'paid') {
    await voidBill(appt.payment_bill_id, appt.payment_provider)
  }
  await notifyCancelled({
    to: appt.patient_email,
    name: appt.patient_name,
    treatmentName: appt.treatment_name,
    refundable: false,
    reason: finalReason,
  })

  revalidatePath('/console')
  revalidatePath('/doctor')
  revalidatePath(`/console/${id}`)
  return { ok: true }
}

/**
 * Permanently delete an appointment record. Destructive — for spam / test /
 * duplicate entries. Admin or front desk only.
 */
export async function deleteBooking(id: string): Promise<Ok | Err> {
  const { db } = await requireStaff(['admin', 'front_desk'])
  const { error } = await db.from('appointments').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/console')
  revalidatePath('/doctor')
  return { ok: true }
}

/** Doctor/admin saves clinical notes (vaidya-only field). */
export async function saveClinicalNotes(id: string, notes: string): Promise<Ok | Err> {
  const { db } = await requireStaff(['admin', 'doctor'])
  const { error } = await db.from('appointments').update({ clinical_notes: notes }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/doctor/${id}`)
  return { ok: true }
}

/**
 * After a consultation, the practitioner clears the patient for a treatment.
 * Records the outcome and flags it so the treatment booking can proceed.
 */
export async function unlockTreatment(consultationId: string, note: string): Promise<Ok | Err> {
  const { db } = await requireStaff(['admin', 'doctor'])
  const outcome = note.trim()
  if (!outcome) return { error: 'Record the consultation outcome before clearing treatment.' }

  const nowMs = Date.now()
  const { data: consultation, error: lookupError } = await db
    .from('appointments')
    .select('booking_kind, status, appointment_date_time')
    .eq('id', consultationId)
    .maybeSingle()
  if (lookupError) return { error: lookupError.message }
  if (!consultation) return { error: 'Consultation not found.' }
  if (!canClearConsultation({
    bookingKind: consultation.booking_kind as BookingKind,
    status: consultation.status as BookingStatus,
    appointmentISO: consultation.appointment_date_time,
    nowMs,
  })) {
    return { error: 'Only an attended consultation at or after its appointment time can be cleared.' }
  }

  const { data: updated, error } = await db
    .from('appointments')
    .update({ consultation_outcome: outcome, treatment_unlocked: true })
    .eq('id', consultationId)
    .eq('booking_kind', 'consultation')
    .in('status', CLEARABLE_CONSULTATION_STATUSES)
    .lte('appointment_date_time', new Date(nowMs).toISOString())
    .select('id')
    .maybeSingle()
  if (error) return { error: error.message }
  if (!updated) return { error: 'This consultation is no longer eligible for clearance.' }
  revalidatePath(`/doctor/${consultationId}`)
  return { ok: true }
}

/* ── Schedule blocks (staff leave / closures / manual blocks) ───────── */

export interface BlockInput {
  therapistCode: string | null // null = all therapists / centre closed
  startAt: string
  endAt: string
  allDay: boolean
  recurrence: 'none' | 'weekly' | 'monthly'
  untilDate: string | null
  reason: string
}

/** 'YYYY-MM-DD' + n days, in Malaysia time. */
function shiftDayMYT(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00+08:00`)
  d.setDate(d.getDate() + days)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

export async function createBlock(input: BlockInput): Promise<Ok | Err> {
  const { userId, db } = await requireStaff(['admin', 'front_desk'])
  if (!input.startAt || !input.endAt) return { error: 'Start and end times are required.' }
  if (new Date(input.endAt).getTime() <= new Date(input.startAt).getTime()) {
    return { error: 'End must be after start.' }
  }

  // No double-blocking: reject a block whose window is already covered for the
  // same therapist (or centre-wide). Recurring inputs are checked on their first
  // occurrence; multi-day spans are checked day by day (capped at 62 days).
  const existing = await fetchBlocksOnOrAfter(db, mytDayKey(input.startAt))
  const newStartMs = new Date(input.startAt).getTime()
  const newEndMs = new Date(input.endAt).getTime()
  const lastDay = mytDayKey(input.endAt)
  let day = mytDayKey(input.startAt)
  for (let i = 0; i < 62 && day <= lastDay; i++, day = shiftDayMYT(day, 1)) {
    const dayStartMs = new Date(`${day}T00:00:00+08:00`).getTime()
    const dayEndMs = dayStartMs + 86_400_000
    const sMs = input.allDay ? dayStartMs : Math.max(newStartMs, dayStartMs)
    const eMs = input.allDay ? dayEndMs : Math.min(newEndMs, dayEndMs)
    const clash = blockedIntervalsForDate(existing, day).find(
      (iv) =>
        sMs < iv.endMs &&
        iv.startMs < eMs &&
        (input.therapistCode ? iv.therapistCode === null || iv.therapistCode === input.therapistCode : iv.therapistCode === null),
    )
    if (clash) {
      const t = clash.therapistCode ? therapistByCode(clash.therapistCode) : null
      const who = clash.therapistCode === null ? 'the whole centre' : t?.name ?? clash.therapistCode
      return {
        error: `That time is already blocked for ${who}${clash.reason ? ` (${clash.reason})` : ''} — tap the existing block to edit or remove it.`,
      }
    }
  }

  const { error } = await db.from('schedule_blocks').insert({
    therapist_code: input.therapistCode || null,
    start_at: input.startAt,
    end_at: input.endAt,
    all_day: input.allDay,
    recurrence: input.recurrence,
    until_date: input.untilDate || null,
    reason: input.reason?.trim() || null,
    created_by: userId,
  })
  if (error) return { error: error.message }
  revalidatePath('/console/blocks')
  revalidatePath('/console/schedule')
  return { ok: true }
}

export async function deleteBlock(id: string): Promise<Ok | Err> {
  const { db } = await requireStaff(['admin', 'front_desk'])
  const { error } = await db.from('schedule_blocks').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/console/blocks')
  revalidatePath('/console/schedule')
  return { ok: true }
}

/** Edit the reason shown on an existing block (from the schedule grid). */
export async function updateBlockReason(id: string, reason: string): Promise<Ok | Err> {
  const { db } = await requireStaff(['admin', 'front_desk'])
  if (!id) return { error: 'Missing block.' }
  const { error } = await db.from('schedule_blocks').update({ reason: reason.trim() || null }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/console/blocks')
  revalidatePath('/console/schedule')
  return { ok: true }
}

/* ── Customer announcements (public banner) ─────────────────────────── */

export interface AnnouncementInput {
  kind: 'closure' | 'message'
  message: string
  /** Required for closures. 'YYYY-MM-DD'. */
  startDate: string | null
  endDate: string | null
}

/**
 * Publish an announcement. A 'closure' also creates a linked centre-closed
 * all-day block so customers can't book those dates; a 'message' is banner-only.
 */
export async function createAnnouncement(input: AnnouncementInput): Promise<Ok | Err> {
  const { userId, db } = await requireStaff(['admin', 'front_desk'])
  const message = input.message?.trim()
  if (!message) return { error: 'Enter a message.' }
  if (input.kind === 'closure' && !input.startDate) return { error: 'Pick the closure date.' }
  if (input.endDate && input.startDate && input.endDate < input.startDate) {
    return { error: 'End date must be on or after the start date.' }
  }

  let blockId: string | null = null
  if (input.kind === 'closure') {
    const start = input.startDate as string
    const end = input.endDate || start
    const { data: block, error: bErr } = await db
      .from('schedule_blocks')
      .insert({
        therapist_code: null, // whole centre
        start_at: new Date(`${start}T00:00:00+08:00`).toISOString(),
        end_at: new Date(`${end}T23:59:00+08:00`).toISOString(),
        all_day: true,
        recurrence: 'none',
        until_date: null,
        reason: message,
        created_by: userId,
      })
      .select('id')
      .single()
    if (bErr) return { error: bErr.message }
    blockId = block.id as string
  }

  const { error } = await db.from('announcements').insert({
    kind: input.kind,
    message,
    start_date: input.startDate || null,
    end_date: input.endDate || null,
    block_id: blockId,
    created_by: userId,
  })
  if (error) return { error: error.message }
  revalidatePath('/console/announcements')
  revalidateTag('announcements')
  return { ok: true }
}

/** Remove an announcement. A closure also deletes its block, reopening bookings. */
export async function deleteAnnouncement(id: string): Promise<Ok | Err> {
  const { db } = await requireStaff(['admin', 'front_desk'])
  const { data: a } = await db.from('announcements').select('block_id').eq('id', id).maybeSingle()
  const { error } = await db.from('announcements').delete().eq('id', id)
  if (error) return { error: error.message }
  if (a?.block_id) await db.from('schedule_blocks').delete().eq('id', a.block_id)
  revalidatePath('/console/announcements')
  revalidateTag('announcements')
  return { ok: true }
}
