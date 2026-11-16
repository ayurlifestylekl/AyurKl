import { requireStaff } from '@/lib/staff/guard'
import { filterPatients, getPatientList } from '@/lib/staff/patients'
import PatientDirectory from '@/components/staff/PatientDirectory'

export const dynamic = 'force-dynamic'

export default async function ConsolePatientsPage({ searchParams }: { searchParams: { q?: string } }) {
  const { db } = await requireStaff(['admin', 'front_desk'])
  const all = await getPatientList(db)
  const q = (searchParams.q ?? '').trim()

  return (
    <div>
      <h1 className="font-heading text-[22px] font-extrabold text-primary">Patients</h1>
      <p className="mb-5 font-body text-[13px] text-dark/55">
        Everyone who has booked. Open a patient to see their contact, health details and every visit, or start a new booking for them.
      </p>
      <PatientDirectory patients={filterPatients(all, q, true)} total={all.length} query={q} basePath="/console/patients" hideContact={false} />
    </div>
  )
}
