import { notFound } from 'next/navigation'
import { requireStaff } from '@/lib/staff/guard'
import { getAppointmentDetail } from '@/lib/staff/appointments'
import { getPatientVisits } from '@/lib/staff/patients'
import PatientProfile from '@/components/staff/PatientProfile'

export const dynamic = 'force-dynamic'

export default async function DoctorPatientProfilePage({ params }: { params: { id: string } }) {
  const { db, role } = await requireStaff(['admin', 'doctor'])
  const patient = await getAppointmentDetail(db, params.id)
  if (!patient) notFound()
  const visits = await getPatientVisits(db, patient)

  return (
    <PatientProfile
      patient={patient}
      visits={visits}
      backHref="/doctor/patients"
      visitLinkBase="/doctor"
      hideContact={role === 'doctor'}
      showClinical
    />
  )
}
