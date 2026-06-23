import Link from 'next/link'
import { requireStaff } from '@/lib/staff/guard'
import { listAppointments } from '@/lib/staff/appointments'
import type { BookingStatus } from '@/types/booking'
import BookingQueue from '@/components/staff/BookingQueue'
import AutoRefresh from '@/components/staff/AutoRefresh'

export const dynamic = 'force-dynamic'

const TABS: { key: string; label: string; status?: BookingStatus | BookingStatus[] }[] = [
  { key: 'new', label: 'New requests', status: 'pending' },
  { key: 'awaiting', label: 'Awaiting payment', status: 'awaiting_payment' },
  { key: 'confirmed', label: 'Confirmed', status: ['confirmed', 'checked_in', 'in_progress'] },
  { key: 'all', label: 'All' },
]

export default async function ConsolePage({ searchParams }: { searchParams: { tab?: string } }) {
  const { db } = await requireStaff(['admin', 'front_desk'])
  const tab = TABS.find((t) => t.key === searchParams.tab) ?? TABS[0]
  const appointments = await listAppointments(db, { status: tab.status })

  // counts for the New tab badge
  const pending = tab.key === 'new' ? appointments.length : (await listAppointments(db, { status: 'pending' })).length

  return (
    <div>
      <AutoRefresh />
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="font-heading text-[22px] font-extrabold text-primary">Bookings console</h1>
          <p className="font-body text-[13px] text-dark/55">Review requests, approve & assign therapists.</p>
        </div>
        <Link
          href="/console/new"
          className="rounded-xl bg-accent px-5 py-2.5 font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-white hover:bg-accent/90"
        >
          + New booking
        </Link>
      </div>

      <nav className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = t.key === tab.key
          return (
            <Link
              key={t.key}
              href={`/console?tab=${t.key}`}
              className={`rounded-full border px-4 py-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                active ? 'border-accent bg-accent text-white' : 'border-accent/30 bg-white text-dark/60 hover:text-primary'
              }`}
            >
              {t.label}
              {t.key === 'new' && pending > 0 && (
                <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/25' : 'bg-accent/15 text-accent'}`}>{pending}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <BookingQueue appointments={appointments} linkBase="/console" emptyLabel="Nothing in this view yet." />
    </div>
  )
}
