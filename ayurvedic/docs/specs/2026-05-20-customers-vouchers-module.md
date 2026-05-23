# Sub-Project 3 — Admin Customers (CRM) + Voucher Push

> **Status:** Approved 2026-05-20, ready for implementation
> **Owner:** Sanjay Gunabalan / Aurexis Solution
> **Deadline:** 2026-06-02 / 03
> **Source:** `docs/admin-master-inventory.md` Section B.6 (Customers CRM) + B.9 (Marketing & Vouchers)
> **Est. effort:** ~2.5 days

## 1. Goal

Build the admin CRM workspace so the client can manage customer relationships, and ship the **Voucher Push** system — the feature the user explicitly flagged at project start. Voucher push must work end-to-end: admin assigns a voucher to a customer's wallet → in-app bell notification + Resend email → customer sees in `/account/promos` → applies at checkout.

## 2. Scope

### In v1
- `/admin/customers` — list with filters + search + bulk select
- `/admin/customers/[id]` — full customer detail with all sub-sections
- Voucher Push: single + bulk + birthday-list one-click
- `/admin/promos` — list + CRUD for promo templates (so admin can manage the catalogue of vouchers that get pushed)
- Internal admin notes per customer (timestamped, staff-only)
- PDPA data export for a single customer
- Birthday list view (this-week / this-month)
- Block / unblock customer
- Send password reset (server-triggered)
- Add customer to tag / segment

### Deferred (Phase 2)
- Email campaigns (broadcast to segment via Resend)
- Site banner / announcement bar manager
- Automation rules (birthday auto-push, abandoned cart, post-purchase, re-engagement)
- Customer view-as / impersonate
- Communication log (every email/SMS sent history)
- Advanced segmentation builder
- Bulk tag / bulk email

## 3. Schema

**No new migration required.** All necessary tables exist:

- `users` — has `full_name, email, phone_number, date_of_birth, gender, role, language`, wellness fields (`height_cm, weight_kg, allergies, current_medications, medical_conditions`), opt-in flags, `marketing_opt_in, whatsapp_reminders_opt_in, email_reminders_opt_in`, `mfa_enrolled`, `created_at`, `deleted_at`
- `addresses` — already linked by `customer_id`
- `orders` — already linked by `customer_id`
- `appointments` — already linked by `customer_id`
- `support_tickets` + `support_messages` — already linked by `customer_id`
- `promos` — has `code, title, description, kind (percentage/fixed/free-shipping), value_amount, min_spend_rm, applies_to, starts_at, expires_at, is_public, is_active`
- `customer_promos` — has `customer_id, promo_id, status (active/used/expired/revoked), source ('admin-grant' is already a valid value), granted_at, used_at, used_on_order_id`
- `notifications` — for the bell fan-out
- `quiz_results` — for prakriti / dosha info

**One small additive migration** for two minor things:
- `users.tags TEXT[]` — admin-defined segment labels
- `users.internal_notes TEXT` — single field for staff-only notes (rich history can come later)
- `users.blocked_at TIMESTAMPTZ` + `users.blocked_reason TEXT` — for the block action

Migration file: `supabase/migrations/20260520_customers_admin.sql`

## 4. Routes

### Customers
| Path | Purpose |
|---|---|
| `/admin/customers` | List + filters + bulk select |
| `/admin/customers/[id]` | Full detail page |
| `/admin/customers/birthdays` | Birthday list (this week + this month) |
| `/admin/customers/[id]/export` | GET JSON PDPA export |

### Vouchers / Promos
| Path | Purpose |
|---|---|
| `/admin/promos` | List of promo templates + create |
| `/admin/promos/[id]` | Edit promo template |

## 5. Files to create

### Library
- `src/lib/admin/customers/queries.ts`
- `src/lib/admin/customers/actions.ts`
- `src/lib/admin/customers/mocks.ts`
- `src/lib/admin/promos/queries.ts`
- `src/lib/admin/promos/actions.ts`

### Customers UI
- `src/app/admin/(portal)/customers/page.tsx`
- `src/app/admin/(portal)/customers/CustomersTable.tsx`
- `src/app/admin/(portal)/customers/CustomersFilters.tsx`
- `src/app/admin/(portal)/customers/CustomerBulkActions.tsx`
- `src/app/admin/(portal)/customers/[id]/page.tsx`
- `src/app/admin/(portal)/customers/[id]/IdentityCard.tsx`
- `src/app/admin/(portal)/customers/[id]/WellnessSnapshot.tsx`
- `src/app/admin/(portal)/customers/[id]/AddressesList.tsx`
- `src/app/admin/(portal)/customers/[id]/OrderHistory.tsx`
- `src/app/admin/(portal)/customers/[id]/AppointmentHistory.tsx`
- `src/app/admin/(portal)/customers/[id]/TicketsList.tsx`
- `src/app/admin/(portal)/customers/[id]/VouchersWallet.tsx`
- `src/app/admin/(portal)/customers/[id]/InternalNotesPanel.tsx`
- `src/app/admin/(portal)/customers/[id]/CustomerActions.tsx`
- `src/app/admin/(portal)/customers/[id]/PushVoucherDialog.tsx`
- `src/app/admin/(portal)/customers/[id]/BlockCustomerDialog.tsx`
- `src/app/admin/(portal)/customers/[id]/export/route.ts`
- `src/app/admin/(portal)/customers/birthdays/page.tsx`

