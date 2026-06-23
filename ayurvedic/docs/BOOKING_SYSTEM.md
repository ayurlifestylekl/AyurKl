# Booking & Consultation System — Handover & Test Guide

Approval-gated booking for Kerala Ayurvedic Lifestyle: a customer requests a treatment or
consultation → staff (doctor / admin / front desk) approve & assign a therapist → the
customer pays the full price → the appointment is confirmed.

Built on the existing Supabase `appointments` table. No Cal.com.

---

## Roles & where they sign in

| Role | Login | Lands on | Can do |
|------|-------|----------|--------|
| Front desk | `/staff/login` | `/console` | See all requests, approve & assign, create walk-in bookings |
| Admin | `/staff/login` | `/admin/dashboard` (also `/console` + `/doctor`) | Everything |
| Doctor | `/doctor/login` | `/doctor` | Booked patients only — health info + clinical notes + consultation unlock |
| Customer | `/auth/login` (or guest) | `/account/appointments` | Book, pay, track, cancel |

Set a user's role in Supabase: `update public.users set role='doctor' where email='…';`
(roles: `admin`, `front_desk`, `doctor`, `customer`, `sales_agent`).

**Staff accounts** (password-only login, no OTP):
- Doctor — `kals.admin1@keralaayurvediclifestyle.com.my`
- Front desk — `frontdesk@keralaayurvediclifestyle.com.my`
- Admin — `admin@keralaayurvediclifestyle.com`

Passwords are shared privately, not stored in the repo.

---

## The flow

1. **Customer** picks a treatment at `/book/treatment` (or `/book/consultation`), chooses a
   preferred time + gender, fills a short health intake, accepts the policies, submits.
   Guests need no account; signed-in customers get it tracked in their dashboard.
2. The request lands on **all three staff panels** (auto-refresh every 20s) as `pending`.
3. **Staff approve & assign** a therapist (same-gender enforced), set the confirmed time + room.
   - Treatment → `awaiting_payment`. Consultation → `confirmed` (free).
4. **Customer pays** the full price (Billplz/FPX) → `confirmed`.
5. **Consultation-required treatments**: the consultation happens first; the **doctor "clears
   for treatment"** on their panel, which unlocks the treatment booking → same approve → pay flow.

Policies: same-gender therapists, 12-hour non-refundable cancellation window, rescheduling via
WhatsApp (12–24h notice).

---

## Test it end-to-end (local)

`npm run dev` → http://localhost:3000

1. **Book** — `/book/treatment` → pick *Ayurvedic Herbal Facial* → submit → you land on the
   request page (`Awaiting approval`).
2. **Approve** — `/staff/login` (front desk) → `/console` → open the request → *Approve & assign*
   (try a wrong-gender therapist first → it blocks) → status becomes `Awaiting payment`.
3. **Pay** — back on the request page (or `/account/appointments` → *Pay now*) → pays (test mode)
   → `Confirmed`.
4. **Doctor** — `/doctor/login` → `/doctor` → open the confirmed patient → name, contact, health,
   clinical notes.
5. **Consultation** — `/book/consultation` → request → front desk confirms → doctor opens it →
   *Clear for treatment* → use the link → treatment booking → approve → pay → confirmed.
6. **Walk-in** — front desk `/console` → *+ New booking*.
7. **Cancel** — request page → *Cancel booking* (more than 12h before = refund-eligible; within
   12h = non-refundable message).

---

## Going live with real payment (day 2)

Payment runs through one seam (`src/lib/payments/`). The Billplz provider is **already coded**
(`billplz.ts` — v3 bill creation + webhook signature verification). To switch from test mode to
real FPX:

1. In the environment set:
   - `BILLPLZ_API_KEY`, `BILLPLZ_COLLECTION_ID`, `BILLPLZ_WEBHOOK_SECRET` (the collection's *X Signature* key)
   - `PAYMENTS_PROVIDER=billplz`
   - `NEXT_PUBLIC_SITE_URL=https://your-domain` (so callback/redirect URLs are correct)
   - (sandbox testing: `BILLPLZ_API_BASE=https://www.billplz-sandbox.com`)
2. In Billplz, point the collection's callback at `https://your-domain/api/payments/callback`.
3. Test a live FPX payment. Nothing else changes.

---

## Migrations (apply to each environment, in order)

Run in the Supabase SQL Editor (idempotent):

- `supabase/migrations/20260622_treatments_catalog.sql` — treatment catalogue tables
- `supabase/migrations/20260518_users_profile_fields.sql` — user health/profile fields
- `supabase/migrations/20260623_booking_system.sql` — roles, statuses, appointment fields

Then seed the catalogue: `npx tsx scripts/seed-treatments-supabase.ts`.

---

## Go-live checklist

- [ ] Apply all three migrations to production
- [ ] Seed the treatment catalogue
- [ ] Set `PAYMENTS_PROVIDER=billplz` + Billplz keys + `NEXT_PUBLIC_SITE_URL`
- [ ] Create real doctor / front-desk staff accounts; **remove the `*.klal.test` test accounts**
- [ ] Delete sample/test bookings
- [ ] (optional) set `BOOKING_LINK_SECRET` to a dedicated secret for guest request links

## Deferred (not built — optional fast-follows)

- Appointment **reminders** before the visit (needs a scheduler/cron)
- Regenerating `src/lib/database.types.ts` from the live schema (currently hand-maintained; the
  new columns are handled via casts)
- Real-time sockets instead of 20s polling
