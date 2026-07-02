'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

import type { BookingKind, Gender, HealthIntake } from '@/types/booking'
import { createBookingRequest, createGroupBooking, type GroupGuest } from '@/lib/booking/actions'
import HealthIntakeFields from './HealthIntakeFields'
import PolicyDisclaimers from './PolicyDisclaimers'
import SlotPicker from './SlotPicker'

/** A treatment a group guest can choose from. */
export interface GroupTreatmentOption {
  id: string
  title: string
  price?: number | null
}

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
  /** Bookable treatments a group guest can pick from (per-guest therapy choice). */
  treatmentOptions?: GroupTreatmentOption[]
  account?: { email: string | null; signedIn: boolean } | null
  parentConsultationId?: string | null
}

type GuestRow = { name: string; gender: Gender | ''; age: string; treatmentId: string }
const MAX_GUESTS = 6
const emptyGuest = (treatmentId = ''): GuestRow => ({ name: '', gender: '', age: '', treatmentId })

export default function BookingRequestForm({
  bookingKind,
  treatment,
  treatmentOptions,
  account,
  parentConsultationId,
}: BookingRequestFormProps) {
  const router = useRouter()
  const signedIn = account?.signedIn ?? false
  const canGroup = bookingKind === 'treatment'
  const defaultTreatmentId = treatment?.id ?? ''

  // Treatments a guest can pick from. Falls back to the page's treatment.
  const options: GroupTreatmentOption[] =
    treatmentOptions && treatmentOptions.length > 0
      ? treatmentOptions
      : treatment
        ? [{ id: treatment.id, title: treatment.title, price: treatment.price }]
        : []
  const priceById = new Map(options.map((o) => [o.id, typeof o.price === 'number' ? o.price : null]))

  const [partySize, setPartySize] = useState(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(account?.email ?? '')
  const [gender, setGender] = useState<Gender | ''>('')
  const [guests, setGuests] = useState<GuestRow[]>([emptyGuest(defaultTreatmentId), emptyGuest(defaultTreatmentId)])
  const [preferredAt, setPreferredAt] = useState('')
  const [preferredAtAlt, setPreferredAtAlt] = useState('')
  const [bookAsGuest, setBookAsGuest] = useState(!signedIn)
  const [health, setHealth] = useState<HealthIntake>({})
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isGroup = canGroup && partySize > 1

  const resizeParty = (n: number) => {
    setPartySize(n)
    setPreferredAt('')
    setPreferredAtAlt('')
    if (n > 1) {
      setGuests((prev) => {
        const next = [...prev]
        while (next.length < n) next.push(emptyGuest(defaultTreatmentId))
        return next.slice(0, n)
      })
    }
  }

  // Each guest's gender + chosen treatment, for same-time same-gender matching.
  const members = isGroup
    ? guests.slice(0, partySize).map((g) => ({
        gender: g.gender,
        treatmentId: g.treatmentId || defaultTreatmentId || null,
      }))
    : undefined

  const unitPrice = typeof treatment?.price === 'number' ? treatment.price : null
  const groupTotal = isGroup
    ? guests
        .slice(0, partySize)
        .reduce((sum, g) => sum + (priceById.get(g.treatmentId || defaultTreatmentId) ?? 0), 0)
    : 0
  const priceText =
    bookingKind === 'consultation'
      ? 'Free'
      : isGroup
        ? `RM${groupTotal} total`
        : treatment?.priceLabel || (unitPrice != null ? `RM${unitPrice}` : 'On consultation')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!phone.trim()) return setError('Please enter a contact number — we need it to confirm your booking.')
    if (!email.trim()) return setError('Please enter an email — we need it to send your booking updates.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Please enter a valid email address.')
    if (!preferredAt) return setError('Please choose a preferred date and time.')
    if (!accepted) return setError('Please accept the booking policies to continue.')

    startTransition(async () => {
      let res
      if (isGroup) {
        const cleaned = guests.slice(0, partySize)
        if (cleaned.some((g) => !g.name.trim() || (g.gender !== 'male' && g.gender !== 'female'))) {
          setError('Please enter a name and gender for every guest.')
          return
        }
        if (options.length > 1 && cleaned.some((g) => !(g.treatmentId || defaultTreatmentId))) {
          setError('Please choose a therapy for every guest.')
          return
        }
        res = await createGroupBooking({
          treatmentId: treatment?.id ?? '',
          preferredAt: new Date(preferredAt).toISOString(),
          preferredAtAlt: preferredAtAlt ? new Date(preferredAtAlt).toISOString() : null,
          patientPhone: phone,
          patientEmail: email,
          isGuest: bookAsGuest || !signedIn,
          healthIntake: health,
          acceptedPolicies: accepted,
          guests: cleaned.map<GroupGuest>((g) => ({
            name: g.name,
            gender: g.gender as Gender,
            age: g.age ? Number(g.age) : null,
            treatmentId: g.treatmentId || defaultTreatmentId,
          })),
        })
      } else {
        if (!gender) return setError(bookingKind === 'consultation' ? 'Please select a gender.' : 'Please select a gender for therapist matching.')
        res = await createBookingRequest({
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
      }
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
          {treatment?.duration && <div className="font-body text-[12.5px] text-dark/55">{treatment.duration}</div>}
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
          <Link href="/auth/login?next=/book" className="font-semibold text-accent underline-offset-2 hover:underline">Sign in</Link>{' '}
          to track your appointments.
        </p>
      )}

      {/* Party size (treatments only) */}
      {canGroup && (
        <Field label="How many guests?">
          <select value={partySize} onChange={(e) => resizeParty(Number(e.target.value))} className={inputCls}>
            {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n === 1 ? '1 guest (just me)' : `${n} guests`}</option>
            ))}
          </select>
        </Field>
      )}

      {/* Contact */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Contact number" required>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputCls} placeholder="01X-XXXXXXX" inputMode="tel" />
        </Field>
        <Field label="Email" required>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className={inputCls} placeholder="you@email.com" />
        </Field>
      </div>

      {/* Single guest details */}
      {!isGroup && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" required>
            <input value={name} onChange={(e) => setName(e.target.value)} required={!isGroup} className={inputCls} placeholder="Your name" />
          </Field>
          <Field label={bookingKind === 'consultation' ? 'Gender' : 'Gender (for therapist matching)'} required>
            <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={inputCls}>
              <option value="">Select…</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </Field>
        </div>
      )}

      {/* Group guests */}
      {isGroup && (
        <fieldset className="rounded-xl border border-accent/25 bg-white/60 p-4">
          <legend className="px-1 font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-accent">Guests</legend>
          <p className="mb-3 font-body text-[12px] italic text-dark/55">
            Each guest gets a same-gender therapist at the same time
            {options.length > 1 ? ' — and can choose their own therapy.' : '.'}
          </p>
          <div className="space-y-3">
            {guests.slice(0, partySize).map((g, i) => (
              <div key={i} className="rounded-lg border border-accent/15 bg-white/70 p-2.5">
                <div className="grid grid-cols-[1fr_110px_72px] gap-2">
                  <input
                    value={g.name}
                    onChange={(e) => setGuests((p) => p.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                    className={inputCls}
                    placeholder={`Guest ${i + 1} name`}
                  />
                  <select
                    value={g.gender}
                    onChange={(e) => setGuests((p) => p.map((x, j) => (j === i ? { ...x, gender: e.target.value as Gender } : x)))}
                    className={inputCls}
                  >
                    <option value="">Gender…</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                  <input
                    value={g.age}
                    onChange={(e) => setGuests((p) => p.map((x, j) => (j === i ? { ...x, age: e.target.value.replace(/\D/g, '') } : x)))}
                    className={inputCls}
                    placeholder="Age"
                    inputMode="numeric"
                  />
                </div>
                {options.length > 1 && (
                  <select
                    value={g.treatmentId}
                    onChange={(e) => setGuests((p) => p.map((x, j) => (j === i ? { ...x, treatmentId: e.target.value } : x)))}
                    className={`${inputCls} mt-2`}
                    aria-label={`Therapy for guest ${i + 1}`}
                  >
                    <option value="">Choose therapy…</option>
                    {options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title}
                        {typeof o.price === 'number' ? ` — RM${o.price}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </fieldset>
      )}

      {/* Time slots */}
      <div className="grid gap-3">
        <SlotPicker treatmentId={treatment?.id ?? null} gender={gender} mode={bookingKind === 'consultation' ? 'consultation' : 'treatment'} members={members} value={preferredAt} onChange={setPreferredAt} label="Preferred date & time" required />
        <SlotPicker treatmentId={treatment?.id ?? null} gender={gender} mode={bookingKind === 'consultation' ? 'consultation' : 'treatment'} members={members} value={preferredAtAlt} onChange={setPreferredAtAlt} label="Alternate date & time (optional)" />
      </div>

      <HealthIntakeFields value={health} onChange={setHealth} gender={isGroup ? '' : gender} />
      <PolicyDisclaimers accepted={accepted} onAcceptedChange={setAccepted} />

      {error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-50 px-4 py-3 font-body text-[13px] text-red-700">{error}</p>
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
