import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient as createSb } from '@supabase/supabase-js'
import { fmtMY } from '@/lib/datetime'
import { CLINIC_EMAIL, CLINIC_PHONE_ALT_1, CLINIC_PHONE_ALT_2, CLINIC_PHONE_PRIMARY } from '@/lib/clinic'
import { PACKAGE_TERMS } from '@/lib/packages/terms'
import { RECEIPT_ISSUER, packageReceiptNo, paymentMethodLabel, receiptTherapyName } from '@/lib/packages/receipt'
import { reconcilePackagePurchaseByBill } from '@/lib/packages/payment'
import PrintButton from './PrintButton'

export const metadata: Metadata = {
  title: 'Package Receipt | Kerala Ayurvedic Lifestyle',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

function admin() {
  return createSb(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (i, init) => fetch(i, { ...init, cache: 'no-store' }) },
    },
  )
}

// Printing shows the receipt alone on an A4 page — the site's navbar, footer,
// banner, WhatsApp button and popups are hidden without touching those components.
const PRINT_CSS = `
@page { size: A4; margin: 10mm; }
@media print {
  /* Drop everything that isn't the receipt or one of its ancestors, so hidden
     site chrome can't push the receipt onto a second page. */
  body *:not(:has(#package-receipt)):not(#package-receipt):not(#package-receipt *) { display: none !important; }
  body *:has(#package-receipt) { padding: 0 !important; margin: 0 !important; min-height: 0 !important; max-width: none !important; background: #fff !important; box-shadow: none !important; }
  body { background: #fff !important; }
  #package-receipt { border: none !important; box-shadow: none !important; border-radius: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  /* Tighter vertical rhythm on paper so the whole receipt fits one A4 sheet. */
  #package-receipt .receipt-body { padding: 14px 22px !important; }
  #package-receipt .mt-8 { margin-top: 12px !important; }
  #package-receipt .pt-6 { padding-top: 10px !important; }
  #package-receipt .py-3 { padding-top: 8px !important; padding-bottom: 8px !important; }
  #package-receipt .p-5 { padding: 12px 16px !important; }
  #package-receipt footer { padding-top: 8px !important; }
  #package-receipt .signature { margin-top: 10px !important; }
  #package-receipt .signature .mt-8 { margin-top: 26px !important; }
}
`

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

