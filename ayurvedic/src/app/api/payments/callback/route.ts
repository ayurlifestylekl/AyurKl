import { NextResponse, type NextRequest } from 'next/server'
import { getPaymentProvider } from '@/lib/payments'
import { markBillPaid, reconcileByBill } from '@/lib/booking/payment'

export const dynamic = 'force-dynamic'

async function handle(req: NextRequest) {
  const provider = getPaymentProvider()
  const result = await provider.verifyCallback(req)
  if (result.paid && result.billId) {
    await markBillPaid(result.billId)
  } else if (result.billId) {
    // Signature check failed or the paid flag wasn't set — don't silently drop
    // it. Ask the provider's API directly; confirm only if it's genuinely paid.
    await reconcileByBill(result.billId)
  }
  // Stub return flow carries a redirect back to the customer status page.
  if (result.redirectTo) {
    return NextResponse.redirect(new URL(result.redirectTo, req.url))
  }
  // Real gateways (Billplz) just need a 200 ack.
  return NextResponse.json({ ok: true })
}

export const GET = handle
export const POST = handle
