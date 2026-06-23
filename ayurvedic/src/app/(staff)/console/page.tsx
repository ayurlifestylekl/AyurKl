import Link from 'next/link'
import { requireStaff } from '@/lib/staff/guard'
import {
  listAppointments,
  getTodayAppointments,
  getTherapistBoard,
} from '@/lib/staff/appointments'
import type { BookingStatus } from '@/types/booking'
import BookingQueue from '@/components/staff/BookingQueue'
import TodayBoard from '@/components/staff/TodayBoard'
import TherapistBoard from '@/components/staff/TherapistBoard'
import StatCard from '@/components/staff/StatCard'
import StatusBadge from '@/components/staff/StatusBadge'
import AutoRefresh from '@/components/staff/AutoRefresh'

export const dynamic = 'force-dynamic'

const TABS: { key: string; label: string; status?: BookingStatus | BookingStatus[] }[] = [
  { key: 'today', label: 'Today' },
  { key: 'new', label: 'New requests', status: 'pending' },
  { key: 'awaiting', label: 'Awaiting payment', status: 'awaiting_payment' },
  { key: 'confirmed', label: 'Confirmed', status: ['confirmed', 'checked_in', 'in_progress'] },
  { key: 'therapists', label: 'Therapists' },
  { key: 'all', label: 'All' },
]

function timeOf(iso: string | null) {
  return iso ? new Date(iso).toLocaleTimeString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit' }) : '—'
}

export default async function ConsolePage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string }
}) {
  const { db } = await requireStaff(['admin', 'front_desk'])
  const q = (searchParams.q ?? '').trim()
  const hasTab = !!searchParams.tab
  const tab = TABS.find((t) => t.key === searchParams.tab)

  const heading = q ? 'Search' : tab ? tab.label : 'Overview'

  return (
    <div>
      <AutoRefresh />
      <div className="mb-5">
        <h1 className="font-heading text-[22px] font-extrabold text-primary">{heading}</h1>
        <p className="font-body text-[13px] text-dark/55">Review requests, approve &amp; assign therapists.</p>
      </div>

      {/* Search — always available, overrides the view when present. */}
      <form method="get" className="mb-5 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or phone…"
          className="w-full max-w-sm rounded-lg border border-accent/30 bg-white px-3 py-2 font-body text-[14px] text-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
        />
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-white hover:bg-accent/90">
          Search
        </button>
        {q && (
          <Link href="/console" className="rounded-lg border border-accent/30 px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-dark/55 hover:text-primary">
            Clear
          </Link>
        )}
      </form>

      {q ? <SearchResults db={db} q={q} /> : hasTab && tab ? <TabView db={db} tab={tab} /> : <Overview db={db} />}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function Overview({ db }: { db: any }) {
  const [pending, awaiting, today, board] = await Promise.all([
    listAppointments(db, { status: 'pending' }),
    listAppointments(db, { status: 'awaiting_payment' }),
    getTodayAppointments(db),
    getTherapistBoard(db),
  ])
  const freeNow = board.filter((t) => !t.busy).length

  return (
    <div>
      <div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New requests" value={pending.length} href="/console?tab=new" tone={pending.length > 0 ? 'alert' : 'default'} hint="Awaiting approval" />
        <StatCard label="Awaiting payment" value={awaiting.length} href="/console?tab=awaiting" hint="Approved, unpaid" />
        <StatCard label="Today" value={today.length} href="/console?tab=today" hint="Appointments today" />
        <StatCard label="Therapists free" value={`${freeNow}/${board.length}`} href="/console?tab=therapists" tone={freeNow > 0 ? 'good' : 'default'} hint="Available now" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-accent">Today&apos;s schedule</h2>
            <Link href="/console?tab=today" className="font-heading text-[10.5px] font-bold uppercase tracking-[0.12em] text-dark/50 hover:text-primary">View all →</Link>
          </div>
          {today.length === 0 ? (
            <p className="rounded-xl border border-dashed border-accent/30 bg-white/60 px-5 py-8 text-center font-body text-[13.5px] text-dark/50">No appointments today.</p>
          ) : (
            <div className="divide-y divide-accent/10 overflow-hidden rounded-xl border border-accent/20 bg-white">
              {today.slice(0, 6).map((a) => (
                <Link key={a.id} href={`/console/${a.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream/50">
                  <span className="w-14 flex-none font-heading text-[13px] font-bold text-primary">{timeOf(a.appointmentDatetime)}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-dark">{a.patientName ?? '—'}</span>
                  <StatusBadge status={a.status} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-2 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-accent">Needs attention</h2>
          <div className="space-y-2">
            <AttentionRow href="/console?tab=new" label="new request(s) to approve" count={pending.length} />
            <AttentionRow href="/console?tab=awaiting" label="awaiting customer payment" count={awaiting.length} />
            {pending.length === 0 && awaiting.length === 0 && (
              <p className="rounded-xl border border-green-200 bg-green-50/60 px-4 py-3 font-body text-[13.5px] text-green-800">All clear — no pending requests or payments. 🎉</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function AttentionRow({ href, label, count }: { href: string; label: string; count: number }) {
  if (count === 0) return null
  return (
    <Link href={href} className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 transition-colors hover:bg-amber-100">
      <span className="font-body text-[13.5px] text-amber-900"><strong>{count}</strong> {label}</span>
      <span className="font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700">Open →</span>
    </Link>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function TabView({ db, tab }: { db: any; tab: { key: string; status?: BookingStatus | BookingStatus[] } }) {
  if (tab.key === 'today') {
    const today = await getTodayAppointments(db)
    return <TodayBoard appointments={today} />
  }
  if (tab.key === 'therapists') {
    const board = await getTherapistBoard(db)
    return <TherapistBoard board={board} />
  }
  const appointments = await listAppointments(db, { status: tab.status })
  return <BookingQueue appointments={appointments} linkBase="/console" emptyLabel="Nothing in this view yet." />
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function SearchResults({ db, q }: { db: any; q: string }) {
  const results = await listAppointments(db, { search: q })
  return (
    <div>
      <p className="mb-3 font-body text-[12.5px] text-dark/55">
        {results.length} result{results.length === 1 ? '' : 's'} for “{q}”.
      </p>
      <BookingQueue appointments={results} linkBase="/console" emptyLabel={`No bookings match “${q}”.`} />
    </div>
  )
}
