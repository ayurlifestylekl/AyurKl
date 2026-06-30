import 'server-only'
import type { BookingKind, BookingStatus, DoctorPatientView, HealthIntake, StaffAppointment } from '@/types/booking'
import { APPOINTMENT_COLUMNS, mapAppointmentRow } from '@/lib/booking/map'
import { THERAPISTS, type Therapist } from './therapists'
import { THERAPIST_BUFFER_MINS } from '@/lib/booking/scheduling'
import { mytTodayRange, mytTimeOfDay } from '@/lib/datetime'
import { fetchBlocksOnOrAfter, blockedIntervalsForDate } from '@/lib/booking/blocks'
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

/** All guests in a group booking, in stable creation order. [] if not a group. */
export async function getGroupAppointments(db: ServiceDb, groupId: string): Promise<StaffAppointment[]> {
  const { data, error } = await db
    .from('appointments')
    .select(APPOINTMENT_COLUMNS)
    .eq('group_id', groupId)
    .order('updated_at', { ascending: true })
  if (error) {
    console.error('[staff/appointments] group:', error.message)
    return []
  }
  return (data ?? []).map(mapAppointmentRow)
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

/** Incoming requests the doctor can act on (approve / awaiting customer payment). */
export const INCOMING_STATUSES: BookingStatus[] = ['pending', 'scheduled', 'awaiting_payment']

/** Requests awaiting approval/payment — shown to the doctor so they can approve. */
export async function getIncomingRequests(db: ServiceDb): Promise<StaffAppointment[]> {
  const { data, error } = await db
    .from('appointments')
    .select(APPOINTMENT_COLUMNS)
    .in('status', INCOMING_STATUSES)
    .order('requested_datetime', { ascending: true })
  if (error) {
    console.error('[staff/appointments] incoming:', error.message)
    return []
  }
  return (data ?? []).map(mapAppointmentRow)
}

/** Active (front-desk relevant) statuses for a day's running schedule. */
const ACTIVE_TODAY_STATUSES: BookingStatus[] = ['confirmed', 'checked_in', 'in_progress', 'completed']

/** Today's booked appointments, ordered by time — the front-desk day board. */
export async function getTodayAppointments(db: ServiceDb): Promise<StaffAppointment[]> {
  const { startISO, endISO } = mytTodayRange() // "today" in Malaysia, not server (UTC)

  const { data, error } = await db
    .from('appointments')
    .select(APPOINTMENT_COLUMNS)
    .in('status', ACTIVE_TODAY_STATUSES)
    .gte('appointment_date_time', startISO)
    .lt('appointment_date_time', endISO)
    .order('appointment_date_time', { ascending: true })
  if (error) {
    console.error('[staff/appointments] today:', error.message)
    return []
  }
  return (data ?? []).map(mapAppointmentRow)
}

export interface TherapistStatus {
  therapist: Therapist
  busy: boolean
  /** When they next become free (treatment end + buffer), if busy now. */
  freeAtISO: string | null
  /** Patient they're currently with, if busy. */
  withPatient: string | null
  /** Count of remaining appointments today (now or later). */
  remainingToday: number
}

/**
 * Live therapist availability for the front desk: who is occupied right now
 * (session + buffer) and when each frees up, based on today's assignments.
 */
export async function getTherapistBoard(db: ServiceDb): Promise<TherapistStatus[]> {
  const today = await getTodayAppointments(db)
  const now = Date.now()
  const bufferMs = THERAPIST_BUFFER_MINS * 60 * 1000

  return THERAPISTS.map((therapist) => {
    const mine = today.filter((a) => a.assignedTherapistCode === therapist.code && a.appointmentDatetime)
    let busy = false
    let freeAt = 0
    let withPatient: string | null = null
    let remaining = 0
    for (const a of mine) {
      const start = new Date(a.appointmentDatetime as string).getTime()
      const end = start + (a.durationMins ?? 60) * 60 * 1000 + bufferMs
      if (now >= start && now < end) {
        busy = true
        withPatient = a.patientName ?? null
        if (end > freeAt) freeAt = end
      }
      if (end > now) remaining += 1
    }
    return {
      therapist,
      busy,
      freeAtISO: busy ? new Date(freeAt).toISOString() : null,
      withPatient,
      remainingToday: remaining,
    }
  })
}

/* ── Visual day schedule (calendar grid) ───────────────────────────── */

export interface GridAppt {
  id: string
  therapistCode: string | null
  startMin: number // minutes from midnight, Malaysia time
  durationMins: number
  patientName: string | null
  treatmentName: string | null
  status: BookingStatus
  room: string | null
}
export interface GridBlock {
  therapistCode: string | null
  startMin: number
  endMin: number
  reason: string | null
}
export interface DaySchedule {
  appts: GridAppt[] // assigned to a therapist
  unassigned: GridAppt[] // confirmed but no therapist yet (waiting list)
  blocks: GridBlock[]
}

const hhmmToMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))

