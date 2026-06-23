import type { CallbackResult, CreateBillArgs, CreateBillResult, PaymentProvider } from './provider'

/**
 * Test-mode payment. No real money: createBill returns a URL that points
 * straight at our callback with `paid=true`, so the whole approve → pay →
 * confirm flow runs end-to-end. Swap in the Billplz provider for production.
 */
export const stubProvider: PaymentProvider = {
  name: 'stub',

  async createBill(args: CreateBillArgs): Promise<CreateBillResult> {
    const billId = `stub_${args.appointmentId}`
    const url =
      `${args.callbackUrl}?provider=stub&bill_id=${encodeURIComponent(billId)}` +
      `&paid=true&redirect=${encodeURIComponent(args.redirectUrl)}`
    return { billId, url }
  },

  async verifyCallback(req: Request): Promise<CallbackResult> {
    const { searchParams } = new URL(req.url)
    return {
      billId: searchParams.get('bill_id') ?? '',
      paid: searchParams.get('paid') === 'true',
      redirectTo: searchParams.get('redirect') ?? undefined,
    }
  },
}
