import Link from 'next/link'
import { MessageCircle, Phone, CalendarPlus } from 'lucide-react'
import PatientHealthPanel from '@/components/staff/PatientHealthPanel'
import PatientVisitHistory from '@/components/staff/PatientVisitHistory'
import { customerWaLink } from '@/lib/booking/contact'
import type { DoctorPatientView } from '@/types/booking'
import type { PatientVisit } from '@/lib/staff/patients'

function fmtDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'medium', timeStyle: 'short' }) : null
}

const ATTENDED = ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed']
const UPCOMING = ['confirmed', 'scheduled', 'awaiting_payment', 'pending']

/** One patient: contact, health details from their latest booking, and every visit. */
export default function PatientProfile({
  patient,
  visits,
  backHref,
  visitLinkBase,
  hideContact,
  showClinical,
  newBookingHref,
}: {
  patient: DoctorPatientView
  visits: PatientVisit[]
  backHref: string
  visitLinkBase: string
  hideContact: boolean
  showClinical: boolean
  newBookingHref?: string
}) {
  const nowISO = new Date().toISOString()
  const attended = visits.filter((v) => ATTENDED.includes(v.status) && (v.whenISO ?? '') <= nowISO)
  const next = visits
    .filter((v) => UPCOMING.includes(v.status) && (v.whenISO ?? '') > nowISO)
    .sort((a, b) => (a.whenISO ?? '').localeCompare(b.whenISO ?? ''))[0]
  const wa = hideContact ? null : customerWaLink(patient.patientPhone, `Hi ${patient.patientName ?? ''}, this is Kerala Ayurvedic Lifestyle.`)

  return (
    <div>
      <Link href={backHref} className="font-heading text-[11px] font-semibold uppercase tracking-[0.12em] text-dark/50 hover:text-primary">
        ← Patients
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-[24px] font-extrabold text-primary">{patient.patientName ?? 'Patient'}</h1>
          <p className="mt-1 font-body text-[13.5px] text-dark/60">
            {[
              patient.patientGender ? (patient.patientGender === 'male' ? 'Male' : 'Female') : null,
              patient.customerId ? 'Has an account' : 'Guest',
              `${attended.length} visit${attended.length === 1 ? '' : 's'}`,
              attended[0] ? `last ${fmtDate(attended[0].whenISO)}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {next && (
            <p className="mt-1 font-body text-[13.5px] font-semibold text-emerald-700">
              Next: {fmtDate(next.whenISO)} — {next.bookingKind === 'consultation' ? 'Consultation' : next.treatmentName ?? 'Treatment'}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#25D366] px-4 font-heading text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#128C4A] hover:bg-[#25D366]/10">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          )}
          {!hideContact && patient.patientPhone && (
            <a href={`tel:${patient.patientPhone.replace(/[^\d+]/g, '')}`} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-accent/30 px-4 font-heading text-[10.5px] font-bold uppercase tracking-[0.12em] text-primary hover:bg-cream/60">
              <Phone className="h-4 w-4" /> Call
            </a>
          )}
          {newBookingHref && (
            <Link href={newBookingHref} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-accent px-4 font-heading text-[10.5px] font-bold uppercase tracking-[0.12em] text-white hover:bg-accent/90">
              <CalendarPlus className="h-4 w-4" /> New booking
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <PatientVisitHistory visits={visits} currentId="" patientName={patient.patientName} linkBase={visitLinkBase} showClinical={showClinical} />
        <div className="space-y-2">
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-dark/45">Details from the latest booking</p>
          <PatientHealthPanel p={patient} hideContact={hideContact} />
        </div>
      </div>
    </div>
  )
}
