import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireStaff } from '@/lib/staff/guard'
import { getAppointmentDetail } from '@/lib/staff/appointments'
import StatusBadge from '@/components/staff/StatusBadge'
import PatientHealthPanel from '@/components/staff/PatientHealthPanel'
import ClinicalNotes from '@/components/staff/ClinicalNotes'
import UnlockTreatment from '@/components/staff/UnlockTreatment'

export const dynamic = 'force-dynamic'

function fmt(dt: string | null) {
  return dt ? new Date(dt).toLocaleString('en-MY', { dateStyle: 'full', timeStyle: 'short' }) : '—'
}

export default async function DoctorPatientPage({ params }: { params: { id: string } }) {
  const { db } = await requireStaff(['admin', 'doctor'])
  const a = await getAppointmentDetail(db, params.id)
  if (!a) notFound()

  return (
    <div>
      <Link href="/doctor" className="font-heading text-[11px] font-semibold uppercase tracking-[0.12em] text-dark/50 hover:text-primary">
        ← Doctor dashboard
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-[22px] font-extrabold text-primary">{a.patientName ?? 'Patient'}</h1>
        <StatusBadge status={a.status} />
        <span className="rounded-full border border-dark/15 px-2 py-0.5 font-heading text-[10px] uppercase tracking-[0.12em] text-dark/50">{a.bookingKind}</span>
      </div>
      <p className="mt-1 font-body text-[13.5px] text-dark/60">
        {a.treatmentName} · {fmt(a.appointmentDatetime)} · {a.patientPhone}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <PatientHealthPanel p={a} />
        <div className="space-y-4">
          {a.bookingKind === 'consultation' && (
            <UnlockTreatment consultationId={a.id} unlocked={a.treatmentUnlocked} outcome={a.consultationOutcome ?? null} />
          )}
          <ClinicalNotes id={a.id} initial={a.clinicalNotes} />
        </div>
      </div>
    </div>
  )
}
