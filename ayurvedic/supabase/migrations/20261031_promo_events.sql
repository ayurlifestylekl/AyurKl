-- Click tracking for promos, shown to staff in /console/packages.
-- Stores only which button was used, on which package, and when: no names,
-- phone numbers, IP addresses or cookies.

CREATE TABLE IF NOT EXISTS public.promo_events (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  promo         TEXT NOT NULL,
  event         TEXT NOT NULL,
  placement     TEXT NOT NULL,
  package_slug  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS promo_events_promo_created_idx
  ON public.promo_events (promo, created_at);

-- RLS on with no policies: only the server (service role) can read or write.
ALTER TABLE public.promo_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.promo_events FROM anon, authenticated;
GRANT SELECT, INSERT ON public.promo_events TO service_role;

-- One JSONB value rather than a row set, so PostgREST's row cap can never
-- silently cut a month of grouped counts short.
CREATE OR REPLACE FUNCTION public.promo_event_summary(p_promo TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(s ORDER BY s.day), '[]'::jsonb)
  FROM (
    SELECT
      (created_at AT TIME ZONE 'Asia/Kuala_Lumpur')::date AS day,
      event,
      placement,
      package_slug,
      count(*)::int AS total
    FROM public.promo_events
    WHERE promo = p_promo
    GROUP BY 1, 2, 3, 4
  ) s;
$$;

REVOKE EXECUTE ON FUNCTION public.promo_event_summary(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.promo_event_summary(TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promo_event_summary(TEXT) TO service_role;
