-- =====================================================================
-- Deepawali promo packages (2026-10-29)
-- =====================================================================
-- Session-bundle packages (e.g. "Abhyangam Package — RM750 — 10 sessions").
-- For this promo there is no online self-checkout: a customer enquires via
-- WhatsApp and staff logs the sale manually in /console/packages, then
-- redeems sessions off it on each visit. Schema still models a real
-- purchase + redemption ledger so a future promo can add an online
-- payment step without a rebuild.
--
-- Safe to re-run. Apply via Supabase SQL Editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. packages — catalog, admin-managed
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.packages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  price_rm          DECIMAL(10,2) NOT NULL CHECK (price_rm >= 0),
  session_count     INTEGER NOT NULL CHECK (session_count > 0),
  treatment_id      UUID NOT NULL REFERENCES public.treatments(id) ON DELETE RESTRICT,
  description       TEXT,
  validity_days     INTEGER NOT NULL DEFAULT 365 CHECK (validity_days > 0),
  terms_version     TEXT NOT NULL DEFAULT '2026-10',
  is_active         BOOLEAN NOT NULL DEFAULT true,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS packages_active_idx ON public.packages(is_active, sort_order);

CREATE OR REPLACE FUNCTION public.touch_packages_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS packages_touch_updated_at ON public.packages;
CREATE TRIGGER packages_touch_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.touch_packages_updated_at();


-- ---------------------------------------------------------------------
-- 2. package_purchases — one row per sale (always staff-logged this round)
-- ---------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.package_purchase_status_enum AS ENUM ('active', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.package_purchases (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id              UUID NOT NULL REFERENCES public.packages(id) ON DELETE RESTRICT,

  owner_name              TEXT NOT NULL,
  owner_email             TEXT,
  owner_phone             TEXT NOT NULL,
  owner_customer_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Snapshot at purchase time, independent of later catalog edits.
  package_name_snapshot   TEXT NOT NULL,
  price_rm_snapshot        DECIMAL(10,2) NOT NULL,
  session_count_snapshot  INTEGER NOT NULL,
  treatment_id_snapshot   UUID REFERENCES public.treatments(id) ON DELETE SET NULL,

  sessions_used           INTEGER NOT NULL DEFAULT 0 CHECK (sessions_used >= 0),
  purchased_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at              TIMESTAMPTZ NOT NULL,
  status                  public.package_purchase_status_enum NOT NULL DEFAULT 'active',

  -- Fixed for this promo; kept so a future online-purchase flow is additive.
  source                  TEXT NOT NULL DEFAULT 'whatsapp_manual',
  payment_method          TEXT,
  payment_bill_id         TEXT,
  payment_url             TEXT,

  created_by_staff_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS package_purchases_owner_phone_idx ON public.package_purchases(owner_phone);
CREATE INDEX IF NOT EXISTS package_purchases_owner_email_idx ON public.package_purchases(owner_email);
CREATE INDEX IF NOT EXISTS package_purchases_status_idx ON public.package_purchases(status, created_at DESC);

COMMENT ON TABLE public.package_purchases IS
  'One row per sold package. This promo: always staff-logged from a WhatsApp enquiry (source = whatsapp_manual).';


-- ---------------------------------------------------------------------
-- 3. package_redemptions — ledger, one row per session used
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.package_redemptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_purchase_id     UUID NOT NULL REFERENCES public.package_purchases(id) ON DELETE CASCADE,
  appointment_id          UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  redeemed_by_staff_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  redeemed_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes                   TEXT
);

CREATE INDEX IF NOT EXISTS package_redemptions_purchase_idx
  ON public.package_redemptions(package_purchase_id, redeemed_at DESC);


-- ---------------------------------------------------------------------
-- 4. redeem_package_session — atomic redemption RPC
-- ---------------------------------------------------------------------
-- Locks the purchase row FOR UPDATE so a double-click (or two staff at once)
-- can't deduct two sessions for a single visit. Same shape as
-- claim_instant_slots in 20260902_consultation_no_buffer.sql.
CREATE OR REPLACE FUNCTION public.redeem_package_session(
  p_package_purchase_id UUID,
  p_staff_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS public.package_redemptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_purchase RECORD;
  v_redemption public.package_redemptions;
BEGIN
  SELECT * INTO v_purchase
  FROM public.package_purchases
  WHERE id = p_package_purchase_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Package purchase % not found', p_package_purchase_id;
  END IF;

  IF v_purchase.status <> 'active' THEN
    RAISE EXCEPTION 'Package is % — not active', v_purchase.status;
  END IF;

  IF v_purchase.expires_at <= now() THEN
    UPDATE public.package_purchases SET status = 'expired' WHERE id = p_package_purchase_id;
    RAISE EXCEPTION 'Package expired on %', v_purchase.expires_at;
  END IF;

  IF v_purchase.sessions_used >= v_purchase.session_count_snapshot THEN
    RAISE EXCEPTION 'All % sessions already used', v_purchase.session_count_snapshot;
  END IF;

  UPDATE public.package_purchases
  SET sessions_used = sessions_used + 1
  WHERE id = p_package_purchase_id;

  INSERT INTO public.package_redemptions (package_purchase_id, redeemed_by_staff_id, notes)
  VALUES (p_package_purchase_id, p_staff_id, p_notes)
  RETURNING * INTO v_redemption;

  RETURN v_redemption;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_package_session(UUID, UUID, TEXT) TO authenticated, service_role;


-- ---------------------------------------------------------------------
-- 5. RLS
-- ---------------------------------------------------------------------
-- Staff pages read/write exclusively through requireStaff()'s service-role
-- client, which bypasses RLS. These policies are a defence-in-depth net for
-- any direct (anon/authenticated-key) access, mirroring the admin-only
-- pattern used by product_orders etc.
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads active packages" ON public.packages;
CREATE POLICY "Public reads active packages" ON public.packages
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Staff manages packages" ON public.packages;
CREATE POLICY "Staff manages packages" ON public.packages
  FOR ALL USING (public.is_admin() OR public.is_front_desk())
  WITH CHECK (public.is_admin() OR public.is_front_desk());

DROP POLICY IF EXISTS "Staff manages package purchases" ON public.package_purchases;
CREATE POLICY "Staff manages package purchases" ON public.package_purchases
  FOR ALL USING (public.is_admin() OR public.is_front_desk())
  WITH CHECK (public.is_admin() OR public.is_front_desk());

DROP POLICY IF EXISTS "Staff manages package redemptions" ON public.package_redemptions;
CREATE POLICY "Staff manages package redemptions" ON public.package_redemptions
  FOR ALL USING (public.is_admin() OR public.is_front_desk())
  WITH CHECK (public.is_admin() OR public.is_front_desk());
