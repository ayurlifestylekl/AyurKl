'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { BookingKind, Gender } from '@/types/booking'
import { createBookingRequest } from '@/lib/booking/actions'

interface TreatmentOption {
  id: string
  title: string
  bookingType?: string | null
}

export default function StaffNewBooking({ treatments }: { treatments: TreatmentOption[] }) {
  const router = useRouter()
  const [kind, setKind] = useState<BookingKind>('treatment')
  const [treatmentId, setTreatmentId] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [preferredAt, setPreferredAt] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  // Walk-in bookings exclude enquiry-only therapies.
  const bookable = treatments.filter((t) => t.bookingType !== 'enquiry')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!gender) return setError('Select a gender for therapist matching.')
    if (!preferredAt) return setError('Choose a date & time.')
    if (kind === 'treatment' && !treatmentId) return setError('Choose a treatment.')

    start(async () => {
      const res = await createBookingRequest({
        treatmentId: kind === 'treatment' ? treatmentId : null,
        bookingKind: kind,
        preferredAt: new Date(preferredAt).toISOString(),
        patientName: name,
        patientPhone: phone,
        patientEmail: email,
        patientGender: gender,
        isGuest: true, // staff-created on the customer's behalf
        healthIntake: notes ? { notes } : {},
        acceptedPolicies: true, // staff confirm the policies verbally
      })
      if ('error' in res) setError(res.error)
      else router.push(`/console/${res.id}`)
    })
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4 rounded-xl border border-accent/30 bg-white p-6">
      <div className="flex gap-2">
        {(['treatment', 'consultation'] as BookingKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-full border px-4 py-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.12em] ${
              kind === k ? 'border-accent bg-accent text-white' : 'border-accent/30 text-dark/60'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {kind === 'treatment' && (
        <Field label="Treatment">
          <select value={treatmentId} onChange={(e) => setTreatmentId(e.target.value)} className={inp}>
            <option value="">Select…</option>
            {bookable.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </Field>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Patient name"><input value={name} onChange={(e) => setName(e.target.value)} className={inp} required /></Field>
        <Field label="Contact number"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inp} required /></Field>
        <Field label="Email (optional)"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inp} /></Field>
        <Field label="Gender">
          <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={inp}>
            <option value="">Select…</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </Field>
        <Field label="Preferred date & time"><input type="datetime-local" value={preferredAt} onChange={(e) => setPreferredAt(e.target.value)} className={inp} /></Field>
      </div>

      <Field label="Notes (optional)"><textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inp} placeholder="Health notes, requests…" /></Field>

      {error && <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 font-body text-[13px] text-red-700">{error}</p>}

      <button disabled={pending} className="rounded-xl bg-accent px-6 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-accent/90 disabled:opacity-60">
        {pending ? 'Creating…' : 'Create booking'}
      </button>
    </form>
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
