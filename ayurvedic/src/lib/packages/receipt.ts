/** Short, human-readable receipt number for a package purchase, e.g. "PKG-3F9A21C0". */
export function packageReceiptNo(purchaseId: string): string {
  return `PKG-${purchaseId.slice(0, 8).toUpperCase()}`
}

/** How the customer paid, in words a receipt reader understands. */
export function paymentMethodLabel(method: string | null, source: string | null): string {
  if (method === 'billplz') return 'Online Banking (FPX) via Billplz'
  if (method === 'stripe') return 'Credit / Debit Card'
  if (method === 'stub') return 'Test payment (not real money)'
  if (source === 'whatsapp_manual') return 'Paid at centre'
  return '—'
}

/** Published legal identity — matches the site footer (src/components/Footer.tsx). */
export const RECEIPT_ISSUER = {
  tradingName: 'Kerala Ayurvedic Lifestyle',
  legalName: 'Ayurvedic Lifestyle (KL) Sdn Bhd',
  regNo: '847466D',
  addressLines: ['No. 37, Jalan Thamby Abdullah 1', 'Brickfields, Kuala Lumpur, Malaysia'],
  website: 'keralaayurvediclifestyle.com.my',
} as const
