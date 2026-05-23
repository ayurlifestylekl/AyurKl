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

## Admin Overview verification (Phase 2 of admin Hub C)

### Automated (already green at end of build)
- [x] `npx tsc --noEmit` — clean
- [x] `npm run test` — 16 passing (4 new chart math + prior 12)
- [x] `npm run build` — `/admin/dashboard` ships at ~5.4 kB

### Setup before browser walkthrough
- [ ] Sign in at `/admin/login` as `demo-admin@kerala-ayurvedic.dev` / `Demo1234!`
- [ ] (Optional) seed some data:
  ```sql
  -- one paid order today
  INSERT INTO orders (customer_id, total_amount_rm, payment_status, fulfillment_status)
    SELECT id, 120, 'paid', 'processing' FROM users WHERE role='customer' LIMIT 1;
  -- one aged pending order
  INSERT INTO orders (customer_id, total_amount_rm, payment_status, created_at)
    SELECT id, 50, 'pending', NOW() - INTERVAL '2 days' FROM users WHERE role='customer' LIMIT 1;
  -- one unread ticket
  UPDATE support_tickets SET unread_by_clinic = true WHERE id IN (SELECT id FROM support_tickets LIMIT 1);
  ```

### KPI row (8 tiles)
- [ ] All 8 tiles render in a 4-col grid (2-col on mobile)
- [ ] Revenue today shows `RM 0` cleanly when zero, real value when data exists
- [ ] Avg order value shows `—` when no paid orders, real value otherwise

### Today's consultations card
- [ ] Empty state: "Calendar is clear today."
- [ ] With seeded appointments: list shows time · treatment · customer · in-person/virtual chip
- [ ] Clicking a row goes to `/admin/appointments/{id}` (will 404 until that page exists — expected)

### Quick actions row
- [ ] **Add product** opens modal → submit valid → toast + product row inserted → SQL-verify with `SELECT * FROM products WHERE sku = 'YOUR-SKU';`
- [ ] **Add product** validates: empty name, bad SKU format, negative price all show inline errors
- [ ] **Issue partner invite** opens modal → fill in → submit → success screen shows the invite URL + copy button + auto-assigned referral code
- [ ] After issuing: `SELECT * FROM agent_invites WHERE token = ...;` shows the row
- [ ] **Manual order** and **Find customer** tiles link to upcoming routes (will 404 — expected)

### Charts row
- [ ] All three render with empty-state "Collecting data…" caption on a fresh DB
- [ ] Insert a few orders across multiple days → bars and lines populate after refresh
- [ ] Fulfilment funnel bar widths scale proportionally; longest stage = 100%

### Needs attention
- [ ] Renders only the cards that have items (no empty cards)
- [ ] Aged payments card appears amber-tinted, only when an order is pending >24h
- [ ] All three "View all →" links point to filter URLs (will land on placeholder pages until built)

### Insights row
- [ ] Top selling: shows "No sales yet" empty; populates with paid orders this week
- [ ] Vaidya utilization: shows 0% with progress bar empty; calculates against 60h/week capacity
- [ ] Most booked: shows "No bookings yet" empty; shows top treatment name when bookings exist
- [ ] Active promos: shows "No campaigns running" empty; shows code + title for current promos

### Universal search bar
- [ ] Type 1 char: nothing happens (min 2)
- [ ] Type customer name fragment: shows hits with User icon
- [ ] Type product SKU fragment: shows hits with Package icon
- [ ] Type last 6 chars of an order ID: shows ShoppingBag hit
- [ ] Click outside or X button closes the dropdown
- [ ] No matches → "No matches." message

### Recent activity feed
- [ ] Shows up to 10 events sorted newest-first
- [ ] "Live" badge animates
- [ ] Insert a new order via SQL → page auto-reloads via realtime subscription
- [ ] Empty DB shows "No recent activity."

### Cross-tenant + RLS
- [ ] All admin queries hit `is_admin()` RLS bypass — no leaks to non-admin sessions
- [ ] Non-admin trying to call `createProduct` or `issueAgentInvite` returns "Not authorised."

---

---

## Admin Orders Module verification (Sub-project 1)

### Automated (already green at end of build)
- [x] `npx tsc --noEmit` — clean
- [x] `npm run test` — 30 passing (14 new in admin/orders + prior 16)
- [x] `npm run build` — all 7 admin order routes present (`/admin/orders`, `/admin/orders/[id]`, `/admin/orders/new`, `/admin/orders/[id]/invoice`, `/admin/orders/[id]/label`, `/admin/orders/[id]/packing-slip`, `/admin/orders/batch-print`)

