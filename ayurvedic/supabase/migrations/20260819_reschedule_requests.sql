-- ============================================================================
-- Reschedule request flow: customer asks for a new time, staff approve/decline.
-- ============================================================================

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS reschedule_requested_at TIMESTAMPTZ;

COMMENT ON COLUMN public.appointments.reschedule_requested_at IS
  'When the customer requested a reschedule. NULL = no pending reschedule request. requested_datetime_alt holds the requested new time.';
