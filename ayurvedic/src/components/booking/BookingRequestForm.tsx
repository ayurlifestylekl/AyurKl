'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

import type { BookingKind, Gender, HealthIntake } from '@/types/booking'
import { createBookingRequest } from '@/lib/booking/actions'
import HealthIntakeFields from './HealthIntakeFields'
import PolicyDisclaimers from './PolicyDisclaimers'
import SlotPicker from './SlotPicker'

interface BookingRequestFormProps {
  bookingKind: BookingKind
  treatment?: {
    id: string
    title: string
    duration?: string | null
    price?: number | null
    priceLabel?: string | null
    bookingLeadTimeHours?: number | null
  } | null
  account?: { email: string | null; signedIn: boolean } | null
  parentConsultationId?: string | null
}

export default function BookingRequestForm({
  bookingKind,
  treatment,
  account,
  parentConsultationId,
}: BookingRequestFormProps) {
  const router = useRouter()
  const signedIn = account?.signedIn ?? false

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(account?.email ?? '')
  const [gender, setGender] = useState<Gender | ''>('')
  const [preferredAt, setPreferredAt] = useState('')
  const [preferredAtAlt, setPreferredAtAlt] = useState('')
  const [bookAsGuest, setBookAsGuest] = useState(!signedIn)
  const [health, setHealth] = useState<HealthIntake>({})
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const priceText =
    bookingKind === 'consultation'
      ? 'Free'
      : treatment?.priceLabel || (typeof treatment?.price === 'number' ? `RM${treatment.price}` : 'On consultation')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!gender) return setError('Please select a gender for therapist matching.')
    if (!preferredAt) return setError('Please choose a preferred date and time.')
    if (!accepted) return setError('Please accept the booking policies to continue.')

    startTransition(async () => {
      const res = await createBookingRequest({
        treatmentId: treatment?.id ?? null,
        bookingKind,
        preferredAt: new Date(preferredAt).toISOString(),
        preferredAtAlt: preferredAtAlt ? new Date(preferredAtAlt).toISOString() : null,
        patientName: name,
        patientPhone: phone,
        patientEmail: email,
        patientGender: gender,
        isGuest: bookAsGuest || !signedIn,
        healthIntake: health,
        acceptedPolicies: accepted,
        parentConsultationId: parentConsultationId ?? null,
      })
      if ('error' in res) setError(res.error)
      else router.push(`/book/request/${res.id}?t=${res.token}`)
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {/* Summary */}
      <div className="flex items-center justify-between rounded-xl border border-accent/40 bg-white p-4">
        <div>
          <div className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            {bookingKind === 'consultation' ? 'Consultation' : 'Treatment'}
          </div>
          <div className="font-heading text-[17px] font-extrabold text-primary">
            {treatment?.title ?? 'Free Ayurveda Consultation'}
          </div>
          {treatment?.duration && (
            <div className="font-body text-[12.5px] text-dark/55">{treatment.duration}</div>
          )}
        </div>
        <div className="text-right">
          <div className="font-heading text-[9px] uppercase tracking-[0.18em] text-dark/45">Price</div>
          <div className="font-heading text-[16px] font-bold text-accent">{priceText}</div>
        </div>
      </div>

      {/* Account / guest toggle */}
      {signedIn ? (
        <label className="flex cursor-pointer items-center gap-2.5">
          <input type="checkbox" checked={bookAsGuest} onChange={(e) => setBookAsGuest(e.target.checked)} className="h-4 w-4 accent-[#1e5b4b]" />
          <span className="font-body text-[13px] text-dark/75">Book as guest (don&apos;t attach to my account)</span>
        </label>
      ) : (
        <p className="font-body text-[12.5px] text-dark/60">
          Booking as a guest.{' '}
          <Link href="/auth/login?next=/book" className="font-semibold text-accent underline-offset-2 hover:underline">
            Sign in
          </Link>{' '}
          to track your appointments.
        </p>
      )}

      {/* Patient details */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name" required>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} placeholder="Your name" />
        </Field>
        <Field label="Contact number" required>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputCls} placeholder="01X-XXXXXXX" inputMode="tel" />
        </Field>
        <Field label="Email">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputCls} placeholder="you@email.com" />
        </Field>
        <Field label="Gender (for therapist matching)" required>
          <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} required className={inputCls}>
            <option value="">Select…</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-3">
        <SlotPicker
          treatmentId={treatment?.id ?? null}
          gender={gender}
          value={preferredAt}
          onChange={setPreferredAt}
          label="Preferred date & time"
          required
        />
        <SlotPicker
          treatmentId={treatment?.id ?? null}
          gender={gender}
          value={preferredAtAlt}
          onChange={setPreferredAtAlt}
          label="Alternate date & time (optional)"
        />
      </div>

      <HealthIntakeFields value={health} onChange={setHealth} gender={gender} />
      <PolicyDisclaimers accepted={accepted} onAcceptedChange={setAccepted} />

      {error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-50 px-4 py-3 font-body text-[13px] text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-7 font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? 'Sending request…' : 'Request this appointment'}
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>
      <p className="text-center font-body text-[12px] italic text-dark/55">
        We&apos;ll review your request and confirm your slot
        {bookingKind === 'consultation' ? '.' : ' — you pay only after it&apos;s approved.'}
      </p>
    </form>
  )
}

const inputCls =
  'w-full rounded-lg border border-accent/30 bg-white px-3 py-2.5 font-body text-[14px] text-dark placeholder:text-dark/35 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-dark/55">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      {children}
    </label>
  )
}
