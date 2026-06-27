import { NextResponse, type NextRequest } from 'next/server'
import { createClient as createSb } from '@supabase/supabase-js'
import { createBookingToken } from '@/lib/booking/token'
import { notifyCancelled, notifyPaymentReminder, BOOKING_SITE_URL } from '@/lib/booking/notify'

export const dynamic = 'force-dynamic'

function admin() {
  return createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

const EXPIRED_REASON = 'Payment wasn’t completed in time — the slot has been released. You’re welcome to book again.'

/**
 * Scheduled sweep (Vercel Cron):
 *  1. Cancel awaiting_payment bookings past their 15-hour window and free the slot.
 *  2. Email a reminder ~2 hours before a window expires (once).
 * Protected by CRON_SECRET when set (Vercel sends it as a Bearer token).
 */
async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sb = admin()
  const now = new Date()
  const nowISO = now.toISOString()

  // 1) Expire + release
  const { data: expired } = await sb
    .from('appointments')
    .select('id, patient_email, patient_name, treatment_name')
    .eq('status', 'awaiting_payment')
    .lt('payment_expires_at', nowISO)

  for (const a of expired ?? []) {
    const { error } = await sb
      .from('appointments')
      .update({ status: 'cancelled', cancelled_at: nowISO, cancellation_reason: EXPIRED_REASON })
      .eq('id', a.id)
      .eq('status', 'awaiting_payment') // guard against a race with a just-completed payment
    if (!error) {
      await notifyCancelled({
        to: a.patient_email,
        name: a.patient_name,
        treatmentName: a.treatment_name,
        refundable: false,
        reason: EXPIRED_REASON,
      })
    }
  }

  // 2) Remind (within 2h of expiry, not yet reminded)
  const soonISO = new Date(now.getTime() + 2 * 3600_000).toISOString()
  const { data: soon } = await sb
    .from('appointments')
    .select('id, patient_email, patient_name, treatment_name, payment_expires_at')
    .eq('status', 'awaiting_payment')
    .eq('payment_reminded', false)
    .gt('payment_expires_at', nowISO)
    .lt('payment_expires_at', soonISO)

  for (const a of soon ?? []) {
    await notifyPaymentReminder({
      to: a.patient_email,
      name: a.patient_name,
      treatmentName: a.treatment_name,
      payUrl: `${BOOKING_SITE_URL}/book/request/${a.id}/pay?t=${createBookingToken(a.id)}`,
      expiresISO: a.payment_expires_at,
    })
    await sb.from('appointments').update({ payment_reminded: true }).eq('id', a.id)
  }

  return NextResponse.json({ expired: expired?.length ?? 0, reminded: soon?.length ?? 0 })
}

export const GET = handle
export const POST = handle
