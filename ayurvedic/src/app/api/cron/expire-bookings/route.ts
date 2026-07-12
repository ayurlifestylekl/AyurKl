import { NextResponse, type NextRequest } from 'next/server'
import { createClient as createSb } from '@supabase/supabase-js'
import { createBookingToken } from '@/lib/booking/token'
import { reconcileByBill } from '@/lib/booking/payment'
import { notifyCancelled, notifyPaymentReminder, BOOKING_SITE_URL } from '@/lib/booking/notify'

export const dynamic = 'force-dynamic'

function admin() {
  return createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

const EXPIRED_REASON = 'Payment wasn’t completed in time — the slot has been released. You’re welcome to book again.'

/**
 * Scheduled sweep (Vercel Cron daily + UptimeRobot every 30 min):
 *  1. Cancel awaiting_payment bookings past their 15-hour window and free the slot.
 *  2. Email a reminder ~2 hours before a window expires (once).
 * Protected by CRON_SECRET when set — either as a Bearer token (Vercel Cron) or
 * a `?key=` query param (UptimeRobot's free plan can't send custom headers).
 */
async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authorized =
    !secret ||
    req.headers.get('authorization') === `Bearer ${secret}` ||
    req.nextUrl.searchParams.get('key') === secret
  if (!authorized) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const sb = admin()
    const now = new Date()
    const nowISO = now.toISOString()
    // Fallback cutoff: if a hold somehow has no expiry stamp, treat >15h-old as expired.
    const staleISO = new Date(now.getTime() - 15 * 3600_000).toISOString()

    // 1) Expire + release — explicit-expiry holds, plus a safety net for any
    //    awaiting_payment row missing its expiry stamp but approved >15h ago.
    const [byExpiry, byStale] = await Promise.all([
      sb.from('appointments')
        .select('id, group_id, patient_email, patient_name, treatment_name, payment_bill_id')
        .eq('status', 'awaiting_payment')
        .lt('payment_expires_at', nowISO),
      sb.from('appointments')
        .select('id, group_id, patient_email, patient_name, treatment_name, payment_bill_id')
        .eq('status', 'awaiting_payment')
        .is('payment_expires_at', null)
        .lt('approved_at', staleISO),
    ])
    if (byExpiry.error) throw byExpiry.error
    // byStale is best-effort (approved_at may be null on old rows); don't hard-fail on it.
    const expired = [...(byExpiry.data ?? []), ...(byStale.data ?? [])]

    let expiredCount = 0
    let rescuedCount = 0
    // A group shares one email address — send its expiry notice once, not per guest.
    const cancelledGroups = new Set<string>()
    for (const a of expired) {
      // Never cancel a booking the customer actually paid for: if a bill is
      // attached, confirm-if-paid against the provider's API first. This catches
      // payments whose webhook was missed/rejected before they get released.
      if (a.payment_bill_id) {
        try {
          const r = await reconcileByBill(a.payment_bill_id)
          if ('appointmentId' in r) { rescuedCount++; continue }
        } catch (e) {
          console.error('[cron] reconcile check failed for', a.id, e)
        }
      }
      const { error } = await sb
        .from('appointments')
        .update({ status: 'cancelled', cancelled_at: nowISO, cancellation_reason: EXPIRED_REASON })
        .eq('id', a.id)
        .eq('status', 'awaiting_payment') // guard against a race with a just-completed payment
      if (error) continue
      expiredCount++
      if (a.group_id && cancelledGroups.has(a.group_id)) continue
      if (a.group_id) cancelledGroups.add(a.group_id)
      // One bad email must not abort the whole sweep.
      try {
        await notifyCancelled({
          to: a.patient_email,
          name: a.patient_name,
          treatmentName: a.group_id ? `${a.treatment_name ?? 'Treatment'} (group)` : a.treatment_name,
          refundable: false,
          reason: EXPIRED_REASON,
        })
      } catch (e) {
        console.error('[cron] notifyCancelled failed for', a.id, e)
      }
    }

    // 2) Remind (within 2h of expiry, not yet reminded)
    const soonISO = new Date(now.getTime() + 2 * 3600_000).toISOString()
    const { data: soon, error: soonErr } = await sb
      .from('appointments')
      .select('id, group_id, patient_email, patient_name, treatment_name, payment_expires_at')
      .eq('status', 'awaiting_payment')
      .eq('payment_reminded', false)
      .gt('payment_expires_at', nowISO)
      .lt('payment_expires_at', soonISO)
    if (soonErr) throw soonErr

    // A group shares one combined bill — remind it ONCE, not once per guest.
    const remindedGroups = new Set<string>()
    let remindedCount = 0
    for (const a of soon ?? []) {
      if (a.group_id && remindedGroups.has(a.group_id)) continue
      try {
        await notifyPaymentReminder({
          to: a.patient_email,
          name: a.patient_name,
          treatmentName: a.group_id ? `${a.treatment_name ?? 'Treatment'} (group)` : a.treatment_name,
          payUrl: `${BOOKING_SITE_URL}/book/request/${a.id}/pay?t=${createBookingToken(a.id)}`,
          expiresISO: a.payment_expires_at,
        })
        if (a.group_id) {
          remindedGroups.add(a.group_id)
          await sb.from('appointments').update({ payment_reminded: true }).eq('group_id', a.group_id)
        } else {
          await sb.from('appointments').update({ payment_reminded: true }).eq('id', a.id)
        }
        remindedCount++
      } catch (e) {
        console.error('[cron] reminder failed for', a.id, e)
      }
    }

    return NextResponse.json({ expired: expiredCount, rescued: rescuedCount, reminded: remindedCount })
  } catch (err) {
    console.error('[cron] expire-bookings failed:', err)
    return NextResponse.json(
      { error: 'cron_failed', message: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}

export const GET = handle
export const POST = handle
