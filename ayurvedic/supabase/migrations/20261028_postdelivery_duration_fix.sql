-- =====================================================================
-- Post-Delivery Care Package duration label fix (2026-10-28)
-- =====================================================================
-- 20260812_special_chapter_duration.sql was edited in place after it had
-- already been applied to the live database (changing the label from
-- 'Up to 45 days' to 'Personalised(7, 10, 14 DAYS)'). Editing an applied
-- migration does not re-run it, so that change never reached the
-- database. This migration carries the same change forward as its own
-- file so it actually applies.
-- =====================================================================

UPDATE public.treatments
SET duration = 'Personalised(7, 10, 14 DAYS)'
WHERE title = 'Post-Delivery Care Package (Sutika Paricharya)';
