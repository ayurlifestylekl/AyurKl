'use server'

import { randomBytes } from 'node:crypto'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { notifyGuestManagementOtp } from './notify'
import {
  generateOtp,
  hashManagementValue,
  normalizeBookingEmail,
  verifyOtpHash,
} from './guest-recovery'

export type ManagementActionResult<T = undefined> =
  | { ok: true; data: T }
  | {
      error: string
      code: 'UNAUTHORIZED' | 'POLICY_CLOSED' | 'SLOT_FULL' | 'INVALID_INPUT' | 'PROVIDER_ERROR'
    }

const NEUTRAL_REQUEST_MESSAGE = 'If that email has eligible bookings, a code has been sent.'
const ACTIVE_GUEST_STATUSES = ['pending', 'scheduled', 'awaiting_payment', 'confirmed']
const OTP_EXPIRY_MS = 10 * 60 * 1000
const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const GRANT_EXPIRY_MS = 30 * 24 * HOUR_MS

type RequestResult = ManagementActionResult<{ message: typeof NEUTRAL_REQUEST_MESSAGE }>
type VerifyResult = ManagementActionResult<{ href: string }>

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

function neutralRequestResult(): RequestResult {
  return { ok: true, data: { message: NEUTRAL_REQUEST_MESSAGE } }
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function escapedIlikeLiteral(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&')
}

async function sourceIpHash(): Promise<string> {
  const requestHeaders = await headers()
  return hashManagementValue(
    (
      requestHeaders.get('x-vercel-forwarded-for') ??
      requestHeaders.get('x-forwarded-for') ??
      requestHeaders.get('x-real-ip') ??
      'unavailable'
    )
      .split(',')[0]
      .trim(),
  )
}

/**
 * Request a short-lived recovery code without revealing whether a booking exists.
 * Every externally visible outcome is intentionally identical.
 */
export async function requestGuestManagementOtp(email: string): Promise<RequestResult> {
  const normalizedEmail = normalizeBookingEmail(typeof email === 'string' ? email : '')
  if (!validEmail(normalizedEmail)) return neutralRequestResult()

  try {
    const now = Date.now()
    const nowISO = new Date(now).toISOString()
    const minuteAgoISO = new Date(now - MINUTE_MS).toISOString()
    const hourAgoISO = new Date(now - HOUR_MS).toISOString()
    const emailHash = hashManagementValue(normalizedEmail)
    const ipHash = await sourceIpHash()
    const sb = admin()

    const [recentEmail, hourlyEmail, hourlyIp] = await Promise.all([
      sb
        .from('booking_management_otps')
        .select('id', { count: 'exact', head: true })
        .eq('email_hash', emailHash)
        .gte('created_at', minuteAgoISO),
      sb
        .from('booking_management_otps')
        .select('id', { count: 'exact', head: true })
        .eq('email_hash', emailHash)
        .gte('created_at', hourAgoISO),
      sb
        .from('booking_management_otps')
        .select('id', { count: 'exact', head: true })
        .eq('request_ip_hash', ipHash)
        .gte('created_at', hourAgoISO),
    ])

    if (
      recentEmail.error ||
      hourlyEmail.error ||
      hourlyIp.error ||
      (recentEmail.count ?? 0) >= 1 ||
      (hourlyEmail.count ?? 0) >= 5 ||
      (hourlyIp.count ?? 0) >= 20
    ) {
      return neutralRequestResult()
    }

    const { data: bookings, error: bookingError } = await sb
      .from('appointments')
      .select('id')
      .is('customer_id', null)
      .eq('is_guest', true)
      .in('status', ACTIVE_GUEST_STATUSES)
      .ilike('patient_email', escapedIlikeLiteral(normalizedEmail))

    if (bookingError || !bookings?.length) return neutralRequestResult()

    const code = generateOtp()
    const { error: insertError } = await sb.from('booking_management_otps').insert({
      email_hash: emailHash,
      code_hash: hashManagementValue(code),
      expires_at: new Date(now + OTP_EXPIRY_MS).toISOString(),
      attempts: 0,
      send_count: 1,
      request_ip_hash: ipHash,
      created_at: nowISO,
    })

    if (!insertError) {
      await notifyGuestManagementOtp({ to: normalizedEmail, code })
    }
  } catch {
    // Recovery is deliberately fail-closed and enumeration-neutral.
  }

  return neutralRequestResult()
}

export async function verifyGuestManagementOtp(email: string, code: string): Promise<VerifyResult> {
  const normalizedEmail = normalizeBookingEmail(typeof email === 'string' ? email : '')
  const normalizedCode = typeof code === 'string' ? code.trim() : ''
  if (!validEmail(normalizedEmail) || !/^\d{6}$/.test(normalizedCode)) {
    return { error: 'Enter a valid email and six-digit code.', code: 'INVALID_INPUT' }
  }

  const sb = admin()
  const now = Date.now()
  const nowISO = new Date(now).toISOString()
  const emailHash = hashManagementValue(normalizedEmail)
  const { data: otp, error: otpError } = await sb
    .from('booking_management_otps')
    .select('id, code_hash, expires_at, attempts, consumed_at')
    .eq('email_hash', emailHash)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const unauthorized = (): VerifyResult => ({
    error: 'That code is invalid or has expired. Request a new code and try again.',
    code: 'UNAUTHORIZED',
  })

  if (otpError || !otp || otp.consumed_at || otp.attempts >= 6 || Date.parse(otp.expires_at) <= now) return unauthorized()

  if (!verifyOtpHash(normalizedCode, otp.code_hash)) {
    await sb
      .from('booking_management_otps')
      .update({ attempts: Math.min(6, otp.attempts + 1) })
      .eq('id', otp.id)
      .eq('attempts', otp.attempts)
      .is('consumed_at', null)
    return unauthorized()
  }

  const { data: bookings, error: bookingError } = await sb
    .from('appointments')
    .select('id')
    .is('customer_id', null)
    .eq('is_guest', true)
    .in('status', ACTIVE_GUEST_STATUSES)
    .ilike('patient_email', escapedIlikeLiteral(normalizedEmail))

  const appointmentIds = Array.from(new Set((bookings ?? []).map((row) => row.id)))
  if (bookingError || appointmentIds.length === 0) return unauthorized()

  const { data: consumed, error: consumeError } = await sb
    .from('booking_management_otps')
    .update({ consumed_at: nowISO })
    .eq('id', otp.id)
    .eq('attempts', otp.attempts)
    .is('consumed_at', null)
    .select('id')
    .maybeSingle()

  if (consumeError || !consumed) return unauthorized()

  const rawToken = randomBytes(32).toString('base64url')
  const { data: grant, error: grantError } = await sb
    .from('booking_management_grants')
    .insert({
      token_hash: hashManagementValue(rawToken),
      email_hash: emailHash,
      appointment_ids: appointmentIds,
      expires_at: new Date(now + GRANT_EXPIRY_MS).toISOString(),
    })
    .select('id')
    .single()

  if (grantError || !grant) {
    return { error: 'We could not restore access right now. Please try again.', code: 'PROVIDER_ERROR' }
  }

  const { error: revokeError } = await sb
    .from('booking_management_grants')
    .update({ revoked_at: nowISO })
    .eq('email_hash', emailHash)
    .is('revoked_at', null)
    .gt('expires_at', nowISO)
    .neq('id', grant.id)

  if (revokeError) {
    await sb.from('booking_management_grants').update({ revoked_at: nowISO }).eq('id', grant.id)
    return { error: 'We could not restore access right now. Please try again.', code: 'PROVIDER_ERROR' }
  }

  const { error: eventError } = await sb.from('booking_events').insert(
    appointmentIds.map((appointmentId) => ({
      appointment_id: appointmentId,
      event_type: 'management_link_recovered' as const,
      actor_type: 'guest' as const,
      old_data: {},
      new_data: {},
    })),
  )

  if (eventError) {
    await sb.from('booking_management_grants').update({ revoked_at: nowISO }).eq('id', grant.id)
    return { error: 'We could not restore access right now. Please try again.', code: 'PROVIDER_ERROR' }
  }

  return { ok: true, data: { href: `/book/manage?t=${encodeURIComponent(rawToken)}` } }
}
