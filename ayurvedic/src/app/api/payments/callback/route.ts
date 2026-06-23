import { NextResponse, type NextRequest } from 'next/server'
import { getPaymentProvider } from '@/lib/payments'
import { markBillPaid } from '@/lib/booking/payment'

export const dynamic = 'force-dynamic'

async function handle(req: NextRequest) {
  const provider = getPaymentProvider()
  const result = await provider.verifyCallback(req)
  if (result.paid && result.billId) {
    await markBillPaid(result.billId)
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
