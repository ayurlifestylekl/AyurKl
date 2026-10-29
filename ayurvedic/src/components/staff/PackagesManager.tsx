'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, CheckCircle2, XCircle, Printer } from 'lucide-react'
import {
  createManualPackagePurchase,
  redeemPackageSession,
  cancelPackagePurchase,
  searchPackagePurchasesAction,
} from '@/lib/packages/actions'
import type { PackageCatalogRow, PackagePurchaseRow } from '@/lib/packages/queries'
import { fmtMY } from '@/lib/datetime'
import { CENTRE_PAYMENT_METHODS, type CentrePaymentMethod } from '@/lib/packages/receipt'

export default function PackagesManager({
  catalog,
  initialPurchases,
}: {
  catalog: PackageCatalogRow[]
  initialPurchases: PackagePurchaseRow[]
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Log a sale
  const [packageId, setPackageId] = useState(catalog.find((c) => c.isActive)?.id ?? '')
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<CentrePaymentMethod | ''>('')
  const [paymentReference, setPaymentReference] = useState('')
  const [notes, setNotes] = useState('')

  // Search
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PackagePurchaseRow[] | null>(null)
  const [searching, setSearching] = useState(false)

  const logSale = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!paymentMethod) {
      setError('Pick how the customer paid.')
      return
    }
    start(async () => {
      const res = await createManualPackagePurchase({ packageId, ownerName, ownerPhone, ownerEmail, paymentMethod, paymentReference, notes })
      if ('error' in res) setError(res.error)
      else {
        setOwnerName(''); setOwnerPhone(''); setOwnerEmail(''); setPaymentMethod(''); setPaymentReference(''); setNotes('')
        router.refresh()
      }
    })
  }

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    try {
      setResults(await searchPackagePurchasesAction(query))
    } finally {
      setSearching(false)
    }
  }

  const redeem = (id: string) => {
    if (!confirm('Mark one session used for this customer?')) return
    setError(null)
    start(async () => {
      const res = await redeemPackageSession(id)
      if ('error' in res) setError(res.error)
      else {
        router.refresh()
        if (results) setResults(await searchPackagePurchasesAction(query))
      }
    })
  }

  const cancel = (id: string) => {
    if (!confirm('Cancel this package? The customer will no longer be able to redeem sessions against it.')) return
    setError(null)
    start(async () => {
      const res = await cancelPackagePurchase(id)
      if ('error' in res) setError(res.error)
      else {
        router.refresh()
        if (results) setResults(await searchPackagePurchasesAction(query))
      }
    })
  }

  const listed = results ?? initialPurchases

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* Log a sale */}
      <form onSubmit={logSale} className="space-y-3 rounded-xl border border-accent/30 bg-white p-5">
        <h3 className="font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-accent">Log a sale</h3>

        <Field label="Package">
          <select value={packageId} onChange={(e) => setPackageId(e.target.value)} className={inp}>
            {catalog.map((p) => (
              <option key={p.id} value={p.id} disabled={!p.isActive}>
                {p.name} — RM{p.priceRm} — {p.sessionCount} sessions{!p.isActive ? ' (not on sale)' : ''}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Customer name">
          <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inp} placeholder="Full name" />
        </Field>

        <Field label="Phone">
          <input value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} className={inp} placeholder="e.g. 016-407 1129" />
        </Field>

        <Field label="Email (optional)">
          <input value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} className={inp} placeholder="customer@email.com" />
        </Field>

        <Field label="Payment method">
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as CentrePaymentMethod)} className={inp}>
            <option value="" disabled>Choose how they paid…</option>
            {CENTRE_PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Payment reference (optional)">
          <input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} maxLength={80} className={inp} placeholder="QR / transfer / card slip no." />
        </Field>

        <Field label="Notes (optional)">
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inp} placeholder="Internal note — not printed on the receipt" />
        </Field>

        {error && <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 font-body text-[12.5px] text-red-700">{error}</p>}

        <button type="submit" disabled={pending || !packageId} className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-accent px-5 font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-accent/90 disabled:opacity-60">
          {pending ? 'Saving…' : 'Log sale'}
        </button>
      </form>

      {/* Search + list */}
      <div>
        <form onSubmit={runSearch} className="mb-3 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={inp}
            placeholder="Search by name, phone, or email"
          />
          <button type="submit" disabled={searching} className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-accent/30 bg-white px-4 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-accent hover:bg-accent/5 disabled:opacity-60">
            <Search className="h-4 w-4" /> Search
          </button>
          {results && (
            <button type="button" onClick={() => { setResults(null); setQuery('') }} className="font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-dark/50 hover:text-dark">
              Clear
            </button>
          )}
        </form>

        <h3 className="mb-2 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-accent">
          {results ? 'Search results' : 'Recent sales'}
        </h3>

        {listed.length === 0 ? (
          <p className="rounded-xl border border-dashed border-accent/30 bg-white/60 px-5 py-10 text-center font-body text-[14px] text-dark/50">
            {results ? 'No matches.' : 'No packages sold yet.'}
          </p>
        ) : (
          <div className="divide-y divide-accent/10 overflow-hidden rounded-xl border border-accent/20 bg-white">
            {listed.map((p) => {
              const remaining = p.sessionCount - p.sessionsUsed
              const expired = p.status === 'expired' || (!!p.expiresAt && new Date(p.expiresAt) <= new Date())
              const awaitingPayment = p.status === 'awaiting_payment'
              return (
                <div key={p.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-primary">
                      {p.ownerName}
                      <span className="ml-2 font-heading text-[10px] uppercase tracking-[0.1em] text-dark/45">{p.ownerPhone}</span>
                    </div>
                    <div className="text-[12.5px] text-dark/65">
                      {p.packageName} — RM{p.priceRm} · {remaining}/{p.sessionCount} sessions left
                      {p.status === 'cancelled' && <span className="ml-2 font-semibold text-red-600">Cancelled</span>}
                      {awaitingPayment && <span className="ml-2 font-semibold text-amber-600">Awaiting payment</span>}
                      {p.status !== 'cancelled' && !awaitingPayment && expired && <span className="ml-2 font-semibold text-red-600">Expired</span>}
                    </div>
                    <div className="text-[11px] text-dark/45">
                      Bought {fmtMY(p.purchasedAt, { dateStyle: 'medium' })} · Expires {fmtMY(p.expiresAt, { dateStyle: 'medium' })}
                    </div>
                    {p.redemptions.length > 0 && (
                      <div className="mt-1 text-[11px] text-dark/45">
                        Last used {fmtMY(p.redemptions[0].redeemedAt, { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-none flex-col items-end gap-1.5">
                    <button
                      onClick={() => redeem(p.id)}
                      disabled={pending || p.status !== 'active' || expired || remaining <= 0}
                      className="inline-flex items-center gap-1 rounded-lg border border-accent/30 px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-accent hover:bg-accent/5 disabled:opacity-40"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Use session
                    </button>
                    {!awaitingPayment && (
                      <a
                        href={`/packages/purchase/success?id=${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/20 px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:bg-primary/5"
                      >
                        <Printer className="h-3.5 w-3.5" /> Receipt
                      </a>
                    )}
                    {p.status === 'active' && (
                      <button
                        onClick={() => cancel(p.id)}
                        disabled={pending}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-red-600 hover:bg-red-50 disabled:opacity-40"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
