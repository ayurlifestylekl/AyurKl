import { NextResponse, type NextRequest } from 'next/server'
import { stripeProvider } from '@/lib/payments/stripe'
import { markBillPaid, reconcileByBill } from '@/lib/booking/payment'
import { paymentCallbackResponse } from '@/lib/booking/payment-result'

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
  try {
    const result = await stripeProvider.verifyCallback(req)
    if (result.paid && result.billId) {
      const response = paymentCallbackResponse(await markBillPaid(result.billId))
      return NextResponse.json(response, { status: response.status })
    } else if (result.billId) {
      const reconciliation = await reconcileByBill(result.billId, 'stripe')
      if ('disposition' in reconciliation) {
        const response = paymentCallbackResponse(reconciliation)
        return NextResponse.json(response, { status: response.status })
      }
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[stripe webhook] processing failed', error)
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}

export const POST = handle
