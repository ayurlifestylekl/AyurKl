import { NextResponse, type NextRequest } from 'next/server'
import { startPaymentForAppointment } from '@/lib/booking/payment'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const res = await startPaymentForAppointment(params.id)
  if ('error' in res) {
    return NextResponse.redirect(new URL(`/book/request/${params.id}?payerror=1`, req.url))
  }
  return NextResponse.redirect(res.url)
}
