-- ================================================================
-- Standardise duration for the 5 Vasti/Tarpanam "special chapter"
-- therapies to 1 hour, with the multi-day course options noted.
-- Run via the Supabase SQL Editor or `supabase migration up`.
-- ================================================================

UPDATE public.treatments
SET duration = '1 hour (3, 5, 7, 10 or more days)'
WHERE title IN (
  'Jaanu Vasti (Knee Care)',
  'Kati Vasti (Lower Back Care)',
  'Greeva Vasti (Neck Care)',
  'Uro Vasti (Chest Care)',
  'Netra Tarpanam (Eye Rejuvenation)'
);

-- Set the Post-Delivery Care Package duration to the requested
-- personalised multi-day programme label.
UPDATE public.treatments
SET duration = 'Personalised(7, 10, 14 DAYS)'
WHERE title = 'Post-Delivery Care Package (Sutika Paricharya)';
