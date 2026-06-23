'use server'

import { revalidatePath } from 'next/cache'
import type { BookingStatus, Gender } from '@/types/booking'
import { canTransition } from '@/lib/booking/status'
import { therapistMatchesRequirement } from '@/lib/booking/policy'
import { requireStaff } from './guard'

type Ok = { ok: true }
type Err = { error: string }

/**
 * Approve a request and assign a therapist. Enforces the same-gender policy.
 * Treatment → awaiting_payment; consultation → confirmed (free).
 */
export async function approveAndAssign(
  id: string,
  p: { therapistName: string; therapistGender: Gender; confirmedAt: string; room?: string },
): Promise<Ok | Err> {
  const { userId, db } = await requireStaff()
  if (!p.therapistName?.trim()) return { error: 'Enter the therapist name.' }
  if (!p.confirmedAt) return { error: 'Set the confirmed date & time.' }

  const { data: appt } = await db
    .from('appointments')
    .select('status, booking_kind, gender_requirement')
    .eq('id', id)
    .maybeSingle()
  if (!appt) return { error: 'Appointment not found.' }

  if (!therapistMatchesRequirement(p.therapistGender, appt.gender_requirement)) {
    const need = appt.gender_requirement === 'men_only' ? 'male' : 'female'
    return { error: `Same-gender policy: this patient must be assigned a ${need} therapist.` }
  }

  const to: BookingStatus = appt.booking_kind === 'consultation' ? 'confirmed' : 'awaiting_payment'
  if (!canTransition(appt.status as BookingStatus, to)) {
    return { error: `Cannot move ${appt.status} → ${to}.` }
  }

  const { error } = await db
    .from('appointments')
    .update({
      assigned_therapist_name: p.therapistName.trim(),
      assigned_therapist_gender: p.therapistGender,
      appointment_date_time: p.confirmedAt,
      room: p.room?.trim() || null,
      approved_by: userId,
      approved_at: new Date().toISOString(),
      status: to,
    })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/console')
  revalidatePath(`/console/${id}`)
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
