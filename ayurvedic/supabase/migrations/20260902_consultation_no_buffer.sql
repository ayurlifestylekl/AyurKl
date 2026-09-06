-- ============================================================================
-- Consultation bookings have no post-session buffer (2026-09-02). Idempotent.
-- Apply via Supabase SQL Editor.
--
-- Free 30-minute consultations were sharing the therapist 30-minute buffer
-- that exists to separate physical treatment sessions. For doctors, that buffer
-- was over-restrictive: it prevented a 30-minute consultation from being booked
-- at 10:30 when another consultation ended at 10:30, and it made the public
-- slot picker show every second slot as unavailable. This migration removes the
-- buffer for consultations only — treatments keep it.
--
-- The app-layer clash check (freeVaidyaIn / findClash in
-- src/lib/booking/consultation-availability.ts) was already updated to pass
-- buffer = 0 for consultations. This migration keeps the database guard in sync.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Occupied window for a session, with NO post-session buffer.
-- Used by the consultation-specific exclusion constraint below.
CREATE OR REPLACE FUNCTION public.appt_occupied_range_no_buffer(_start timestamptz, _dur integer)
RETURNS tstzrange
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT tstzrange(_start, _start + make_interval(mins => COALESCE(_dur, 60)));
$$;

-- The old constraint applies to every booking with an assigned_therapist_code.
-- Split it by booking_kind so consultations can use the no-buffer range.
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_no_therapist_overlap;

-- Treatments (and any future non-consultation kind) keep the 30-minute buffer.
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_no_therapist_overlap_treatment
  EXCLUDE USING gist (
    assigned_therapist_code WITH =,
    public.appt_occupied_range(appointment_date_time, duration_mins) WITH &&
  )
  WHERE (
    assigned_therapist_code IS NOT NULL
    AND status IN ('scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress')
    AND booking_kind <> 'consultation'
  );

-- Consultations use the no-buffer range, allowing back-to-back 30-minute slots.
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_no_therapist_overlap_consultation
  EXCLUDE USING gist (
    assigned_therapist_code WITH =,
    public.appt_occupied_range_no_buffer(appointment_date_time, duration_mins) WITH &&
  )
  WHERE (
    assigned_therapist_code IS NOT NULL
    AND status IN ('scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress')
    AND booking_kind = 'consultation'
  );

-- Update the atomic write-time guard to use the no-buffer range for consultations.
-- This is the same per-Vaidya logic from 20260727_consultation_multi_vaidya_capacity.sql,
-- only the consultation overlap check changes.
CREATE OR REPLACE FUNCTION public.claim_instant_slots(p_claims jsonb)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_keys text[];
  v_key text;
  v_claim jsonb;
  v_row jsonb;
  v_resource_type text;
  v_resource_key text;
  v_capacity integer;
  v_start timestamptz;
  v_dur integer;
  v_count integer;
  v_id uuid;
  v_ids uuid[] := '{}';
