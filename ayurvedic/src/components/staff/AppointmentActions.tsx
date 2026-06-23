'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { BookingKind, BookingStatus, Gender } from '@/types/booking'
import { approveAndAssign, setStatus } from '@/lib/staff/actions'

interface Props {
  id: string
  status: BookingStatus
  bookingKind: BookingKind
  /** Required therapist gender derived from the gender policy (or null = any). */
  genderRequirement: Gender | null
  requestedAt: string | null
}

function toLocalInput(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AppointmentActions({ id, status, bookingKind, genderRequirement, requestedAt }: Props) {
  const router = useRouter()
  const [therapistName, setTherapistName] = useState('')
  const [therapistGender, setTherapistGender] = useState<Gender | ''>(genderRequirement ?? '')
  const [confirmedAt, setConfirmedAt] = useState(toLocalInput(requestedAt))
  const [room, setRoom] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const run = (fn: () => Promise<{ ok: true } | { error: string }>) => {
    setError(null)
    start(async () => {
      const res = await fn()
      if ('error' in res) setError(res.error)
      else router.refresh()
    })
  }

  const needsApproval = status === 'pending' || status === 'scheduled'

  return (
    <div className="rounded-xl border border-accent/30 bg-white p-5">
      <h3 className="mb-3 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Actions</h3>

      {needsApproval && (
        <div className="space-y-3">
          {genderRequirement && (
            <p className="rounded-lg bg-cream px-3 py-2 font-body text-[12.5px] text-dark/70">
              Same-gender policy: assign a <strong>{genderRequirement}</strong> therapist.
            </p>
          )}
          <Field label="Therapist name">
            <input value={therapistName} onChange={(e) => setTherapistName(e.target.value)} className={inp} placeholder="Therapist's name" />
          </Field>
          <Field label="Therapist gender">
            <select value={therapistGender} onChange={(e) => setTherapistGender(e.target.value as Gender)} className={inp}>
              <option value="">Select…</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </Field>
          <Field label="Confirmed date & time">
            <input type="datetime-local" value={confirmedAt} onChange={(e) => setConfirmedAt(e.target.value)} className={inp} />
          </Field>
          <Field label="Room (optional)">
            <input value={room} onChange={(e) => setRoom(e.target.value)} className={inp} placeholder="e.g. Room 2" />
          </Field>
          <button
            disabled={pending}
            onClick={() =>
              run(() =>
                approveAndAssign(id, {
                  therapistName,
                  therapistGender: (therapistGender || 'female') as Gender,
                  confirmedAt: new Date(confirmedAt).toISOString(),
                  room,
                }),
              )
            }
            className={btnPrimary}
          >
            {pending ? 'Saving…' : bookingKind === 'consultation' ? 'Approve & confirm consultation' : 'Approve & assign'}
          </button>
        </div>
      )}

      {status === 'awaiting_payment' && (
        <p className="font-body text-[13px] text-dark/65">Approved — waiting for the customer to pay. They&apos;ll be confirmed automatically once payment succeeds.</p>
      )}

      {(status === 'confirmed' || status === 'checked_in' || status === 'in_progress') && (
        <div className="flex flex-wrap gap-2">
          {status === 'confirmed' && <Btn onClick={() => run(() => setStatus(id, 'checked_in'))} disabled={pending}>Check in</Btn>}
          {status === 'checked_in' && <Btn onClick={() => run(() => setStatus(id, 'in_progress'))} disabled={pending}>Start treatment</Btn>}
          {status === 'in_progress' && <Btn onClick={() => run(() => setStatus(id, 'completed'))} disabled={pending}>Complete</Btn>}
          {status !== 'in_progress' && <Btn danger onClick={() => run(() => setStatus(id, 'no_show'))} disabled={pending}>No-show</Btn>}
          <Btn danger onClick={() => run(() => setStatus(id, 'cancelled'))} disabled={pending}>Cancel</Btn>
        </div>
      )}

      {error && <p role="alert" className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 font-body text-[12.5px] text-red-700">{error}</p>}
    </div>
  )
}

const inp = 'w-full rounded-lg border border-accent/30 bg-white px-3 py-2 font-body text-[14px] text-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40'
const btnPrimary = 'inline-flex h-11 w-full items-center justify-center rounded-xl bg-accent px-5 font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-accent/90 disabled:opacity-60'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-dark/55">{label}</span>
      {children}
    </label>
  )
}
function Btn({ children, onClick, disabled, danger }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.12em] disabled:opacity-60 ${
        danger ? 'border-red-300 text-red-700 hover:bg-red-50' : 'border-accent/40 text-primary hover:bg-cream'
      }`}
    >
      {children}
    </button>
  )
}
