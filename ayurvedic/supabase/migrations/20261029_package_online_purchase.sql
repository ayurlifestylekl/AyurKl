-- =====================================================================
-- Package online self-checkout (2026-10-29, part 2)
-- =====================================================================
-- Client requirement (WhatsApp, 2026-10-29): allow the public to buy a
-- package directly from the website — customer details, a printable
-- receipt, a required T&C checkbox, and online payment (Billplz/Stripe,
-- same providers already used for bookings and product orders). This
-- reverses the earlier "WhatsApp-enquiry-only" cut: package_purchases
-- already had payment_method/payment_bill_id/payment_url columns sitting
-- unused for exactly this reason.
--
-- Safe to re-run. Apply via Supabase SQL Editor.
-- =====================================================================

-- A purchase now starts life 'awaiting_payment' until the provider confirms.
ALTER TYPE public.package_purchase_status_enum ADD VALUE IF NOT EXISTS 'awaiting_payment';

-- purchased_at/expires_at are only meaningful once payment is confirmed —
-- for an online purchase they're set at confirmation time, not at the
-- awaiting_payment row's creation. (Staff-logged manual sales still set
-- them immediately, same as before.)
ALTER TABLE public.package_purchases
  ALTER COLUMN purchased_at DROP NOT NULL,
  ALTER COLUMN purchased_at DROP DEFAULT,
  ALTER COLUMN expires_at DROP NOT NULL;

-- Snapshot validity_days too (price/sessions/treatment were already
-- snapshotted) — needed to compute expires_at at confirmation time without
-- re-reading the catalog, which may have changed since the customer started.
ALTER TABLE public.package_purchases
  ADD COLUMN IF NOT EXISTS validity_days_snapshot INTEGER NOT NULL DEFAULT 365;

-- Idempotent order creation (same pattern as product_orders.idempotency_key)
-- — a retried submit must not create a second awaiting-payment row/bill.
ALTER TABLE public.package_purchases
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- Records that the customer ticked "I agree" before paying.
ALTER TABLE public.package_purchases
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

ALTER TABLE public.package_purchases
  ADD COLUMN IF NOT EXISTS terms_version TEXT;

CREATE INDEX IF NOT EXISTS package_purchases_provider_bill_idx
  ON public.package_purchases(payment_bill_id);
