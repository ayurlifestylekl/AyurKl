import 'server-only'
import { createClient as ssr } from '@/lib/supabase/server'
import { verifyBookingToken } from './token'

/**
 * Authorize access to a booking's status/pay/cancel surface.
 * Allowed when the signed link token matches, OR the requester is the
 * signed-in customer who owns the booking.
 */
export async function canAccessBooking(
  id: string,
  customerId: string | null,
  token: string | null | undefined,
): Promise<boolean> {
  if (verifyBookingToken(id, token)) return true
  if (!customerId) return false
  const s = await ssr()
  const {
    data: { user },
  } = await s.auth.getUser()
  return !!user && user.id === customerId
}
