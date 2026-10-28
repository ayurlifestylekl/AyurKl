-- =============================================================
-- Combined migration run — apply in dependency order
-- Generated 2026-10-28 14:10
-- =============================================================

-- ───────────────────────────────────────────────────────────
-- FILE: 20260819_reschedule_requests.sql
-- ───────────────────────────────────────────────────────────
-- ============================================================================
-- Reschedule request flow: customer asks for a new time, staff approve/decline.
-- ============================================================================

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS reschedule_requested_at TIMESTAMPTZ;

COMMENT ON COLUMN public.appointments.reschedule_requested_at IS
  'When the customer requested a reschedule. NULL = no pending reschedule request. requested_datetime_alt holds the requested new time.';

-- ───────────────────────────────────────────────────────────
-- FILE: 20260901_manual_refund_workflow.sql
-- ───────────────────────────────────────────────────────────
-- Manual refund approval workflow
-- 1. Customers cancel with a reason but no automatic refund.
-- 2. Customers separately request a refund with a reason and bank details.
-- 3. Staff approve (triggers provider refund) or reject (with a reason).

-- ---------------------------------------------------------------------------
-- 1. Extend booking_refunds to store request/approval metadata
-- ---------------------------------------------------------------------------

alter table public.booking_refunds
  add column if not exists customer_reason text,
  add column if not exists staff_reason text,
  add column if not exists bank_account_number text,
  add column if not exists bank_account_holder_name text;

-- Allow customers to request a refund and staff to reject it.
alter table public.booking_refunds
  drop constraint if exists booking_refunds_status_check;

alter table public.booking_refunds
  add constraint booking_refunds_status_check
    check (status in ('claimed', 'pending', 'confirmed', 'failed', 'exception', 'requested', 'rejected'));

comment on column public.booking_refunds.customer_reason is 'Reason provided by the customer when requesting a refund.';
comment on column public.booking_refunds.staff_reason is 'Reason provided by staff when rejecting a refund.';
comment on column public.booking_refunds.bank_account_number is 'Full bank account number collected for FPX refunds (sensitive).';
comment on column public.booking_refunds.bank_account_holder_name is 'Bank account holder name collected for FPX refunds.';

-- ---------------------------------------------------------------------------
-- 2. Replace claim_booking_cancellation so it records the customer reason and
--    no longer creates an automatic refund record. Refunds are requested
--    separately and approved by staff.
-- ---------------------------------------------------------------------------

drop function if exists public.claim_booking_cancellation(uuid[], timestamptz, text);

