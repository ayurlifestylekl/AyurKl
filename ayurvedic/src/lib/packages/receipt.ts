/** Short, human-readable receipt number for a package purchase, e.g. "PKG-3F9A21C0". */
export function packageReceiptNo(purchaseId: string): string {
  return `PKG-${purchaseId.slice(0, 8).toUpperCase()}`
}

/** Ways a walk-in / WhatsApp customer can pay at the centre (front desk picks one when logging the sale). */
export const CENTRE_PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'duitnow_qr', label: 'DuitNow QR / Bank QR' },
  { value: 'tng_ewallet', label: "Touch 'n Go eWallet" },
  { value: 'card_terminal', label: 'Card (at counter)' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'other', label: 'Other' },
] as const

export type CentrePaymentMethod = (typeof CENTRE_PAYMENT_METHODS)[number]['value']

export function isCentrePaymentMethod(v: unknown): v is CentrePaymentMethod {
  return CENTRE_PAYMENT_METHODS.some((m) => m.value === v)
}

/** How the customer paid, in words a receipt reader understands. */
export function paymentMethodLabel(method: string | null, source: string | null): string {
  if (method === 'billplz') return 'Online Banking (FPX) via Billplz'
  if (method === 'stripe') return 'Credit / Debit Card'
  if (method === 'stub') return 'Test payment (not real money)'
  const centre = CENTRE_PAYMENT_METHODS.find((m) => m.value === method)
  if (centre) return centre.label
  if (source === 'whatsapp_manual') return 'Paid at centre'
  return '—'
}

/**
 * The therapy's Ayurvedic name only, as the clinic wants it printed —
 * "Abhyangam (Full Body Oil Massage)" → "Abhyangam",
 * "Sirodhaara — Head, Neck & Foot Massage" → "Sirodhaara",
 * "Udwarthanam + Steam Bath" → "Udwarthanam".
 */
export function receiptTherapyName(title: string): string {
  return title.replace(/\s*\(.*?\)\s*/g, ' ').split(/\s+[—–+-]\s+/)[0].trim()
}

/** Published legal identity — matches the site footer (src/components/Footer.tsx) and the centre's till receipt. */
export const RECEIPT_ISSUER = {
  tradingName: 'Kerala Ayurvedic Lifestyle',
  legalName: 'Ayurvedic Lifestyle (KL) Sdn Bhd',
  regNo: '847466D',
  addressLines: ['No. 37, Jalan Thambi Abdullah 1', 'Brickfields, 50470 Kuala Lumpur, Malaysia'],
  website: 'keralaayurvediclifestyle.com.my',
} as const
