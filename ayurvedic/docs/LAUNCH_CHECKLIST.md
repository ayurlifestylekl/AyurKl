# Launch Checklist — Kerala Ayurvedic Lifestyle

Everything left to flip the Phase 2 build fully live. No secrets in this file —
values live in Vercel / Supabase dashboards and `.env.local`.

## 1. Database — run the 3 migrations (Supabase SQL Editor)

Run each file from `supabase/migrations/` (any order, all idempotent):

- [ ] `20260627_schedule_blocks.sql` — slot blocking + staff leave
- [ ] `20260627b_payment_expiry.sql` — 15-hour payment window columns
- [ ] `20260628_group_bookings.sql` — group bookings (`group_id`, `guest_age`)

Until these run, those three features stay dormant (code degrades gracefully).

## 2. Vercel — environment variables

Already set (verified 29 Jun): Billplz ×3, Supabase ×3, Sanity ×4, SMTP ×4,
`EMAIL_FROM`, `NEXT_PUBLIC_SITE_URL`, `PAYMENTS_PROVIDER`, `NEXT_PUBLIC_REQUIRE_OTP`.

- [ ] Add `CRON_SECRET` — any long random string (protects both cron routes;
      Vercel sends it automatically as a Bearer token)
- [ ] (Only if the product shop ever returns) `NEXT_PUBLIC_COMMERCE_ENABLED=true`

## 3. Vercel — redeploy & verify

- [ ] Redeploy `main` (cron config is read at deploy time)
- [ ] Settings → Cron Jobs shows BOTH:
      `/api/cron/expire-bookings` (0 18 * * * — 2 AM MYT) and
      `/api/health` (0 6 * * * — 2 PM MYT)
- [ ] Open `https://<domain>/api/health` → `{"ok":true}`

## 4. Keep-alive / uptime monitor (UptimeRobot — free, ~2 min)

Prevents the Supabase free-tier 7-day pause with extra redundancy AND emails
you if the site ever goes down during the client trial.

- [ ] Sign up at https://uptimerobot.com (free plan)
- [ ] Add monitor → type **HTTP(s)** → URL `https://<domain>/api/health`
- [ ] Interval: 5 minutes · Alert contact: your email
- [ ] Confirm the monitor shows "Up"

(Even without this, the two daily crons already keep Supabase active.)

## 5. Security

- [ ] Revoke the GitHub personal-access token that was shared in chat
      (GitHub → Settings → Developer settings → Tokens) and mint a fresh one
- [ ] Keep `docs/` guide files with staff passwords out of git (already
      gitignored — do not force-add)

## 6. Before public launch (day-2)

- [ ] Verify the Brevo sending domain (SPF/DKIM) so emails avoid spam
- [ ] Switch `NEXT_PUBLIC_REQUIRE_OTP=true` and redeploy
- [ ] Add treatment photos
- [ ] Weekly Supabase backup during the trial (Dashboard → Database → Backups
      is Pro-only; on free, use Table Editor export or `pg_dump` weekly)

## 7. Smoke test with the team

- [ ] Single booking end-to-end: request → approve (pick Preferred/Alt) →
      pay (Billplz FPX) → confirmed email
- [ ] Group booking (2 guests, mixed gender): slots appear only where both
      therapists free → approve both → one combined payment confirms both
- [ ] Reject a request with a reason → customer sees reason + "Book again"
- [ ] Block a slot / mark leave → slot disappears from customer picker
- [ ] Visual schedule shows the day correctly (therapist columns, day off)
- [ ] Let a payment window lapse → slot reopens immediately; overnight cron
      cancels + emails
