/**
 * Customer-facing booking reads. The status/pay page fetches a single
 * appointment by id via the service role (guests have no session); the
 * account dashboard lists a signed-in customer's own bookings via their
 * authed client (RLS scopes to customer_id = auth.uid()).
 */
import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createSb } from '@supabase/supabase-js'
import type { StaffAppointment } from '@/types/booking'
import { APPOINTMENT_COLUMNS, mapAppointmentRow } from '@/lib/booking/map'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = SupabaseClient<any, 'public', any>

function admin() {
  return createSb(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

/** Single booking by id (service role) — used by the public status/pay page. */
export async function getBookingForPayment(id: string): Promise<StaffAppointment | null> {
  const { data, error } = await admin()
    .from('appointments')
    .select(APPOINTMENT_COLUMNS)
    .eq('id', id)
    .maybeSingle()
  if (error) {
    console.error('[storefront/booking] getBookingForPayment:', error.message)
    return null
  }
  return data ? mapAppointmentRow(data) : null
}

/** All guests in a group booking (service role). Returns [] for non-groups. */
export async function getGroupMembers(groupId: string): Promise<StaffAppointment[]> {
  const { data, error } = await admin()
    .from('appointments')
    .select(APPOINTMENT_COLUMNS)
    .eq('group_id', groupId)
    .order('updated_at', { ascending: true })
  if (error) {
    console.error('[storefront/booking] getGroupMembers:', error.message)
    return []
  }
  return (data ?? []).map(mapAppointmentRow)
}

/** A signed-in customer's own bookings (RLS-scoped client). */
export async function getMyBookings(sb: SB, userId: string): Promise<StaffAppointment[]> {
  const { data, error } = await sb
    .from('appointments')
    .select(APPOINTMENT_COLUMNS)
    .eq('customer_id', userId)
    .order('updated_at', { ascending: false })
  if (error) {
    console.error('[storefront/booking] getMyBookings:', error.message)
    return []
  }
  return (data ?? []).map(mapAppointmentRow)
}
