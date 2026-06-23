import 'server-only'
import type { BookingKind, BookingStatus, DoctorPatientView, HealthIntake, StaffAppointment } from '@/types/booking'
import { APPOINTMENT_COLUMNS, mapAppointmentRow } from '@/lib/booking/map'
import type { ServiceDb } from './guard'

/** Statuses that count as a real, booked patient for the doctor view. */
export const BOOKED_STATUSES: BookingStatus[] = ['confirmed', 'checked_in', 'in_progress', 'completed']

export interface AppointmentFilters {
  status?: BookingStatus | BookingStatus[]
  kind?: BookingKind
  search?: string
}

export async function listAppointments(
  db: ServiceDb,
  filters: AppointmentFilters = {},
): Promise<StaffAppointment[]> {
  let q = db.from('appointments').select(APPOINTMENT_COLUMNS)

  if (filters.status) {
    q = Array.isArray(filters.status) ? q.in('status', filters.status) : q.eq('status', filters.status)
  }
  if (filters.kind) q = q.eq('booking_kind', filters.kind)
  if (filters.search) {
    const s = `%${filters.search}%`
    q = q.or(`patient_name.ilike.${s},patient_phone.ilike.${s},treatment_name.ilike.${s}`)
  }

  const { data, error } = await q.order('requested_datetime', { ascending: true })
  if (error) {
    console.error('[staff/appointments] list:', error.message)
    return []
  }
  return (data ?? []).map(mapAppointmentRow)
}

const DETAIL_COLUMNS = `${APPOINTMENT_COLUMNS}, patient_email, pre_visit_form, clinical_notes, customer_id, consultation_outcome, payment_status, payment_url`

/** Rich appointment detail incl. health context. Used by console + doctor detail. */
export async function getAppointmentDetail(db: ServiceDb, id: string): Promise<DoctorPatientView | null> {
  const { data: r, error } = await db.from('appointments').select(DETAIL_COLUMNS).eq('id', id).maybeSingle()
  if (error) {
    console.error('[staff/appointments] detail:', error.message)
    return null
  }
  if (!r) return null

  let accountHealth: DoctorPatientView['accountHealth'] = null
  if (r.customer_id) {
    // Requires the users profile-fields migration (20260518). Degrades to null
    // until applied — booking intake still provides health context.
    const { data: u } = await db
      .from('users')
      .select('allergies, current_medications, medical_conditions, height_cm, weight_kg')
      .eq('id', r.customer_id)
      .maybeSingle()
    if (u) {
      accountHealth = {
        allergies: u.allergies ?? null,
        medications: u.current_medications ?? null,
        conditions: u.medical_conditions ?? null,
        heightCm: u.height_cm ?? null,
        weightKg: u.weight_kg ?? null,
      }
    }
  }

  return {
    ...mapAppointmentRow(r),
    patientEmail: r.patient_email ?? null,
    healthIntake: (r.pre_visit_form ?? null) as HealthIntake | null,
    accountHealth,
    clinicalNotes: r.clinical_notes ?? null,
    consultationOutcome: r.consultation_outcome ?? null,
  }
}

/** Doctor's list — only patients who have actually booked (confirmed+). */
export async function getDoctorPatients(db: ServiceDb): Promise<StaffAppointment[]> {
  const { data, error } = await db
    .from('appointments')
    .select(APPOINTMENT_COLUMNS)
    .in('status', BOOKED_STATUSES)
    .order('appointment_date_time', { ascending: true })
  if (error) {
    console.error('[staff/appointments] doctorPatients:', error.message)
    return []
  }
  return (data ?? []).map(mapAppointmentRow)
}