create or replace function public.claim_booking_cancellation(
  p_appointment_ids uuid[],
  p_now timestamptz,
  p_actor_type text,
  p_reason text default null
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_appointment public.appointments%rowtype;
  v_locked_count integer;
  v_now timestamptz;
  v_created_ms double precision;
  v_appt_ms double precision;
  v_now_ms double precision;
  v_is_paid boolean;
  v_group_id_val uuid;
  v_whole_group boolean := false;
  v_active_group_ids uuid[];
  v_detach_this boolean;
  v_idempotency_key text;
  v_result_appointments uuid[] := array[]::uuid[];
  v_result_bills jsonb := '[]'::jsonb;
  v_seen_bills text[] := array[]::text[];
  v_bill_id text;
  v_bill_provider text;
begin
  -- ── structural validation ──────────────────────────────────────────────────
  if p_appointment_ids is null or cardinality(p_appointment_ids) = 0 then
    raise exception 'INVALID_INPUT: appointment_ids must be non-empty';
  end if;
  if (select count(distinct id) from unnest(p_appointment_ids) id) <> cardinality(p_appointment_ids) then
    raise exception 'INVALID_INPUT: duplicate appointment_id';
  end if;
  if p_actor_type not in ('customer', 'guest', 'staff', 'system', 'provider') then
    raise exception 'INVALID_INPUT: invalid actor_type';
  end if;

  -- ── lock rows in uuid order (before clock sample) ─────────────────────────
  perform a.id
  from public.appointments a
  where a.id = any(p_appointment_ids)
  order by a.id
  for update;

  get diagnostics v_locked_count = row_count;
  if v_locked_count <> cardinality(p_appointment_ids) then
    raise exception 'INVALID_INPUT: one or more appointments not found';
  end if;

  -- ── trusted database time (after all locks) ────────────────────────────────
  v_now := clock_timestamp();
  v_now_ms := extract(epoch from v_now) * 1000;

  -- ── determine whole-group vs individual ───────────────────────────────────
  select a.group_id into v_group_id_val
  from public.appointments a
  where a.id = p_appointment_ids[1];

  if v_group_id_val is not null then
    select array_agg(a.id order by a.id)
    into v_active_group_ids
    from public.appointments a
    where a.group_id = v_group_id_val
      and a.group_management_active = true;

    if cardinality(p_appointment_ids) = cardinality(v_active_group_ids) then
      v_whole_group := (
        select bool_and(a.id = any(p_appointment_ids))
        from unnest(v_active_group_ids) a(id)
      );
    end if;
  end if;

  -- ── full batch validation before any mutation ─────────────────────────────
  for v_appointment in
    select * from public.appointments
    where id = any(p_appointment_ids)
    order by id
  loop
    if v_appointment.status not in ('pending', 'scheduled', 'awaiting_payment', 'confirmed') then
      raise exception 'POLICY_CLOSED: appointment % is not in a cancellable status', v_appointment.id;
    end if;

    v_appt_ms := extract(epoch from v_appointment.appointment_date_time) * 1000;
    if v_now_ms >= v_appt_ms then
      raise exception 'POLICY_CLOSED: appointment % has already started', v_appointment.id;
    end if;
  end loop;

  -- ── mutations: all guards passed ─────────────────────────────────────────
  for v_appointment in
    select * from public.appointments
    where id = any(p_appointment_ids)
    order by id
  loop
    v_is_paid := v_appointment.payment_status = 'paid';
    v_detach_this := v_appointment.group_id is not null and not v_whole_group;

    -- cancel the appointment and optionally mark detached
    update public.appointments
    set status = 'cancelled',
        cancelled_at = v_now,
        cancellation_reason = coalesce(p_reason, 'Cancelled by customer'),
        updated_at = v_now,
        group_management_active = case when v_detach_this then false else group_management_active end,
        group_detached_at = case when v_detach_this and group_detached_at is null then v_now else group_detached_at end
    where id = v_appointment.id;

    -- sever old group bill from remaining active siblings for unpaid individual
    if v_detach_this and not v_is_paid and v_appointment.payment_bill_id is not null then
      update public.appointments
      set payment_bill_id = null,
          payment_url = null,
          payment_status = 'unpaid',
          updated_at = v_now
      where group_id = v_appointment.group_id
        and group_management_active = true
        and id <> v_appointment.id;

      v_bill_id := v_appointment.payment_bill_id;
      v_bill_provider := coalesce(v_appointment.payment_provider, '');
      if not (v_bill_id = any(v_seen_bills)) then
        v_seen_bills := array_append(v_seen_bills, v_bill_id);
        v_result_bills := v_result_bills || jsonb_build_array(
          jsonb_build_object('bill_id', v_bill_id, 'provider', v_bill_provider)
        );
      end if;
    end if;

    -- collect unpaid single-row bill (non-group or whole-group cancellation)
    if not v_is_paid and not v_detach_this and v_appointment.payment_bill_id is not null
       and not (v_appointment.payment_bill_id = any(v_seen_bills)) then
      v_seen_bills := array_append(v_seen_bills, v_appointment.payment_bill_id);
      v_result_bills := v_result_bills || jsonb_build_array(
        jsonb_build_object(
          'bill_id', v_appointment.payment_bill_id,
          'provider', coalesce(v_appointment.payment_provider, '')
        )
      );
    end if;

    -- audit event (cancelled)
    insert into public.booking_events (
      appointment_id, event_type, actor_type, old_data, new_data, created_at
    ) values (
      v_appointment.id,
      'cancelled',
      p_actor_type,
      jsonb_build_object(
        'status', v_appointment.status,
        'payment_status', v_appointment.payment_status,
        'appointment_date_time', v_appointment.appointment_date_time
      ),
      jsonb_build_object(
        'status', 'cancelled',
        'payment_status', v_appointment.payment_status,
        'appointment_date_time', v_appointment.appointment_date_time,
        'cancellation_reason', coalesce(p_reason, 'Cancelled by customer')
      ),
      v_now
    );

    v_result_appointments := array_append(v_result_appointments, v_appointment.id);
  end loop;

  return jsonb_build_object(
    'refund_required', false,
    'appointments',    to_jsonb(v_result_appointments),
    'refunds',         '[]'::jsonb,
    'unpaid_bills',    v_result_bills
  );
end;
$$;

revoke all on function public.claim_booking_cancellation(uuid[], timestamptz, text, text) from public, anon, authenticated;
grant execute on function public.claim_booking_cancellation(uuid[], timestamptz, text, text) to service_role;

-- ───────────────────────────────────────────────────────────
-- FILE: 20260902_consultation_no_buffer.sql
-- ───────────────────────────────────────────────────────────
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
  DROP CONSTRAINT IF EXISTS appointments_no_therapist_overlap_treatment;
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
  DROP CONSTRAINT IF EXISTS appointments_no_therapist_overlap_consultation;
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

-- ───────────────────────────────────────────────────────────
-- FILE: 20260902_product_orders_checkout.sql
-- ───────────────────────────────────────────────────────────
-- =====================================================================
-- Product Orders + Checkout Module — DB Delta (2026-09-02)
-- =====================================================================
-- Adds: product order tables, shipping address table, cancellation/refund
-- request tables, status history, order numbering, and stock reservation
-- helpers tied to the new product_orders table.
--
-- Safe to re-run. Apply via Supabase SQL Editor.
-- =====================================================================


-- -----------------------------------------------------------------
-- 1. Enums
-- -----------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.product_order_status_enum AS ENUM (
    'awaiting_payment', 'paid', 'processing', 'shipped', 'delivered',
    'cancelled', 'refunded'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.product_payment_status_enum AS ENUM (
    'pending', 'paid', 'failed', 'refunded'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.product_cancel_status_enum AS ENUM (
    'requested', 'processing', 'approved', 'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.product_refund_status_enum AS ENUM (
    'requested', 'claimed', 'pending', 'confirmed', 'failed', 'exception', 'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- -----------------------------------------------------------------
-- 2. Product order address table
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_order_addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  line_1        TEXT NOT NULL,
  line_2        TEXT,
  city          TEXT NOT NULL,
  postcode      TEXT NOT NULL,
  state         TEXT NOT NULL,
  country       TEXT NOT NULL DEFAULT 'Malaysia',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.product_order_addresses IS
  'Shipping addresses captured at checkout time for product orders.';


-- -----------------------------------------------------------------
-- 3. Shipping zones
-- -----------------------------------------------------------------
-- Add hitpay to the existing payment-method enum if it hasn't been added yet.
ALTER TYPE public.payment_method_enum ADD VALUE IF NOT EXISTS 'hitpay';

CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  country_code     TEXT NOT NULL DEFAULT '*',
  base_rate_rm     DECIMAL(10,2) NOT NULL CHECK (base_rate_rm >= 0),
  per_kg_rate_rm   DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (per_kg_rate_rm >= 0),
  free_threshold_rm DECIMAL(10,2) DEFAULT NULL,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.shipping_zones IS
  'Flat shipping rate rules per country/region for product orders.';

CREATE UNIQUE INDEX IF NOT EXISTS shipping_zones_country_code_active_idx
  ON public.shipping_zones(country_code) WHERE is_active = true;

-- Seed default overseas shipping zones. Use ON CONFLICT so the file stays re-runnable.
INSERT INTO public.shipping_zones (name, country_code, base_rate_rm, free_threshold_rm, sort_order)
VALUES
  ('Malaysia', 'MY', 10.00, 150.00, 1),
  ('ASEAN', '*-ASEAN', 35.00, 250.00, 2),
  ('Asia Pacific', '*-APAC', 55.00, 300.00, 3),
  ('Rest of World', '*', 80.00, 400.00, 4)
ON CONFLICT (country_code) WHERE is_active = true DO UPDATE SET
  name = EXCLUDED.name,
  base_rate_rm = EXCLUDED.base_rate_rm,
  free_threshold_rm = EXCLUDED.free_threshold_rm,
  sort_order = EXCLUDED.sort_order;

-- Trigger to keep updated_at current on shipping_zones.
CREATE OR REPLACE FUNCTION public.touch_shipping_zone_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS shipping_zones_touch_updated_at ON public.shipping_zones;
CREATE TRIGGER shipping_zones_touch_updated_at
  BEFORE UPDATE ON public.shipping_zones
  FOR EACH ROW EXECUTE FUNCTION public.touch_shipping_zone_updated_at();


-- -----------------------------------------------------------------
-- 4. Product orders
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_orders (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number            TEXT UNIQUE NOT NULL,
  idempotency_key         TEXT UNIQUE,
  customer_id             UUID REFERENCES public.users(id) ON DELETE SET NULL,
  email                   TEXT NOT NULL,
  phone                   TEXT,
  status                  public.product_order_status_enum NOT NULL DEFAULT 'awaiting_payment',
  payment_status          public.product_payment_status_enum NOT NULL DEFAULT 'pending',
  payment_method          public.payment_method_enum NOT NULL DEFAULT 'billplz',
  subtotal_rm             DECIMAL(10,2) NOT NULL CHECK (subtotal_rm >= 0),
  shipping_rm             DECIMAL(10,2) NOT NULL DEFAULT 10.00 CHECK (shipping_rm >= 0),
  member_discount_rm      DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (member_discount_rm >= 0),
  total_rm                DECIMAL(10,2) NOT NULL CHECK (total_rm >= 0),
  shipping_address_id     UUID NOT NULL REFERENCES public.product_order_addresses(id) ON DELETE RESTRICT,
  billplz_bill_id         TEXT,
  billplz_collection_id   TEXT,
  payment_url             TEXT,
  paid_at                 TIMESTAMPTZ,
  shipped_at              TIMESTAMPTZ,
  delivered_at            TIMESTAMPTZ,
  cancelled_at            TIMESTAMPTZ,
  cancel_reason           TEXT,
  payment_expires_at      TIMESTAMPTZ,
  tracking_number         TEXT,
  courier                 TEXT,
  internal_notes          TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_orders_customer_id_idx
  ON public.product_orders(customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS product_orders_status_idx
  ON public.product_orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS product_orders_payment_status_idx
  ON public.product_orders(payment_status, created_at DESC);

CREATE INDEX IF NOT EXISTS product_orders_email_idx
  ON public.product_orders(email);

COMMENT ON TABLE public.product_orders IS
  'Customer-facing product orders created from the public storefront checkout.';

ALTER TABLE public.product_orders
  ADD COLUMN IF NOT EXISTS payment_provider TEXT,
  ADD COLUMN IF NOT EXISTS provider_bill_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_collection_id TEXT,
  ADD COLUMN IF NOT EXISTS shipping_zone_id UUID REFERENCES public.shipping_zones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS shipping_country_code TEXT,
  ADD COLUMN IF NOT EXISTS total_weight_grams INTEGER NOT NULL DEFAULT 0 CHECK (total_weight_grams >= 0);

CREATE INDEX IF NOT EXISTS product_orders_provider_bill_idx
  ON public.product_orders(provider_bill_id);


-- -----------------------------------------------------------------
-- 4. Product order items
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_order_id  UUID NOT NULL REFERENCES public.product_orders(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name      TEXT NOT NULL,
  product_sku       TEXT,
  quantity          INT NOT NULL CHECK (quantity > 0),
  unit_price_rm     DECIMAL(10,2) NOT NULL CHECK (unit_price_rm >= 0),
  line_total_rm     DECIMAL(10,2) NOT NULL CHECK (line_total_rm >= 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_order_items_order_idx
  ON public.product_order_items(product_order_id);


-- -----------------------------------------------------------------
-- 5. Product order status history
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_order_status_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_order_id  UUID NOT NULL REFERENCES public.product_orders(id) ON DELETE CASCADE,
  actor_id          UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type        TEXT NOT NULL,
  from_status       TEXT,
  to_status         TEXT,
  payload           JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_customer_visible BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_order_status_history_order_idx
  ON public.product_order_status_history(product_order_id, created_at DESC);


-- -----------------------------------------------------------------
-- 6. Product cancellations
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_cancellations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_order_id  UUID NOT NULL REFERENCES public.product_orders(id) ON DELETE CASCADE,
  reason            TEXT NOT NULL,
  status            public.product_cancel_status_enum NOT NULL DEFAULT 'requested',
  requested_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at        TIMESTAMPTZ,
  staff_reason      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_cancellations_order_idx
  ON public.product_cancellations(product_order_id);

CREATE INDEX IF NOT EXISTS product_cancellations_status_idx
  ON public.product_cancellations(status, requested_at DESC);

-- At most one cancellation per order can be in flight at a time. Without
-- this, a double-submitted cancellation request creates two 'requested'
-- rows, and two staff approving them close together could both reach the
-- non-idempotent restore_stock_for_product_order RPC for the same order.
CREATE UNIQUE INDEX IF NOT EXISTS product_cancellations_one_active_per_order
  ON public.product_cancellations(product_order_id)
  WHERE status IN ('requested', 'processing');


-- -----------------------------------------------------------------
-- 7. Product refund requests
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_refund_requests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_order_id      UUID NOT NULL REFERENCES public.product_orders(id) ON DELETE CASCADE,
  product_cancellation_id UUID REFERENCES public.product_cancellations(id) ON DELETE SET NULL,
  amount_rm             DECIMAL(10,2) NOT NULL CHECK (amount_rm > 0),
  status                public.product_refund_status_enum NOT NULL DEFAULT 'requested',
  customer_bank_name    TEXT,
  customer_bank_account TEXT,
  customer_reason       TEXT,
  staff_reason          TEXT,
  provider_refund_id    TEXT,
  provider_refund_status TEXT,
  bank_code             TEXT,
  bank_account_number   TEXT,
  bank_account_holder_name TEXT,
  bank_account_last4    TEXT,
  idempotency_key       TEXT UNIQUE,
  failure_reason        TEXT,
  requested_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at          TIMESTAMPTZ,
  decided_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_refund_requests_order_idx
  ON public.product_refund_requests(product_order_id);

CREATE INDEX IF NOT EXISTS product_refund_requests_status_idx
  ON public.product_refund_requests(status, requested_at DESC);

CREATE INDEX IF NOT EXISTS product_refund_requests_pending_idx
  ON public.product_refund_requests(status, requested_at) WHERE status = 'pending';


-- -----------------------------------------------------------------
-- 8. Order number sequence + helper
-- -----------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.product_order_number_seq START 1;

CREATE OR REPLACE FUNCTION public.next_product_order_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN 'ORD-' || to_char(now(), 'YYYY')
         || '-' || LPAD(nextval('public.product_order_number_seq')::TEXT, 5, '0');
END $$;


-- -----------------------------------------------------------------
-- 9. Updated_at touch
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_product_orders()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS product_orders_touch ON public.product_orders;
CREATE TRIGGER product_orders_touch
  BEFORE UPDATE ON public.product_orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_product_orders();


-- -----------------------------------------------------------------
-- 10. Status change audit trigger
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_product_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.product_order_status_history(
        product_order_id, actor_id, event_type, from_status, to_status
      ) VALUES (
        NEW.id, auth.uid(), 'status_change',
        OLD.status::TEXT, NEW.status::TEXT
      );
    END IF;

    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
      INSERT INTO public.product_order_status_history(
        product_order_id, actor_id, event_type, from_status, to_status, payload
      ) VALUES (
        NEW.id, auth.uid(), 'payment_status_change',
        OLD.payment_status::TEXT, NEW.payment_status::TEXT,
        jsonb_build_object('amount_rm', NEW.total_rm)
      );
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS product_orders_audit_status_change ON public.product_orders;
CREATE TRIGGER product_orders_audit_status_change
  AFTER UPDATE ON public.product_orders
  FOR EACH ROW EXECUTE FUNCTION public.log_product_order_status_change();


-- -----------------------------------------------------------------
-- 11. Link stock_movements to product_orders
-- -----------------------------------------------------------------
ALTER TABLE public.stock_movements
  ADD COLUMN IF NOT EXISTS reference_product_order_id UUID
    REFERENCES public.product_orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS stock_movements_product_order_idx
  ON public.stock_movements(reference_product_order_id, created_at DESC);


-- -----------------------------------------------------------------
-- 12. Stock reservation helpers
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reserve_stock_for_product_order(
  p_order_id UUID,
  p_items JSONB
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_item RECORD;
  v_product RECORD;
BEGIN
  FOR v_item IN
    SELECT *
    FROM jsonb_to_recordset(p_items) AS x(
      product_id UUID,
      quantity INT,
      allow_backorder BOOLEAN
    )
  LOOP
    SELECT stock_qty, allow_backorder
    INTO v_product
    FROM public.products
    WHERE id = v_item.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_item.product_id;
    END IF;

    IF NOT COALESCE(v_item.allow_backorder, v_product.allow_backorder, false)
       AND v_product.stock_qty < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product % (need %, have %)',
        v_item.product_id, v_item.quantity, v_product.stock_qty;
    END IF;

    INSERT INTO public.stock_movements(
      product_id,
      movement_type,
      quantity_delta,
      reason,
      reference_product_order_id
    ) VALUES (
      v_item.product_id,
      'reserved',
      -v_item.quantity,
      'Reserved for order ' || p_order_id,
      p_order_id
    );
  END LOOP;

  RETURN true;
END $$;


CREATE OR REPLACE FUNCTION public.release_stock_for_product_order(p_order_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_item RECORD;
BEGIN
  FOR v_item IN
    SELECT product_id, ABS(quantity_delta) AS qty
    FROM public.stock_movements
    WHERE movement_type = 'reserved'
      AND reference_product_order_id = p_order_id
  LOOP
    INSERT INTO public.stock_movements(
      product_id, movement_type, quantity_delta, reason,
      reference_product_order_id
    ) VALUES (
      v_item.product_id, 'unreserved', v_item.qty,
      'Released reservation for order ' || p_order_id,
      p_order_id
    );
  END LOOP;
END $$;


CREATE OR REPLACE FUNCTION public.finalize_stock_for_product_order(p_order_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  UPDATE public.stock_movements
  SET movement_type = 'sold',
      reason = 'Sold for order ' || p_order_id
  WHERE movement_type = 'reserved'
    AND reference_product_order_id = p_order_id;
END $$;


CREATE OR REPLACE FUNCTION public.restore_stock_for_product_order(
  p_order_id UUID,
  p_reason TEXT DEFAULT 'Order cancelled/refunded'
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_item RECORD;
BEGIN
  FOR v_item IN
    SELECT product_id, ABS(quantity_delta) AS qty
    FROM public.stock_movements
    WHERE movement_type = 'sold'
      AND reference_product_order_id = p_order_id
  LOOP
    INSERT INTO public.stock_movements(
      product_id, movement_type, quantity_delta, reason,
      reference_product_order_id
    ) VALUES (
      v_item.product_id, 'returned', v_item.qty,
      p_reason || ' — order ' || p_order_id,
      p_order_id
    );
  END LOOP;
END $$;


CREATE OR REPLACE FUNCTION public.sweep_expired_product_orders(p_timeout INTERVAL DEFAULT INTERVAL '24 hours')
RETURNS TABLE (order_id UUID, order_number TEXT) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_order RECORD;
BEGIN
  FOR v_order IN
    SELECT id, order_number
    FROM public.product_orders
    WHERE status = 'awaiting_payment'
      AND payment_expires_at IS NOT NULL
      AND payment_expires_at < now()
    FOR UPDATE
  LOOP
    PERFORM public.release_stock_for_product_order(v_order.id);

    UPDATE public.product_orders
    SET status = 'cancelled',
        payment_status = 'failed',
        cancelled_at = now(),
        cancel_reason = 'Payment deadline expired'
    WHERE id = v_order.id;

    order_id := v_order.id;
    order_number := v_order.order_number;
    RETURN NEXT;
  END LOOP;
END $$;


-- -----------------------------------------------------------------
-- 13. RLS policies
-- -----------------------------------------------------------------
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_order_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_refund_requests ENABLE ROW LEVEL SECURITY;

-- Admin full access
DROP POLICY IF EXISTS "Admin manages product orders" ON public.product_orders;
CREATE POLICY "Admin manages product orders" ON public.product_orders
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manages product order items" ON public.product_order_items;
CREATE POLICY "Admin manages product order items" ON public.product_order_items
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manages product order addresses" ON public.product_order_addresses;
CREATE POLICY "Admin manages product order addresses" ON public.product_order_addresses
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manages product order status history" ON public.product_order_status_history;
CREATE POLICY "Admin manages product order status history" ON public.product_order_status_history
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manages product cancellations" ON public.product_cancellations;
CREATE POLICY "Admin manages product cancellations" ON public.product_cancellations
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manages product refund requests" ON public.product_refund_requests;
CREATE POLICY "Admin manages product refund requests" ON public.product_refund_requests
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Customers read their own rows
DROP POLICY IF EXISTS "Customer reads own product orders" ON public.product_orders;
CREATE POLICY "Customer reads own product orders" ON public.product_orders
  FOR SELECT USING (
    customer_id = auth.uid() OR email = auth.email()
  );

DROP POLICY IF EXISTS "Customer reads own product order items" ON public.product_order_items;
CREATE POLICY "Customer reads own product order items" ON public.product_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_orders o
      WHERE o.id = product_order_items.product_order_id
        AND (o.customer_id = auth.uid() OR o.email = auth.email())
    )
  );

DROP POLICY IF EXISTS "Customer reads own product order addresses" ON public.product_order_addresses;
CREATE POLICY "Customer reads own product order addresses" ON public.product_order_addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_orders o
      WHERE o.shipping_address_id = product_order_addresses.id
        AND (o.customer_id = auth.uid() OR o.email = auth.email())
    )
  );

DROP POLICY IF EXISTS "Customer reads own product order history" ON public.product_order_status_history;
CREATE POLICY "Customer reads own product order history" ON public.product_order_status_history
  FOR SELECT USING (
    is_customer_visible AND
    EXISTS (
      SELECT 1 FROM public.product_orders o
      WHERE o.id = product_order_status_history.product_order_id
        AND (o.customer_id = auth.uid() OR o.email = auth.email())
    )
  );

DROP POLICY IF EXISTS "Customer reads own product cancellations" ON public.product_cancellations;
CREATE POLICY "Customer reads own product cancellations" ON public.product_cancellations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_orders o
      WHERE o.id = product_cancellations.product_order_id
        AND (o.customer_id = auth.uid() OR o.email = auth.email())
    )
  );

DROP POLICY IF EXISTS "Customer reads own product refund requests" ON public.product_refund_requests;
CREATE POLICY "Customer reads own product refund requests" ON public.product_refund_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_orders o
      WHERE o.id = product_refund_requests.product_order_id
        AND (o.customer_id = auth.uid() OR o.email = auth.email())
    )
  );

-- ------------------------------------------------------------------
-- 14. Public read access for the storefront catalog
-- ------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads active products" ON public.products;
CREATE POLICY "Public reads active products" ON public.products
  FOR SELECT USING (status = 'active');

-- ───────────────────────────────────────────────────────────
-- FILE: 20260903_product_manager_role.sql
-- ───────────────────────────────────────────────────────────
-- =====================================================================
-- Product Management — dedicated role (2026-09-03)
-- =====================================================================
-- Product Management (/product-management) previously required an
-- 'admin' account and signed in through /admin/login — not actually
-- separate from the admin portal. This adds a new 'product_manager' role
-- with its own dedicated login (/product-management/login) and RLS access
-- scoped ONLY to the tables Product Management touches: catalog, bundle
-- items, inventory/stock movements, and product orders/fulfillment. It
-- gets no access to bookings, treatments, other admin settings, etc.
--
-- Safe to re-run. Apply via Supabase SQL Editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Allow the new role value
-- ---------------------------------------------------------------------
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin','customer','sales_agent','doctor','front_desk','product_manager'));

-- ---------------------------------------------------------------------
-- 2. Helper function (mirrors is_admin/is_doctor/is_front_desk pattern)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_product_manager()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'product_manager'
  );
END;
$$;

-- ---------------------------------------------------------------------
-- 3. Widen product-scoped RLS policies to admin OR product_manager
-- ---------------------------------------------------------------------

-- Catalog
DROP POLICY IF EXISTS "products: admin full access" ON public.products;
CREATE POLICY "products: admin full access" ON public.products
  FOR ALL USING (public.is_admin() OR public.is_product_manager())
  WITH CHECK (public.is_admin() OR public.is_product_manager());

DROP POLICY IF EXISTS "bundle_items: admin full access" ON public.bundle_items;
CREATE POLICY "bundle_items: admin full access" ON public.bundle_items
  FOR ALL USING (public.is_admin() OR public.is_product_manager())
  WITH CHECK (public.is_admin() OR public.is_product_manager());

-- product_bundle_items doesn't exist in this database (only bundle_items does,
-- already covered above) — guard so this is a no-op here instead of erroring.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_bundle_items') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admin manages bundle items" ON public.product_bundle_items';
    EXECUTE 'CREATE POLICY "Admin manages bundle items" ON public.product_bundle_items
      FOR ALL USING (public.is_admin() OR public.is_product_manager())
      WITH CHECK (public.is_admin() OR public.is_product_manager())';
  END IF;
END $$;

-- Inventory
DROP POLICY IF EXISTS "Admin manages stock movements" ON public.stock_movements;
CREATE POLICY "Admin manages stock movements" ON public.stock_movements
  FOR ALL USING (public.is_admin() OR public.is_product_manager())
  WITH CHECK (public.is_admin() OR public.is_product_manager());

-- Orders / fulfillment / cancellations / refunds
DROP POLICY IF EXISTS "Admin manages product orders" ON public.product_orders;
CREATE POLICY "Admin manages product orders" ON public.product_orders
  FOR ALL USING (public.is_admin() OR public.is_product_manager())
  WITH CHECK (public.is_admin() OR public.is_product_manager());

DROP POLICY IF EXISTS "Admin manages product order items" ON public.product_order_items;
CREATE POLICY "Admin manages product order items" ON public.product_order_items
  FOR ALL USING (public.is_admin() OR public.is_product_manager())
  WITH CHECK (public.is_admin() OR public.is_product_manager());

DROP POLICY IF EXISTS "Admin manages product order addresses" ON public.product_order_addresses;
CREATE POLICY "Admin manages product order addresses" ON public.product_order_addresses
  FOR ALL USING (public.is_admin() OR public.is_product_manager())
  WITH CHECK (public.is_admin() OR public.is_product_manager());

DROP POLICY IF EXISTS "Admin manages product order status history" ON public.product_order_status_history;
CREATE POLICY "Admin manages product order status history" ON public.product_order_status_history
  FOR ALL USING (public.is_admin() OR public.is_product_manager())
  WITH CHECK (public.is_admin() OR public.is_product_manager());

DROP POLICY IF EXISTS "Admin manages product cancellations" ON public.product_cancellations;
CREATE POLICY "Admin manages product cancellations" ON public.product_cancellations
  FOR ALL USING (public.is_admin() OR public.is_product_manager())
  WITH CHECK (public.is_admin() OR public.is_product_manager());

DROP POLICY IF EXISTS "Admin manages product refund requests" ON public.product_refund_requests;
CREATE POLICY "Admin manages product refund requests" ON public.product_refund_requests
  FOR ALL USING (public.is_admin() OR public.is_product_manager())
  WITH CHECK (public.is_admin() OR public.is_product_manager());

-- Product image uploads (admin/products ProductForm writes via the browser)
DROP POLICY IF EXISTS "Admin writes product images" ON storage.objects;
CREATE POLICY "Admin writes product images" ON storage.objects
  FOR ALL USING (bucket_id = 'product-images' AND (public.is_admin() OR public.is_product_manager()))
  WITH CHECK (bucket_id = 'product-images' AND (public.is_admin() OR public.is_product_manager()));

GRANT EXECUTE ON FUNCTION public.is_product_manager() TO anon, authenticated;

