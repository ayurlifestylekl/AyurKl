import { createHmac, timingSafeEqual } from 'crypto'
import type { CallbackResult, CreateBillArgs, CreateBillResult, PaymentProvider } from './provider'

/**
 * Billplz (FPX) provider.
 *
 * To go live (day 2): set in the environment
 *   BILLPLZ_API_KEY          — secret API key
 *   BILLPLZ_COLLECTION_ID    — the collection bills are created under
 *   BILLPLZ_WEBHOOK_SECRET   — the collection's "X Signature" key
 *   PAYMENTS_PROVIDER=billplz — flips getPaymentProvider() to this
 *   BILLPLZ_API_BASE         — optional; defaults to production. Use
 *                              https://www.billplz-sandbox.com for testing.
 *
 * Docs: https://www.billplz.com/api — v3 Bills + X Signature verification.
 */

const API_BASE = process.env.BILLPLZ_API_BASE || 'https://www.billplz.com'

function authHeader(): string {
  // Basic auth: base64(`${API_KEY}:`) — key as username, blank password.
  return 'Basic ' + Buffer.from(`${process.env.BILLPLZ_API_KEY}:`).toString('base64')
}

export const billplzProvider: PaymentProvider = {
  name: 'billplz',

  async createBill(args: CreateBillArgs): Promise<CreateBillResult> {
    const body = new URLSearchParams({
      collection_id: process.env.BILLPLZ_COLLECTION_ID ?? '',
      email: args.email || 'no-reply@keralaayurvediclifestyle.com.my',
      name: args.name || 'Guest',
      amount: String(Math.round(args.amountRm * 100)), // sen
      callback_url: args.callbackUrl,
      redirect_url: args.redirectUrl,
      description: args.description.slice(0, 200),
      reference_1_label: 'Appointment',
      reference_1: args.appointmentId,
    })
    if (args.phone) body.set('mobile', args.phone)

    const res = await fetch(`${API_BASE}/api/v3/bills`, {
      method: 'POST',
      headers: { Authorization: authHeader(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Billplz createBill failed (${res.status}): ${text}`)
    }
    const json = (await res.json()) as { id: string; url: string }
    return { billId: json.id, url: json.url }
  },

  async fetchBillStatus(billId: string): Promise<{ paid: boolean } | null> {
    if (!billId) return null
    try {
      const res = await fetch(`${API_BASE}/api/v3/bills/${billId}`, {
        headers: { Authorization: authHeader() },
      })
      if (!res.ok) return null
      const json = (await res.json()) as { paid?: boolean }
      return { paid: json.paid === true }
    } catch {
      return null
    }
  },

  async verifyCallback(req: Request): Promise<CallbackResult> {
    // Server-to-server callback is an x-www-form-urlencoded POST.
    const form = await req.formData()
    const params: Record<string, string> = {}
    form.forEach((v, k) => {
      params[k] = typeof v === 'string' ? v : ''
    })

    const signature = params['x_signature'] ?? ''
    delete params['x_signature']

    // X Signature source: `key`+`value` for each param, sorted by key, joined by '|'.
    const source = Object.keys(params)
      .sort()
      .map((k) => `${k}${params[k]}`)
      .join('|')
    const expected = createHmac('sha256', process.env.BILLPLZ_WEBHOOK_SECRET ?? '')
      .update(source)
      .digest('hex')

    const a = Buffer.from(expected)
    const b = Buffer.from(signature)
    const valid = a.length === b.length && timingSafeEqual(a, b)
    if (!valid) {
      return { billId: params['id'] ?? '', paid: false }
    }
    return { billId: params['id'] ?? '', paid: params['paid'] === 'true' }
  },
}
