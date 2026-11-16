import { notFound } from 'next/navigation'
import { requireStaff } from '@/lib/staff/guard'
import { getAppointmentDetail } from '@/lib/staff/appointments'
import { getPatientVisits } from '@/lib/staff/patients'
import PatientProfile from '@/components/staff/PatientProfile'

export const dynamic = 'force-dynamic'

export default async function ConsolePatientPage({ params }: { params: { id: string } }) {
  const { db } = await requireStaff(['admin', 'front_desk'])
  const patient = await getAppointmentDetail(db, params.id)
  if (!patient) notFound()
  const visits = await getPatientVisits(db, patient)

  return (
    <PatientProfile
      patient={patient}
      visits={visits}
      backHref="/console/patients"
      visitLinkBase="/console"
      hideContact={false}
      showClinical={false}
      newBookingHref={`/console/new?client=${patient.id}`}
    />
  )
}
