# Sub-Project 1 — Admin Orders Module

> **Status:** Approved 2026-05-19, ready for implementation plan
> **Owner:** Sanjay Gunabalan / Aurexis Solution
> **Hard deadline:** 2026-06-02/03 (handover)
> **Source:** `docs/admin-master-inventory.md` Section A.1 (Orders) + Section E (build order #1)
> **Est. effort:** ~3.5 days of focused work

## 1. Goal

Build the admin-side Orders module end-to-end so the clinic can run order fulfilment from this system on go-live day. Customer-side order pages already exist (`/account/orders/*`); this sub-project adds `/admin/orders/*` plus the schema, server actions, and PDF artefacts that admin needs.

## 2. Scope

### In v1
- Schema migration: add missing columns + statuses + `order_events` audit table + `refunds` table
- Admin order list with filters + search + bulk actions
- Admin order detail with full timeline, items, addresses, payment trail, internal notes
- Status workflow transitions (pending → paid → processing → packing → shipped → delivered → completed; cancelled / refunded / failed)
- Tracking entry (carrier dropdown + number) and per-carrier tracking URL templates
- Three PDF artefacts via `@react-pdf/renderer`:
  - Tax invoice (extend existing customer invoice template)
  - Packing slip (new)
  - A6 address label (new)
- Batch print: select N orders → one PDF combining their address labels + packing slips
- Manual order entry (walk-in / phone)
- Refund recording (manual — actual money movement happens in Billplz dashboard separately)
- Customer-side fan-out: bell notification + Resend email on every status change

### Out of v1 (deferred)
- Carrier API integration (EasyParcel, direct Pos Laju/J&T/Ninja Van APIs)
- Auto-refund via Billplz API
- Returns / RMA workflow
- Multiple shipments per order
- Advanced fraud / velocity rules
- Bulk cancel
- Bulk price update

## 3. Schema migration

File: `supabase/migrations/20260519_orders_admin.sql` (idempotent, safe to re-run)

### 3.1. New enums

```sql
DO $$ BEGIN
  CREATE TYPE public.payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.fulfillment_status_enum AS ENUM (
    'pending', 'processing', 'packing', 'shipped', 'delivered', 'completed', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.order_channel_enum AS ENUM ('web', 'manual', 'walk_in', 'phone');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method_enum AS ENUM (
    'billplz', 'cod', 'bank_transfer', 'fpx', 'cash', 'card'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
```

The existing `orders.payment_status` and `orders.fulfillment_status` columns are currently TEXT-typed with check constraints (per the database.types.ts inspection). We migrate them to these enums.

### 3.2. New columns on `orders`

```sql
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS channel                public.order_channel_enum NOT NULL DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS payment_method         public.payment_method_enum,
  ADD COLUMN IF NOT EXISTS subtotal_rm            DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS tax_amount_rm          DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_amount_rm     DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount_rm     DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_code          TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_id     UUID REFERENCES public.addresses(id),
  ADD COLUMN IF NOT EXISTS shipping_address_id    UUID REFERENCES public.addresses(id),
  ADD COLUMN IF NOT EXISTS invoice_number         TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS paid_at                TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shipped_at             TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS internal_notes         TEXT,
  ADD COLUMN IF NOT EXISTS created_by_admin_id    UUID REFERENCES public.users(id);
```

`practitioner_note` already exists (customer-visible). `internal_notes` is new (staff-only).

### 3.3. Status enum migration

The two status columns currently have hardcoded TEXT values + check constraints. Migrate carefully:

```sql
-- Backfill any rows missing the new values
UPDATE public.orders SET fulfillment_status = 'processing' WHERE fulfillment_status IS NULL;
UPDATE public.orders SET payment_status = 'pending' WHERE payment_status IS NULL;

-- Drop old check constraint, convert column type
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check,
  DROP CONSTRAINT IF EXISTS orders_fulfillment_status_check;

ALTER TABLE public.orders
  ALTER COLUMN payment_status TYPE public.payment_status_enum USING payment_status::public.payment_status_enum,
  ALTER COLUMN fulfillment_status TYPE public.fulfillment_status_enum USING fulfillment_status::public.fulfillment_status_enum;
```

### 3.4. `order_events` audit table

```sql
CREATE TABLE IF NOT EXISTS public.order_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  actor_id            UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type          TEXT NOT NULL,  -- 'status_change', 'note_added', 'tracking_added', 'refund_recorded', 'payment_received', 'invoice_issued'
  from_status         TEXT,
  to_status           TEXT,
  payload             JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_customer_visible BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_events_order_id_idx ON public.order_events(order_id, created_at DESC);
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- Customers can SELECT visible events on their own orders
CREATE POLICY "Customer reads own visible events" ON public.order_events
  FOR SELECT USING (
    is_customer_visible AND
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid())
  );

-- Admin reads everything
CREATE POLICY "Admin reads all events" ON public.order_events
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
```

### 3.5. `refunds` table

```sql
CREATE TABLE IF NOT EXISTS public.refunds (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  amount_rm            DECIMAL(10,2) NOT NULL CHECK (amount_rm > 0),
  reason               TEXT NOT NULL,
  refund_method        public.payment_method_enum NOT NULL,
  gateway_reference    TEXT,   -- Billplz refund ID or bank-transfer ref
  notes                TEXT,
  created_by_admin_id  UUID NOT NULL REFERENCES public.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refunds_order_id_idx ON public.refunds(order_id);
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- Customer can read refunds on their own orders
CREATE POLICY "Customer reads own refunds" ON public.refunds
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid())
  );

-- Admin manages refunds
CREATE POLICY "Admin manages refunds" ON public.refunds
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
```

### 3.6. Invoice number sequence

```sql
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1;

CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN 'INV-' || to_char(now(), 'YYYY') || '-' || LPAD(nextval('public.invoice_number_seq')::TEXT, 5, '0');
END $$;
```

Assigned on first `paid` transition.

### 3.7. Trigger: insert `order_events` row on status change

```sql
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    IF NEW.fulfillment_status IS DISTINCT FROM OLD.fulfillment_status THEN
      INSERT INTO public.order_events(order_id, actor_id, event_type, from_status, to_status)
      VALUES (NEW.id, auth.uid(), 'status_change', OLD.fulfillment_status::TEXT, NEW.fulfillment_status::TEXT);
    END IF;
    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
      INSERT INTO public.order_events(order_id, actor_id, event_type, from_status, to_status, payload)
      VALUES (NEW.id, auth.uid(), 'payment_status_change', OLD.payment_status::TEXT, NEW.payment_status::TEXT,
              jsonb_build_object('amount_rm', NEW.total_amount_rm));
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER orders_audit_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();
```

## 4. Routes

| Path | Purpose |
|---|---|
| `/admin/orders` | List + filters + search + bulk actions |
| `/admin/orders/[id]` | Order detail page |
| `/admin/orders/new` | Manual order entry form |
| `/admin/orders/[id]/invoice` | Tax invoice PDF download |
| `/admin/orders/[id]/packing-slip` | Packing slip PDF download |
| `/admin/orders/[id]/label` | A6 address label PDF download |
| `/admin/orders/batch-print?ids=...&type=label\|slip` | Batch PDF combining multiple orders |

## 5. Files to create / modify

### Create
- `supabase/migrations/20260519_orders_admin.sql`
- `src/app/admin/(portal)/orders/page.tsx`
- `src/app/admin/(portal)/orders/OrdersTable.tsx`
- `src/app/admin/(portal)/orders/OrdersFilters.tsx`
- `src/app/admin/(portal)/orders/BulkActionsBar.tsx`
- `src/app/admin/(portal)/orders/[id]/page.tsx`
- `src/app/admin/(portal)/orders/[id]/OrderTimeline.tsx`
- `src/app/admin/(portal)/orders/[id]/OrderItemsTable.tsx`
- `src/app/admin/(portal)/orders/[id]/OrderActions.tsx`
- `src/app/admin/(portal)/orders/[id]/StatusTransitionDialog.tsx`
- `src/app/admin/(portal)/orders/[id]/TrackingDialog.tsx`
- `src/app/admin/(portal)/orders/[id]/RefundDialog.tsx`
- `src/app/admin/(portal)/orders/[id]/InternalNotesPanel.tsx`
- `src/app/admin/(portal)/orders/[id]/invoice/route.tsx`
- `src/app/admin/(portal)/orders/[id]/packing-slip/route.tsx`
- `src/app/admin/(portal)/orders/[id]/label/route.tsx`
- `src/app/admin/(portal)/orders/batch-print/route.tsx`
- `src/app/admin/(portal)/orders/new/page.tsx`
- `src/app/admin/(portal)/orders/new/ManualOrderForm.tsx`
- `src/lib/admin/orders/queries.ts`
- `src/lib/admin/orders/actions.ts`
- `src/lib/admin/orders/tracking-urls.ts`
- `src/lib/invoice/PackingSlipDocument.tsx`
- `src/lib/invoice/AddressLabelDocument.tsx`
- `src/lib/admin/orders/__tests__/actions.test.ts`
- `src/lib/admin/orders/__tests__/queries.test.ts`

### Modify
- `src/lib/database.types.ts` — regenerate from new schema
- `src/lib/invoice/InvoiceDocument.tsx` — adopt invoice_number, SST line item, breakdowns
- `src/app/account/orders/[id]/page.tsx` — render new event types in timeline, render refunds
- `src/lib/admin/queries.ts` — extend existing dashboard order queries for the new statuses
- `middleware.ts` — no changes needed (admin gating already in place)

## 6. Server actions

All in `src/lib/admin/orders/actions.ts`. Each is a `'use server'` function with:
- `requireAdmin()` guard
- Zod schema for input
- Single transaction where possible
- Inserts `order_events` row when applicable
- Inserts `notifications` row + sends Resend email when customer-visible
- Returns typed result `{ ok: true } | { ok: false, error: string }`

```ts
// transitions
moveOrderStatus(orderId, toStatus, note?)
markOrderPaid(orderId, paymentMethod, gatewayRef?)
markOrderShipped(orderId, carrier, trackingNumber)
markOrderDelivered(orderId)
markOrderCompleted(orderId)
cancelOrder(orderId, reason)        // already exists in src/actions — move + extend
recordRefund(orderId, amountRm, reason, refundMethod, gatewayRef?, notes?)

// notes
addPractitionerNote(orderId, note)  // customer-visible
addInternalNote(orderId, note)      // staff-only

// fulfilment helpers
assignTracking(orderId, carrier, trackingNumber)
resendOrderConfirmation(orderId)
resendInvoice(orderId)
reAttemptPayment(orderId)           // generates new Billplz bill URL

// manual orders
createManualOrder({ customerId | walkInDetails, items, paymentMethod, shippingAddress, billingAddress, agentId?, discountCode?, internalNote? })

// bulk
bulkMarkPaid(orderIds[], paymentMethod)
bulkMarkShipped(orderIds[], carrier, trackingNumbers[])   // one tracking per order, parallel arrays
bulkExportCsv(filters)
```

Status-transition rules (enforced in `moveOrderStatus`):

```
pending     → paid, cancelled, failed
paid        → processing, refunded, cancelled
processing  → packing, cancelled
packing     → shipped, cancelled
shipped     → delivered
delivered   → completed
completed   → (terminal, no transitions)
cancelled   → (terminal, but refund still allowed if was paid)
refunded    → (terminal)
failed      → pending  (retry)
```

## 7. PDF templates

All use `@react-pdf/renderer`. Brand styling matches `frontend_context.md`:
- Primary green `#2F5D50`
- Accent gold `#D4A373`
- Charcoal text `#2B2B2B`
- Montserrat for headings, Lora for body (load via `Font.register`)

### 7.1. Tax invoice
- Header: clinic logo + business info (legal name, reg no, SST reg no if applicable, address)
- Customer info + billing address
- Invoice number + invoice date + order ID
- Line items table with qty, unit price, line total
- Subtotal, discount, shipping, tax (SST line if registered), grand total
- Payment method + payment date
- Footer: thank-you note + terms
- Output: A4

### 7.2. Packing slip
- Header: clinic name + order ID (large, scan-friendly)
- Customer name + shipping address
- Items table: SKU, name, qty (no prices — packing slip is for warehouse, prices not needed)
- Picker initials + checkbox column
- Footer: handling notes from customer (if any)
- Output: A4

### 7.3. A6 address label
- Top: sender block (clinic name, address, phone)
- Big: recipient block (name, address, phone)
- Right side: barcode of order ID (Code128) + order short ID + carrier name (if assigned)
- Output: A6 (105×148mm) — thermal-printer friendly

### 7.4. Batch print
- Combines multiple orders' labels (or packing slips) into one PDF, one per page
- Returns single PDF download

## 8. Cross-hub effects (Admin → Customer)

Every status transition triggers the fan-out pattern from Section D1 of the master inventory:

| Admin trigger | Customer effect | Notification |
|---|---|---|
| `markOrderPaid` | `/account/orders/[id]` shows "Paid" + invoice download | Bell + email ("Payment confirmed") |
| `moveOrderStatus` to `processing` | Timeline progresses | Bell |
| `moveOrderStatus` to `packing` | Timeline progresses | Bell |
| `markOrderShipped` | Tracking widget appears | Bell + email ("Your order has shipped") |
| `markOrderDelivered` | Timeline progresses | Bell |
| `markOrderCompleted` | "Leave a review" CTA appears | Bell |
| `cancelOrder` | Order shows "Cancelled" | Bell + email |
| `recordRefund` | Refund line appears in payment trail | Bell + email |
| `addPractitionerNote` | Gold chip on order detail | Bell ("Vaidya left a note") |
| `assignTracking` | Tracking widget appears | Bell |

Notification helper: reuse existing `notifications` insert pattern from Phase 2.
Email helper: reuse existing Resend wrapper at `src/lib/email/sendEmail.ts` (verify path during impl).

## 9. RLS posture

- All new admin queries hit tables via `is_admin()` bypass
- Customer-side reads of `order_events` filtered by `is_customer_visible AND orders.customer_id = auth.uid()`
- Customer-side reads of `refunds` filtered by ownership of parent order
- Admin-only mutations enforced both by RLS WITH CHECK and by `requireAdmin()` in server actions (defense in depth)

## 10. Testing approach

### Automated (Vitest)
- Unit tests for `tracking-urls.ts` (URL templating per carrier)
- Unit tests for status-transition rules in `moveOrderStatus` (allowed / forbidden transitions)
- Unit tests for invoice number generation (sequence + format)
- Integration test for `createManualOrder` (one happy path, one validation failure)
- Integration test for `recordRefund` (insert + event + status flip)

### Manual smoke (Verification doc)
- Walk through every status transition with a seeded order
- Print each PDF (invoice, packing slip, label) and visually verify
- Batch print 3 orders and verify all 3 labels in one PDF
- Manual order entry: walk-in customer, COD payment
- Cross-tenant: customer A can't see customer B's order or events
- Customer-side: every admin transition reflects on `/account/orders/[id]` correctly

### Verification doc
Add a new section to `docs/dashboard-verification.md` under "Admin Orders verification" mirroring the format of the existing "Admin Overview verification" section.

## 11. Verification checklist (acceptance)

- [ ] Migration applied cleanly to a fresh DB
- [ ] Migration applied to existing DB without data loss
- [ ] All 14 status transitions work (allowed) and rejected ones return error
- [ ] Invoice PDF renders with correct invoice number, SST line, breakdowns
- [ ] Packing slip PDF renders without prices
- [ ] A6 label PDF prints at correct size on a thermal printer simulation (Preview app, 105×148mm)
- [ ] Batch print of 5 orders produces 5-page PDF
- [ ] Tracking number entry → customer sees clickable tracking link → opens carrier's tracking page
- [ ] Manual order entry (walk-in, COD) → row inserted with `channel='walk_in'`
- [ ] Refund recorded → `refunds` row + `order_events` row + customer-side reflects
- [ ] Cancel order → customer cannot read it as "in progress"; customer-side timeline shows cancellation
- [ ] All cross-hub notifications fire (bell + email where applicable)
- [ ] Cross-tenant RLS holds (customer B cannot see customer A's order, refund, or events)
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run test` passes (new tests + existing 16+)
- [ ] `npm run build` succeeds; all 8 admin order routes present

## 12. Open items (none blocking)

None at spec time. Will revisit during implementation if anything surfaces.