BEGIN
  IF jsonb_typeof(p_claims) IS DISTINCT FROM 'array' OR jsonb_array_length(p_claims) = 0 THEN
    RAISE EXCEPTION 'claim_instant_slots requires a non-empty JSON array';
  END IF;

  SELECT array_agg(DISTINCT key ORDER BY key) INTO v_keys
  FROM (
    SELECT (c->>'resourceType') || '|' || (c->>'resourceKey') || '|' ||
           to_char((c->'row'->>'appointment_date_time')::timestamptz AT TIME ZONE 'Asia/Kuala_Lumpur', 'YYYY-MM-DD') AS key
    FROM jsonb_array_elements(p_claims) c
  ) s;

  FOREACH v_key IN ARRAY v_keys LOOP
    PERFORM pg_advisory_xact_lock(hashtextextended(v_key, 0));
  END LOOP;

  FOR v_claim IN SELECT * FROM jsonb_array_elements(p_claims) LOOP
    v_resource_type := v_claim->>'resourceType';
    v_resource_key  := v_claim->>'resourceKey';
    v_capacity      := (v_claim->>'capacity')::integer;
    v_row           := v_claim->'row';
    v_start         := (v_row->>'appointment_date_time')::timestamptz;
    v_dur           := COALESCE((v_row->>'duration_mins')::integer, 60);

    IF v_resource_type = 'gender' THEN
      SELECT count(*) INTO v_count
        FROM public.appointments a
       WHERE a.gender_requirement::text = v_resource_key
         AND a.status IN ('scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress')
         AND (a.status <> 'awaiting_payment' OR a.payment_expires_at IS NULL OR a.payment_expires_at > now())
         AND public.appt_occupied_range(a.appointment_date_time, a.duration_mins)
             && public.appt_occupied_range(v_start, v_dur);
    ELSE
      SELECT count(*) INTO v_count
        FROM public.appointments a
       WHERE a.booking_kind = 'consultation'
         AND (
           a.assigned_therapist_code = v_resource_key
           OR (a.assigned_therapist_code IS NULL AND v_resource_key = 'VAIDYA')
         )
         AND a.status IN ('scheduled', 'awaiting_payment', 'confirmed', 'checked_in', 'in_progress')
         AND (a.status <> 'awaiting_payment' OR a.payment_expires_at IS NULL OR a.payment_expires_at > now())
         AND public.appt_occupied_range_no_buffer(a.appointment_date_time, a.duration_mins)
             && public.appt_occupied_range_no_buffer(v_start, v_dur);
    END IF;

    IF v_count >= v_capacity THEN
      RAISE EXCEPTION 'SLOT_FULL: % has no room at %', v_resource_key, v_start;
    END IF;

    INSERT INTO public.appointments (
      customer_id, is_guest, booking_kind, treatment_id, treatment_category_id,
      treatment_name, duration_mins, status, requested_datetime, requested_datetime_alt,
      appointment_date_time, patient_name, patient_phone, patient_email, patient_gender,
      gender_requirement, pre_visit_form, payable_amount_rm, payment_status,
      parent_consultation_id, group_id, guest_age, payment_expires_at,
      assigned_therapist_code
    ) VALUES (
      NULLIF(v_row->>'customer_id', '')::uuid,
      COALESCE((v_row->>'is_guest')::boolean, true),
      v_row->>'booking_kind',
      NULLIF(v_row->>'treatment_id', '')::uuid,
      v_row->>'treatment_category_id',
      v_row->>'treatment_name',
      v_dur,
      (v_row->>'status')::appointment_status_enum,
      (v_row->>'requested_datetime')::timestamptz,
      NULLIF(v_row->>'requested_datetime_alt', '')::timestamptz,
      v_start,
      v_row->>'patient_name',
      v_row->>'patient_phone',
      v_row->>'patient_email',
      v_row->>'patient_gender',
      (v_row->>'gender_requirement')::gender_requirement_enum,
      COALESCE(v_row->'pre_visit_form', '{}'::jsonb),
      NULLIF(v_row->>'payable_amount_rm', '')::numeric,
      v_row->>'payment_status',
      NULLIF(v_row->>'parent_consultation_id', '')::uuid,
      NULLIF(v_row->>'group_id', '')::uuid,
      NULLIF(v_row->>'guest_age', '')::integer,
      NULLIF(v_row->>'payment_expires_at', '')::timestamptz,
      NULLIF(v_row->>'assigned_therapist_code', '')
    )
    RETURNING id INTO v_id;

    v_ids := array_append(v_ids, v_id);
  END LOOP;

  RETURN v_ids;
END;
$$;

-- Called only from server actions using the service-role key — never exposed
-- to anon/authenticated directly.
REVOKE ALL ON FUNCTION public.claim_instant_slots(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_instant_slots(jsonb) TO service_role;
