'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { X } from 'lucide-react'
import type { GridAppt } from '@/lib/staff/appointments'
import type { Therapist } from '@/lib/staff/therapists'
import { rescheduleFromGrid, deleteBooking } from '@/lib/staff/actions'
import { fmtMY } from '@/lib/datetime'
import { therapistLabel } from '@/lib/staff/therapists'

const OPEN = 9 * 60 + 30
const CLOSE = 20 * 60 + 30
const ROW = 30

function shiftDay(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00+08:00`)
  d.setDate(d.getDate() + days)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

function minLabel(min: number) {
  const hh = String(Math.floor(min / 60)).padStart(2, '0')
  const mm = String(min % 60).padStart(2, '0')
  const d = new Date(`1970-01-01T${hh}:${mm}:00+08:00`)
  return d.toLocaleTimeString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', hour: 'numeric', minute: '2-digit', hour12: true })
}

const SLOTS: number[] = []
for (let m = OPEN; m < CLOSE; m += ROW) SLOTS.push(m)

interface Props {
  appt: GridAppt
  date: string
  therapists: Therapist[]
  onClose: () => void
  onSuccess: () => void
}

export default function ConsoleRescheduleDialog({ appt, date, therapists, onClose, onSuccess }: Props) {
  const [newDate, setNewDate] = useState(date)
  const [newTimeMin, setNewTimeMin] = useState<number>(appt.startMin)
  const [therapistCode, setTherapistCode] = useState<string>(appt.therapistCode ?? '')
  const [room, setRoom] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  // Ensure the current appointment time is always a selectable option, even
  // if it was created off the 30-minute grid. Without this the controlled
  // <select> has no matching <option> and silently falls back to the first
  // grid slot while state still holds the original (off-grid) value.
  const timeOptions = useMemo(() => {
    if (SLOTS.includes(appt.startMin)) return SLOTS
    return [...SLOTS, appt.startMin].sort((a, b) => a - b)
  }, [appt.startMin])

  // Lock body scroll while the dialog is open.
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [])

  const startAt = useMemo(() => {
    const hh = String(Math.floor(newTimeMin / 60)).padStart(2, '0')
    const mm = String(newTimeMin % 60).padStart(2, '0')
    return new Date(`${newDate}T${hh}:${mm}:00+08:00`).toISOString()
  }, [newDate, newTimeMin])

  const submit = () => {
    if (pending) return
    setError(null)
    start(async () => {
      const res = await rescheduleFromGrid({
        appointmentId: appt.id,
        newStartAt: startAt,
        newTherapistCode: therapistCode || null,
        room: room || null,
      })
      if ('error' in res) {
        setError(res.error)
      } else {
        onSuccess()
      }
    })
  }

  const handleDelete = () => {
    if (pending) return
    if (!confirm('Delete this appointment permanently? This cannot be undone.')) return
    setError(null)
    start(async () => {
      const res = await deleteBooking(appt.id)
      if ('error' in res) {
        setError(res.error)
      } else {
        onSuccess()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-[15px] font-bold text-primary">Reschedule appointment</h3>
          <button onClick={onClose} className="rounded-lg border border-accent/30 p-1.5 text-dark/60 hover:text-primary" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 font-body text-[13px] text-dark/70">
          <strong>{appt.patientName ?? '—'}</strong> · {appt.treatmentName ?? 'Treatment'}
          <br />
          <span className="text-dark/55">
            {fmtMY(`${date}T${String(Math.floor(appt.startMin / 60)).padStart(2, '0')}:${String(appt.startMin % 60).padStart(2, '0')}:00+08:00`, { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="New date">
              <input
                type="date"
                value={newDate}
                min={shiftDay(new Date().toISOString().slice(0, 10), 0)}
                onChange={(e) => e.target.value && setNewDate(e.target.value)}
                className={inp}
              />
            </Field>
            <Field label="New time">
              <select value={newTimeMin} onChange={(e) => setNewTimeMin(Number(e.target.value))} className={inp}>
                {timeOptions.map((m) => (
                  <option key={m} value={m}>{minLabel(m)}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Therapist">
            <select value={therapistCode} onChange={(e) => setTherapistCode(e.target.value)} className={inp}>
              <option value={appt.therapistCode ?? ''}>Keep current</option>
              {therapists.map((t) => (
                <option key={t.code} value={t.code}>{therapistLabel(t)}</option>
              ))}
            </select>
          </Field>

          <Field label="Room (optional)">
            <input value={room} onChange={(e) => setRoom(e.target.value)} className={inp} placeholder="e.g. Room 2" />
          </Field>
        </div>

        {error && <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 font-body text-[12px] text-red-700">{error}</p>}

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={onClose} className="rounded-xl border border-accent/30 px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-dark/70 hover:bg-cream">Cancel</button>
          <button onClick={handleDelete} disabled={pending} className="rounded-xl border border-red-300 px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-red-700 hover:bg-red-50 disabled:opacity-60">
            {pending ? 'Deleting…' : 'Delete'}
          </button>
          <button onClick={submit} disabled={pending} className="rounded-xl bg-accent px-5 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-accent/90 disabled:opacity-60">
            {pending ? 'Rescheduling…' : 'Reschedule'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inp = 'w-full rounded-lg border border-accent/30 bg-white px-3 py-2 font-body text-[14px] text-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-dark/55">{label}</span>
      {children}
    </label>
  )
}
