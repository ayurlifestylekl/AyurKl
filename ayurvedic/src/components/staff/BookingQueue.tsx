import Link from 'next/link'
import type { StaffAppointment } from '@/types/booking'
import StatusBadge from './StatusBadge'
import { customerWaLink } from '@/lib/booking/contact'

function fmt(dt: string | null) {
  return dt ? new Date(dt).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

export default function BookingQueue({
  appointments,
  linkBase = '/console',
  emptyLabel = 'No bookings here.',
}: {
  appointments: StaffAppointment[]
  linkBase?: string
  emptyLabel?: string
}) {
  if (appointments.length === 0) {
    return <p className="rounded-xl border border-dashed border-accent/30 bg-white/60 px-5 py-10 text-center font-body text-[14px] text-dark/50">{emptyLabel}</p>
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-accent/20 bg-white">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-accent/20 font-heading text-[10px] uppercase tracking-[0.12em] text-dark/45">
          <tr>
            <th className="px-4 py-3">Guest</th>
            <th className="px-4 py-3">Treatment</th>
            <th className="px-4 py-3">Requested</th>
            <th className="px-4 py-3">Gender</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Price</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-accent/10">
          {appointments.map((a) => (
            <tr key={a.id} className="hover:bg-cream/60">
              <td className="px-4 py-3">
                <div className="font-semibold text-primary">
                  {a.patientName ?? '—'}
                  {a.groupId && <span className="ml-2 rounded bg-accent/15 px-1.5 py-0.5 align-middle text-[9px] font-bold uppercase tracking-wide text-accent">Group</span>}
                </div>
                <div className="flex items-center gap-2 text-[12px] text-dark/55">
                  <span>{a.patientPhone ?? ''}{a.isGuest ? ' · guest' : ''}</span>
                  {customerWaLink(a.patientPhone) && (
                    <a href={customerWaLink(a.patientPhone) as string} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-600 hover:text-green-700">
                      WhatsApp
                    </a>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-dark/85">{a.treatmentName ?? '—'}</div>
                <div className="text-[11px] uppercase tracking-wide text-dark/40">{a.bookingKind}</div>
              </td>
              <td className="px-4 py-3 text-dark/70">{fmt(a.requestedDatetime)}</td>
              <td className="px-4 py-3 text-dark/70">{a.genderRequirement ?? 'any'}</td>
              <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
              <td className="px-4 py-3 text-right font-semibold text-dark">{a.payableAmountRm != null ? `RM${a.payableAmountRm}` : '—'}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`${linkBase}/${a.id}`} className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-accent hover:text-primary">
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
