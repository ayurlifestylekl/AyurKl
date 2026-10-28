-- =====================================================================
-- Announcement banner: optional link (2026-10-29)
-- =====================================================================
-- The sitewide announcement strip was text-only. The Deepawali packages
-- promo needs the banner to link through to /packages, so this adds an
-- optional link_url — unused (NULL) for a plain message or a closure
-- notice, set only when the announcement should be clickable.
--
-- Idempotent. Apply via Supabase SQL Editor.
-- =====================================================================

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS link_url TEXT;