### Promos UI
- `src/app/admin/(portal)/promos/page.tsx`
- `src/app/admin/(portal)/promos/PromosTable.tsx`
- `src/app/admin/(portal)/promos/[id]/page.tsx`
- `src/app/admin/(portal)/promos/[id]/PromoForm.tsx`
- `src/app/admin/(portal)/promos/new/page.tsx`

### Nav
- Modify `src/lib/dashboard/admin-nav.ts` — add Customers + Vouchers entries
- Modify `src/lib/dashboard/nav-types.ts` — add `'users'` + `'ticket'` icons
- Modify `src/components/dashboard/DashboardShell.tsx` — register the two new icons

## 6. Server actions

```ts
// customers
addInternalNote(customerId, note)
blockCustomer(customerId, reason)
unblockCustomer(customerId)
sendPasswordReset(customerId)            // triggers Supabase auth recovery email
setCustomerTags(customerId, tags)
bulkSetTags(customerIds, tags)
exportCustomerData(customerId)            // returns JSON for download

// vouchers (push)
pushVoucherToCustomer(input)              // single — full flow
pushVoucherToManyCustomers(input)         // bulk — same flow, parallel
createOneOffVoucher(input)                // create a private promo + push in one shot

// promos
createPromo(input)
updatePromo(promoId, input)
deactivatePromo(promoId)
deletePromo(promoId)                       // only if never granted
```

## 7. Voucher Push flow (the key feature)

```
1. Admin opens /admin/customers/[id]
2. Clicks "Push voucher" button
3. Modal opens with two tabs:
   - "Use existing promo" — picker from public + private promos
   - "Create one-off" — inline form: kind, value, min_spend, expiry, message
4. Optional message field ("Welcome gift", "Birthday voucher", "Thanks for the review")
5. Submit →
   a. If "one-off": INSERT into promos (is_public=false, code='admin-{shortid}', generated)
   b. INSERT into customer_promos (source='admin-grant', status='active', granted_at=now())
   c. INSERT into notifications (kind='promo_granted', title, body, href=/account/promos)
   d. Send Resend email with promo code + expiry
6. Customer sees voucher in /account/promos within 1 second (via realtime)
7. Customer applies code at checkout → checkout marks customer_promos.status='used'
```

### Bulk variant
- From customers list: select N rows → "Push voucher" → same modal
- From birthday list: "Push birthday voucher to all" → predefined template

## 8. Cross-hub effects

| Admin action | Customer effect | Notification |
|---|---|---|
| Push voucher | Appears in `/account/promos` wallet, code visible, copy-able | Bell ("You got a voucher!") + Resend email |
| Block customer | Can't sign in (middleware checks `blocked_at`) | None (silent) |
| Unblock customer | Sign-in works again | None |
| Send password reset | Receives Supabase recovery email | Email only |
| Add internal note | Customer doesn't see anything | None (staff-only) |
| PDPA export | Admin downloads JSON for the customer | None |

## 9. RLS

- `users` — admin has full read via `is_admin()`. Self-update for own row.
- `customer_promos` — admin all-ops, customer reads own
- `promos` — public reads `is_public=true AND is_active=true`, admin all-ops
- `notifications` — customer reads own, server inserts via service role (existing pattern)

## 10. Testing approach

### Automated
- Unit test for one-off voucher code generation (uniqueness + format)
- Integration test: push voucher → row in `customer_promos` + row in `notifications`
- Integration test: block customer → middleware redirects them to a blocked screen

### Manual smoke
- Walk through customer list → filter "VIP" → click a customer
- Detail page renders all sub-sections without crashing
- Push voucher → see in customer's `/account/promos` after refresh
- Bulk push to 3 selected customers → all 3 receive

## 11. Verification checklist

- [ ] Migration applied
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run test` passes
- [ ] `npm run build` succeeds; all new admin routes present
- [ ] Customers list + filters + search
- [ ] Customer detail page renders all 8 sub-sections (identity, wellness, addresses, orders, appointments, tickets, vouchers, notes)
- [ ] Push voucher (single, from detail) → bell + email + wallet
- [ ] Push voucher (bulk, from list) → all targets receive
- [ ] Birthday list shows this week + this month with one-click bulk
- [ ] Promo CRUD: create / edit / deactivate / delete (if unused)
- [ ] Block customer → blocked_at set, sign-in fails
- [ ] PDPA export downloads JSON with their data
- [ ] Demo admin sees 8 mock customers + sample vouchers
- [ ] Admin sidebar shows Customers + Vouchers entries
- [ ] Cross-tenant RLS holds — customer B can't see customer A's voucher

## 12. Open items

None.
