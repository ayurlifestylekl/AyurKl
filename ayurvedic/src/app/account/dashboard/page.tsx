import { Package, Calendar, Sprout } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import {
  getRecentOrders,
  getUpcomingAppointments,
  getActiveOrdersCount,
} from '@/lib/dashboard/queries'

import DashboardHero from '@/components/account/DashboardHero'
import StatTile from '@/components/account/StatTile'
import QuickActionsRow from '@/components/account/QuickActionsRow'
import RecentOrdersCard from '@/components/account/RecentOrdersCard'
import UpcomingAppointmentsCard from '@/components/account/UpcomingAppointmentsCard'
import VaidyaMessagesPreview from '@/components/account/VaidyaMessagesPreview'

export const metadata = {
  title: 'My Dashboard',
}

const monthYearFormat = new Intl.DateTimeFormat('en-MY', {
  month: 'short',
  year: 'numeric',
})
const fullDateFormat = new Intl.DateTimeFormat('en-MY', {
  day: 'numeric',
  month: 'short',
})
const timeFormat = new Intl.DateTimeFormat('en-MY', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

export default async function AccountDashboardPage() {
  const me = await getCurrentUser()
  const firstName = me?.profile.full_name?.split(' ')[0] ?? 'there'
  const customerId = me?.authId ?? ''
  const memberSinceLabel = me?.profile.created_at
    ? monthYearFormat.format(new Date(me.profile.created_at))
    : '—'

  const supabase = await createClient()

  const [recentOrders, upcomingAppointments, activeOrdersCount] = await Promise.all([
    getRecentOrders(supabase, customerId, 3),
    getUpcomingAppointments(supabase, customerId, 2),
    getActiveOrdersCount(supabase, customerId),
  ])

  const next = upcomingAppointments[0]
  const nextAptValue = next
    ? fullDateFormat.format(new Date(next.appointment_date_time))
    : '—'
  const nextAptSub = next
    ? `${next.treatment_name} · ${timeFormat.format(new Date(next.appointment_date_time))}`
    : 'No upcoming consultations'

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:gap-4">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <DashboardHero firstName={firstName} />

      {/* ── QUICK STATS — 3-up grid ──────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <StatTile
          label="Active orders"
          value={String(activeOrdersCount)}
          sub={activeOrdersCount === 0 ? 'All caught up' : `${activeOrdersCount === 1 ? '1 order' : `${activeOrdersCount} orders`} in motion`}
          icon={Package}
          accent="sage"
        />
        <StatTile
          label="Next consultation"
          value={nextAptValue}
          sub={nextAptSub}
          icon={Calendar}
          accent="gold"
        />
        <StatTile
          label="Member since"
          value={memberSinceLabel}
          sub="Welcome to the practice"
          icon={Sprout}
          accent="olive"
        />
      </section>

      {/* ── QUICK ACTIONS ────────────────────────────────────────────── */}
      <QuickActionsRow />

      {/* ── RECENT ORDERS + UPCOMING APPOINTMENTS — side-by-side at lg+ ── */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
        <div className="lg:col-span-7">
          <RecentOrdersCard orders={recentOrders} />
        </div>
        <div className="lg:col-span-5">
          <UpcomingAppointmentsCard appointments={upcomingAppointments} />
        </div>
      </section>

      {/* ── MESSAGES PREVIEW ─────────────────────────────────────────── */}
      <VaidyaMessagesPreview />
    </div>
  )
}
