'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { GridAppt, GridBlock } from '@/lib/staff/appointments'
import type { Therapist } from '@/lib/staff/therapists'
import { fmtMY } from '@/lib/datetime'

const OPEN = 9 * 60 + 30   // 09:30
const CLOSE = 20 * 60 + 30 // 20:30
const ROW = 30
const ROW_PX = 46
const HEADER_PX = 40
const COL_W = 150
const totalPx = ((CLOSE - OPEN) / ROW) * ROW_PX

const STATUS_BG: Record<string, string> = {
  scheduled: 'bg-blue-100 border-blue-300 text-blue-900',
  awaiting_payment: 'bg-amber-100 border-amber-300 text-amber-900',
  confirmed: 'bg-green-100 border-green-300 text-green-900',
  checked_in: 'bg-teal-100 border-teal-300 text-teal-900',
  in_progress: 'bg-indigo-100 border-indigo-300 text-indigo-900',
  completed: 'bg-gray-100 border-gray-300 text-gray-500',
}

function shiftDay(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00+08:00`)
  d.setDate(d.getDate() + days)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}
const topFor = (min: number) => ((min - OPEN) / ROW) * ROW_PX
const clamp = (min: number) => Math.max(OPEN, Math.min(CLOSE, min))

interface Props {
  basePath: string // e.g. '/console/schedule' or '/doctor/calendar'
  detailBase: string // e.g. '/console' or '/doctor'
  date: string
  therapists: Therapist[]
  appts: GridAppt[]
  unassigned: GridAppt[]
  blocks: GridBlock[]
}

export default function ScheduleGrid({ basePath, detailBase, date, therapists, appts, unassigned, blocks }: Props) {
  const router = useRouter()
  const go = (d: string) => router.push(`${basePath}?date=${d}`)

  const hourLabels: number[] = []
  for (let m = Math.ceil(OPEN / 60) * 60; m <= CLOSE; m += 60) hourLabels.push(m)

  const columns: { code: string | null; name: string }[] = [
    ...(unassigned.length ? [{ code: null as string | null, name: 'Waiting list' }] : []),
    ...therapists.map((t) => ({ code: t.code as string | null, name: t.name })),
  ]
  const apptsFor = (code: string | null) =>
    code === null ? unassigned : appts.filter((a) => a.therapistCode === code)
  const blocksFor = (code: string | null) =>
    blocks.filter((b) => b.therapistCode === null || b.therapistCode === code)

  return (
    <div>
      {/* Date nav */}
      <div className="mb-4 flex items-center gap-3">
        <Link href={`${basePath}?date=${shiftDay(date, -1)}`} className="rounded-lg border border-accent/30 p-1.5 text-dark/60 hover:text-primary">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && go(e.target.value)}
          className="rounded-lg border border-accent/30 bg-white px-3 py-1.5 font-body text-[13px] text-dark focus:border-accent focus:outline-none"
        />
        <Link href={`${basePath}?date=${shiftDay(date, 1)}`} className="rounded-lg border border-accent/30 p-1.5 text-dark/60 hover:text-primary">
          <ChevronRight className="h-4 w-4" />
        </Link>
        <span className="font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-dark/55">
          {fmtMY(`${date}T12:00:00+08:00`, { weekday: 'long', day: 'numeric', month: 'long' })}
          <span className="ml-2 text-accent">{appts.length + unassigned.length} appts</span>
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-accent/20 bg-white">
        <div className="flex min-w-full">
          {/* Time gutter */}
          <div className="sticky left-0 z-10 flex-none bg-white" style={{ width: 64 }}>
            <div style={{ height: HEADER_PX }} className="border-b border-accent/20" />
            <div className="relative" style={{ height: totalPx }}>
              {hourLabels.map((m) => (
                <div key={m} className="absolute right-2 -translate-y-1/2 whitespace-nowrap font-heading text-[10.5px] font-semibold tabular-nums text-dark/55" style={{ top: topFor(m) }}>
                  {fmtMY(`${date}T${String(Math.floor(m / 60)).padStart(2, '0')}:00:00+08:00`, { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
              ))}
            </div>
          </div>

          {/* Columns */}
          {columns.map((col) => (
            <div key={col.code ?? 'wait'} className="flex-1 border-l border-accent/15" style={{ minWidth: COL_W }}>
              <div style={{ height: HEADER_PX }} className="flex items-center justify-center border-b border-accent/20 bg-cream/60 px-2 text-center font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                {col.name}
              </div>
              <div
                className="relative"
                style={{
                  height: totalPx,
                  backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${ROW_PX - 1}px, rgba(110,16,35,0.06) ${ROW_PX - 1}px, rgba(110,16,35,0.06) ${ROW_PX}px)`,
                }}
              >
                {/* Blocked / leave shading */}
                {blocksFor(col.code).map((b, i) => {
                  const isDayOff = b.endMin - b.startMin >= 1440
                  return (
                    <div
                      key={`b${i}`}
                      className="absolute inset-x-0 z-0 flex items-center justify-center bg-dark/[0.07]"
                      style={{
                        top: topFor(clamp(b.startMin)),
                        height: ((clamp(b.endMin) - clamp(b.startMin)) / ROW) * ROW_PX,
                        backgroundImage:
                          'repeating-linear-gradient(135deg, transparent, transparent 7px, rgba(31,31,31,0.05) 7px, rgba(31,31,31,0.05) 8px)',
                      }}
                      title={b.reason ?? (isDayOff ? 'Day off' : 'Blocked')}
                    >
                      <span className="rounded-full border border-dark/10 bg-white/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-dark/60 shadow-sm backdrop-blur-sm">
                        {isDayOff ? 'Day off' : 'Blocked'}
                      </span>
                    </div>
                  )
                })}
                {/* Appointments */}
                {apptsFor(col.code).map((a) => (
                  <Link
                    key={a.id}
                    href={`${detailBase}/${a.id}`}
                    className={`absolute inset-x-1 z-[1] overflow-hidden rounded-md border px-1.5 py-1 text-[10.5px] leading-tight ${STATUS_BG[a.status] ?? 'bg-white border-accent/30'}`}
                    style={{ top: topFor(clamp(a.startMin)) + 1, height: Math.max(ROW_PX - 2, (a.durationMins / ROW) * ROW_PX) - 2 }}
                  >
                    <div className="truncate font-bold">{a.patientName ?? '—'}</div>
                    <div className="truncate opacity-80">{a.treatmentName ?? ''}</div>
                    <div className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wide opacity-60">
                      {fmtMY(`${date}T${String(Math.floor(a.startMin / 60)).padStart(2, '0')}:${String(a.startMin % 60).padStart(2, '0')}:00+08:00`, { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
