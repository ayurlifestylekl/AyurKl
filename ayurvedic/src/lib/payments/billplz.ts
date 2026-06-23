import type { CallbackResult, CreateBillArgs, CreateBillResult, PaymentProvider } from './provider'

/**
 * Real Billplz (FPX) provider — DAY 2.
 *
 * To finish: the client supplies BILLPLZ_API_KEY, BILLPLZ_COLLECTION_ID,
 * BILLPLZ_WEBHOOK_SECRET (already named in the env), then implement:
 *
 *   createBill: POST https://www.billplz.com/api/v3/bills
 *     auth: Basic base64(`${API_KEY}:`)
 *     body: collection_id, email, name, amount (sen = RM*100), description,
 *           callback_url, redirect_url, reference_1 = appointmentId
 *     → returns { id, url }  ⇒ { billId: id, url }
 *
 *   verifyCallback: read x-signature (or form body), verify HMAC-SHA256 with
 *     BILLPLZ_WEBHOOK_SECRET over the sorted form fields, then
 *     → { billId: body.id, paid: body.paid === 'true' }
 *
 * Until then these throw so we never silently "confirm" an unpaid booking.
 */
export const billplzProvider: PaymentProvider = {
  name: 'billplz',

  async createBill(_args: CreateBillArgs): Promise<CreateBillResult> {
    throw new Error('Billplz createBill not wired yet — see src/lib/payments/billplz.ts (day 2).')
  },

  async verifyCallback(_req: Request): Promise<CallbackResult> {
    throw new Error('Billplz verifyCallback not wired yet — see src/lib/payments/billplz.ts (day 2).')
  },
}
