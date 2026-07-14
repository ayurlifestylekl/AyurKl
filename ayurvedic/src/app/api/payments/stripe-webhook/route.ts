import { NextResponse, type NextRequest } from 'next/server'
import { stripeProvider } from '@/lib/payments/stripe'
import { markBillPaid, reconcileByBill } from '@/lib/booking/payment'

export const dynamic = 'force-dynamic'
// The Stripe SDK needs Node's crypto module for signature verification — not
// available on the Edge runtime.
export const runtime = 'nodejs'

/**
 * Stripe webhook — configure in the Stripe Dashboard → Developers → Webhooks:
 *   Endpoint URL: https://<your-domain>/api/payments/stripe-webhook
 *   Event: checkout.session.completed
 * Signature is verified against the RAW body, so this route must read it via
 * stripeProvider.verifyCallback(req) before any other body parsing.
 */
async function handle(req: NextRequest) {
  const result = await stripeProvider.verifyCallback(req)
  if (result.paid && result.billId) {
    await markBillPaid(result.billId)
  } else if (result.billId) {
    await reconcileByBill(result.billId, 'stripe')
  }
  return NextResponse.json({ ok: true })
}

export const POST = handle
