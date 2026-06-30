'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Gender } from '@/types/booking'
import { approveGroup, rejectGroup, deleteBooking } from '@/lib/staff/actions'
import { therapistsForGender, therapistLabel } from '@/lib/staff/therapists'
import { fmtMY } from '@/lib/datetime'

export interface GroupGuestRow {
  id: string
  patientName: string | null
  patientGender: Gender | null
  /** Same-gender therapist required for this guest (null = any). */
  genderRequirement: Gender | null
  status: string
  assignedTherapistName: string | null
  assignedTherapistCode: string | null
}

interface Props {
  groupId: string
  members: GroupGuestRow[]
  /** Shared requested time (the whole group is booked for one slot). */
  requestedAt: string | null
  requestedAtAlt?: string | null
  backHref?: string
  canDelete?: boolean
}

export default function GroupApprovalActions({
  groupId,
  members,
  requestedAt,
  requestedAtAlt = null,
  backHref = '/console',
  canDelete = false,
}: Props) {
  const router = useRouter()
  const pendingMembers = members.filter((m) => m.status === 'pending' || m.status === 'scheduled')
  const needsApproval = pendingMembers.length > 0
  const awaitingPayment = members.some((m) => m.status === 'awaiting_payment')

  const timeOptions = [
    { key: 'preferred', label: 'Preferred', iso: requestedAt },
    { key: 'alt', label: 'Alternate', iso: requestedAtAlt },
  ].filter((o): o is { key: string; label: string; iso: string } => !!o.iso)

  const [chosenTime, setChosenTime] = useState(timeOptions[0]?.iso ?? '')
  const [room, setRoom] = useState('')
  const [assign, setAssign] = useState<Record<string, string>>({})
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const setTherapist = (id: string, code: string) => setAssign((p) => ({ ...p, [id]: code }))

  const run = (fn: () => Promise<{ ok: true } | { error: string }>) => {
    setError(null)
    start(async () => {
      const res = await fn()
      if ('error' in res) setError(res.error)
      else router.refresh()
    })
  }

  const onApprove = () => {
    if (!chosenTime) { setError('Select the confirmed time.'); return }
    for (const m of pendingMembers) {
      if (!assign[m.id]) { setError('Assign a therapist for every guest.'); return }
    }
    run(() => approveGroup(groupId, {
      confirmedAt: chosenTime,
      room,
      assignments: pendingMembers.map((m) => ({ id: m.id, therapistCode: assign[m.id] })),
    }))
  }

  const onReject = () => run(() => rejectGroup(groupId, rejectReason))

  const onDelete = () => {
    if (!confirm('Permanently delete EVERY guest in this group? This cannot be undone.')) return
    setError(null)
    start(async () => {
      for (const m of members) {
        const res = await deleteBooking(m.id)
        if ('error' in res) { setError(res.error); return }
      }
      router.push(backHref)
    })
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-white p-5">
      <h3 className="mb-1 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-accent">
        Group · {members.length} guests
      </h3>
      <p className="mb-3 font-body text-[12px] text-dark/55">
        One request, one shared time. Assign a same-gender therapist to each guest, then approve the whole group.
      </p>

      {needsApproval && (
        <div className="space-y-3">
          <Field label="Confirm a time the guest requested">
            {timeOptions.length === 0 ? (
              <p className="font-body text-[12.5px] italic text-dark/55">No time provided.</p>
            ) : (
              <div className="space-y-1.5">
                {timeOptions.map((o) => (
                  <label key={o.key} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-accent/20 px-3 py-2">
                    <input
                      type="radio"
                      name="groupConfirmTime"
                      checked={chosenTime === o.iso}
                      onChange={() => setChosenTime(o.iso)}
                      className="h-4 w-4 flex-none accent-[#6E1023]"
                    />
                    <span className="font-body text-[13px] text-dark/80">
                      <strong className="font-heading text-[10px] uppercase tracking-[0.12em] text-dark/55">{o.label}:</strong>{' '}
                      {fmtMY(o.iso, { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </Field>

          <Field label="Assign a therapist per guest">
            <div className="space-y-2">
              {pendingMembers.map((m) => (
                <div key={m.id} className="rounded-lg border border-accent/20 px-3 py-2">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-body text-[13px] font-semibold text-primary">{m.patientName ?? 'Guest'}</span>
                    <span className="font-heading text-[9px] uppercase tracking-[0.12em] text-dark/45">
                      {m.genderRequirement ?? m.patientGender ?? 'any'}
                    </span>
                  </div>
                  <select value={assign[m.id] ?? ''} onChange={(e) => setTherapist(m.id, e.target.value)} className={inp}>
                    <option value="">Select therapist…</option>
                    {therapistsForGender(m.genderRequirement).map((t) => (
                      <option key={t.code} value={t.code}>{therapistLabel(t)}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </Field>

          <Field label="Room (optional)">
            <input value={room} onChange={(e) => setRoom(e.target.value)} className={inp} placeholder="e.g. Room 2" />
          </Field>

          <button disabled={pending} onClick={onApprove} className={btnPrimary}>
            {pending ? 'Saving…' : `Approve group (${pendingMembers.length})`}
          </button>
        </div>
      )}

      {!needsApproval && (
        <div className="space-y-2">
          {awaitingPayment && (
            <p className="font-body text-[13px] text-dark/65">
              Approved — waiting for the customer to pay. One payment confirms the whole group.
            </p>
          )}
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-accent/15 px-3 py-2 font-body text-[12.5px]">
              <span className="font-semibold text-primary">{m.patientName ?? 'Guest'}</span>
              <span className="text-dark/60">{m.assignedTherapistName ? `${m.assignedTherapistName} · ${m.assignedTherapistCode}` : '—'}</span>
            </div>
          ))}
        </div>
      )}

      {/* Reject the whole group with a reason the guest will see. */}
      {rejecting && (
        <div className="mt-4 space-y-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <Field label="Reason for rejection (shown to the guest)">
            <textarea
              rows={2}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Not enough therapists available at that time — please pick another slot."
              className={inp}
            />
          </Field>
          <div className="flex gap-2">
            <Btn danger onClick={onReject} disabled={pending}>{pending ? 'Rejecting…' : 'Confirm rejection'}</Btn>
            <Btn onClick={() => setRejecting(false)} disabled={pending}>Back</Btn>
          </div>
        </div>
      )}

      {!rejecting && (needsApproval || awaitingPayment || canDelete) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-accent/15 pt-4">
          {(needsApproval || awaitingPayment) && <Btn danger onClick={() => setRejecting(true)} disabled={pending}>Reject group</Btn>}
          {canDelete && <Btn danger onClick={onDelete} disabled={pending}>Delete group</Btn>}
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
