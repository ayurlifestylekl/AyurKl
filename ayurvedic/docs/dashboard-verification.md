# Customer Dashboard — Phase 1 Verification Log

> Status: ☐ in progress / ☐ complete
> Reviewer: _________________________  Date: _________

Run through this checklist after Phase 1 ships. Mark each item Pass / Fail / N-A and
note any follow-up tickets at the bottom.

## Automated (already done at end of Task 10)

- [x] `npx tsc --noEmit` — clean
- [x] `npm run test` — 3 passing (account deletion guard)
- [x] `npm run build` — succeeds; `/account/addresses` route present

## 1. RLS audit (Supabase Studio → SQL Editor)

Run this query and confirm every customer-touching table has a `SELECT` policy gated on
`auth.uid() = customer_id` (or `user_id`):

```sql
SELECT tablename, policyname, cmd, qual FROM pg_policies
WHERE tablename IN (
  'users','orders','order_items','appointments',
  'support_tickets','support_messages','customer_promos',
  'quiz_results','addresses'
)
ORDER BY tablename, cmd;
```

- [ ] `users` — self-only SELECT/UPDATE present
- [ ] `orders` — customer_id-scoped SELECT
- [ ] `order_items` — joined via orders RLS
- [ ] `appointments` — customer_id-scoped SELECT
- [ ] `support_tickets` — customer_id-scoped SELECT
- [ ] `support_messages` — joined via tickets RLS
- [ ] `customer_promos` — customer_id-scoped SELECT
- [ ] `quiz_results` — user_id-scoped SELECT
- [ ] `addresses` — customer_id-scoped SELECT/INSERT/UPDATE/DELETE (new in Phase 1)

## 2. Cross-tenant spot check

Create two test customers (A and B). Sign in as B. In a fresh browser tab:

- [ ] Visit `/account/orders/<order-id-belonging-to-A>` → expect 404 (RLS hides)
- [ ] Visit `/account/messages/<ticket-id-belonging-to-A>` → expect 404
- [ ] Add an address as A, then as B view `/account/addresses` — only B's address visible

## 3. Happy-path walkthrough (signed in as customer with seed data)

- [ ] `/account/dashboard` — hero, 3 stat tiles, quick actions, orders preview, appointments preview, messages preview all render
- [ ] `/account/orders` — list renders with filter tabs; live shipment tracker shows where applicable
- [ ] `/account/orders/{id}` — order detail with timeline, items, tracking, payment panel (no duplicate receipt button), order actions (cancel button appears for pending+processing orders only)
- [ ] **Cancel order** — for a pending+processing test order: cancel button → modal → type reason ≥5 chars → confirm → toast → order now shows "Cancelled" status and `cancelled_at` populated in DB
- [ ] **Practitioner note** — `UPDATE orders SET practitioner_note = 'test note' WHERE id = ...` → refresh → chip appears. Set back to NULL → chip disappears
- [ ] `/account/appointments` — hero, summary tiles, filter tabs, list cards, aftercare panel
- [ ] `/account/profile` — hero, wellness snapshot, **avatar uploader**, identity form (no Bahasa "coming soon" copy), health intake, preferences, security section (no 2FA "coming soon" copy), danger zone with Download my data + Delete my account
- [ ] **Avatar upload** — pick PNG ≤2MB → toast → avatar shows in form + topbar. Refresh → still there. Click Remove → falls back to initials. Try 3MB file → "must be under 2 MB". Try PDF → "Use PNG, JPEG, or WebP."
- [ ] `/account/messages` — list, new ticket form, clinic info card
- [ ] `/account/messages/{ticketId}` — thread, reply form
- [ ] `/account/addresses` (new) — empty state friendly. Add address → appears in list. Set default → "Default" badge moves. Edit → changes persist. Delete → removed
- [ ] `/account/assessments` — Prakriti live, 6 quizzes locked as "Coming soon"
- [ ] `/account/promos` — wallet hero, featured voucher, claim form, locked categories show as "Coming soon"

## 4. Empty-state walkthrough (brand-new customer)

Create a fresh test customer with zero data. Visit each:

- [ ] `/account/dashboard` — no crashes, friendly empty messaging
- [ ] `/account/orders` — empty state with CTA to shop
- [ ] `/account/appointments` — empty state with CTA to book
- [ ] `/account/messages` — empty state with CTA to start a ticket
- [ ] `/account/addresses` — empty state copy renders
- [ ] `/account/promos` — wallet shows "No vouchers yet"
- [ ] `/account/assessments` — Prakriti starts in 'active' state

## 5. PDPA data export

