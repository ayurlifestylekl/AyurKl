-- =====================================================================
-- Package sale end date (2026-10-29, part 3)
-- =====================================================================
-- A package can now carry its own last-sale moment. After available_until
-- it drops off the website (homepage section, therapy strips, /packages,
-- flyer popup) and can't be bought online or logged at the counter — no one
-- has to remember to switch the promo off. NULL = no end date.
-- Packages already sold are unaffected: they stay valid for their full year.
--
-- Safe to re-run. Apply via Supabase SQL Editor.
-- =====================================================================

ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS available_until TIMESTAMPTZ;

-- Deepawali 2026: "Package available till November 30th 2026" (flyer), end of day Malaysia time.
UPDATE public.packages
SET available_until = '2026-11-30T23:59:59+08:00'
WHERE slug IN ('abhyangam-package', 'complete-relaxing-package', 'deepawali-special-udwarthanam', 'sirodhaara-package');