### Setup before browser walkthrough
- [ ] Sign in at `/admin/login` as `demo-admin@kerala-ayurvedic.dev` / `Demo1234!`
- [ ] Migration `20260519_orders_admin.sql` applied (idempotent re-run safe)
- [ ] Seed at least one order with a shipping address so the PDFs have data to render

### Migration
- [ ] `SELECT public.next_invoice_number();` returns `INV-2026-00001` (or next sequence value)
- [ ] `orders` table has all 16 new columns: `channel`, `payment_method`, `subtotal_rm`, `tax_amount_rm`, `shipping_amount_rm`, `discount_amount_rm`, `discount_code`, `billing_address_id`, `shipping_address_id`, `invoice_number`, `paid_at`, `shipped_at`, `delivered_at`, `completed_at`, `internal_notes`, `created_by_admin_id`
- [ ] `order_events` and `refunds` tables exist with RLS enabled
- [ ] Status enum includes `paid`, `packing`, `completed`, `refunded` values

### List page (`/admin/orders`)
- [ ] Renders all orders, newest first, with status + payment chips
- [ ] Search bar filters by customer name / email / order ID fragment
- [ ] Status dropdown filters by fulfilment status
- [ ] Payment dropdown filters by payment status
- [ ] `+ Manual order` button links to `/admin/orders/new`
- [ ] Checkbox column allows selection; `Select all` toggles all rows
- [ ] Selecting 1+ rows reveals the gold bulk-actions bar at the top

### Detail page (`/admin/orders/{id}`)
- [ ] Customer card shows name, email, phone, ship-to
- [ ] Status chip + payment chip render in header
- [ ] `Move status` dialog offers only valid next states from current
- [ ] Cancelling requires a 5+ char reason
- [ ] `Add tracking + ship` dialog accepts carrier dropdown + tracking number → saves, status flips to shipped, customer bell fires
- [ ] `Record refund` button only appears when `payment_status = paid`
- [ ] Full refund (amount = total) flips order to `refunded`
- [ ] Partial refund keeps order at `paid` but records the refund row
- [ ] Practitioner note saves; customer sees the gold chip on their order
- [ ] Internal note saves but does not appear on customer side
- [ ] Timeline lists all events; staff-only events show the "staff-only" badge

### PDFs
- [ ] `/admin/orders/{id}/invoice` opens a PDF with order number, items, total
- [ ] `/admin/orders/{id}/packing-slip` opens A4 PDF with ship-to + items + qty checkbox column (no prices)
- [ ] `/admin/orders/{id}/label` opens A6-sized PDF (105×148mm) with FROM + TO + order short ID
- [ ] Batch print: select 3 orders on the list page → click `Print address labels` → single PDF with 3 pages downloads
- [ ] Batch print: same with `Print packing slips` works

### Manual order entry (`/admin/orders/new`)
- [ ] Walk-in name + at least one product required
- [ ] Adding products updates running total live
- [ ] Removing an item updates total
- [ ] Submit creates customer + order + items, redirects to `/admin/orders/{newId}`
- [ ] New order has `channel = 'walk_in'` (or whichever channel selected)

### Cross-hub (admin → customer)
- [ ] Status change → customer bell shows new notification, order detail timeline updates
- [ ] Tracking added → customer sees tracking widget on `/account/orders/{id}`
- [ ] Refund recorded → customer sees the refund block on their order detail page

### Cross-tenant RLS
- [ ] Customer A's session cannot read customer B's order, events, or refunds (verifies RLS)
- [ ] Non-admin attempting to call any admin server action returns "Not authorised."

---

---

## Products + Inventory Module verification (Sub-project 2)

### Automated
- [x] `npx tsc --noEmit` — clean
- [x] `npm run test` — 44 passing (14 new in admin/products + prior 30)
- [x] `npm run build` — all 7 new routes present: `/admin/products`, `/admin/products/new`, `/admin/products/[id]`, `/admin/products/import`, `/admin/products/export`, `/admin/inventory`, `/admin/inventory/[id]`

### Migration
- [ ] `20260520_products_admin.sql` applied (idempotent)
- [ ] One-time cleanup: `DROP TABLE IF EXISTS public.product_bundle_items;` (redundant table from initial migration draft; uses existing `bundle_items` instead)
- [ ] `products` has new columns: `slug`, `status`, `dosha_indication`, `ingredients`, `dosage_instructions`, `contraindications`, `featured`, `low_stock_threshold`, `expiry_date`, `image_urls`, etc.
- [ ] `stock_movements` table exists with RLS
- [ ] Storage bucket `product-images` exists with public-read, admin-write policies
- [ ] Trigger `stock_movements_apply` keeps `products.stock_qty` in sync on INSERT

