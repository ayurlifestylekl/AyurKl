/**
 * Payment provider seam. The booking flow only ever talks to this interface,
 * so swapping the stub for real Billplz (day 2) is a single-file drop-in.
 */

export interface CreateBillArgs {
  appointmentId: string
  amountRm: number
  name: string
  email: string
  phone: string
  description: string
  /** Absolute URL the provider calls server-side when payment settles. */
  callbackUrl: string
  /** Absolute URL the customer is returned to after paying. */
  redirectUrl: string
}

export interface CreateBillResult {
  billId: string
  /** Where to send the customer to complete payment. */
  url: string
}

export interface CallbackResult {
  billId: string
  paid: boolean
  /** Optional URL to redirect the browser to (used by the stub return flow). */
  redirectTo?: string
}

export interface PaymentProvider {
  readonly name: string
  createBill(args: CreateBillArgs): Promise<CreateBillResult>
  /** Parse + verify a provider callback/return request. */
  verifyCallback(req: Request): Promise<CallbackResult>
  /**
   * Authoritative status lookup straight from the provider's API — used to
   * reconcile a webhook that was missed or failed signature verification.
   * Returns null when the provider can't be queried (e.g. the test stub).
   */
  fetchBillStatus?(billId: string): Promise<{ paid: boolean } | null>
}
