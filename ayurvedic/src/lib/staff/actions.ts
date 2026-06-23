'use server'

import { revalidatePath } from 'next/cache'
import type { BookingStatus } from '@/types/booking'
import { canTransition } from '@/lib/booking/status'
import { therapistMatchesRequirement } from '@/lib/booking/policy'
import { createBookingToken } from '@/lib/booking/token'
import { notifyApproved, notifyCancelled, BOOKING_SITE_URL } from '@/lib/booking/notify'
import { findClash, freeAtLabel, type Slot } from '@/lib/booking/scheduling'
import { therapistByCode } from './therapists'
import { requireStaff } from './guard'

type Ok = { ok: true }
type Err = { error: string }

/**
 * Approve a request and assign a therapist. Enforces the same-gender policy.
 * Treatment → awaiting_payment; consultation → confirmed (free).
 */
export async function approveAndAssign(
  id: string,
  p: { therapistCode: string; confirmedAt: string; room?: string },
): Promise<Ok | Err> {
  const { userId, db } = await requireStaff()
  if (!p.confirmedAt) return { error: 'Set the confirmed date & time.' }

  const therapist = therapistByCode(p.therapistCode)
  if (!therapist) return { error: 'Select a therapist.' }

  const { data: appt } = await db
    .from('appointments')
    .select('status, booking_kind, gender_requirement, duration_mins, patient_email, patient_name, treatment_name, payable_amount_rm')
    .eq('id', id)
    .maybeSingle()
  if (!appt) return { error: 'Appointment not found.' }

  if (!therapistMatchesRequirement(therapist.gender, appt.gender_requirement)) {
    const need = appt.gender_requirement === 'men_only' ? 'male' : 'female'
    return { error: `Same-gender policy: this patient must be assigned a ${need} therapist.` }
  }

  // Double-booking check: is this therapist free for the session + 30-min buffer?
  const durationMins = appt.duration_mins ?? 60
  const { data: others } = await db
    .from('appointments')
    .select('appointment_date_time, duration_mins')
    .eq('assigned_therapist_code', therapist.code)
    .in('status', ['scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress'])
    .neq('id', id)
  const busy: Slot[] = (others ?? [])
    .filter((o) => o.appointment_date_time)
    .map((o) => ({ startISO: o.appointment_date_time as string, durationMins: o.duration_mins ?? 60 }))
  const clash = findClash({ startISO: p.confirmedAt, durationMins }, busy)
  if (clash) {
    return { error: `${therapist.name} (${therapist.code}) is busy until ${freeAtLabel(clash)} — pick another therapist or time.` }
  }

  const to: BookingStatus = appt.booking_kind === 'consultation' ? 'confirmed' : 'awaiting_payment'
  if (!canTransition(appt.status as BookingStatus, to)) {
    return { error: `Cannot move ${appt.status} → ${to}.` }
  }

  const { error } = await db
    .from('appointments')
    .update({
      assigned_therapist_code: therapist.code,
      assigned_therapist_name: therapist.name,
      assigned_therapist_gender: therapist.gender,
      appointment_date_time: p.confirmedAt,
      duration_mins: durationMins,
      room: p.room?.trim() || null,
      approved_by: userId,
      approved_at: new Date().toISOString(),
      status: to,
    })
    .eq('id', id)
  if (error) return { error: error.message }

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

/** Generic guarded status change (check-in, complete, no-show, cancel, …). */
export async function setStatus(id: string, to: BookingStatus): Promise<Ok | Err> {
  const { db } = await requireStaff()
  const { data: appt } = await db.from('appointments').select('status').eq('id', id).maybeSingle()
  if (!appt) return { error: 'Appointment not found.' }
  if (!canTransition(appt.status as BookingStatus, to)) {
    return { error: `Cannot move ${appt.status} → ${to}.` }
  }
  const stamp: Record<string, string> = {}
  if (to === 'checked_in') stamp.checked_in_at = new Date().toISOString()
  if (to === 'completed') stamp.completed_at = new Date().toISOString()
  if (to === 'cancelled') stamp.cancelled_at = new Date().toISOString()
  const { error } = await db.from('appointments').update({ status: to, ...stamp }).eq('id', id)
  if (error) return { error: error.message }
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
    .select('status, patient_email, patient_name, treatment_name')
    .eq('id', id)
    .maybeSingle()
  if (!appt) return { error: 'Appointment not found.' }
  if (['cancelled', 'completed', 'no_show'].includes(appt.status as string)) {
    return { error: `Cannot reject a ${appt.status} booking.` }
  }

  const { error } = await db
    .from('appointments')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason?.trim() || 'Declined by clinic',
    })
    .eq('id', id)
  if (error) return { error: error.message }

  await notifyCancelled({
    to: appt.patient_email,
    name: appt.patient_name,
    treatmentName: appt.treatment_name,
    refundable: false,
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
  const { error } = await db
    .from('appointments')
    .update({ consultation_outcome: note, treatment_unlocked: true })
    .eq('id', consultationId)
  if (error) return { error: error.message }
  revalidatePath(`/doctor/${consultationId}`)
  return { ok: true }
}