### Products workspace (`/admin/products`)
- [ ] List renders with thumbnails, SKU, price (+ sale price), stock chip, category, status, featured star
- [ ] Filters work: status (active/draft/archived), category, featured
- [ ] Search hits name, SKU, slug
- [ ] Bulk-select: Set active / Set draft / Archive

### Add product (`/admin/products/new`)
- [ ] Form has 5 sections: Basics, Pricing, Ayurvedic, Inventory, SEO + status
- [ ] Required fields: name + SKU (rest optional)
- [ ] Slug auto-generated from name on create (deduplicated with `-2`, `-3`)
- [ ] Submit creates product + redirects to `/admin/products/{newId}`

### Edit product (`/admin/products/[id]`)
- [ ] Form pre-filled from DB
- [ ] Sidebar: Stock summary, Image uploader, Bundle composition (if `is_bundle=true`)
- [ ] Image upload: drag JPEG/PNG/WebP ≤4MB → uploads to `product-images` bucket → renders thumbnail with "Primary" badge
- [ ] Image delete: removes from bucket + from `image_urls` array
- [ ] Bundle: mark product as bundle → add components from dropdown → quantities update total

### Inventory workspace (`/admin/inventory`)
- [ ] List shows: thumbnail, name, SKU, category, stock qty (colored), threshold, expiry, status chip
- [ ] Filter chips: All / Low stock / Out of stock / Expiring ≤60d
- [ ] Search hits name + SKU
- [ ] Click product → `/admin/inventory/[id]`

### Inventory detail (`/admin/inventory/[id]`)
- [ ] Big stock number in header (red if 0, amber if ≤ threshold, ink if healthy)
- [ ] 3 action buttons: Receive / Write off / Recount
- [ ] **Receive stock dialog:** qty + cost + expiry + notes → inserts movement → stock_qty goes up
- [ ] **Write off dialog:** qty + reason (3+ chars) → inserts negative movement → stock_qty goes down
- [ ] **Recount dialog:** shows current system qty, lets you enter physical count, computes delta, applies adjustment
- [ ] Movement log shows newest first with actor name + cost + expiry per row
- [ ] Sidebar: Product summary card with "Edit product details →" link to `/admin/products/[id]`

### CSV import + export
- [ ] Export: click "Export CSV" on products page → downloads `products-YYYY-MM-DD.csv` with all columns
- [ ] Import: paste/upload CSV → preview validates rows, reports per-line errors
- [ ] Import: submit imports valid rows, skips invalid, shows summary
- [ ] Required columns: `name, sku, price_rm, stock_qty, status`

### Demo mocks
- [ ] Demo admin sees 8 mock products on `/admin/products` when DB has no real products
- [ ] Demo admin sees mock inventory rows with varied statuses (healthy / low / out / expiring)
- [ ] Page caption shows "demo data (no real products yet)"
- [ ] Once a real product exists, mocks disappear

### Cross-tenant + RLS
- [ ] Signed-out user can read products (storefront still works) but cannot mutate
- [ ] Non-admin cannot call any server action (returns "Not authorised.")
- [ ] Stock movements RLS: admin-only
- [ ] Storage bucket: public read, admin write

### Known deferred items
- Storefront still uses `@/data/products` (hard-coded). Switching the storefront to read from Supabase is a separate sub-project — does not block Sub-project 2 completion.

---

---

## Customers (CRM) + Voucher Push verification (Sub-project 3)

### Automated
- [x] `npx tsc --noEmit` — clean
- [x] `npm run test` — 44 passing
- [x] `npm run build` — new routes present: `/admin/customers`, `/admin/customers/[id]`, `/admin/customers/birthdays`, `/admin/customers/[id]/export`, `/admin/promos`, `/admin/promos/new`, `/admin/promos/[id]`

### Migration
- [ ] `20260520_customers_admin.sql` applied (adds `users.tags`, `internal_notes`, `blocked_at`, `blocked_reason`)
- [ ] Two new indexes (`users_tags_idx`, `users_dob_month_idx`) created

### Customers list (`/admin/customers`)
- [ ] List renders with all customers, segments filter chips (All / New / VIP / At risk / Blocked)
- [ ] Search hits name, email, phone
- [ ] Tag filter dropdown populated
- [ ] Bulk-select shows the gold action bar with "Push voucher"