const rm = (n: number) => `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default async function PackageReceiptPage({ searchParams }: PageProps) {
  const { id } = await searchParams
  if (!id) return <ErrorState message="Purchase reference is missing." />

  const sb = admin()
  const load = () =>
    sb
      .from('package_purchases')
      .select(
        'id, package_name_snapshot, price_rm_snapshot, session_count_snapshot, sessions_used, status, source, owner_name, owner_email, owner_phone, purchased_at, expires_at, created_at, payment_method, payment_bill_id, terms_accepted_at, terms_version, package:packages(description), treatment:treatments(title), staff:users!package_purchases_created_by_staff_id_fkey(full_name)',
      )
      .eq('id', id)
      .single()

  let { data: purchase, error } = await load()

  // The customer usually lands here before Billplz's server-to-server callback
  // arrives (and that callback can occasionally be missed entirely). Ask the
  // provider directly; if the bill is paid, this activates the package and
  // sends the alerts — markPackageBillPaid's conditional flip keeps it to once.
  if (purchase?.status === 'awaiting_payment' && purchase.payment_bill_id) {
    const res = await reconcilePackagePurchaseByBill(purchase.payment_bill_id, purchase.payment_method).catch(() => null)
    if (res?.ok && res.state !== 'not_found') ({ data: purchase, error } = await load())
  }

  if (error || !purchase) {
    return <ErrorState message="We couldn't find that purchase. Please check your email or contact us." />
  }

  const pending = purchase.status === 'awaiting_payment'
  const pkg = purchase.package as unknown as { description: string | null } | null
  const treatment = purchase.treatment as unknown as { title: string } | null
  const staff = purchase.staff as unknown as { full_name: string | null } | null
  // Sold at the counter (walk-in / WhatsApp) rather than paid online.
  const counterSale = purchase.source === 'whatsapp_manual'
  // Session length as sold ("1-hour", "90-minute"), taken from the package text
  // so the receipt carries no English therapy description — the clinic prints
  // the Ayurvedic name only.
  const sessionLength = pkg?.description?.match(/\b\d+-(?:hour|minute)\b/i)?.[0]
  const price = Number(purchase.price_rm_snapshot)
  const issuedOn = purchase.purchased_at ?? purchase.created_at

  const stamp =
    purchase.status === 'cancelled'
      ? { label: 'CANCELLED', cls: 'border-red-600 text-red-600' }
      : purchase.status === 'expired'
        ? { label: 'EXPIRED', cls: 'border-dark/50 text-dark/50' }
        : pending
          ? { label: 'PAYMENT PENDING', cls: 'border-amber-600 text-amber-600' }
          : { label: 'PAID', cls: 'border-emerald-700 text-emerald-700' }

  return (
    <section className="min-h-screen bg-cream py-10 sm:py-14">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="mx-auto max-w-[820px] px-4 sm:px-6">
        {pending && (
          <p className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-center font-body text-[13.5px] text-amber-800">
            We&rsquo;re still confirming your payment. Refresh this page in a moment — it will show <b>PAID</b> once confirmed.
          </p>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          <PrintButton />
          <Link
            href="/packages"
            className="inline-flex h-11 items-center rounded-full border border-primary/20 bg-white px-6 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-primary hover:bg-cream/60"
          >
            Back to packages
          </Link>
        </div>

        <article id="package-receipt" className="relative overflow-hidden rounded-2xl border border-primary/10 bg-white text-dark shadow-sm">
          {/* Brand band */}
          <div className="h-2 bg-primary" />
          <div className="h-[3px] bg-accent" />

          <div className="receipt-body px-7 py-8 sm:px-10">
            {/* Header */}
            <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Image src="/kerala-logo.png" alt="Kerala Ayurvedic Lifestyle" width={170} height={93} priority />
                <div className="mt-3 font-body text-[11.5px] leading-[1.55] text-dark/65">
                  <div className="font-semibold text-dark">{RECEIPT_ISSUER.legalName}</div>
                  <div>Reg. No: {RECEIPT_ISSUER.regNo}</div>
                  {RECEIPT_ISSUER.addressLines.map((l) => (
                    <div key={l}>{l}</div>
                  ))}
                  <div>
                    {CLINIC_PHONE_PRIMARY} · {CLINIC_PHONE_ALT_1} · {CLINIC_PHONE_ALT_2}
                  </div>
                  <div>{CLINIC_EMAIL}</div>
                </div>
              </div>

              <div className="sm:text-right">
                <div className="font-heading text-[28px] font-extrabold tracking-[0.08em] text-primary">RECEIPT</div>
                <dl className="mt-2 grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 font-body text-[12.5px] sm:justify-end">
                  <dt className="text-dark/50">Receipt No.</dt>
                  <dd className="font-semibold">{packageReceiptNo(purchase.id)}</dd>
                  <dt className="text-dark/50">Date</dt>
                  <dd className="font-semibold">{fmtMY(issuedOn, { dateStyle: 'medium' })}</dd>
                </dl>
                <div className={`mt-3 inline-block -rotate-3 rounded-md border-2 px-3 py-1 font-heading text-[13px] font-extrabold tracking-[0.2em] ${stamp.cls}`}>
                  {stamp.label}
                </div>
              </div>
            </header>

            {/* Billed to */}
            <div className="mt-8 grid gap-6 border-t border-dark/10 pt-6 sm:grid-cols-2">
              <div>
                <div className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Billed to</div>
                <div className="mt-1.5 font-body text-[13.5px] leading-[1.6]">
                  <div className="font-semibold">{purchase.owner_name}</div>
                  <div className="text-dark/70">{purchase.owner_phone}</div>
                  {purchase.owner_email && <div className="text-dark/70">{purchase.owner_email}</div>}
                </div>
              </div>
              <div>
                <div className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Package owner</div>
                <p className="mt-1.5 font-body text-[12.5px] leading-[1.6] text-dark/70">
                  The person named here owns this package and must make every booking against it. Sessions may be
                  shared with friends and family.
                </p>
              </div>
            </div>

            {/* Line items */}
            <table className="mt-8 w-full border-collapse font-body text-[13px]">
              <thead>
                <tr className="bg-primary text-left text-white">
                  <th className="px-3 py-2 font-heading text-[10.5px] font-bold uppercase tracking-[0.14em]">Description</th>
                  <th className="px-3 py-2 text-center font-heading text-[10.5px] font-bold uppercase tracking-[0.14em]">Sessions</th>
                  <th className="px-3 py-2 text-right font-heading text-[10.5px] font-bold uppercase tracking-[0.14em]">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-dark/10 align-top">
                  <td className="px-3 py-3">
                    <div className="font-semibold">{purchase.package_name_snapshot}</div>
                    {treatment?.title && <div className="mt-0.5 text-[12px] text-dark/65">Therapy: {receiptTherapyName(treatment.title)}</div>}
                    {sessionLength && (
                      <div className="mt-0.5 text-[12px] text-dark/65">
                        {purchase.session_count_snapshot} × {sessionLength} sessions
                      </div>
                    )}
                    <div className="mt-0.5 text-[12px] text-dark/65">Deepawali Promo 2026</div>
                  </td>
                  <td className="px-3 py-3 text-center">{purchase.session_count_snapshot}</td>
                  <td className="px-3 py-3 text-right">{rm(price)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  <td className="px-3 pt-3 text-right text-dark/60">Subtotal</td>
                  <td className="px-3 pt-3 text-right">{rm(price)}</td>
                </tr>
                <tr>
                  <td />
                  <td className="px-3 pt-1 text-right font-heading text-[14px] font-bold text-primary">Total</td>
                  <td className="px-3 pt-1 text-right font-heading text-[16px] font-extrabold text-primary">{rm(price)}</td>
                </tr>
              </tfoot>
            </table>

            {/* Payment + package details */}
            <div className="mt-8 grid gap-6 rounded-xl bg-cream/70 p-5 sm:grid-cols-2">
              <Details
                title="Payment"
                rows={[
                  ['Method', paymentMethodLabel(purchase.payment_method, purchase.source)],
                  ...(purchase.payment_bill_id ? ([['Reference', purchase.payment_bill_id]] as [string, string][]) : []),
                  ['Paid on', purchase.purchased_at ? fmtMY(purchase.purchased_at, { dateStyle: 'medium', timeStyle: 'short' }) : '—'],
                  ...(counterSale && staff?.full_name ? ([['Served by', staff.full_name]] as [string, string][]) : []),
                ]}
              />
              <Details
                title="Package"
                rows={[
                  ['Valid from', purchase.purchased_at ? fmtMY(purchase.purchased_at, { dateStyle: 'medium' }) : '—'],
                  ['Valid until', purchase.expires_at ? fmtMY(purchase.expires_at, { dateStyle: 'medium' }) : '—'],
                  ['Sessions used', `${purchase.sessions_used} of ${purchase.session_count_snapshot}`],
                ]}
              />
            </div>

            {/* Terms */}
            <div className="mt-8">
              <div className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Terms &amp; Conditions</div>
              <ol className="mt-2 list-decimal space-y-0.5 pl-4 font-body text-[10.5px] leading-[1.5] text-dark/65">
                {PACKAGE_TERMS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
              {purchase.terms_accepted_at && (
                <p className="mt-2 font-body text-[10.5px] italic text-dark/55">
                  Customer agreed to these Terms &amp; Conditions online on{' '}
                  {fmtMY(purchase.terms_accepted_at, { dateStyle: 'medium', timeStyle: 'short' })}
                  {purchase.terms_version ? ` (version ${purchase.terms_version})` : ''}.
                </p>
              )}
            </div>

            {/* Counter sales: the customer never ticked the online T&C box, so they sign the centre's copy. */}
            {counterSale && (
              <div className="signature mt-6 grid items-end gap-6 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div>
                  <p className="font-body text-[10.5px] italic text-dark/60">
                    I have read and agree to the Terms &amp; Conditions above.
                  </p>
                  <div className="mt-8 border-t border-dark/40 pt-1 font-heading text-[9.5px] font-bold uppercase tracking-[0.16em] text-dark/55">
                    Customer signature
                  </div>
                </div>
                <div>
                  <div className="mt-8 border-t border-dark/40 pt-1 font-heading text-[9.5px] font-bold uppercase tracking-[0.16em] text-dark/55">
                    Date
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <footer className="mt-8 border-t border-dark/10 pt-4 text-center font-body text-[11px] leading-[1.6] text-dark/55">
              <div className="font-semibold text-primary">Thank you for choosing {RECEIPT_ISSUER.tradingName}.</div>
              <div>To book a session, WhatsApp us on {CLINIC_PHONE_PRIMARY}.</div>
              <div>
                {counterSale ? 'The centre keeps a copy signed by the customer.' : 'This is a computer-generated receipt — no signature is required.'} ·{' '}
                {RECEIPT_ISSUER.website}
              </div>
            </footer>
          </div>
        </article>
      </div>
    </section>
  )
}

function Details({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div>
      <div className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-accent">{title}</div>
      <dl className="mt-1.5 space-y-0.5 font-body text-[12.5px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-dark/55">{k}</dt>
            <dd className="break-all text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="relative min-h-screen bg-cream">
      <div className="relative mx-auto max-w-2xl px-6 py-16 text-center sm:py-24">
        <h1 className="font-heading text-[26px] font-bold text-primary">Receipt not found</h1>
        <p className="mt-2 font-body text-[14px] text-dark/65">{message}</p>
        <Link
          href="/packages"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-white"
        >
          Back to packages
        </Link>
      </div>
    </section>
  )
}
