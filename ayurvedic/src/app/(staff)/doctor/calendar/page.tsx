import Link from 'next/link'
import { requireStaff } from '@/lib/staff/guard'
import { getDoctorPatients } from '@/lib/staff/appointments'
import StatusBadge from '@/components/staff/StatusBadge'
import AutoRefresh from '@/components/staff/AutoRefresh'
import type { StaffAppointment } from '@/types/booking'
import { fmtMY, mytDayKey } from '@/lib/datetime'

export const dynamic = 'force-dynamic'

function timeOf(iso: string | null) {
  return fmtMY(iso, { hour: '2-digit', minute: '2-digit' })
}

export default async function DoctorCalendarPage() {
  const { db } = await requireStaff(['admin', 'doctor'])
  const patients = await getDoctorPatients(db)

  // Group scheduled appointments by day. getDoctorPatients is sorted ascending,
  // so both the day order and the per-day time order come out chronological.
  const withDate = patients.filter((p) => p.appointmentDatetime)
  const groups = new Map<string, StaffAppointment[]>()
  for (const p of withDate) {
    const key = mytDayKey(p.appointmentDatetime as string) // Malaysia calendar day
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(p)
  }
  const days = Array.from(groups.keys())
  const todayStr = mytDayKey(new Date())

  return (
    <div>
      <AutoRefresh />
      <h1 className="font-heading text-[22px] font-extrabold text-primary">Calendar</h1>
      <p className="mb-5 font-body text-[13px] text-dark/55">Your booked appointments by day. Tap one for the patient&apos;s details.</p>

      {days.length === 0 ? (
        <p className="rounded-xl border border-dashed border-accent/30 bg-white/60 px-5 py-10 text-center font-body text-[14px] text-dark/50">
          No scheduled appointments yet.
        </p>
      ) : (
        days.map((d) => (
          <section key={d} className="mb-7">
            <h2 className="mb-2 flex items-center gap-2 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-accent">
              {fmtMY(`${d}T12:00:00+08:00`, { weekday: 'long', day: 'numeric', month: 'long' })}
              {d === todayStr && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] tracking-[0.12em] text-white">Today</span>
              )}
            </h2>
            <div className="divide-y divide-accent/10 overflow-hidden rounded-xl border border-accent/20 bg-white">
              {groups.get(d)!.map((p) => (
                <Link key={p.id} href={`/doctor/${p.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-cream/60">
                  <div className="w-16 flex-none font-heading text-[14px] font-bold text-primary">{timeOf(p.appointmentDatetime)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-dark">{p.patientName ?? '—'}</div>
                    <div className="truncate text-[12.5px] text-dark/55">
                      {p.treatmentName ?? '—'}
                      {p.assignedTherapistName ? ` · ${p.assignedTherapistName} (${p.assignedTherapistCode ?? '—'})` : ''}
                      {p.room ? ` · ${p.room}` : ''}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
