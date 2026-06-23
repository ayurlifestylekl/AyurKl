import type { BookingKind, BookingStatus, Gender, PaymentStatus, StaffAppointment } from '@/types/booking'

/** Columns needed to build a StaffAppointment. */
export const APPOINTMENT_COLUMNS =
  `id, booking_kind, status, payment_status, treatment_name, treatment_id,
   patient_name, patient_phone, patient_gender, gender_requirement,
   requested_datetime, requested_datetime_alt, appointment_date_time,
   assigned_therapist_code, assigned_therapist_name, assigned_therapist_gender, duration_mins, payable_amount_rm,
   room, is_guest, customer_id, parent_consultation_id, treatment_unlocked, updated_at`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAppointmentRow(r: any): StaffAppointment {
  return {
    id: r.id,
    bookingKind: (r.booking_kind ?? 'treatment') as BookingKind,
    status: r.status as BookingStatus,
    paymentStatus: (r.payment_status ?? 'unpaid') as PaymentStatus,
    treatmentName: r.treatment_name ?? null,
    treatmentId: r.treatment_id ?? null,
    patientName: r.patient_name ?? null,
    patientPhone: r.patient_phone ?? null,
    patientGender: (r.patient_gender ?? null) as Gender | null,
    genderRequirement:
      r.gender_requirement === 'men_only'
        ? 'male'
        : r.gender_requirement === 'ladies_only'
          ? 'female'
          : null,
    requestedDatetime: r.requested_datetime ?? null,
    requestedDatetimeAlt: r.requested_datetime_alt ?? null,
    appointmentDatetime: r.appointment_date_time ?? null,
    assignedTherapistCode: r.assigned_therapist_code ?? null,
    assignedTherapistName: r.assigned_therapist_name ?? null,
    assignedTherapistGender: (r.assigned_therapist_gender ?? null) as Gender | null,
    durationMins: r.duration_mins ?? null,
    payableAmountRm: r.payable_amount_rm != null ? Number(r.payable_amount_rm) : null,
    room: r.room ?? null,
    isGuest: r.is_guest ?? false,
    customerId: r.customer_id ?? null,
    parentConsultationId: r.parent_consultation_id ?? null,
    treatmentUnlocked: r.treatment_unlocked ?? false,
    createdAt: r.updated_at ?? null,
  }
}