### Customer detail (`/admin/customers/[id]`)
- [ ] Renders 8 sub-sections: Identity, Wellness, Addresses, Orders, Vouchers, Appointments, Tickets, Internal notes
- [ ] LTV + AOV computed correctly from paid orders
- [ ] Tags shown as chips
- [ ] "Push voucher" button opens dialog with two tabs
- [ ] Send password reset → customer receives Supabase recovery email
- [ ] Block customer → reason required, `blocked_at` set
- [ ] Unblock customer → flags cleared
- [ ] Internal note saves
- [ ] PDPA export downloads JSON

### Voucher Push (the marquee feature)
- [ ] Single push (one-off): from detail page → fill form → Submit → success screen shows generated code
  - Inserts row in `customer_promos` with `source='admin-grant', status='active'`
  - Inserts row in `notifications` (`kind='promo_granted'`)
  - Customer's `/account/promos` shows the voucher
- [ ] Single push (existing promo): pick from dropdown → push → customer wallet updated
- [ ] Bulk push: select N customers on list → "Push voucher" → success message shows count

### Promos (`/admin/promos`)
- [ ] List shows all promos with usage count, status chips, visibility
- [ ] Create promo: code (uppercase), title, kind, value, min spend, applies-to, validity, public/private, active
- [ ] Edit promo: changes persist
- [ ] Toggle active/inactive
- [ ] Delete promo: blocked if any customer has been granted it; works if zero usages

### Birthdays (`/admin/customers/birthdays`)
- [ ] Shows "This week" + "This month" sections
- [ ] Empty state when nobody has birthday this month
- [ ] Click customer → opens their detail page

### Admin nav
- [ ] Sidebar now includes: Customers (Users icon), Vouchers (Gift icon)

### Demo mocks
- [ ] Demo admin sees 8 mock customers with varied segments (VIP, new, at-risk, blocked)
- [ ] Demo customer detail page renders with empty sub-sections + "Demo data" badge

### Cross-tenant + RLS
- [ ] Non-admin cannot call any customer/promo action (returns "Not authorised.")
- [ ] Customer A cannot read customer B's vouchers

---

---

## Appointments / Clinic verification (Sub-project 4)

### Automated
- [x] `npx tsc --noEmit` — clean
- [x] `npm run test` — 44 passing
- [x] `npm run build` — new routes: `/admin/appointments`, `/admin/appointments/[id]`, `/admin/appointments/new`, `/admin/treatments`

### Migration
- [ ] `20260521_appointments_admin.sql` applied
- [ ] `appointment_status_enum` has 9 values (pending, scheduled, confirmed, checked_in, in_progress, completed, cancelled, no_show, rescheduled)
- [ ] `appointments` table has new columns: `rescheduled_from_id, checked_in_at, completed_at, cancelled_at, cancellation_reason, internal_notes, clinical_notes, room, pre_visit_form, advance_payment_status, created_by_admin_id, updated_at`

### List page (`/admin/appointments`)
- [ ] Filter chips work: Today / Upcoming / Past / Cancelled / No-show / All
- [ ] Search hits customer name, email, treatment, vaidya
- [ ] Columns: When, Customer, Treatment, Mode (with virtual/in-person icons), Vaidya, Status chip, Advance payment
- [ ] Click "+Walk-in" → `/admin/appointments/new`
- [ ] Click "Treatments" → `/admin/treatments` landing page

### Detail page (`/admin/appointments/[id]`)
- [ ] Header shows treatment, status chip, date/time, duration, vaidya
- [ ] Session details card: treatment, duration, mode (with meeting link for virtual), vaidya, advance payment status, customer note, cancellation reason
- [ ] Customer card: name, email, phone, allergies/medications/conditions, link to full profile
- [ ] "Change status" dialog offers only valid next states
- [ ] Cancel requires reason ≥3 chars; reason stored in `cancellation_reason`
- [ ] Reschedule creates new appointment row, old marked `rescheduled`, customer notified
- [ ] No-show transitions allowed only from scheduled/confirmed
- [ ] Internal notes panel saves to `internal_notes`
- [ ] Cal.com sync card shows booking UID if synced

### Walk-in form (`/admin/appointments/new`)
- [ ] Required: walk-in name, treatment, when
- [ ] Treatment dropdown auto-populates from Sanity treatments (falls back to 8 default names if Sanity empty)
- [ ] Submit creates user (role=customer) + appointment row, redirects to detail
- [ ] New appointment has `created_by_admin_id` set, status=confirmed

### Treatments page (`/admin/treatments`)
- [ ] Renders explanation + "Open Sanity Studio" button → `/studio` in new tab

### Cross-flow
- [ ] Customer detail page (`/admin/customers/[id]`) — appointment history section pulls from same source
- [ ] Dashboard "Today's consultations" card links to `/admin/appointments/[id]`

