import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { verifyCalSignature, type CalWebhookEnvelope } from '@/lib/calcom/webhook'
import { createNotification } from '@/lib/notifications/create'
import { sendEmail } from '@/lib/email/send'
import { appointmentConfirmationEmail } from '@/lib/email/templates/appointmentConfirmation'

export const runtime = 'nodejs'

let cached: SupabaseClient<Database> | null = null
function admin(): SupabaseClient<Database> {
  if (cached) return cached
  cached = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
  return cached
}

export async function POST(req: Request) {
  const secret = process.env.CALCOM_WEBHOOK_SECRET
  if (!secret || secret.startsWith('your-')) {
    return NextResponse.json({ error: 'webhook_not_configured' }, { status: 503 })
  }

  const rawBody = await req.text()
  const sig = req.headers.get('x-cal-signature-256')
  if (!verifyCalSignature(rawBody, sig, secret)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  let envelope: CalWebhookEnvelope
  try {
    envelope = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const p = envelope.payload
  if (!p?.uid || !p?.startTime) {
    return NextResponse.json({ error: 'missing_required_fields' }, { status: 400 })
  }

  // Match the booker to a user by email. If no matching user, store the appointment unattributed.
  const attendeeEmail = p.attendees?.[0]?.email?.toLowerCase()
  const userLookup = attendeeEmail
    ? await admin().from('users').select('id, full_name, email').eq('email', attendeeEmail).maybeSingle()
    : { data: null }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = userLookup.data as any | null

  const isConsultation = p.eventTypeSlug === process.env.NEXT_PUBLIC_CAL_CONSULTATION_EVENT
  const treatmentName = p.title || (isConsultation ? 'Free consultation' : 'Treatment booking')
  const durationMins = Math.max(1, Math.round((new Date(p.endTime).getTime() - new Date(p.startTime).getTime()) / 60000))

  // Upsert appointment by Cal.com booking UID (unique).
  const status = envelope.triggerEvent === 'BOOKING_CANCELLED' ? 'cancelled' : 'scheduled'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin().from('appointments') as any).upsert({
    customer_id: user?.id ?? null,
    treatment_name: treatmentName,
    doctor_name: p.organizer?.name ?? 'Vaidya Akhil HS',
    appointment_date_time: p.startTime,
    duration_mins: durationMins,
    status,
    advance_payment_rm: null,
    calcom_booking_uid: p.uid,
    mode: 'in-person',
    meeting_link: null,
    notes: p.cancellationReason ?? null,
  }, { onConflict: 'calcom_booking_uid' })

  if (error) {
    console.error('[calcom/webhook] upsert failed:', error.message)
    return NextResponse.json({ error: 'db_upsert_failed' }, { status: 500 })
  }

  // Fan out: notification + email on confirmed bookings only.
  if (envelope.triggerEvent === 'BOOKING_CREATED' && user) {
    await createNotification({
      userId: user.id,
      kind: 'appointment_confirmed',
      title: 'Appointment confirmed',
      body: `${treatmentName} on ${new Date(p.startTime).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}`,
      href: '/account/appointments',
    })
    if (user.email) {
      const t = appointmentConfirmationEmail({
        firstName: (user.full_name as string)?.split(' ')[0] ?? 'there',
        treatmentName,
        whenLocal: new Date(p.startTime).toLocaleString('en-MY', { dateStyle: 'full', timeStyle: 'short' }),
        doctorName: p.organizer?.name ?? 'Vaidya Akhil HS',
        href: 'https://keralaayurvedic.my/account/appointments',
      })
      await sendEmail({ to: user.email, category: 'transactional', ...t, userId: user.id })
    }
  }

  return NextResponse.json({ ok: true })
}