- [ ] Click "Download my data" in profile danger zone → browser downloads `kerala-ayurvedic-data-xxxx.json`
- [ ] Open the file → contains keys: `exportedAt, user, addresses, orders, appointments, tickets, promos, quizResults`
- [ ] Data is scoped to your account only (no other customers' rows)

## 6. Account deletion (USE A THROWAWAY TEST ACCOUNT)

- [ ] Open delete dialog → type wrong phrase → Delete button stays disabled
- [ ] Type "delete my account" (wrong case) → still disabled
- [ ] Type "DELETE MY ACCOUNT" → button enables
- [ ] Click delete → redirected to `/`, signed out
- [ ] SQL check:
  ```sql
  SELECT full_name, email, deleted_at FROM users WHERE id = '<test-user-id>';
  -- Expected: 'Deleted user', NULL, <recent timestamp>
  ```
- [ ] Orders for that user still exist in DB (referential integrity)
- [ ] Try signing in with that account's email — should fail (or sign in but show as anonymized)

## 7. `.ics` export (existing feature, unchanged in Phase 1)

- [ ] Trigger `/account/appointments/{id}/ics` → file downloads
- [ ] Double-click → opens in Apple Calendar with correct date, time, treatment
- [ ] Import into Google Calendar (Settings → Import & export) — appears with correct details

## 8. Invoice route (existing feature, unchanged in Phase 1)

- [ ] Open `/account/orders/{id}/invoice` for a paid order
- [ ] Response is a binary PDF (Content-Type: application/pdf), not HTML/JSON
- [ ] If it returns HTML instead — file Phase 3 ticket to switch to `@react-pdf/renderer`

## 9. Cross-browser sanity (golden path on Safari + Chrome at least)

- [ ] Dashboard renders on Safari (avatar uploads work, modal dialogs render)
- [ ] Mobile viewport (375px) — sidebar collapses, nav drawer works, cancel/delete modals readable

---

## Phase 2 verification

### Automated (already done at end of Task 8)
- [x] `npx tsc --noEmit` — clean
- [x] `npm run test` — 12 passing (5 cal.com signature + 4 email opt-in + 3 deletion guard)
- [x] `npm run build` — succeeds; new routes `/account/wishlist`, `/account/notifications`, `/api/webhooks/calcom`, `/api/account/export` all present

### Wishlist
- [ ] Heart icon appears on `/products` cards (top-right of each card)
- [ ] Click while signed in → toast → icon fills gold
- [ ] `/account/wishlist` lists saved items with image, name, price, category, link to detail
- [ ] Re-click on `/products` → toast "Removed", item disappears from `/account/wishlist` after refresh
- [ ] Sign out → heart still appears; click → toast "Sign in to save items."
- [ ] Cross-tenant: User A's wishlist not visible to User B (RLS)

### 2FA TOTP
- [ ] Studio → Auth → Providers → MFA TOTP must be enabled before testing (else `enrollMfa` returns "MFA_DISABLED_FOR_PROJECT")
- [ ] Profile → Security shows the 2FA panel below the password form
- [ ] Click "Enable 2FA" → QR dialog appears
- [ ] Scan with Google Authenticator / Authy / 1Password → enter the 6-digit code → toast "Two-factor authentication enabled" → panel flips to "Enabled. Disable 2FA"
- [ ] Refresh → still shows enabled (mirrored in `users.mfa_enrolled`)
- [ ] Sign out → sign back in → Supabase prompts for MFA code
- [ ] Disable 2FA → confirm dialog → panel flips back; subsequent sign-in no longer prompts

### Notifications inbox
- [ ] DashboardShell no longer contains `SAMPLE_NOTIFICATIONS` or the `NotificationsMenu` function (real `<NotificationsRealBell/>` swapped in)
- [ ] Bell starts empty for a fresh customer
- [ ] Insert a notification in Studio SQL Editor:
  ```sql
  INSERT INTO notifications (user_id, kind, title, body, href)
  VALUES ('<your-user-id>', 'welcome', 'Welcome!', 'Test body here.', '/account/dashboard');
  ```
- [ ] **Realtime check:** with the dropdown closed, insert another notification via SQL → gold dot appears on the bell **without page refresh**
- [ ] Click a notification → navigates to href, row turns from gold-tinted to plain
- [ ] "Mark all read" clears the gold dot
- [ ] `/account/notifications` full inbox shows all 100 most recent notifications with per-row mark-read button
- [ ] "Notifications" nav entry appears in the account sidebar with bell icon
- [ ] Cross-tenant: User A's notifications not visible to User B (RLS verifies)

### Cross-action wiring
- [ ] Cancel an order → notification appears in bell with title `Order #XXXXXX cancelled`
- [ ] Save a new address → notification appears in bell with title `Address saved`
- [ ] (Throwaway account) trigger account deletion → email arrives at the original email (Resend) with the cool-off date

### Resend transactional email
- [ ] `RESEND_API_KEY` is set in `.env.local` (real key, not `your-resend-api-key`)
- [ ] Send a manual welcome via node REPL or temp route: arrives in inbox
- [ ] Sender label shows "Kerala Ayurvedic Lifestyle" (uses fallback `onboarding@resend.dev` until domain is verified)
- [ ] Reminder email skipped when `email_reminders_opt_in = false` (covered by unit test)
- [ ] Marketing email skipped when `marketing_opt_in = false` (covered by unit test)
- [ ] Transactional always sends regardless of opt-ins (covered by unit test)

### Cal.com webhook
- [ ] `CALCOM_WEBHOOK_SECRET` is set in `.env.local` (matches the secret you generated in Cal.com → Settings → Webhooks)
- [ ] Webhook URL configured in Cal.com pointing to `/api/webhooks/calcom`
- [ ] Cal.com "Test" button returns 200 (signature valid)
- [ ] Tampered body returns 401 (signature verify failure)
- [ ] Real booking via `/book/consultation` with a known-customer email → row appears in `appointments` table with the `calcom_booking_uid`
- [ ] Same booking → notification appears in the customer's bell ("Appointment confirmed")
- [ ] Same booking → confirmation email arrives in inbox
- [ ] Cancel the booking in Cal.com → appointment status flips to `cancelled` (same `calcom_booking_uid` row updated via upsert)

---

## Findings & follow-ups

| Item | Pass/Fail | Notes / Ticket for Phase 2 or 3 |
|---|---|---|
| | | |
| | | |
| | | |