### Demo mocks
- [ ] Demo admin sees 8 mock appointments (3 today, 2 upcoming, 1 past completed, 1 no-show, 1 cancelled)
- [ ] Demo data badge visible on detail page

### Cross-tenant + RLS
- [ ] Non-admin cannot call status actions (returns "Not authorised.")
- [ ] Customer cannot see another customer's appointment

---

## Messages admin inbox + Sales Agents admin Part 1 verification (2026-05-21)

### Automated
- [x] `npx tsc --noEmit` — clean
- [x] `npm run test` — 44 passing
- [x] `npm run build` — new routes: `/admin/messages`, `/admin/messages/[ticketId]`, `/admin/partners`, `/admin/partners/[id]`

### Migrations
- [ ] `20260521_messages_admin.sql` applied — `support_tickets` has `internal_notes` + `assigned_to_admin_id`
- [ ] `20260521_agents_admin.sql` applied — `sales_agents` has `status` enum + `suspended_at` + `suspended_reason` + `internal_notes` + `updated_at`

### Messages
- [ ] List page filter chips (Unread / Open / Awaiting customer / Resolved / Closed / All) + topic dropdown + search
- [ ] Unread tickets show gold dot + bold subject
- [ ] Detail page: full thread, customer card with health flags, reply form
- [ ] Reply sends bell notification + flips unread flags + status to `awaiting-customer`
- [ ] "Mark as resolved" checkbox on reply form flips status to `resolved`
- [ ] TicketControls: change status / topic / assign to me / clear / toggle read
- [ ] Internal notes panel saves staff-only notes
- [ ] Demo admin sees 6 mock tickets across status spectrum

### Sales Agents (Part 1)
- [ ] List page filter chips (Active / Suspended / All) + type filter + search
- [ ] Detail page: performance card, referral link, attributed orders list, contact card
- [ ] PartnerControls: adjust rate with required reason → appends audit entry to internal_notes
- [ ] Type toggle (affiliate ↔ reseller) saves immediately
- [ ] Suspend → requires reason → flips status + stamps suspended_at
- [ ] Reactivate clears flags
- [ ] Internal notes editable + auto-stamps rate changes
- [ ] Demo admin sees 4 mock agents (3 active, 1 suspended)

### Sales Agents Part 2 — completed 2026-05-21
- [x] `agent_commissions` ledger table + RLS (admin all, agent reads own)
- [x] `agent_payouts` table + RLS
- [x] Auto-create commission trigger on `orders.payment_status='paid'`
- [x] Auto-reverse trigger on cancel / refund
- [x] `recompute_agent_totals` keeps `sales_agents` aggregates in sync
- [x] `/admin/partners/payouts` queue page with bulk mark-paid + payment method picker
- [x] Bank-transfer CSV export at `/admin/partners/payouts/export?ids=…`
- [x] Commission ledger on agent detail page
- [x] Payouts history on agent detail page
- [x] Leaderboard widget on `/admin/partners` (top 5 this month)
- [x] "Pending RM X" header link from agent detail → payouts queue
- [x] "Pay out · N agents · RM X" CTA in partners list header when balance pending

### Migration verification
- [ ] `20260521_agents_payouts.sql` applied
- [ ] `SELECT unnest(enum_range(NULL::public.commission_status_enum));` returns 3 values
- [ ] `SELECT count(*) FROM agent_commissions, agent_payouts;` returns 0,0 on fresh DB

### Payouts queue (`/admin/partners/payouts`)
- [ ] Lists agents with pending commissions, grouped + summed
- [ ] Largest balance shown first, oldest pending age visible
- [ ] Bulk-select → payment method → "Mark all as paid" creates payout rows + flips commissions to paid
- [ ] Bank-transfer CSV exports selected (or all) with name / email / code / amount / count / reference
- [ ] Empty state: "Nothing pending. All paid up."
- [ ] Demo admin: 3 mock pending payouts visible

### Auto-commission trigger smoke (manual end-to-end)
- [ ] Create order with `referral_agent_id` set
- [ ] Mark order paid → commission row auto-created in `agent_commissions`, status='pending'
- [ ] Mark order cancelled → commission status flips to 'reversed'
- [ ] `sales_agents.total_commission_earned_rm` matches sum of non-reversed commissions

### Pending future work
- Sales Agent Portal (`/agent/*`) pages — separate session
- Marketing assets library
- Per-tier commission rules

---

## Findings & follow-ups

| Item | Pass/Fail | Notes / Ticket for Phase 2 or 3 |
|---|---|---|
| | | |
| | | |
| | | |
