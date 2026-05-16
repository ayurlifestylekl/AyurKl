import { redirect } from 'next/navigation'
import { getCurrentUser, homeForRole } from '@/lib/auth/getCurrentUser'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { agentNav, agentChrome } from '@/lib/dashboard/agent-nav'

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser()
  if (!me) redirect('/agent/login?next=/agent/dashboard')
  if (me.role !== 'sales_agent') redirect(homeForRole(me.role))

  return (
    <DashboardShell
      user={{
        id: me.authId,
        fullName: me.profile.full_name ?? 'Brand Partner',
        email: me.identifier,
        role: me.role,
      }}
      nav={agentNav}
      portal={agentChrome}
    >
      {children}
    </DashboardShell>
  )
}
