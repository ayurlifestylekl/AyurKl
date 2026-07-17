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

export interface RefundArgs {
  billId: string
  amountRm: number
  idempotencyKey: string
  customerEmail: string
  bank?: {
    bankCode: string
    accountNumber: string
    accountHolderName: string
  }
}

export interface ProviderRefundResult {
  providerRefundId: string
  status: 'pending' | 'confirmed'
  bankCode?: string
  bankAccountLast4?: string
}

export interface RefundStatusResult {
  status: 'pending' | 'confirmed' | 'exception'
}

export interface RefundCallbackResult extends RefundStatusResult {
  providerRefundId: string
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
  /**
   * Remove an UNPAID bill so a cancelled booking can never be paid for.
   * Providers reject deleting a paid bill — callers treat failure as
   * "possibly paid" and rely on reconciliation, never on this succeeding.
   */
  deleteBill?(billId: string): Promise<void>
  /** Create an idempotent refund or outgoing refund disbursement. */
  createRefund(args: RefundArgs): Promise<ProviderRefundResult>
  /** Authoritative provider lookup used to reconcile a pending refund. */
  fetchRefundStatus(providerRefundId: string): Promise<RefundStatusResult | null>
  /** Parse and verify a provider refund callback without returning recipient PII. */
  verifyRefundCallback?(req: Request): Promise<RefundCallbackResult | null>
}
