import { requireStaff } from '@/lib/staff/guard'
import { listAppointments } from '@/lib/staff/appointments'
import ConsoleShell from '@/components/staff/ConsoleShell'

export const dynamic = 'force-dynamic'

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { db, role } = await requireStaff(['admin', 'front_desk'])
  const pending = (await listAppointments(db, { status: 'pending' })).length
  return (
    <ConsoleShell role={role} pendingCount={pending}>
      {children}
    </ConsoleShell>
  )
}
