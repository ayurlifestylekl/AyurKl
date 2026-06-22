/**
 * Booking & consultation domain types. Mirrors the extended `appointments`
 * table (see supabase/migrations/20260623_booking_system.sql). Kept separate
 * from the generated DB types so UI/server code shares one clean shape.
 */

export type Gender = 'male' | 'female'

export type BookingKind = 'treatment' | 'consultation'

export type BookingStatus =
  | 'pending' // requested, awaiting staff approval
  | 'scheduled'
  | 'awaiting_payment' // approved; customer must pay (treatment path)
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled'

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'

/** Health questions captured at booking (stored in appointments.pre_visit_form). */
export interface HealthIntake {
  conditions?: string
  allergies?: string
  medications?: string
  pregnant?: boolean
  notes?: string
}

/** What the customer submits to request a booking or consultation. */
export interface BookingRequestInput {
  treatmentId: string
  bookingKind: BookingKind
  /** Customer's preferred slot (ISO datetime). Staff confirm the real time. */
  preferredAt: string
  preferredAtAlt?: string | null
  patientName: string
  patientPhone: string
  patientEmail: string
  patientGender: Gender
  isGuest: boolean
  healthIntake: HealthIntake
  /** Gender-matching + cancellation + reschedule policies acknowledged. */
  acceptedPolicies: boolean
  /** Set when a treatment booking follows a cleared consultation. */
  parentConsultationId?: string | null
}

/** Row shape used across staff console + customer status views. */
export interface StaffAppointment {
  id: string
  bookingKind: BookingKind
  status: BookingStatus
  paymentStatus: PaymentStatus
  treatmentName: string | null
  treatmentId: string | null
  patientName: string | null
  patientPhone: string | null
  patientGender: Gender | null
  /** Required therapist gender (= patient gender by policy). */
  genderRequirement: Gender | null
  requestedDatetime: string | null
  requestedDatetimeAlt: string | null
  appointmentDatetime: string | null
  assignedTherapistName: string | null
  assignedTherapistGender: Gender | null
  payableAmountRm: number | null
  room: string | null
  isGuest: boolean
  parentConsultationId: string | null
  treatmentUnlocked: boolean
  createdAt: string | null
}

/** Doctor's clinical view — booked patients only, with health context. */
export interface DoctorPatientView extends StaffAppointment {
  patientEmail: string | null
  /** From appointments.pre_visit_form (guest/first-timer intake). */
  healthIntake: HealthIntake | null
  /** From the users table — only for signed-in patients. */
  accountHealth: {
    allergies: string | null
    medications: string | null
    conditions: string | null
    heightCm: number | null
    weightKg: number | null
  } | null
  clinicalNotes: string | null
}
