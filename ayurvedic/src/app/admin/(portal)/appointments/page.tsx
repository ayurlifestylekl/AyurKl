import Link from 'next/link'
import { Plus, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import {
  listAppointments,
  countPendingRequests,
  type AppointmentFilters,
  type AppointmentListItem,
} from '@/lib/admin/appointments/queries'
import {
  DEMO_ADMIN_EMAIL,
  MOCK_APPOINTMENTS,
} from '@/lib/admin/appointments/mocks'
import AppointmentsFilters from './AppointmentsFilters'
import AppointmentsTable from './AppointmentsTable'

export const metadata = { title: 'Appointments · Admin' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { segment?: string; q?: string }
}

function filterMocks(
  items: AppointmentListItem[],
  filters: AppointmentFilters,
): AppointmentListItem[] {
  const now = Date.now()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  let arr = items
  if (filters.segment === 'requests') {
    arr = arr.filter((a) => ['pending', 'scheduled', 'awaiting_payment'].includes(a.status))
  } else if (filters.segment === 'today') {
    arr = arr.filter((a) => {
      const t = new Date(a.appointmentDateTime).getTime()
      return t >= todayStart.getTime() && t < todayEnd.getTime()
    })
  } else if (filters.segment === 'upcoming') {
    arr = arr.filter(
      (a) =>
        new Date(a.appointmentDateTime).getTime() >= todayEnd.getTime() &&
        ['pending', 'scheduled', 'confirmed', 'checked_in', 'in_progress'].includes(a.status),
    )
  } else if (filters.segment === 'past') {
    arr = arr.filter((a) => new Date(a.appointmentDateTime).getTime() < todayStart.getTime())
  } else if (filters.segment === 'cancelled') {
    arr = arr.filter((a) => a.status === 'cancelled')
  } else if (filters.segment === 'no_show') {
    arr = arr.filter((a) => a.status === 'no_show')
  }
  if (filters.search) {
    const s = filters.search.toLowerCase()
    arr = arr.filter((a) =>
      [a.customerName, a.customerEmail, a.treatmentName, a.doctorName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(s),
    )
  }
  // sort
  if (filters.segment === 'today' || filters.segment === 'upcoming' || filters.segment === 'requests') {
    arr = [...arr].sort(
      (a, b) =>
        new Date(a.appointmentDateTime).getTime() -
        new Date(b.appointmentDateTime).getTime(),
    )
  } else {
    arr = [...arr].sort(
      (a, b) =>
        new Date(b.appointmentDateTime).getTime() -
        new Date(a.appointmentDateTime).getTime(),
    )
  }
  void now
  return arr
}

export default async function AdminAppointmentsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const me = await getCurrentUser()
  const filters: AppointmentFilters = {
    segment:
      (searchParams.segment as AppointmentFilters['segment']) ?? 'requests',
    search: searchParams.q,
    limit: 100,
  }
  const [real, requestCount] = await Promise.all([
    listAppointments(supabase, filters),
    countPendingRequests(supabase),
  ])

  const isDemoAdmin = me?.email === DEMO_ADMIN_EMAIL
  const showMocks = isDemoAdmin && real.items.length === 0
  const items = showMocks ? filterMocks(MOCK_APPOINTMENTS, filters) : real.items
  const total = showMocks ? items.length : real.total

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
            Clinic
          </span>
          <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight text-[#163F33]">
            Appointments
          </h1>
          <p className="mt-1 font-body text-[13px] text-[#1F1F1F]/65">
            {total} appointment{total === 1 ? '' : 's'} · {filters.segment}
            {showMocks ? ' · demo data' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/console"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-3 py-2 text-[12.5px] font-semibold text-[#163F33] hover:bg-[#D4AF37]/20"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Bookings Console
          </Link>
          <Link
            href="/admin/treatments"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#163F33]/20 bg-white px-3 py-2 text-[12.5px] font-semibold text-[#163F33] hover:bg-[#F7F2E8]/60"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Treatments
          </Link>
          <Link
            href="/admin/appointments/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E5B4B] px-3 py-2 text-[12.5px] font-semibold text-white hover:bg-[#163F33]"
          >
            <Plus className="h-3.5 w-3.5" />
            Walk-in
          </Link>
        </div>
      </header>

      <AppointmentsFilters requestCount={requestCount} />
      <AppointmentsTable items={items} />
    </div>
  )
}
