import Link from 'next/link'
import { CalendarDays, Video, MapPin } from 'lucide-react'
import type { ConsultationToday } from '@/lib/admin/queries'

const TIME_FMT = new Intl.DateTimeFormat('en-MY', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

export default function TodayConsultationsCard({
  consultations,
}: {
  consultations: ConsultationToday[]
}) {
  return (
    <article
      className="overflow-hidden rounded-3xl border border-[#6E1023]/8 bg-white"
      style={{
        boxShadow:
          '0 1px 0 0 rgba(110,16,35,0.04), 0 12px 30px -16px rgba(110,16,35,0.18)',
      }}
    >
      <header className="flex items-center justify-between border-b border-[#6E1023]/6 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#D4AF37]/12">
            <CalendarDays className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="font-heading text-[13px] font-semibold text-[#6E1023]">
              Today&apos;s consultations
            </h2>
            <p className="font-body text-[10.5px] text-[#1F1F1F]/55">
              {consultations.length === 0
                ? 'Nothing booked'
                : `${consultations.length} scheduled`}
            </p>
          </div>
        </div>
        <Link
          href="/admin/appointments?filter=today"
          className="font-heading text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#6E1023]/55 hover:text-[#D4AF37]"
        >
          View all →
        </Link>
      </header>
      {consultations.length === 0 ? (
        <p className="px-5 py-8 text-center font-body text-[13px] italic text-[#1F1F1F]/55">
          Calendar is clear today.
        </p>
      ) : (
        <ul className="divide-y divide-[#6E1023]/6">
          {consultations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/appointments/${c.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[#F7F2E8]/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="font-mono text-[12px] font-semibold tabular-nums text-[#6E1023]">
                    {TIME_FMT.format(new Date(c.startsAt))}
                  </span>
                  <span className="h-4 w-px bg-[#6E1023]/10" />
                  <div className="min-w-0">
                    <p className="truncate font-heading text-[12.5px] font-semibold text-[#6E1023]">
                      {c.treatmentName}
                    </p>
                    <p className="truncate font-body text-[11px] text-[#1F1F1F]/55">
                      {c.customerName ?? 'Walk-in'}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#6E1023]/[0.06] px-2 py-0.5 font-heading text-[10px] font-semibold text-[#6E1023]">
                  {c.mode === 'virtual' ? (
                    <Video className="h-2.5 w-2.5" />
                  ) : (
                    <MapPin className="h-2.5 w-2.5" />
                  )}
                  {c.mode === 'virtual' ? 'Virtual' : 'In-person'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
