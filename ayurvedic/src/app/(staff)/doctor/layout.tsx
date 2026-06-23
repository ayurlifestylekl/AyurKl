import { requireStaff } from '@/lib/staff/guard'
import { getConsultationsToClear, getIncomingRequests } from '@/lib/staff/appointments'
import DoctorShell from '@/components/staff/DoctorShell'

export const dynamic = 'force-dynamic'

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { db, role } = await requireStaff(['admin', 'doctor'])
  const [toClear, requests] = await Promise.all([getConsultationsToClear(db), getIncomingRequests(db)])
  const pendingRequests = requests.filter((r) => r.status === 'pending').length
  return (
    <DoctorShell role={role} toClearCount={toClear.length} requestCount={pendingRequests}>
      {children}
    </DoctorShell>
  )
}
