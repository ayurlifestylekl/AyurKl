import 'server-only'
import type { BookingKind, BookingStatus, Gender } from '@/types/booking'
import type { ServiceDb } from './guard'

/**
 * Patients aren't a table of their own — every booking carries its own copy of
 * the name, phone, email and gender. These helpers recognise the same person
 * across bookings so front desk can reuse their details and staff can see
 * every visit together.
 *
 * Identity, in order:
 *   1. phone + first name — the phone is normalised ("+60 12-345 6789" ==
 *      "0123456789"), and the first name keeps family members or a shared /
 *      placeholder number from merging different people (and their notes);
 *   2. customer account, when there is no phone;
 *   3. full name, when there is neither.
 */

/** Malaysian-friendly phone normaliser: digits only, "60…" → "0…". */
export function normalizePhone(raw: string | null | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (digits.length < 7) return null
  return digits.startsWith('60') ? `0${digits.slice(2)}` : digits
}

function normalizeName(name: string | null | undefined): string {
  return (name ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function firstName(name: string | null | undefined): string {
  return normalizeName(name).split(' ')[0] ?? ''
}

export function patientKey(p: {
  patientPhone: string | null
  customerId: string | null
  patientName: string | null
}): string | null {
  const phone = normalizePhone(p.patientPhone)
  if (phone) return `p:${phone}:${firstName(p.patientName)}`
  if (p.customerId) return `c:${p.customerId}`
  const name = normalizeName(p.patientName)
  return name ? `n:${name}` : null
}

/** PostgREST `or()` treats , ( ) as syntax and * % _ as wildcards. */
function cleanTerm(q: string): string {
  return q.replace(/[,()"'\\%*_]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)
}

export interface ReturningClient {
  key: string
  name: string
  phone: string | null
  email: string | null
  gender: Gender | null
  visits: number
  lastVisitISO: string | null
}

/**
 * Past patients matching a name or phone fragment, newest details first —
 * for the "Find existing client" box on staff booking forms.
 */
export async function searchReturningClients(db: ServiceDb, query: string): Promise<ReturningClient[]> {
  const term = cleanTerm(query)
  if (term.length < 2) return []

  const digits = term.replace(/\D/g, '')
  const filters = [`patient_name.ilike.*${term}*`]
  // Phones are stored as typed ("012-345 6789", "+60 12…"), so match the digits
  // in order with anything between them, then confirm on the normalised number.
  if (digits.length >= 3) filters.push(`patient_phone.ilike.*${digits.split('').join('*')}*`)

  const { data, error } = await db
    .from('appointments')
    .select('patient_name, patient_phone, patient_email, patient_gender, customer_id, appointment_date_time, requested_datetime, created_at, status')
    .or(filters.join(','))
    .order('created_at', { ascending: false })
    .limit(300)
  if (error) {
    console.error('[staff/patients] search:', error.message)
    return []
  }

  const wantDigits = digits.length >= 3 ? normalizePhone(digits) ?? digits : null
  const byKey = new Map<string, ReturningClient>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (data ?? []) as any[]) {
    if (!r.patient_name) continue
    const nameHit = r.patient_name.toLowerCase().includes(term.toLowerCase())
    const phoneHit = !!wantDigits && (normalizePhone(r.patient_phone) ?? '').includes(wantDigits)
    if (!nameHit && !phoneHit) continue

    const key = patientKey({ patientPhone: r.patient_phone, customerId: r.customer_id, patientName: r.patient_name })
    if (!key) continue
    const when = r.appointment_date_time ?? r.requested_datetime ?? r.created_at ?? null
    const counted = ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed'].includes(r.status)
    const existing = byKey.get(key)
    if (existing) {
      if (counted) existing.visits += 1
      // Rows are newest first, so the first row holds the latest details; fill gaps only.
      existing.email ??= r.patient_email ?? null
      existing.gender ??= (r.patient_gender ?? null) as Gender | null
      if (counted && when && (!existing.lastVisitISO || when > existing.lastVisitISO)) existing.lastVisitISO = when
    } else {
      byKey.set(key, {
        key,
        name: r.patient_name,
        phone: r.patient_phone ?? null,
        email: r.patient_email ?? null,
        gender: (r.patient_gender ?? null) as Gender | null,
        visits: counted ? 1 : 0,
        lastVisitISO: counted ? when : null,
      })
    }
  }
  return Array.from(byKey.values()).slice(0, 8)
}

export interface PatientVisit {
  id: string
  /** Name this booking was made under — shown so a mismatch is easy to spot. */
  patientName: string | null
  bookingKind: BookingKind
  status: BookingStatus
  treatmentName: string | null
  whenISO: string | null
  therapistName: string | null
  clinicalNotes: string | null
  consultationOutcome: string | null
}

/** Every booking for the same person as `a`, newest first (includes `a`). */
export async function getPatientVisits(
  db: ServiceDb,
  a: { patientPhone: string | null; customerId: string | null; patientName: string | null },
): Promise<PatientVisit[]> {
  const key = patientKey(a)
  if (!key) return []

  const phone = normalizePhone(a.patientPhone)
  const filters: string[] = []
  if (phone) filters.push(`patient_phone.ilike.*${phone.slice(-7).split('').join('*')}*`)
  if (a.customerId) filters.push(`customer_id.eq.${a.customerId}`)
  if (!phone && !a.customerId && a.patientName) filters.push(`patient_name.ilike.${cleanTerm(a.patientName)}`)
  if (filters.length === 0) return []

  const { data, error } = await db
    .from('appointments')
    .select('id, booking_kind, status, treatment_name, appointment_date_time, requested_datetime, assigned_therapist_name, clinical_notes, consultation_outcome, patient_phone, patient_name, customer_id')
    .or(filters.join(','))
    .order('appointment_date_time', { ascending: false, nullsFirst: false })
    .limit(200)
  if (error) {
    console.error('[staff/patients] visits:', error.message)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[])
    .filter((r) => {
      // The query above is a loose prefilter; only the same person passes.
      if (patientKey({ patientPhone: r.patient_phone, customerId: r.customer_id, patientName: r.patient_name }) === key) return true
      // The same account booked without a phone (or with a different one) under the same first name.
      return !!a.customerId && r.customer_id === a.customerId && firstName(r.patient_name) === firstName(a.patientName)
    })
    .map((r) => ({
      id: r.id,
      patientName: r.patient_name ?? null,
      bookingKind: (r.booking_kind ?? 'treatment') as BookingKind,
      status: r.status as BookingStatus,
      treatmentName: r.treatment_name ?? null,
      whenISO: r.appointment_date_time ?? r.requested_datetime ?? null,
      therapistName: r.assigned_therapist_name ?? null,
      clinicalNotes: r.clinical_notes ?? null,
      consultationOutcome: r.consultation_outcome ?? null,
    }))
}

/**
 * Bookings that count as a visit once their time has passed. 'scheduled' is
 * included because walk-ins booked on the schedule grid stay in that status.
 */
const ATTENDED: BookingStatus[] = ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed']

export interface PatientListEntry {
  key: string
  /** Latest booking — the patient's page is opened through it. */
  anchorId: string
  name: string
  phone: string | null
  gender: Gender | null
  isGuest: boolean
  /** Attended or confirmed visits. */
  visits: number
  bookings: number
  lastVisitISO: string | null
  nextVisitISO: string | null
}

/**
 * Everyone who has booked (cancelled-only patients left out), most recent
 * first. Reads every booking in pages, since PostgREST caps a single read at
 * 1,000 rows.
 */
export async function getPatientList(db: ServiceDb): Promise<PatientListEntry[]> {
  const rows: Record<string, unknown>[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from('appointments')
      .select('id, patient_name, patient_phone, patient_gender, customer_id, is_guest, status, appointment_date_time, requested_datetime, created_at')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .range(from, from + 999)
    if (error) {
      console.error('[staff/patients] list:', error.message)
      break
    }
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }

  const nowISO = new Date().toISOString()
  const byKey = new Map<string, PatientListEntry>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of rows as any[]) {
    if (!r.patient_name) continue
    const key = patientKey({ patientPhone: r.patient_phone, customerId: r.customer_id, patientName: r.patient_name })
    if (!key) continue
    const when: string | null = r.appointment_date_time ?? r.requested_datetime ?? null
    const attended = ATTENDED.includes(r.status) && !!when && when <= nowISO
    const upcoming = !!when && when > nowISO && ['confirmed', 'scheduled', 'awaiting_payment', 'pending'].includes(r.status)
    let p = byKey.get(key)
    if (!p) {
      p = {
        key,
        anchorId: r.id,
        name: r.patient_name,
        phone: r.patient_phone ?? null,
        gender: (r.patient_gender ?? null) as Gender | null,
        isGuest: !r.customer_id,
        visits: 0,
        bookings: 0,
        lastVisitISO: null,
        nextVisitISO: null,
      }
      byKey.set(key, p)
    }
    p.bookings += 1
    p.phone ??= r.patient_phone ?? null
    p.gender ??= (r.patient_gender ?? null) as Gender | null
    if (r.customer_id) p.isGuest = false
    if (attended) {
      p.visits += 1
      if (!p.lastVisitISO || when! > p.lastVisitISO) p.lastVisitISO = when
    }
    if (upcoming && (!p.nextVisitISO || when! < p.nextVisitISO)) p.nextVisitISO = when
  }
  return Array.from(byKey.values()).sort((a, b) =>
    (b.nextVisitISO ?? b.lastVisitISO ?? '').localeCompare(a.nextVisitISO ?? a.lastVisitISO ?? ''),
  )
}

/** Name / phone search over the patient list (phone digits match however they were typed). */
export function filterPatients(list: PatientListEntry[], q: string, allowPhone: boolean): PatientListEntry[] {
  const term = q.trim().toLowerCase()
  if (!term) return list
  const digits = term.replace(/\D/g, '')
  const wantPhone = allowPhone && digits.length >= 3 ? normalizePhone(digits) ?? digits : null
  return list.filter(
    (p) => p.name.toLowerCase().includes(term) || (!!wantPhone && (normalizePhone(p.phone) ?? '').includes(wantPhone)),
  )
}
