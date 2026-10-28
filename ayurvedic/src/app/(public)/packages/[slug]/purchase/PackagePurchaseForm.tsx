'use client'

import { useState } from 'react'
import { createPackageOrder } from '@/lib/packages/checkout-actions'
import { PACKAGE_TERMS } from '@/lib/packages/terms'

export default function PackagePurchaseForm({
  packageSlug,
  packageName,
  priceRm,
  cardEnabled,
}: {
  packageSlug: string
  packageName: string
  priceRm: number
  cardEnabled: boolean
}) {
  const [idempotencyKey] = useState(() => {
    try {
      return crypto.randomUUID()
    } catch {
      return `${Date.now()}-${Math.random()}`
    }
  })

  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [method, setMethod] = useState<'fpx' | 'card'>('fpx')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!agreed) {
      setError('You must agree to the terms and conditions to continue.')
      return
    }
    setSubmitting(true)
    try {
      const result = await createPackageOrder({
        packageSlug,
        ownerName,
        ownerPhone,
        ownerEmail,
        agreedToTerms: agreed,
        method,
        idempotencyKey,
      })
      if (!result.ok) {
        setError(result.error)
        setSubmitting(false)
        return
      }
      window.location.href = result.data!.billUrl
    } catch {
      setError('Something went wrong. Please try again or WhatsApp us.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-accent/20 bg-white p-6 sm:p-8">
      <Field label="Full name">
        <input
          required
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          className={inp}
          placeholder="Your full name"
        />
      </Field>

      <Field label="Phone number">
        <input
          required
          value={ownerPhone}
          onChange={(e) => setOwnerPhone(e.target.value)}
          className={inp}
          placeholder="e.g. 016-407 1129"
        />
      </Field>

      <Field label="Email address">
        <input
          required
          type="email"
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
          className={inp}
          placeholder="you@email.com"
        />
      </Field>

      <div>
        <span className="mb-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-dark/55">
          Package
        </span>
        <div className="rounded-lg border border-accent/20 bg-cream px-3 py-2 font-body text-[14px] text-dark">
          {packageName} — RM{priceRm}
        </div>
      </div>

      {cardEnabled && (
        <div>
          <span className="mb-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-dark/55">
            Payment method
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMethod('fpx')}
              className={`h-11 flex-1 rounded-lg border font-heading text-[11px] font-bold uppercase tracking-[0.12em] ${method === 'fpx' ? 'border-accent bg-accent/10 text-accent' : 'border-accent/20 text-dark/60'}`}
            >
              Online Banking (FPX)
            </button>
            <button
              type="button"
              onClick={() => setMethod('card')}
              className={`h-11 flex-1 rounded-lg border font-heading text-[11px] font-bold uppercase tracking-[0.12em] ${method === 'card' ? 'border-accent bg-accent/10 text-accent' : 'border-accent/20 text-dark/60'}`}
            >
              Credit / Debit Card
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-accent/20 bg-cream/60 p-4">
        <h3 className="font-heading text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
          Terms &amp; Conditions
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-4 font-body text-[12px] leading-[1.5] text-dark/70">
          {PACKAGE_TERMS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <label className="mt-3 flex items-start gap-2 font-body text-[13px] text-dark">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-none"
          />
          I acknowledge that I have read and agree to the above Terms and Conditions.
        </label>
      </div>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 font-body text-[12.5px] text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !agreed}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent px-5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-white hover:bg-accent/90 disabled:opacity-50"
      >
        {submitting ? 'Redirecting to payment…' : `Pay RM${priceRm} Now`}
      </button>
    </form>
  )
}

const inp =
  'w-full rounded-lg border border-accent/30 bg-white px-3 py-2.5 font-body text-[14px] text-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-dark/55">
        {label}
      </span>
      {children}
    </label>
  )
}
