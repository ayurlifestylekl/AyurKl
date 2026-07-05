'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { GridAppt, GridBlock } from '@/lib/staff/appointments'
import type { Therapist } from '@/lib/staff/therapists'
import { createBlock, deleteBlock } from '@/lib/staff/actions'
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
  /** Front desk / admin can add & remove blocks straight from the grid. */
  editable?: boolean
}

const SLOTS: number[] = []
for (let m = OPEN; m < CLOSE; m += ROW) SLOTS.push(m)

export default function ScheduleGrid({ basePath, detailBase, date, therapists, appts, unassigned, blocks, editable = false }: Props) {
  const router = useRouter()
  const go = (d: string) => router.push(`${basePath}?date=${d}`)

  // Quick-block draft: which therapist column + start minute the user tapped.
  const [draft, setDraft] = useState<{ code: string; startMin: number } | null>(null)
  const [reason, setReason] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const isoAt = (min: number) => {
    const hh = String(Math.floor(min / 60)).padStart(2, '0')
    const mm = String(min % 60).padStart(2, '0')
    return new Date(`${date}T${hh}:${mm}:00+08:00`).toISOString()
  }
  const minLabel = (min: number) =>
    fmtMY(`${date}T${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}:00+08:00`, { hour: 'numeric', minute: '2-digit', hour12: true })

  const addBlock = () => {
    if (!draft) return
    setErr(null)
    start(async () => {
      const res = await createBlock({
        therapistCode: draft.code,
        startAt: isoAt(draft.startMin),
        endAt: isoAt(draft.startMin + ROW),
        allDay: false,
        recurrence: 'none',
        untilDate: null,
        reason,
      })
      if ('error' in res) setErr(res.error)
      else { setDraft(null); setReason(''); router.refresh() }
    })
  }

  const removeBlock = (id: string | null) => {
    if (!id) { setErr('This block can only be removed from the Availability page.'); return }
    if (!confirm('Remove this block?')) return
    setErr(null)
    start(async () => {
      const res = await deleteBlock(id)
      if ('error' in res) setErr(res.error)
      else router.refresh()
    })
  }

  const therapistName = (code: string) => therapists.find((t) => t.code === code)?.name ?? code

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

      {editable && (
        <div className="mb-3">
          {draft ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/40 bg-cream/60 p-3">
              <span className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                Block {therapistName(draft.code)} · {minLabel(draft.startMin)}–{minLabel(draft.startMin + ROW)}
              </span>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional)"
                className="min-w-[180px] flex-1 rounded-lg border border-accent/30 bg-white px-3 py-1.5 font-body text-[13px] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
                autoFocus
              />
              <button onClick={addBlock} disabled={pending} className="rounded-lg bg-accent px-4 py-1.5 font-heading text-[10.5px] font-bold uppercase tracking-[0.14em] text-white hover:bg-accent/90 disabled:opacity-60">
                {pending ? 'Blocking…' : 'Block slot'}
              </button>
              <button onClick={() => { setDraft(null); setReason(''); setErr(null) }} className="rounded-lg border border-accent/30 p-1.5 text-dark/50 hover:text-primary" aria-label="Cancel">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <p className="font-body text-[11.5px] italic text-dark/50">Tap a free slot to block it · tap a block to remove it.</p>
          )}
          {err && <p className="mt-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 font-body text-[12px] text-red-700">{err}</p>}
        </div>
      )}

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
                {/* Click-to-block overlay (front desk / admin, therapist columns only) */}
                {editable && col.code && SLOTS.map((m) => (
                  <button
                    key={`s${m}`}
                    type="button"
                    onClick={() => { setErr(null); setDraft({ code: col.code as string, startMin: m }) }}
                    title={`Block ${minLabel(m)}`}
                    className="group absolute inset-x-0 z-0 hover:bg-accent/10"
                    style={{ top: topFor(m), height: ROW_PX }}
                  >
                    <span className="pointer-events-none absolute inset-0 hidden items-center justify-center text-[9px] font-bold uppercase tracking-wide text-accent group-hover:flex">+ Block</span>
                  </button>
                ))}

                {/* Blocked / leave shading — removable when editable */}
                {blocksFor(col.code).map((b, i) => {
                  const isDayOff = b.endMin - b.startMin >= 1440
                  const content = (
                    <span className="flex max-w-full flex-col items-center gap-0.5 px-1 text-center">
                      <span className="rounded-full border border-dark/10 bg-white/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-dark/60 shadow-sm backdrop-blur-sm">
                        {isDayOff ? 'Day off' : 'Blocked'}
                      </span>
                      {b.reason && (
                        <span className="line-clamp-2 max-w-full break-words text-[9.5px] font-semibold leading-tight text-dark/70">
                          {b.reason}
                        </span>
                      )}
                    </span>
                  )
                  const style = {
                    top: topFor(clamp(b.startMin)),
                    height: ((clamp(b.endMin) - clamp(b.startMin)) / ROW) * ROW_PX,
                    backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 7px, rgba(31,31,31,0.05) 7px, rgba(31,31,31,0.05) 8px)',
                  }
                  return editable ? (
                    <button
                      key={`b${i}`}
                      type="button"
                      onClick={() => removeBlock(b.id)}
                      disabled={pending}
                      title={`${b.reason ?? (isDayOff ? 'Day off' : 'Blocked')} — tap to remove`}
                      className="absolute inset-x-0 z-[1] flex items-center justify-center bg-dark/[0.07] hover:bg-red-500/10"
                      style={style}
                    >
                      {content}
                    </button>
                  ) : (
                    <div
                      key={`b${i}`}
                      className="absolute inset-x-0 z-0 flex items-center justify-center bg-dark/[0.07]"
                      style={style}
                      title={b.reason ?? (isDayOff ? 'Day off' : 'Blocked')}
                    >
                      {content}
                    </div>
                  )
                })}
                {/* Appointments */}
                {apptsFor(col.code).map((a) => (
                  <Link
                    key={a.id}
                    href={`${detailBase}/${a.id}`}
                    className={`absolute inset-x-1 z-[2] overflow-hidden rounded-md border px-1.5 py-1 text-[10.5px] leading-tight ${STATUS_BG[a.status] ?? 'bg-white border-accent/30'}`}
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