/** All appointments + blocks for a Malaysia day, shaped for the calendar grid. */
export async function getDaySchedule(db: ServiceDb, dateYMD: string): Promise<DaySchedule> {
  const dayStartMs = new Date(`${dateYMD}T00:00:00+08:00`).getTime()
  const start = new Date(dayStartMs).toISOString()
  const end = new Date(dayStartMs + 86_400_000).toISOString()

  const { data, error } = await db
    .from('appointments')
    .select('id, assigned_therapist_code, appointment_date_time, duration_mins, patient_name, treatment_name, status')
    .in('status', ['scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress', 'completed'])
    .gte('appointment_date_time', start)
    .lt('appointment_date_time', end)
    .order('appointment_date_time', { ascending: true })
  if (error) console.error('[staff/appointments] daySchedule:', error.message)

  const all = (data ?? []).map(mapAppointmentRow)
  const toGrid = (a: StaffAppointment): GridAppt => ({
    id: a.id,
    therapistCode: a.assignedTherapistCode,
    startMin: a.appointmentDatetime ? hhmmToMin(mytTimeOfDay(a.appointmentDatetime)) : 0,
    durationMins: a.durationMins ?? 60,
    patientName: a.patientName,
    treatmentName: a.treatmentName,
    status: a.status,
    room: a.room,
  })
  const grid = all.map(toGrid)

  const blocksRaw = await fetchBlocksOnOrAfter(db, dateYMD)
  const blocks: GridBlock[] = blockedIntervalsForDate(blocksRaw, dateYMD).map((iv) => ({
    therapistCode: iv.therapistCode,
    startMin: Math.max(0, Math.round((iv.startMs - dayStartMs) / 60_000)),
    endMin: Math.min(1440, Math.round((iv.endMs - dayStartMs) / 60_000)),
    reason: iv.reason,
  }))

  return {
    appts: grid.filter((g) => g.therapistCode),
    unassigned: grid.filter((g) => !g.therapistCode),
    blocks,
  }
}

/** Consultations still awaiting the doctor's clearance before treatment. */
export async function getConsultationsToClear(db: ServiceDb): Promise<StaffAppointment[]> {
  const { data, error } = await db
    .from('appointments')
    .select(APPOINTMENT_COLUMNS)
    .eq('booking_kind', 'consultation')
    .in('status', BOOKED_STATUSES)
    .or('treatment_unlocked.is.null,treatment_unlocked.eq.false')
    .order('appointment_date_time', { ascending: true })
  if (error) {
    console.error('[staff/appointments] consultationsToClear:', error.message)
    return []
  }
  return (data ?? []).map(mapAppointmentRow)
}

export interface PatientDirectoryEntry {
  key: string
  name: string | null
  phone: string | null
  isGuest: boolean
  customerId: string | null
  visits: number
  lastVisitISO: string | null
  latestAppointmentId: string
}

/**
 * Unique patients who have booked, most-recent first. Deduped by account →
 * phone → name so a returning patient appears once with a visit count.
 */
export async function getPatientDirectory(db: ServiceDb): Promise<PatientDirectoryEntry[]> {
  const { data, error } = await db
    .from('appointments')
    .select(APPOINTMENT_COLUMNS)
    .in('status', BOOKED_STATUSES)
    .order('appointment_date_time', { ascending: false })
  if (error) {
    console.error('[staff/appointments] directory:', error.message)
    return []
  }
  const byPatient = new Map<string, PatientDirectoryEntry>()
  for (const a of (data ?? []).map(mapAppointmentRow)) {
    const key = a.customerId ?? a.patientPhone ?? a.patientName ?? a.id
    const existing = byPatient.get(key)
    if (existing) {
      existing.visits += 1 // rows are newest-first, so the first seen is the latest
    } else {
      byPatient.set(key, {
        key,
        name: a.patientName,
        phone: a.patientPhone,
        isGuest: a.isGuest,
        customerId: a.customerId,
        visits: 1,
        lastVisitISO: a.appointmentDatetime,
        latestAppointmentId: a.id,
      })
    }
  }
  return Array.from(byPatient.values())
}
