'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSb } from '@supabase/supabase-js'
import type { BookingRequestInput } from '@/types/booking'
import { genderRequirementValue, canCancel } from './policy'

/** Service-role client — bypasses RLS for guest bookings + server writes. */
function admin() {
  return createSb(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

export type CreateBookingResult = { id: string } | { error: string }

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
    booking_type: string | null; category_id: string | null
  } | null = null
  if (input.treatmentId) {
    const { data, error: tErr } = await sb
      .from('treatments')
      .select('id, title, price_rm, booking_type, category_id')
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

  const { data, error } = await sb
    .from('appointments')
    .insert({
      customer_id: userId,
      is_guest: input.isGuest || !userId,
      booking_kind: input.bookingKind,
      treatment_id: t?.id ?? null,
      treatment_category_id: t?.category_id ?? null,
      treatment_name: treatmentName,
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
  return { id: data.id as string }
}

export type CancelResult = { ok: true; refundable: boolean } | { error: string }

/**
 * Customer-initiated cancellation. Enforces the 12-hour rule: cancellations
 * within 12h of the appointment are non-refundable. Refunds (when eligible)
 * are processed manually for now.
 */
export async function cancelBooking(id: string): Promise<CancelResult> {
  const sb = admin()
  const { data: a } = await sb
    .from('appointments')
    .select('id, status, appointment_date_time, payment_status')
    .eq('id', id)
    .maybeSingle()
  if (!a) return { error: 'Booking not found.' }
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
  return { ok: true, refundable }
}
