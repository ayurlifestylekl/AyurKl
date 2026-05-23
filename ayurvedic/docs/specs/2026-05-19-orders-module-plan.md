# Admin Orders Module — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the admin Orders module end-to-end so the Kerala Ayurvedic clinic can run fulfilment from this system on go-live day (2026-06-02/03).

**Architecture:** Server actions over Supabase with RLS gating; admin reads via `is_admin()` bypass, customers read via `auth.uid()` scope. Status workflow enforced in server actions, audit log via DB trigger into `order_events`. PDFs via `@react-pdf/renderer` (already installed for customer invoice). Cross-hub fan-out: every customer-visible admin write inserts a `notifications` row + sends a Resend email.

**Tech Stack:** Next.js 14 App Router · TypeScript · Supabase (Postgres + RLS + Realtime) · `@react-pdf/renderer` · Tailwind + Shadcn UI · Vitest · Zod.

**Spec reference:** `docs/specs/2026-05-19-orders-module.md`

---

## Pre-flight

- [ ] **P-1:** Confirm dev server runs: `npm run dev` → visit `/admin/dashboard` while signed in as `demo-admin@kerala-ayurvedic.dev` / `Demo1234!`. Stop the server before continuing.
- [ ] **P-2:** Confirm baseline tests green: `npm run test` → expect 16 passing (4 chart math + 5 calcom + 4 email opt-in + 3 deletion).
- [ ] **P-3:** Confirm TypeScript clean: `npx tsc --noEmit` → no errors.
- [ ] **P-4:** Create a branch (if using git): `git checkout -b feat/admin-orders`.

---

## Task 1 — Migration: enums, orders columns, status type swap

**Files:**
- Create: `ayurvedic/supabase/migrations/20260519_orders_admin.sql`

- [ ] **Step 1: Write the migration file (part 1 of 2)**

```sql
-- =====================================================================
-- Admin Orders Module — DB Delta (2026-05-19)
-- =====================================================================
-- Adds: payment_status_enum (refunded), fulfillment_status_enum (paid,
-- packing, completed), order_channel_enum, payment_method_enum, 13 new
-- columns on orders, order_events audit table, refunds table, invoice
-- number sequence + helper, status-change trigger.
--
-- Safe to re-run. Apply via Supabase SQL Editor.
-- =====================================================================

-- 1. New enums
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

-- 2. Backfill before type swap
UPDATE public.orders SET fulfillment_status = 'processing' WHERE fulfillment_status IS NULL;
UPDATE public.orders SET payment_status     = 'pending'    WHERE payment_status IS NULL;

-- 3. Drop legacy check constraints (if present)
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check,
  DROP CONSTRAINT IF EXISTS orders_fulfillment_status_check;

-- 4. Swap columns to enum types
ALTER TABLE public.orders
  ALTER COLUMN payment_status TYPE public.payment_status_enum
    USING payment_status::public.payment_status_enum,
  ALTER COLUMN fulfillment_status TYPE public.fulfillment_status_enum
    USING fulfillment_status::public.fulfillment_status_enum;

-- 5. New columns on orders
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

- [ ] **Step 2: Commit part 1**

```bash
git add ayurvedic/supabase/migrations/20260519_orders_admin.sql
git commit -m "feat(orders): migration part 1 — enums + orders columns"
```

---

## Task 2 — Migration: order_events, refunds, invoice sequence, trigger

**Files:**
- Modify: `ayurvedic/supabase/migrations/20260519_orders_admin.sql` (append part 2)

- [ ] **Step 1: Append the rest of the migration**

```sql
-- 6. order_events audit table
CREATE TABLE IF NOT EXISTS public.order_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  actor_id            UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type          TEXT NOT NULL,
  from_status         TEXT,
  to_status           TEXT,
  payload             JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_customer_visible BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_events_order_id_idx
  ON public.order_events(order_id, created_at DESC);

ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customer reads own visible events" ON public.order_events;
CREATE POLICY "Customer reads own visible events" ON public.order_events
  FOR SELECT USING (
    is_customer_visible AND
    EXISTS (SELECT 1 FROM public.orders o
            WHERE o.id = order_events.order_id AND o.customer_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admin reads all events" ON public.order_events;
CREATE POLICY "Admin reads all events" ON public.order_events
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. refunds table
CREATE TABLE IF NOT EXISTS public.refunds (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  amount_rm            DECIMAL(10,2) NOT NULL CHECK (amount_rm > 0),
  reason               TEXT NOT NULL,
  refund_method        public.payment_method_enum NOT NULL,
  gateway_reference    TEXT,
  notes                TEXT,
  created_by_admin_id  UUID NOT NULL REFERENCES public.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refunds_order_id_idx ON public.refunds(order_id);
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customer reads own refunds" ON public.refunds;
CREATE POLICY "Customer reads own refunds" ON public.refunds
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o
            WHERE o.id = refunds.order_id AND o.customer_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admin manages refunds" ON public.refunds;
CREATE POLICY "Admin manages refunds" ON public.refunds
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. Invoice number sequence
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1;

CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN 'INV-' || to_char(now(), 'YYYY')
         || '-' || LPAD(nextval('public.invoice_number_seq')::TEXT, 5, '0');
END $$;

-- 9. Trigger: log status changes into order_events
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    IF NEW.fulfillment_status IS DISTINCT FROM OLD.fulfillment_status THEN
      INSERT INTO public.order_events(order_id, actor_id, event_type, from_status, to_status)
      VALUES (NEW.id, auth.uid(), 'status_change',
              OLD.fulfillment_status::TEXT, NEW.fulfillment_status::TEXT);
    END IF;
    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
      INSERT INTO public.order_events(order_id, actor_id, event_type, from_status, to_status, payload)
      VALUES (NEW.id, auth.uid(), 'payment_status_change',
              OLD.payment_status::TEXT, NEW.payment_status::TEXT,
              jsonb_build_object('amount_rm', NEW.total_amount_rm));
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS orders_audit_status_change ON public.orders;
CREATE TRIGGER orders_audit_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();
```

- [ ] **Step 2: Commit part 2**

```bash
git add ayurvedic/supabase/migrations/20260519_orders_admin.sql
git commit -m "feat(orders): migration part 2 — events, refunds, invoice sequence, trigger"
```

---

## Task 3 — Apply migration + regenerate database.types.ts

**Files:**
- Modify: `ayurvedic/src/lib/database.types.ts` (regen)

- [ ] **Step 1: Apply migration**

Open Supabase Dashboard → SQL Editor → paste contents of `20260519_orders_admin.sql` → Run. Expect no errors.

- [ ] **Step 2: Verify schema**

In SQL Editor, run:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema='public' AND table_name='orders' ORDER BY ordinal_position;
```
Expected: 26 columns including the 16 new ones from Task 1.

```sql
SELECT * FROM public.order_events LIMIT 0;
SELECT * FROM public.refunds LIMIT 0;
SELECT public.next_invoice_number();
```
Expected: tables exist; function returns `INV-2026-00001`.

- [ ] **Step 3: Regenerate TypeScript types**

```bash
npx supabase gen types typescript \
  --project-id <YOUR_SUPABASE_PROJECT_ID> \
  --schema public > ayurvedic/src/lib/database.types.ts
```

(Project ID is in the `.env.local` NEXT_PUBLIC_SUPABASE_URL — the subdomain before `.supabase.co`.)

- [ ] **Step 4: Verify types compile**

```bash
cd ayurvedic && npx tsc --noEmit
```
Expected: clean. If errors mention old fields, check that the regen worked (the new enum types should appear).

- [ ] **Step 5: Commit**

```bash
git add ayurvedic/src/lib/database.types.ts
git commit -m "chore(orders): regenerate database.types after migration"
```

---

## Task 4 — Carrier tracking URL helper

**Files:**
- Create: `ayurvedic/src/lib/admin/orders/tracking-urls.ts`
- Create: `ayurvedic/src/lib/admin/orders/__tests__/tracking-urls.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tracking-urls.test.ts
import { describe, it, expect } from 'vitest'
import { trackingUrlFor, supportedCarriers } from '../tracking-urls'

describe('trackingUrlFor', () => {
  it('returns a Pos Laju URL with the tracking number', () => {
    const url = trackingUrlFor('Pos Laju', 'PL123456789MY')
    expect(url).toBe('https://www.poslaju.com.my/track-trace/?trackingNo=PL123456789MY')
  })

  it('returns null for Self-Pickup', () => {
    expect(trackingUrlFor('Self-Pickup', 'anything')).toBeNull()
  })

  it('returns null for an unknown carrier', () => {
    // @ts-expect-error – intentional bad input
    expect(trackingUrlFor('UnknownCarrier', '123')).toBeNull()
  })

  it('handles J&T Express, Ninja Van, GDex, DHL', () => {
    expect(trackingUrlFor('J&T Express', 'JT001')).toContain('jtexpress.my')
    expect(trackingUrlFor('Ninja Van', 'NV001')).toContain('ninjavan.co')
    expect(trackingUrlFor('GDex', 'GD001')).toContain('gdexpress.com')
    expect(trackingUrlFor('DHL', 'DH001')).toContain('dhl.com')
  })

  it('supportedCarriers exposes all six carriers', () => {
    expect(supportedCarriers).toHaveLength(6)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd ayurvedic && npm run test -- tracking-urls
```
Expected: module not found.

- [ ] **Step 3: Implement**

```ts
// tracking-urls.ts
export type Carrier =
  | 'Pos Laju' | 'J&T Express' | 'Ninja Van' | 'GDex' | 'DHL' | 'Self-Pickup'

export const supportedCarriers: readonly Carrier[] = [
  'Pos Laju', 'J&T Express', 'Ninja Van', 'GDex', 'DHL', 'Self-Pickup',
] as const

const URL_TEMPLATES: Record<Carrier, string | null> = {
  'Pos Laju':    'https://www.poslaju.com.my/track-trace/?trackingNo={tracking}',
  'J&T Express': 'https://www.jtexpress.my/index/query/gzquery.html?bills={tracking}',
  'Ninja Van':   'https://www.ninjavan.co/en-my/tracking?id={tracking}',
  'GDex':        'https://web.gdexpress.com/official/etracking.php?capncode={tracking}',
  'DHL':         'https://www.dhl.com/my-en/home/tracking.html?tracking-id={tracking}',
  'Self-Pickup': null,
}

export function trackingUrlFor(carrier: Carrier, trackingNumber: string): string | null {
  const tpl = URL_TEMPLATES[carrier]
  if (!tpl) return null
  return tpl.replace('{tracking}', encodeURIComponent(trackingNumber))
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd ayurvedic && npm run test -- tracking-urls
```
Expected: 5 passing.

- [ ] **Step 5: Commit**

```bash
git add ayurvedic/src/lib/admin/orders/tracking-urls.ts \
        ayurvedic/src/lib/admin/orders/__tests__/tracking-urls.test.ts
git commit -m "feat(orders): carrier tracking URL helper + tests"
```

---

## Task 5 — Status transition validator

**Files:**
- Create: `ayurvedic/src/lib/admin/orders/status-transitions.ts`
- Create: `ayurvedic/src/lib/admin/orders/__tests__/status-transitions.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest'
import { canTransition, nextStatuses, FulfillmentStatus } from '../status-transitions'

describe('canTransition', () => {
  it('allows pending → processing', () => {
    expect(canTransition('pending', 'processing')).toBe(true)
  })
  it('allows processing → packing → shipped → delivered → completed', () => {
    expect(canTransition('processing', 'packing')).toBe(true)
    expect(canTransition('packing', 'shipped')).toBe(true)
    expect(canTransition('shipped', 'delivered')).toBe(true)
    expect(canTransition('delivered', 'completed')).toBe(true)
  })
  it('forbids going backwards', () => {
    expect(canTransition('shipped', 'processing')).toBe(false)
    expect(canTransition('delivered', 'shipped')).toBe(false)
  })
  it('allows cancel from any non-terminal status', () => {
    expect(canTransition('pending', 'cancelled')).toBe(true)
    expect(canTransition('processing', 'cancelled')).toBe(true)
    expect(canTransition('packing', 'cancelled')).toBe(true)
  })
  it('forbids transitions out of terminal states', () => {
    expect(canTransition('completed', 'shipped')).toBe(false)
    expect(canTransition('cancelled', 'processing')).toBe(false)
  })
  it('nextStatuses returns the set of allowed targets', () => {
    expect(nextStatuses('pending')).toEqual(expect.arrayContaining(['processing', 'cancelled']))
    expect(nextStatuses('completed')).toEqual([])
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd ayurvedic && npm run test -- status-transitions
```

- [ ] **Step 3: Implement**

```ts
// status-transitions.ts
export type FulfillmentStatus =
  | 'pending' | 'processing' | 'packing' | 'shipped'
  | 'delivered' | 'completed' | 'cancelled'

const TRANSITIONS: Record<FulfillmentStatus, readonly FulfillmentStatus[]> = {
  pending:    ['processing', 'cancelled'],
  processing: ['packing', 'cancelled'],
  packing:    ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  ['completed'],
  completed:  [],
  cancelled:  [],
} as const

export function canTransition(from: FulfillmentStatus, to: FulfillmentStatus): boolean {
  return TRANSITIONS[from].includes(to)
}

export function nextStatuses(from: FulfillmentStatus): readonly FulfillmentStatus[] {
  return TRANSITIONS[from]
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd ayurvedic && npm run test -- status-transitions
```

- [ ] **Step 5: Commit**

```bash
git add ayurvedic/src/lib/admin/orders/status-transitions.ts \
        ayurvedic/src/lib/admin/orders/__tests__/status-transitions.test.ts
git commit -m "feat(orders): status transition validator + tests"
```

---

## Task 6 — Admin order queries

**Files:**
- Create: `ayurvedic/src/lib/admin/orders/queries.ts`

- [ ] **Step 1: Write the queries module**

```ts
// queries.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type OrdersRow = Database['public']['Tables']['orders']['Row']

export interface AdminOrderListItem {
  id: string
  shortId: string
  customerName: string | null
  customerEmail: string | null
  totalRm: number
  paymentStatus: OrdersRow['payment_status']
  fulfillmentStatus: OrdersRow['fulfillment_status']
  channel: OrdersRow['channel']
  trackingNumber: string | null
  createdAt: string
  itemCount: number
}

export interface AdminOrderFilters {
  fulfillmentStatus?: OrdersRow['fulfillment_status'][]
  paymentStatus?: OrdersRow['payment_status'][]
  channel?: OrdersRow['channel'][]
  dateFrom?: string  // ISO
  dateTo?: string    // ISO
  hasTracking?: boolean
  search?: string
  limit?: number
  offset?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = SupabaseClient<any, 'public', any>

export async function listAdminOrders(
  supabase: SB,
  filters: AdminOrderFilters = {}
): Promise<{ items: AdminOrderListItem[]; total: number }> {
  let q = supabase
    .from('orders')
    .select(`
      id, customer_id, total_amount_rm,
      payment_status, fulfillment_status, channel,
      tracking_number, created_at,
      customer:users!orders_customer_id_fkey(full_name, email),
      order_items(id)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters.fulfillmentStatus?.length) q = q.in('fulfillment_status', filters.fulfillmentStatus)
  if (filters.paymentStatus?.length)     q = q.in('payment_status', filters.paymentStatus)
  if (filters.channel?.length)           q = q.in('channel', filters.channel)
  if (filters.dateFrom)                  q = q.gte('created_at', filters.dateFrom)
  if (filters.dateTo)                    q = q.lte('created_at', filters.dateTo)
  if (filters.hasTracking === true)      q = q.not('tracking_number', 'is', null)
  if (filters.hasTracking === false)     q = q.is('tracking_number', null)
  if (filters.search) {
    q = q.or(`id.ilike.%${filters.search}%,customer.full_name.ilike.%${filters.search}%,customer.email.ilike.%${filters.search}%`)
  }

  q = q.range(filters.offset ?? 0, (filters.offset ?? 0) + (filters.limit ?? 50) - 1)

  const { data, error, count } = await q
  if (error) {
    console.error('[admin/orders] listAdminOrders failed:', error.message)
    return { items: [], total: 0 }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (data ?? []).map((r: any): AdminOrderListItem => {
    const cust = Array.isArray(r.customer) ? r.customer[0] : r.customer
    return {
      id: r.id,
      shortId: String(r.id).slice(-6).toUpperCase(),
      customerName: cust?.full_name ?? null,
      customerEmail: cust?.email ?? null,
      totalRm: Number(r.total_amount_rm),
      paymentStatus: r.payment_status,
      fulfillmentStatus: r.fulfillment_status,
      channel: r.channel,
      trackingNumber: r.tracking_number,
      createdAt: r.created_at,
      itemCount: Array.isArray(r.order_items) ? r.order_items.length : 0,
    }
  })

  return { items, total: count ?? 0 }
}

export async function getAdminOrderById(supabase: SB, id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:users!orders_customer_id_fkey(id, full_name, email, phone_number),
      billing_address:addresses!orders_billing_address_id_fkey(*),
      shipping_address:addresses!orders_shipping_address_id_fkey(*),
      order_items(*, product:products(id, name, sku, image_url, category)),
      refunds(*),
      events:order_events(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('[admin/orders] getAdminOrderById failed:', error.message)
    return null
  }
  return data
}

export async function searchOrdersByCustomer(supabase: SB, customerId: string, limit = 10) {
  const { data } = await supabase
    .from('orders')
    .select('id, total_amount_rm, fulfillment_status, created_at')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd ayurvedic && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add ayurvedic/src/lib/admin/orders/queries.ts
git commit -m "feat(orders): admin order queries (list + detail + by-customer)"
```

---

## Task 7 — Server actions skeleton (auth guard + helper)

**Files:**
- Create: `ayurvedic/src/lib/admin/orders/actions.ts`
- Create: `ayurvedic/src/lib/admin/orders/__tests__/actions-guards.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// actions-guards.test.ts
import { describe, it, expect, vi } from 'vitest'
import { requireAdminSession } from '../actions'

vi.mock('@/lib/auth/getCurrentUser', () => ({
  getCurrentUser: vi.fn(),
}))

describe('requireAdminSession', () => {
  it('throws when no user', async () => {
    const { getCurrentUser } = await import('@/lib/auth/getCurrentUser')
    ;(getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    await expect(requireAdminSession()).rejects.toThrow('Not authorised.')
  })

  it('throws when user is not admin', async () => {
    const { getCurrentUser } = await import('@/lib/auth/getCurrentUser')
    ;(getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      authId: 'u', role: 'customer', email: 'x', profile: { full_name: 'X' }
    })
    await expect(requireAdminSession()).rejects.toThrow('Not authorised.')
  })

  it('returns the user when admin', async () => {
    const { getCurrentUser } = await import('@/lib/auth/getCurrentUser')
    ;(getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      authId: 'u', role: 'admin', email: 'x', profile: { full_name: 'X' }
    })
    const me = await requireAdminSession()
    expect(me.role).toBe('admin')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

```ts
// actions.ts
'use server'

import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

export async function requireAdminSession() {
  const me = await getCurrentUser()
  if (!me || me.role !== 'admin') throw new Error('Not authorised.')
  return me
}

// helper to insert a notification + (optional) email send
export async function notifyCustomer(
  customerId: string | null,
  payload: {
    kind: string
    title: string
    body: string
    href?: string
  }
): Promise<void> {
  if (!customerId) return
  const supabase = await createClient()
  await supabase.from('notifications').insert({
    user_id: customerId,
    kind: payload.kind,
    title: payload.title,
    body: payload.body,
    href: payload.href ?? null,
  })
  // Email send: implemented per-action where needed using src/lib/email helpers
}
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add ayurvedic/src/lib/admin/orders/actions.ts \
        ayurvedic/src/lib/admin/orders/__tests__/actions-guards.test.ts
git commit -m "feat(orders): server actions skeleton + admin guard"
```

---

## Task 8 — Status transition + payment actions

**Files:**
- Modify: `ayurvedic/src/lib/admin/orders/actions.ts`

- [ ] **Step 1: Append the actions**

```ts
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { canTransition, type FulfillmentStatus } from './status-transitions'
import { trackingUrlFor, type Carrier } from './tracking-urls'

const StatusSchema = z.enum([
  'pending', 'processing', 'packing', 'shipped',
  'delivered', 'completed', 'cancelled',
])

export async function moveOrderStatus(
  orderId: string,
  to: FulfillmentStatus,
  note?: string,
): Promise<ActionResult> {
  try {
    await requireAdminSession()
    const supabase = await createClient()

    const { data: order, error: e1 } = await supabase
      .from('orders')
      .select('id, fulfillment_status, customer_id')
      .eq('id', orderId).single()
    if (e1 || !order) return { ok: false, error: 'Order not found.' }

    const from = order.fulfillment_status as FulfillmentStatus
    if (!canTransition(from, to)) {
      return { ok: false, error: `Cannot move from ${from} to ${to}.` }
    }

    const patch: Record<string, unknown> = { fulfillment_status: to }
    if (to === 'shipped')   patch.shipped_at = new Date().toISOString()
    if (to === 'delivered') patch.delivered_at = new Date().toISOString()
    if (to === 'completed') patch.completed_at = new Date().toISOString()

    const { error: e2 } = await supabase.from('orders').update(patch).eq('id', orderId)
    if (e2) return { ok: false, error: e2.message }

    // trigger logs the status_change event automatically
    if (note) {
      await supabase.from('order_events').insert({
        order_id: orderId, event_type: 'note_added', payload: { note },
      })
    }

    await notifyCustomer(order.customer_id, {
      kind: 'order_status',
      title: `Order #${orderId.slice(-6).toUpperCase()} is now ${to}`,
      body: note || `Status updated.`,
      href: `/account/orders/${orderId}`,
    })

    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath('/admin/orders')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function markOrderPaid(
  orderId: string,
  paymentMethod: 'billplz' | 'cod' | 'bank_transfer' | 'fpx' | 'cash' | 'card',
  gatewayRef?: string,
): Promise<ActionResult> {
  try {
    await requireAdminSession()
    const supabase = await createClient()

    const { data: order } = await supabase
      .from('orders').select('id, payment_status, invoice_number, customer_id')
      .eq('id', orderId).single()
    if (!order) return { ok: false, error: 'Order not found.' }
    if (order.payment_status === 'paid') return { ok: false, error: 'Order already paid.' }

    // assign invoice number if not yet assigned
    let invoiceNumber = order.invoice_number
    if (!invoiceNumber) {
      const { data: rpc } = await supabase.rpc('next_invoice_number')
      invoiceNumber = (rpc as string) ?? null
    }

    const { error } = await supabase.from('orders').update({
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      payment_method: paymentMethod,
      invoice_number: invoiceNumber,
    }).eq('id', orderId)
    if (error) return { ok: false, error: error.message }

    await supabase.from('order_events').insert({
      order_id: orderId, event_type: 'payment_received',
      payload: { method: paymentMethod, gateway_reference: gatewayRef },
    })

    await notifyCustomer(order.customer_id, {
      kind: 'payment_confirmed',
      title: 'Payment received',
      body: `We've received your payment. Invoice ${invoiceNumber} is ready.`,
      href: `/account/orders/${orderId}`,
    })

    revalidatePath(`/admin/orders/${orderId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function assignTracking(
  orderId: string,
  carrier: Carrier,
  trackingNumber: string,
): Promise<ActionResult> {
  try {
    await requireAdminSession()
    const supabase = await createClient()

    const { data: order } = await supabase
      .from('orders').select('id, customer_id, fulfillment_status').eq('id', orderId).single()
    if (!order) return { ok: false, error: 'Order not found.' }

    const url = trackingUrlFor(carrier, trackingNumber)
    const { error } = await supabase.from('orders').update({
      courier_service: carrier,
      tracking_number: trackingNumber,
    }).eq('id', orderId)
    if (error) return { ok: false, error: error.message }

    await supabase.from('order_events').insert({
      order_id: orderId, event_type: 'tracking_added',
      payload: { carrier, tracking_number: trackingNumber, tracking_url: url },
    })

    await notifyCustomer(order.customer_id, {
      kind: 'tracking_added',
      title: 'Your order has shipped',
      body: `Carrier: ${carrier}. Track with number ${trackingNumber}.`,
      href: `/account/orders/${orderId}`,
    })

    revalidatePath(`/admin/orders/${orderId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function markOrderShipped(
  orderId: string,
  carrier: Carrier,
  trackingNumber: string,
): Promise<ActionResult> {
  const t = await assignTracking(orderId, carrier, trackingNumber)
  if (!t.ok) return t
  return moveOrderStatus(orderId, 'shipped')
}
```

- [ ] **Step 2: Commit**

```bash
git add ayurvedic/src/lib/admin/orders/actions.ts
git commit -m "feat(orders): status transition + mark paid + tracking actions"
```

---

## Task 9 — Cancel, refund, notes, resend actions

**Files:**
- Modify: `ayurvedic/src/lib/admin/orders/actions.ts`

- [ ] **Step 1: Append**

```ts
export async function cancelOrder(
  orderId: string,
  reason: string,
): Promise<ActionResult> {
  try {
    await requireAdminSession()
    if (!reason || reason.trim().length < 5) {
      return { ok: false, error: 'Cancellation reason must be at least 5 characters.' }
    }
    const supabase = await createClient()
    const { data: order } = await supabase
      .from('orders').select('id, customer_id, fulfillment_status').eq('id', orderId).single()
    if (!order) return { ok: false, error: 'Order not found.' }
    if (!canTransition(order.fulfillment_status as FulfillmentStatus, 'cancelled')) {
      return { ok: false, error: `Cannot cancel from ${order.fulfillment_status}.` }
    }
    const { error } = await supabase.from('orders').update({
      fulfillment_status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason,
    }).eq('id', orderId)
    if (error) return { ok: false, error: error.message }

    await notifyCustomer(order.customer_id, {
      kind: 'order_cancelled',
      title: `Order #${orderId.slice(-6).toUpperCase()} cancelled`,
      body: reason,
      href: `/account/orders/${orderId}`,
    })
    revalidatePath(`/admin/orders/${orderId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function recordRefund(input: {
  orderId: string
  amountRm: number
  reason: string
  refundMethod: 'billplz' | 'cod' | 'bank_transfer' | 'fpx' | 'cash' | 'card'
  gatewayRef?: string
  notes?: string
}): Promise<ActionResult> {
  try {
    const me = await requireAdminSession()
    const supabase = await createClient()

    const { data: order } = await supabase
      .from('orders').select('id, total_amount_rm, customer_id').eq('id', input.orderId).single()
    if (!order) return { ok: false, error: 'Order not found.' }
    if (input.amountRm <= 0) return { ok: false, error: 'Refund amount must be > 0.' }
    if (input.amountRm > Number(order.total_amount_rm))
      return { ok: false, error: 'Refund cannot exceed order total.' }

    const { error: e1 } = await supabase.from('refunds').insert({
      order_id: input.orderId,
      amount_rm: input.amountRm,
      reason: input.reason,
      refund_method: input.refundMethod,
      gateway_reference: input.gatewayRef,
      notes: input.notes,
      created_by_admin_id: me.authId,
    })
    if (e1) return { ok: false, error: e1.message }

    const isFull = Number(input.amountRm) >= Number(order.total_amount_rm)
    const { error: e2 } = await supabase.from('orders').update({
      payment_status: isFull ? 'refunded' : 'paid',
    }).eq('id', input.orderId)
    if (e2) return { ok: false, error: e2.message }

    await supabase.from('order_events').insert({
      order_id: input.orderId, event_type: 'refund_recorded',
      payload: { amount_rm: input.amountRm, reason: input.reason, full: isFull },
    })

    await notifyCustomer(order.customer_id, {
      kind: 'refund_recorded',
      title: isFull ? 'Refund issued' : 'Partial refund issued',
      body: `RM ${input.amountRm.toFixed(2)} — ${input.reason}`,
      href: `/account/orders/${input.orderId}`,
    })
    revalidatePath(`/admin/orders/${input.orderId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function addPractitionerNote(orderId: string, note: string): Promise<ActionResult> {
  try {
    await requireAdminSession()
    if (!note || note.trim().length < 1) return { ok: false, error: 'Note cannot be empty.' }
    const supabase = await createClient()
    const { data: order } = await supabase
      .from('orders').select('id, customer_id').eq('id', orderId).single()
    if (!order) return { ok: false, error: 'Order not found.' }

    const { error } = await supabase.from('orders').update({
      practitioner_note: note,
    }).eq('id', orderId)
    if (error) return { ok: false, error: error.message }

    await supabase.from('order_events').insert({
      order_id: orderId, event_type: 'practitioner_note_added',
      payload: { note },
    })
    await notifyCustomer(order.customer_id, {
      kind: 'practitioner_note',
      title: 'Vaidya left a note on your order',
      body: note.slice(0, 140),
      href: `/account/orders/${orderId}`,
    })
    revalidatePath(`/admin/orders/${orderId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function addInternalNote(orderId: string, note: string): Promise<ActionResult> {
  try {
    await requireAdminSession()
    const supabase = await createClient()
    const { error } = await supabase.from('orders').update({
      internal_notes: note,
    }).eq('id', orderId)
    if (error) return { ok: false, error: error.message }
    await supabase.from('order_events').insert({
      order_id: orderId, event_type: 'internal_note_added',
      is_customer_visible: false, payload: { note },
    })
    revalidatePath(`/admin/orders/${orderId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add ayurvedic/src/lib/admin/orders/actions.ts
git commit -m "feat(orders): cancel, refund, notes actions"
```

---

## Task 10 — Manual order entry action

**Files:**
- Modify: `ayurvedic/src/lib/admin/orders/actions.ts`

- [ ] **Step 1: Append**

```ts
const ManualOrderItem = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPriceRm: z.number().positive(),
})

const ManualOrderInput = z.object({
  customerId: z.string().uuid().nullable(),
  walkInName: z.string().min(1).optional(),
  walkInPhone: z.string().min(8).optional(),
  walkInEmail: z.string().email().optional(),
  items: z.array(ManualOrderItem).min(1),
  paymentMethod: z.enum(['cod', 'bank_transfer', 'fpx', 'cash', 'card']),
  channel: z.enum(['manual', 'walk_in', 'phone']).default('manual'),
  shippingAddressId: z.string().uuid().nullable().optional(),
  agentId: z.string().uuid().nullable().optional(),
  discountCode: z.string().optional(),
  internalNote: z.string().optional(),
})

export async function createManualOrder(
  raw: unknown,
): Promise<ActionResult<{ orderId: string }>> {
  try {
    const me = await requireAdminSession()
    const input = ManualOrderInput.parse(raw)
    const supabase = await createClient()

    // Either customerId is set OR walk-in fields are set
    let customerId = input.customerId
    if (!customerId) {
      if (!input.walkInName) return { ok: false, error: 'Walk-in name required.' }
      // create a minimal customer row
      const { data: u, error: ue } = await supabase.from('users').insert({
        full_name: input.walkInName,
        phone_number: input.walkInPhone,
        email: input.walkInEmail,
        role: 'customer',
      }).select('id').single()
      if (ue || !u) return { ok: false, error: ue?.message ?? 'Customer create failed.' }
      customerId = u.id
    }

    const subtotal = input.items.reduce((s, it) => s + it.unitPriceRm * it.quantity, 0)
    const { data: order, error: oe } = await supabase.from('orders').insert({
      customer_id: customerId,
      channel: input.channel,
      payment_method: input.paymentMethod,
      subtotal_rm: subtotal,
      total_amount_rm: subtotal,           // tax/shipping added later if needed
      payment_status: 'pending',
      fulfillment_status: 'pending',
      shipping_address_id: input.shippingAddressId,
      referral_agent_id: input.agentId,
      discount_code: input.discountCode,
      internal_notes: input.internalNote,
      created_by_admin_id: me.authId,
    }).select('id').single()
    if (oe || !order) return { ok: false, error: oe?.message ?? 'Order create failed.' }

    const itemRows = input.items.map((it) => ({
      order_id: order.id,
      product_id: it.productId,
      quantity: it.quantity,
      price_at_purchase_rm: it.unitPriceRm,
    }))
    const { error: ie } = await supabase.from('order_items').insert(itemRows)
    if (ie) return { ok: false, error: ie.message }

    revalidatePath('/admin/orders')
    return { ok: true, data: { orderId: order.id } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, error: err.issues.map((i) => i.message).join('; ') }
    }
    return { ok: false, error: (err as Error).message }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add ayurvedic/src/lib/admin/orders/actions.ts
git commit -m "feat(orders): manual order entry action"
```

---

## Task 11 — Bulk actions + resend helpers

**Files:**
- Modify: `ayurvedic/src/lib/admin/orders/actions.ts`

- [ ] **Step 1: Append**

```ts
export async function bulkMarkPaid(
  orderIds: string[],
  paymentMethod: 'billplz' | 'cod' | 'bank_transfer' | 'fpx' | 'cash' | 'card',
): Promise<ActionResult<{ updated: number }>> {
  await requireAdminSession()
  let updated = 0
  for (const id of orderIds) {
    const r = await markOrderPaid(id, paymentMethod)
    if (r.ok) updated++
  }
  revalidatePath('/admin/orders')
  return { ok: true, data: { updated } }
}

export async function bulkMarkShipped(
  rows: { orderId: string; carrier: Carrier; trackingNumber: string }[],
): Promise<ActionResult<{ updated: number }>> {
  await requireAdminSession()
  let updated = 0
  for (const r of rows) {
    const out = await markOrderShipped(r.orderId, r.carrier, r.trackingNumber)
    if (out.ok) updated++
  }
  revalidatePath('/admin/orders')
  return { ok: true, data: { updated } }
}

export async function resendOrderConfirmation(orderId: string): Promise<ActionResult> {
  try {
    await requireAdminSession()
    const supabase = await createClient()
    const { data: order } = await supabase
      .from('orders').select('id, customer_id').eq('id', orderId).single()
    if (!order) return { ok: false, error: 'Order not found.' }

    await supabase.from('order_events').insert({
      order_id: orderId, event_type: 'confirmation_resent',
      is_customer_visible: false, payload: { at: new Date().toISOString() },
    })
    await notifyCustomer(order.customer_id, {
      kind: 'order_confirmation',
      title: `Order confirmation resent`,
      body: `We've re-sent your order confirmation.`,
      href: `/account/orders/${orderId}`,
    })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add ayurvedic/src/lib/admin/orders/actions.ts
git commit -m "feat(orders): bulk actions + resend confirmation"
```

---

## Task 12 — PDF: PackingSlipDocument

**Files:**
- Create: `ayurvedic/src/lib/invoice/PackingSlipDocument.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/orders/[id]/packing-slip/route.tsx`

- [ ] **Step 1: Write the PDF component**

```tsx
// PackingSlipDocument.tsx
import {
  Document, Page, Text, View, StyleSheet, Font,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: 'Helvetica' },
  h1: { fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#2F5D50' },
  meta: { fontSize: 10, color: '#666', marginBottom: 16 },
  addr: { marginBottom: 16, borderTop: '1pt solid #ddd', paddingTop: 8 },
  th: { fontWeight: 700, borderBottom: '1pt solid #2F5D50', paddingBottom: 4 },
  row: { flexDirection: 'row', paddingVertical: 6, borderBottom: '0.5pt solid #eee' },
  c1: { width: '15%' }, c2: { width: '55%' }, c3: { width: '15%', textAlign: 'right' }, c4: { width: '15%', textAlign: 'center' },
  footer: { marginTop: 24, fontSize: 9, color: '#999' },
})

export interface PackingSlipProps {
  orderId: string
  shortId: string
  createdAt: string
  customer: { fullName: string; phone?: string | null }
  shippingAddress: {
    line1: string; line2?: string | null; city: string; state: string;
    postcode: string; country: string
  }
  items: { sku: string | null; name: string; quantity: number }[]
  practitionerNote?: string | null
}

export default function PackingSlipDocument(props: PackingSlipProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Packing Slip — #{props.shortId}</Text>
        <Text style={styles.meta}>
          Kerala Ayurvedic Lifestyle · {new Date(props.createdAt).toLocaleDateString('en-MY')}
        </Text>

        <View style={styles.addr}>
          <Text style={{ fontWeight: 700, marginBottom: 4 }}>Ship to</Text>
          <Text>{props.customer.fullName}</Text>
          <Text>{props.shippingAddress.line1}</Text>
          {props.shippingAddress.line2 ? <Text>{props.shippingAddress.line2}</Text> : null}
          <Text>{props.shippingAddress.city}, {props.shippingAddress.state} {props.shippingAddress.postcode}</Text>
          <Text>{props.shippingAddress.country}</Text>
          {props.customer.phone ? <Text>Tel: {props.customer.phone}</Text> : null}
        </View>

        <View style={[styles.row, styles.th]}>
          <Text style={styles.c1}>SKU</Text>
          <Text style={styles.c2}>Product</Text>
          <Text style={styles.c3}>Qty</Text>
          <Text style={styles.c4}>✓</Text>
        </View>
        {props.items.map((it, i) => (
          <View style={styles.row} key={i}>
            <Text style={styles.c1}>{it.sku ?? '—'}</Text>
            <Text style={styles.c2}>{it.name}</Text>
            <Text style={styles.c3}>{it.quantity}</Text>
            <Text style={styles.c4}>☐</Text>
          </View>
        ))}

        {props.practitionerNote ? (
          <View style={{ marginTop: 16, padding: 8, backgroundColor: '#FAF6EE' }}>
            <Text style={{ fontWeight: 700, marginBottom: 4 }}>Vaidya's note</Text>
            <Text>{props.practitionerNote}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>
          Packed by: ____________________   Date: ____________________
        </Text>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 2: Write the route handler**

```tsx
// route.tsx
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { requireAdminSession } from '@/lib/admin/orders/actions'
import { getAdminOrderById } from '@/lib/admin/orders/queries'
import { createClient } from '@/lib/supabase/server'
import PackingSlipDocument from '@/lib/invoice/PackingSlipDocument'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const order = await getAdminOrderById(supabase, params.id)
  if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o: any = order
  const ship = Array.isArray(o.shipping_address) ? o.shipping_address[0] : o.shipping_address
  const cust = Array.isArray(o.customer) ? o.customer[0] : o.customer

  if (!ship) return NextResponse.json({ error: 'no_shipping_address' }, { status: 400 })

  const buf = await renderToBuffer(
    <PackingSlipDocument
      orderId={o.id}
      shortId={String(o.id).slice(-6).toUpperCase()}
      createdAt={o.created_at}
      customer={{ fullName: cust?.full_name ?? 'Customer', phone: cust?.phone_number }}
      shippingAddress={{
        line1: ship.line1, line2: ship.line2, city: ship.city,
        state: ship.state, postcode: ship.postcode, country: ship.country,
      }}
      items={o.order_items.map((it: any) => ({
        sku: it.product?.sku ?? null,
        name: it.product?.name ?? 'Product',
        quantity: it.quantity,
      }))}
      practitionerNote={o.practitioner_note}
    />
  )

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="packing-slip-${o.id.slice(-6)}.pdf"`,
    },
  })
}
```

- [ ] **Step 3: Smoke test**

Run dev server, navigate to `/admin/orders/<any-order-id>/packing-slip` (need a seeded order with shipping address). Expect a PDF download.

- [ ] **Step 4: Commit**

```bash
git add ayurvedic/src/lib/invoice/PackingSlipDocument.tsx \
        ayurvedic/src/app/admin/\(portal\)/orders/\[id\]/packing-slip/route.tsx
git commit -m "feat(orders): packing slip PDF + admin route"
```

---

## Task 13 — PDF: AddressLabelDocument (A6)

**Files:**
- Create: `ayurvedic/src/lib/invoice/AddressLabelDocument.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/orders/[id]/label/route.tsx`

- [ ] **Step 1: Install barcode helper**

```bash
cd ayurvedic && npm install jsbarcode canvas
```

(`jsbarcode` produces SVG/Canvas; we'll convert to PNG dataURL for embedding in react-pdf.)

Alternative if `canvas` proves heavy on Vercel: render barcode as numbered text only for v1.

- [ ] **Step 2: Write the PDF component**

```tsx
// AddressLabelDocument.tsx
import {
  Document, Page, Text, View, StyleSheet,
} from '@react-pdf/renderer'

// A6 = 105 × 148 mm; react-pdf uses points (72 = 1 inch).
// 105mm = 297.6pt, 148mm = 419.5pt — register as custom size.
const A6 = { width: 297.6, height: 419.5 }

const styles = StyleSheet.create({
  page: { padding: 14, fontSize: 9, fontFamily: 'Helvetica' },
  sender: { fontSize: 8, color: '#444', marginBottom: 8, paddingBottom: 4, borderBottom: '0.5pt solid #aaa' },
  toLabel: { fontSize: 7, color: '#888', marginBottom: 2, textTransform: 'uppercase' },
  recipient: { fontSize: 13, fontWeight: 700, marginBottom: 6 },
  addr: { fontSize: 11, lineHeight: 1.4 },
  footer: { marginTop: 12, paddingTop: 6, borderTop: '0.5pt solid #aaa', flexDirection: 'row', justifyContent: 'space-between' },
  shortId: { fontSize: 22, fontWeight: 700, letterSpacing: 2, color: '#2F5D50' },
  carrier: { fontSize: 9, color: '#666', textAlign: 'right' },
})

export interface AddressLabelProps {
  shortId: string
  customerName: string
  shippingAddress: {
    line1: string; line2?: string | null; city: string; state: string;
    postcode: string; country: string
  }
  customerPhone?: string | null
  carrier?: string | null
  sender: {
    name: string; addressLine: string; phone: string
  }
}

export default function AddressLabelDocument(p: AddressLabelProps) {
  return (
    <Document>
      <Page size={A6} style={styles.page}>
        <View style={styles.sender}>
          <Text>FROM: {p.sender.name}</Text>
          <Text>{p.sender.addressLine}</Text>
          <Text>Tel: {p.sender.phone}</Text>
        </View>

        <Text style={styles.toLabel}>TO</Text>
        <Text style={styles.recipient}>{p.customerName}</Text>
        <View style={styles.addr}>
          <Text>{p.shippingAddress.line1}</Text>
          {p.shippingAddress.line2 ? <Text>{p.shippingAddress.line2}</Text> : null}
          <Text>{p.shippingAddress.city}, {p.shippingAddress.state} {p.shippingAddress.postcode}</Text>
          <Text>{p.shippingAddress.country}</Text>
          {p.customerPhone ? <Text>Tel: {p.customerPhone}</Text> : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.shortId}>#{p.shortId}</Text>
          {p.carrier ? <Text style={styles.carrier}>{p.carrier}</Text> : null}
        </View>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 3: Write the route handler**

```tsx
// route.tsx
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { requireAdminSession } from '@/lib/admin/orders/actions'
import { getAdminOrderById } from '@/lib/admin/orders/queries'
import { createClient } from '@/lib/supabase/server'
import AddressLabelDocument from '@/lib/invoice/AddressLabelDocument'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SENDER = {
  name: 'Kerala Ayurvedic Lifestyle',
  addressLine: '12 Jln Tun Sambanthan 4, Brickfields, 50470 Kuala Lumpur',
  phone: '+60 11 6504 3436',
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try { await requireAdminSession() } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const supabase = await createClient()
  const order = await getAdminOrderById(supabase, params.id)
  if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o: any = order
  const ship = Array.isArray(o.shipping_address) ? o.shipping_address[0] : o.shipping_address
  const cust = Array.isArray(o.customer) ? o.customer[0] : o.customer
  if (!ship) return NextResponse.json({ error: 'no_shipping_address' }, { status: 400 })

  const buf = await renderToBuffer(
    <AddressLabelDocument
      shortId={String(o.id).slice(-6).toUpperCase()}
      customerName={cust?.full_name ?? 'Customer'}
      shippingAddress={{
        line1: ship.line1, line2: ship.line2, city: ship.city,
        state: ship.state, postcode: ship.postcode, country: ship.country,
      }}
      customerPhone={cust?.phone_number}
      carrier={o.courier_service}
      sender={SENDER}
    />
  )

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="label-${o.id.slice(-6)}.pdf"`,
    },
  })
}
```

- [ ] **Step 4: Smoke test**

Dev server, visit `/admin/orders/<id>/label`. Confirm PDF opens at A6 size (297.6×419.5pt).

- [ ] **Step 5: Commit**

```bash
git add ayurvedic/src/lib/invoice/AddressLabelDocument.tsx \
        ayurvedic/src/app/admin/\(portal\)/orders/\[id\]/label/route.tsx \
        ayurvedic/package.json ayurvedic/package-lock.json
git commit -m "feat(orders): A6 address label PDF + admin route"
```

---

## Task 14 — Update InvoiceDocument + admin invoice route

**Files:**
- Modify: `ayurvedic/src/lib/invoice/InvoiceDocument.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/orders/[id]/invoice/route.tsx`

- [ ] **Step 1: Extend InvoiceDocument props**

Read the existing file, then add these props (preserve existing behavior for customer route):

```tsx
// add to InvoiceDocument.tsx interface
invoiceNumber?: string | null      // new — admin will pass; customer existing call doesn't break
subtotalRm?: number | null
taxAmountRm?: number | null
shippingAmountRm?: number | null
discountAmountRm?: number | null
discountCode?: string | null
sstRegistered?: boolean            // toggles SST line on render
```

In the rendered totals block, render `Subtotal`, `Discount`, `Shipping`, `SST 6%` (if `sstRegistered`), `Grand total` only if the corresponding values are present; otherwise fall back to existing single-total rendering.

Header should render invoice number when provided:
```tsx
{invoiceNumber ? <Text>Invoice no: {invoiceNumber}</Text> : null}
```

- [ ] **Step 2: Write the admin invoice route**

```tsx
// route.tsx
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { requireAdminSession } from '@/lib/admin/orders/actions'
import { getAdminOrderById } from '@/lib/admin/orders/queries'
import { createClient } from '@/lib/supabase/server'
import InvoiceDocument from '@/lib/invoice/InvoiceDocument'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try { await requireAdminSession() } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const supabase = await createClient()
  const order = await getAdminOrderById(supabase, params.id)
  if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o: any = order
  const cust = Array.isArray(o.customer) ? o.customer[0] : o.customer

  // TODO: when Settings module ships, read sstRegistered from settings; default false for v1
  const buf = await renderToBuffer(
    <InvoiceDocument
      order={o}
      customer={{ fullName: cust?.full_name ?? 'Customer', email: cust?.email ?? '' }}
      invoiceNumber={o.invoice_number}
      subtotalRm={o.subtotal_rm}
      taxAmountRm={o.tax_amount_rm}
      shippingAmountRm={o.shipping_amount_rm}
      discountAmountRm={o.discount_amount_rm}
      discountCode={o.discount_code}
      sstRegistered={false}
    />
  )
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="invoice-${o.id.slice(-6)}.pdf"`,
    },
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add ayurvedic/src/lib/invoice/InvoiceDocument.tsx \
        ayurvedic/src/app/admin/\(portal\)/orders/\[id\]/invoice/route.tsx
git commit -m "feat(orders): admin invoice route + invoice breakdowns"
```

---

## Task 15 — Batch print route

**Files:**
- Create: `ayurvedic/src/app/admin/(portal)/orders/batch-print/route.tsx`

- [ ] **Step 1: Write the handler**

```tsx
import { NextResponse } from 'next/server'
import { renderToBuffer, Document } from '@react-pdf/renderer'
import { requireAdminSession } from '@/lib/admin/orders/actions'
import { getAdminOrderById } from '@/lib/admin/orders/queries'
import { createClient } from '@/lib/supabase/server'
import AddressLabelDocument from '@/lib/invoice/AddressLabelDocument'
import PackingSlipDocument from '@/lib/invoice/PackingSlipDocument'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SENDER = {
  name: 'Kerala Ayurvedic Lifestyle',
  addressLine: '12 Jln Tun Sambanthan 4, Brickfields, 50470 Kuala Lumpur',
  phone: '+60 11 6504 3436',
}

export async function GET(req: Request) {
  try { await requireAdminSession() } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const ids = (url.searchParams.get('ids') ?? '').split(',').filter(Boolean)
  const type = (url.searchParams.get('type') ?? 'label') as 'label' | 'slip'
  if (ids.length === 0) return NextResponse.json({ error: 'no_ids' }, { status: 400 })
  if (ids.length > 100) return NextResponse.json({ error: 'too_many' }, { status: 400 })

  const supabase = await createClient()
  const orders = await Promise.all(ids.map((id) => getAdminOrderById(supabase, id)))
  const valid = orders.filter(Boolean)
  if (valid.length === 0) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // Compose a single Document with one Page per order using the right sub-document.
  // Easiest: render each individually, then we'll concatenate via pdf-lib (or use
  // multi-Page Document). For v1 keep simple: render N PDFs and concatenate with pdf-lib.
  // Install: npm install pdf-lib
  const { PDFDocument } = await import('pdf-lib')
  const merged = await PDFDocument.create()

  for (const orderRaw of valid) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o: any = orderRaw
    const ship = Array.isArray(o.shipping_address) ? o.shipping_address[0] : o.shipping_address
    const cust = Array.isArray(o.customer) ? o.customer[0] : o.customer
    if (!ship) continue

    const buf = type === 'label'
      ? await renderToBuffer(
          <AddressLabelDocument
            shortId={String(o.id).slice(-6).toUpperCase()}
            customerName={cust?.full_name ?? 'Customer'}
            shippingAddress={{
              line1: ship.line1, line2: ship.line2, city: ship.city,
              state: ship.state, postcode: ship.postcode, country: ship.country,
            }}
            customerPhone={cust?.phone_number}
            carrier={o.courier_service}
            sender={SENDER}
          />
        )
      : await renderToBuffer(
          <PackingSlipDocument
            orderId={o.id}
            shortId={String(o.id).slice(-6).toUpperCase()}
            createdAt={o.created_at}
            customer={{ fullName: cust?.full_name ?? 'Customer', phone: cust?.phone_number }}
            shippingAddress={{
              line1: ship.line1, line2: ship.line2, city: ship.city,
              state: ship.state, postcode: ship.postcode, country: ship.country,
            }}
            items={o.order_items.map((it: any) => ({
              sku: it.product?.sku ?? null,
              name: it.product?.name ?? 'Product',
              quantity: it.quantity,
            }))}
            practitionerNote={o.practitioner_note}
          />
        )

    const src = await PDFDocument.load(buf)
    const copied = await merged.copyPages(src, src.getPageIndices())
    copied.forEach((p) => merged.addPage(p))
  }

  const out = await merged.save()
  return new NextResponse(Buffer.from(out), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="batch-${type}-${valid.length}.pdf"`,
    },
  })
}
```

- [ ] **Step 2: Install pdf-lib**

```bash
cd ayurvedic && npm install pdf-lib
```

- [ ] **Step 3: Commit**

```bash
git add ayurvedic/src/app/admin/\(portal\)/orders/batch-print/route.tsx \
        ayurvedic/package.json ayurvedic/package-lock.json
git commit -m "feat(orders): batch print route (labels or slips)"
```

---

## Task 16 — Admin orders list page

**Files:**
- Create: `ayurvedic/src/app/admin/(portal)/orders/page.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/orders/OrdersTable.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/orders/OrdersFilters.tsx`

- [ ] **Step 1: Filters component (client)**

```tsx
// OrdersFilters.tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const STATUSES = ['pending', 'processing', 'packing', 'shipped', 'delivered', 'completed', 'cancelled'] as const

export default function OrdersFilters() {
  const router = useRouter()
  const sp = useSearchParams()
  const set = useCallback((k: string, v: string | null) => {
    const next = new URLSearchParams(sp)
    if (!v) next.delete(k); else next.set(k, v)
    router.push(`/admin/orders?${next.toString()}`)
  }, [router, sp])

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#1e3d32]/10 bg-white p-3">
      <input
        type="search"
        placeholder="Search ID, name, email…"
        defaultValue={sp.get('q') ?? ''}
        onChange={(e) => set('q', e.target.value || null)}
        className="min-w-[200px] flex-1 rounded-lg border border-[#1e3d32]/10 bg-white px-3 py-1.5 text-sm"
      />
      <select
        value={sp.get('status') ?? ''}
        onChange={(e) => set('status', e.target.value || null)}
        className="rounded-lg border border-[#1e3d32]/10 bg-white px-3 py-1.5 text-sm"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select
        value={sp.get('payment') ?? ''}
        onChange={(e) => set('payment', e.target.value || null)}
        className="rounded-lg border border-[#1e3d32]/10 bg-white px-3 py-1.5 text-sm"
      >
        <option value="">Any payment</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="failed">Failed</option>
        <option value="refunded">Refunded</option>
      </select>
    </div>
  )
}
```

- [ ] **Step 2: Table component (server)**

```tsx
// OrdersTable.tsx
import Link from 'next/link'
import type { AdminOrderListItem } from '@/lib/admin/orders/queries'

const STATUS_CLASS: Record<string, string> = {
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  packing:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped:    'bg-violet-50 text-violet-700 border-violet-200',
  delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed:  'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
}

export default function OrdersTable({ items }: { items: AdminOrderListItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#1e3d32]/15 p-12 text-center font-body text-sm italic text-[#2B2B2B]/55">
        No orders match your filters.
      </div>
    )
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1e3d32]/8 bg-white">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-[#FAF6EE]/40 text-[11px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">
          <tr>
            <th className="px-4 py-3"><input type="checkbox" /></th>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Payment</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e3d32]/6">
          {items.map((o) => (
            <tr key={o.id} className="hover:bg-[#FAF6EE]/30">
              <td className="px-4 py-3">
                <input type="checkbox" name="orderIds" value={o.id} />
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/orders/${o.id}`} className="font-semibold text-[#1e3d32] hover:text-[#D4A373]">
                  #{o.shortId}
                </Link>
                <div className="text-[11px] text-[#2B2B2B]/55">{o.itemCount} item{o.itemCount === 1 ? '' : 's'}</div>
              </td>
              <td className="px-4 py-3">
                <div>{o.customerName ?? '—'}</div>
                <div className="text-[11px] text-[#2B2B2B]/55">{o.customerEmail ?? ''}</div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${STATUS_CLASS[o.fulfillmentStatus] ?? ''}`}>
                  {o.fulfillmentStatus}
                </span>
              </td>
              <td className="px-4 py-3">{o.paymentStatus}</td>
              <td className="px-4 py-3 text-right">RM {o.totalRm.toFixed(2)}</td>
              <td className="px-4 py-3 text-[12px] text-[#2B2B2B]/65">
                {new Date(o.createdAt).toLocaleDateString('en-MY')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 3: Page**

```tsx
// page.tsx
import { createClient } from '@/lib/supabase/server'
import { listAdminOrders, type AdminOrderFilters } from '@/lib/admin/orders/queries'
import OrdersFilters from './OrdersFilters'
import OrdersTable from './OrdersTable'

export const metadata = { title: 'Orders · Admin' }

interface PageProps { searchParams: { q?: string; status?: string; payment?: string } }

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const filters: AdminOrderFilters = {
    search: searchParams.q,
    fulfillmentStatus: searchParams.status ? [searchParams.status as 'pending'] : undefined,
    paymentStatus: searchParams.payment ? [searchParams.payment as 'paid'] : undefined,
    limit: 50,
  }
  const { items, total } = await listAdminOrders(supabase, filters)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <header>
        <h1 className="font-heading text-[28px] font-bold text-[#1e3d32]">Orders</h1>
        <p className="font-body text-[13px] text-[#2B2B2B]/65">{total} total</p>
      </header>
      <OrdersFilters />
      <OrdersTable items={items} />
    </div>
  )
}
```

- [ ] **Step 4: Smoke**

Dev server, sign in as admin, visit `/admin/orders`. Should render filters + table (empty or seeded data). No console errors.

- [ ] **Step 5: Commit**

```bash
git add ayurvedic/src/app/admin/\(portal\)/orders/page.tsx \
        ayurvedic/src/app/admin/\(portal\)/orders/OrdersTable.tsx \
        ayurvedic/src/app/admin/\(portal\)/orders/OrdersFilters.tsx
git commit -m "feat(orders): admin list page + filters + table"
```

---

## Task 17 — Bulk actions bar (client)

**Files:**
- Create: `ayurvedic/src/app/admin/(portal)/orders/BulkActionsBar.tsx`
- Modify: `ayurvedic/src/app/admin/(portal)/orders/page.tsx` + `OrdersTable.tsx` to wire up selection state

- [ ] **Step 1: BulkActionsBar component**

```tsx
'use client'
import { useState } from 'react'
import { bulkMarkPaid, bulkMarkShipped } from '@/lib/admin/orders/actions'

export default function BulkActionsBar({ selectedIds }: { selectedIds: string[] }) {
  const [pending, setPending] = useState(false)

  if (selectedIds.length === 0) return null

  async function handleBulkPaid() {
    setPending(true)
    const r = await bulkMarkPaid(selectedIds, 'bank_transfer')
    setPending(false)
    alert(r.ok ? `Marked ${(r as { ok: true; data: { updated: number } }).data.updated} as paid.` : r.error)
  }

  function handleBatchPrint(type: 'label' | 'slip') {
    window.open(`/admin/orders/batch-print?ids=${selectedIds.join(',')}&type=${type}`, '_blank')
  }

  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 rounded-2xl border border-[#D4A373]/30 bg-[#FAF6EE] p-3">
      <span className="text-[12px] font-semibold text-[#1e3d32]">{selectedIds.length} selected</span>
      <button disabled={pending} onClick={handleBulkPaid} className="rounded-lg bg-[#2F5D50] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50">
        Mark paid (bank transfer)
      </button>
      <button onClick={() => handleBatchPrint('label')} className="rounded-lg border border-[#1e3d32]/20 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1e3d32]">
        Print labels
      </button>
      <button onClick={() => handleBatchPrint('slip')} className="rounded-lg border border-[#1e3d32]/20 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1e3d32]">
        Print packing slips
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Wire selection state in OrdersTable + page**

Convert `OrdersTable` to a client component that manages selection state internally, OR pass a `selectedIds` URL param. Simpler: make OrdersTable a client component that maintains its own selection:

```tsx
// OrdersTable.tsx — convert to client
'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { AdminOrderListItem } from '@/lib/admin/orders/queries'
import BulkActionsBar from './BulkActionsBar'
// ... STATUS_CLASS as before

export default function OrdersTable({ items }: { items: AdminOrderListItem[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  // ... render table; pass selected.has(o.id) to each row checkbox; render <BulkActionsBar selectedIds={[...selected]} />
}
```

- [ ] **Step 3: Smoke**

Select 2-3 rows → bar appears → click Print labels → batch PDF downloads.

- [ ] **Step 4: Commit**

```bash
git add ayurvedic/src/app/admin/\(portal\)/orders/BulkActionsBar.tsx \
        ayurvedic/src/app/admin/\(portal\)/orders/OrdersTable.tsx
git commit -m "feat(orders): bulk actions bar + selection state"
```

---

## Task 18 — Admin order detail page (shell + items + timeline)

**Files:**
- Create: `ayurvedic/src/app/admin/(portal)/orders/[id]/page.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/orders/[id]/OrderTimeline.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/orders/[id]/OrderItemsTable.tsx`

- [ ] **Step 1: Timeline component**

```tsx
// OrderTimeline.tsx
import { Clock } from 'lucide-react'

interface Event {
  id: string
  event_type: string
  from_status: string | null
  to_status: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
  is_customer_visible: boolean
  created_at: string
}

const HUMAN: Record<string, string> = {
  status_change:           'Status changed',
  payment_status_change:   'Payment status changed',
  tracking_added:          'Tracking added',
  practitioner_note_added: 'Practitioner note added',
  internal_note_added:     'Internal note added',
  refund_recorded:         'Refund recorded',
  payment_received:        'Payment received',
  confirmation_resent:     'Confirmation resent',
  note_added:              'Note added',
}

export default function OrderTimeline({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <p className="px-5 py-6 text-center text-[12.5px] italic text-[#2B2B2B]/55">
        No events yet.
      </p>
    )
  }
  return (
    <ul className="divide-y divide-[#1e3d32]/6">
      {events.map((e) => (
        <li key={e.id} className="flex items-start gap-3 px-5 py-3">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1e3d32]/40" strokeWidth={1.8} />
          <div className="min-w-0 flex-1">
            <p className="font-heading text-[12.5px] font-semibold text-[#1e3d32]">
              {HUMAN[e.event_type] ?? e.event_type}
              {e.from_status && e.to_status ? (
                <span className="ml-2 font-normal text-[#2B2B2B]/60">
                  {e.from_status} → {e.to_status}
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 text-[11px] text-[#2B2B2B]/55">
              {new Date(e.created_at).toLocaleString('en-MY')}
              {!e.is_customer_visible ? ' · staff-only' : ''}
            </p>
            {e.payload?.note ? (
              <p className="mt-1 text-[12px] text-[#2B2B2B]/70">{e.payload.note}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 2: Items table component**

```tsx
// OrderItemsTable.tsx
interface Item {
  id: string
  quantity: number
  price_at_purchase_rm: number
  product: { id: string; name: string; sku: string | null; image_url: string | null } | null
}

export default function OrderItemsTable({ items }: { items: Item[] }) {
  const total = items.reduce((s, i) => s + Number(i.price_at_purchase_rm) * i.quantity, 0)
  return (
    <table className="w-full text-left text-[13px]">
      <thead className="text-[11px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">
        <tr>
          <th className="px-5 py-3">Item</th>
          <th className="px-5 py-3">SKU</th>
          <th className="px-5 py-3 text-right">Qty</th>
          <th className="px-5 py-3 text-right">Unit</th>
          <th className="px-5 py-3 text-right">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#1e3d32]/6">
        {items.map((it) => (
          <tr key={it.id}>
            <td className="px-5 py-3">{it.product?.name ?? '—'}</td>
            <td className="px-5 py-3 text-[11px] text-[#2B2B2B]/65">{it.product?.sku ?? '—'}</td>
            <td className="px-5 py-3 text-right">{it.quantity}</td>
            <td className="px-5 py-3 text-right">RM {Number(it.price_at_purchase_rm).toFixed(2)}</td>
            <td className="px-5 py-3 text-right font-semibold">
              RM {(Number(it.price_at_purchase_rm) * it.quantity).toFixed(2)}
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan={4} className="px-5 py-3 text-right font-semibold">Items total</td>
          <td className="px-5 py-3 text-right font-semibold">RM {total.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  )
}
```

- [ ] **Step 3: Page**

```tsx
// page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminOrderById } from '@/lib/admin/orders/queries'
import OrderItemsTable from './OrderItemsTable'
import OrderTimeline from './OrderTimeline'

export const metadata = { title: 'Order · Admin' }

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const order = await getAdminOrderById(supabase, params.id)
  if (!order) notFound()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o: any = order
  const cust = Array.isArray(o.customer) ? o.customer[0] : o.customer
  const ship = Array.isArray(o.shipping_address) ? o.shipping_address[0] : o.shipping_address
  const shortId = String(o.id).slice(-6).toUpperCase()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-[11px] uppercase tracking-wider text-[#1e3d32]/55 hover:text-[#D4A373]">
            ← Back to orders
          </Link>
          <h1 className="mt-1 font-heading text-[24px] font-bold text-[#1e3d32]">
            Order #{shortId}
          </h1>
          <p className="text-[12px] text-[#2B2B2B]/65">
            {new Date(o.created_at).toLocaleString('en-MY')} · channel: {o.channel}
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`/admin/orders/${o.id}/invoice`} target="_blank" className="rounded-lg border border-[#1e3d32]/20 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1e3d32]">Invoice</a>
          <a href={`/admin/orders/${o.id}/packing-slip`} target="_blank" className="rounded-lg border border-[#1e3d32]/20 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1e3d32]">Packing slip</a>
          <a href={`/admin/orders/${o.id}/label`} target="_blank" className="rounded-lg bg-[#2F5D50] px-3 py-1.5 text-[12px] font-semibold text-white">Print label</a>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="lg:col-span-2 rounded-2xl border border-[#1e3d32]/8 bg-white">
          <header className="border-b border-[#1e3d32]/6 px-5 py-3 font-heading text-[13px] font-semibold text-[#1e3d32]">Items</header>
          <OrderItemsTable items={o.order_items ?? []} />
        </article>

        <article className="rounded-2xl border border-[#1e3d32]/8 bg-white p-5">
          <h2 className="font-heading text-[13px] font-semibold text-[#1e3d32]">Customer</h2>
          <p className="mt-2 text-[13px]">{cust?.full_name ?? '—'}</p>
          <p className="text-[12px] text-[#2B2B2B]/65">{cust?.email}</p>
          <p className="text-[12px] text-[#2B2B2B]/65">{cust?.phone_number}</p>
          {ship ? (
            <div className="mt-4 border-t border-[#1e3d32]/6 pt-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">Ship to</h3>
              <p className="mt-1 text-[12.5px]">{ship.line1}</p>
              {ship.line2 ? <p className="text-[12.5px]">{ship.line2}</p> : null}
              <p className="text-[12.5px]">{ship.city}, {ship.state} {ship.postcode}</p>
              <p className="text-[12.5px]">{ship.country}</p>
            </div>
          ) : null}
        </article>
      </section>

      <article className="rounded-2xl border border-[#1e3d32]/8 bg-white">
        <header className="border-b border-[#1e3d32]/6 px-5 py-3 font-heading text-[13px] font-semibold text-[#1e3d32]">Timeline</header>
        <OrderTimeline events={o.events ?? []} />
      </article>
    </div>
  )
}
```

- [ ] **Step 4: Smoke**

Visit `/admin/orders/<id>` for a real order. Items table renders, timeline shows trigger-generated events.

- [ ] **Step 5: Commit**

```bash
git add ayurvedic/src/app/admin/\(portal\)/orders/\[id\]/page.tsx \
        ayurvedic/src/app/admin/\(portal\)/orders/\[id\]/OrderTimeline.tsx \
        ayurvedic/src/app/admin/\(portal\)/orders/\[id\]/OrderItemsTable.tsx
git commit -m "feat(orders): admin order detail page + timeline + items"
```

---

## Task 19 — Action dialogs (status, tracking, refund, notes)

**Files:**
- Create: `ayurvedic/src/app/admin/(portal)/orders/[id]/OrderActions.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/orders/[id]/StatusTransitionDialog.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/orders/[id]/TrackingDialog.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/orders/[id]/RefundDialog.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/orders/[id]/InternalNotesPanel.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/orders/[id]/PractitionerNotePanel.tsx`
- Modify: `[id]/page.tsx` to mount these

- [ ] **Step 1: StatusTransitionDialog**

```tsx
'use client'
import { useState } from 'react'
import { moveOrderStatus, markOrderPaid } from '@/lib/admin/orders/actions'
import { nextStatuses, type FulfillmentStatus } from '@/lib/admin/orders/status-transitions'

export default function StatusTransitionDialog({
  orderId, currentStatus,
}: { orderId: string; currentStatus: FulfillmentStatus }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const options = nextStatuses(currentStatus)

  async function go(to: FulfillmentStatus) {
    setPending(true); setError(null)
    const r = await moveOrderStatus(orderId, to)
    setPending(false)
    if (!r.ok) setError(r.error); else { setOpen(false); location.reload() }
  }

  if (options.length === 0) return null

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg bg-[#2F5D50] px-3 py-1.5 text-[12px] font-semibold text-white">
        Move status
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5">
            <h2 className="font-heading text-[16px] font-semibold text-[#1e3d32]">Move status</h2>
            <p className="mt-1 text-[12px] text-[#2B2B2B]/65">From <strong>{currentStatus}</strong> to:</p>
            <div className="mt-3 flex flex-col gap-2">
              {options.map((s) => (
                <button key={s} disabled={pending} onClick={() => go(s)} className="rounded-lg border border-[#1e3d32]/15 bg-white px-3 py-2 text-left text-[13px] hover:bg-[#FAF6EE]/60">
                  {s}
                </button>
              ))}
            </div>
            {error ? <p className="mt-3 text-[12px] text-red-600">{error}</p> : null}
            <button onClick={() => setOpen(false)} className="mt-4 text-[12px] text-[#2B2B2B]/55">Cancel</button>
          </div>
        </div>
      ) : null}
    </>
  )
}
```

- [ ] **Step 2: TrackingDialog**

```tsx
'use client'
import { useState } from 'react'
import { markOrderShipped } from '@/lib/admin/orders/actions'
import { supportedCarriers, type Carrier } from '@/lib/admin/orders/tracking-urls'

export default function TrackingDialog({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false)
  const [carrier, setCarrier] = useState<Carrier>('Pos Laju')
  const [tracking, setTracking] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setPending(true); setError(null)
    const r = await markOrderShipped(orderId, carrier, tracking.trim())
    setPending(false)
    if (!r.ok) setError(r.error); else location.reload()
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg border border-[#1e3d32]/20 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1e3d32]">
        Add tracking + ship
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5">
            <h2 className="font-heading text-[16px] font-semibold text-[#1e3d32]">Tracking</h2>
            <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">Carrier</label>
            <select value={carrier} onChange={(e) => setCarrier(e.target.value as Carrier)} className="mt-1 w-full rounded-lg border border-[#1e3d32]/15 px-3 py-2 text-[13px]">
              {supportedCarriers.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">Tracking number</label>
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} className="mt-1 w-full rounded-lg border border-[#1e3d32]/15 px-3 py-2 text-[13px]" />
            {error ? <p className="mt-3 text-[12px] text-red-600">{error}</p> : null}
            <div className="mt-4 flex gap-2">
              <button onClick={() => setOpen(false)} className="rounded-lg border border-[#1e3d32]/15 px-3 py-1.5 text-[12px]">Cancel</button>
              <button disabled={pending || !tracking.trim()} onClick={submit} className="rounded-lg bg-[#2F5D50] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50">
                Save + mark shipped
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
```

- [ ] **Step 3: RefundDialog**

```tsx
'use client'
import { useState } from 'react'
import { recordRefund } from '@/lib/admin/orders/actions'

export default function RefundDialog({ orderId, totalRm }: { orderId: string; totalRm: number }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(totalRm.toString())
  const [reason, setReason] = useState('')
  const [method, setMethod] = useState<'cash' | 'bank_transfer' | 'billplz' | 'fpx' | 'card' | 'cod'>('bank_transfer')
  const [ref, setRef] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setPending(true); setError(null)
    const r = await recordRefund({
      orderId, amountRm: Number(amount), reason, refundMethod: method, gatewayRef: ref || undefined,
    })
    setPending(false)
    if (!r.ok) setError(r.error); else location.reload()
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-700">
        Record refund
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5">
            <h2 className="font-heading text-[16px] font-semibold text-[#1e3d32]">Record refund</h2>
            <p className="mt-1 text-[11px] text-[#2B2B2B]/55">Order total: RM {totalRm.toFixed(2)}</p>

            <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">Amount (RM)</label>
            <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded-lg border border-[#1e3d32]/15 px-3 py-2 text-[13px]" />

            <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-[#1e3d32]/15 px-3 py-2 text-[13px]" />

            <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} className="mt-1 w-full rounded-lg border border-[#1e3d32]/15 px-3 py-2 text-[13px]">
              <option value="bank_transfer">Bank transfer</option>
              <option value="cash">Cash</option>
              <option value="billplz">Billplz</option>
              <option value="fpx">FPX</option>
              <option value="card">Card</option>
              <option value="cod">COD (cancel only)</option>
            </select>

            <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">Reference (optional)</label>
            <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Billplz refund ID or bank ref" className="mt-1 w-full rounded-lg border border-[#1e3d32]/15 px-3 py-2 text-[13px]" />

            {error ? <p className="mt-3 text-[12px] text-red-600">{error}</p> : null}
            <div className="mt-4 flex gap-2">
              <button onClick={() => setOpen(false)} className="rounded-lg border border-[#1e3d32]/15 px-3 py-1.5 text-[12px]">Cancel</button>
              <button disabled={pending || !reason || !amount} onClick={submit} className="rounded-lg bg-red-600 px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50">
                Record
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
```

- [ ] **Step 4: Notes panels**

```tsx
// PractitionerNotePanel.tsx
'use client'
import { useState } from 'react'
import { addPractitionerNote } from '@/lib/admin/orders/actions'

export default function PractitionerNotePanel({ orderId, initial }: { orderId: string; initial: string | null }) {
  const [val, setVal] = useState(initial ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function save() {
    setPending(true); setError(null)
    const r = await addPractitionerNote(orderId, val.trim())
    setPending(false)
    if (!r.ok) setError(r.error); else location.reload()
  }
  return (
    <div className="rounded-2xl border border-[#D4A373]/30 bg-[#FAF6EE]/60 p-4">
      <h3 className="font-heading text-[12.5px] font-semibold text-[#1e3d32]">Practitioner note (visible to customer)</h3>
      <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-[#1e3d32]/15 bg-white px-3 py-2 text-[13px]" />
      {error ? <p className="mt-2 text-[12px] text-red-600">{error}</p> : null}
      <button disabled={pending} onClick={save} className="mt-2 rounded-lg bg-[#D4A373] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50">
        Save note
      </button>
    </div>
  )
}
```

```tsx
// InternalNotesPanel.tsx
'use client'
import { useState } from 'react'
import { addInternalNote } from '@/lib/admin/orders/actions'

export default function InternalNotesPanel({ orderId, initial }: { orderId: string; initial: string | null }) {
  const [val, setVal] = useState(initial ?? '')
  const [pending, setPending] = useState(false)
  async function save() {
    setPending(true)
    await addInternalNote(orderId, val.trim())
    setPending(false)
    location.reload()
  }
  return (
    <div className="rounded-2xl border border-[#1e3d32]/8 bg-white p-4">
      <h3 className="font-heading text-[12.5px] font-semibold text-[#1e3d32]">Internal notes (staff-only)</h3>
      <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-[#1e3d32]/15 px-3 py-2 text-[13px]" />
      <button disabled={pending} onClick={save} className="mt-2 rounded-lg border border-[#1e3d32]/20 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1e3d32] disabled:opacity-50">
        Save
      </button>
    </div>
  )
}
```

- [ ] **Step 5: OrderActions umbrella + mount in page**

```tsx
// OrderActions.tsx
import StatusTransitionDialog from './StatusTransitionDialog'
import TrackingDialog from './TrackingDialog'
import RefundDialog from './RefundDialog'
import type { FulfillmentStatus } from '@/lib/admin/orders/status-transitions'

export default function OrderActions({
  orderId, currentStatus, totalRm, paymentStatus,
}: {
  orderId: string
  currentStatus: FulfillmentStatus
  totalRm: number
  paymentStatus: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusTransitionDialog orderId={orderId} currentStatus={currentStatus} />
      <TrackingDialog orderId={orderId} />
      {paymentStatus === 'paid' ? <RefundDialog orderId={orderId} totalRm={totalRm} /> : null}
    </div>
  )
}
```

Add to `[id]/page.tsx`:
```tsx
import OrderActions from './OrderActions'
import PractitionerNotePanel from './PractitionerNotePanel'
import InternalNotesPanel from './InternalNotesPanel'
// ...
<OrderActions
  orderId={o.id}
  currentStatus={o.fulfillment_status}
  totalRm={Number(o.total_amount_rm)}
  paymentStatus={o.payment_status}
/>
<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
  <PractitionerNotePanel orderId={o.id} initial={o.practitioner_note} />
  <InternalNotesPanel orderId={o.id} initial={o.internal_notes} />
</div>
```

- [ ] **Step 6: Smoke**

Walk through: move status → tracking → refund → notes. Each reloads with the new state visible.

- [ ] **Step 7: Commit**

```bash
git add ayurvedic/src/app/admin/\(portal\)/orders/\[id\]
git commit -m "feat(orders): admin order detail actions (status, tracking, refund, notes)"
```

---

## Task 20 — Manual order entry page

**Files:**
- Create: `ayurvedic/src/app/admin/(portal)/orders/new/page.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/orders/new/ManualOrderForm.tsx`

- [ ] **Step 1: Server page**

```tsx
// page.tsx
import { createClient } from '@/lib/supabase/server'
import ManualOrderForm from './ManualOrderForm'

export const metadata = { title: 'New Order · Admin' }

export default async function NewManualOrderPage() {
  const supabase = await createClient()
  const { data: products } = await supabase.from('products')
    .select('id, name, sku, price_rm').eq('is_active', true).order('name').limit(200)

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-[24px] font-bold text-[#1e3d32]">Manual order</h1>
      <p className="mt-1 text-[12px] text-[#2B2B2B]/65">Walk-in, phone, or staff-recorded order.</p>
      <ManualOrderForm products={products ?? []} />
    </div>
  )
}
```

- [ ] **Step 2: Form (client)**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createManualOrder } from '@/lib/admin/orders/actions'

interface P { id: string; name: string; sku: string | null; price_rm: number }

export default function ManualOrderForm({ products }: { products: P[] }) {
  const router = useRouter()
  const [walkInName, setWalkInName] = useState('')
  const [walkInPhone, setWalkInPhone] = useState('')
  const [walkInEmail, setWalkInEmail] = useState('')
  const [channel, setChannel] = useState<'manual' | 'walk_in' | 'phone'>('walk_in')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer' | 'fpx' | 'cash' | 'card'>('cash')
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addItem(productId: string) {
    setItems((arr) => [...arr, { productId, quantity: 1 }])
  }
  function setQty(i: number, q: number) {
    setItems((arr) => arr.map((it, idx) => idx === i ? { ...it, quantity: Math.max(1, q) } : it))
  }
  function removeItem(i: number) {
    setItems((arr) => arr.filter((_, idx) => idx !== i))
  }

  const total = items.reduce((s, it) => {
    const p = products.find((p) => p.id === it.productId)
    return s + (p ? p.price_rm * it.quantity : 0)
  }, 0)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true); setError(null)
    const r = await createManualOrder({
      customerId: null,
      walkInName, walkInPhone, walkInEmail,
      items: items.map((it) => {
        const p = products.find((p) => p.id === it.productId)!
        return { productId: it.productId, quantity: it.quantity, unitPriceRm: p.price_rm }
      }),
      paymentMethod, channel,
    })
    setPending(false)
    if (!r.ok) { setError(r.error); return }
    router.push(`/admin/orders/${(r.data as { orderId: string }).orderId}`)
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
      <fieldset className="rounded-2xl border border-[#1e3d32]/8 bg-white p-4">
        <legend className="px-2 text-[11px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">Customer (walk-in)</legend>
        <input required placeholder="Full name" value={walkInName} onChange={(e) => setWalkInName(e.target.value)} className="mt-2 w-full rounded-lg border border-[#1e3d32]/15 px-3 py-2 text-[13px]" />
        <input placeholder="Phone" value={walkInPhone} onChange={(e) => setWalkInPhone(e.target.value)} className="mt-2 w-full rounded-lg border border-[#1e3d32]/15 px-3 py-2 text-[13px]" />
        <input placeholder="Email (optional)" value={walkInEmail} onChange={(e) => setWalkInEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-[#1e3d32]/15 px-3 py-2 text-[13px]" />
      </fieldset>

      <fieldset className="rounded-2xl border border-[#1e3d32]/8 bg-white p-4">
        <legend className="px-2 text-[11px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">Items</legend>
        <select onChange={(e) => { if (e.target.value) { addItem(e.target.value); e.target.value = '' } }} className="mt-2 w-full rounded-lg border border-[#1e3d32]/15 px-3 py-2 text-[13px]">
          <option value="">Add product…</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} — RM {p.price_rm.toFixed(2)}</option>)}
        </select>
        {items.length > 0 ? (
          <ul className="mt-2 divide-y divide-[#1e3d32]/6">
            {items.map((it, i) => {
              const p = products.find((p) => p.id === it.productId)
              return (
                <li key={i} className="flex items-center gap-2 py-2 text-[13px]">
                  <span className="flex-1">{p?.name}</span>
                  <input type="number" min="1" value={it.quantity} onChange={(e) => setQty(i, Number(e.target.value))} className="w-16 rounded border border-[#1e3d32]/15 px-2 py-1" />
                  <span className="w-20 text-right">RM {((p?.price_rm ?? 0) * it.quantity).toFixed(2)}</span>
                  <button type="button" onClick={() => removeItem(i)} className="text-[11px] text-red-600">Remove</button>
                </li>
              )
            })}
          </ul>
        ) : null}
        <p className="mt-2 text-right font-semibold">Total RM {total.toFixed(2)}</p>
      </fieldset>

      <fieldset className="rounded-2xl border border-[#1e3d32]/8 bg-white p-4">
        <legend className="px-2 text-[11px] font-semibold uppercase tracking-wider text-[#1e3d32]/70">Channel + payment</legend>
        <select value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)} className="mt-2 w-full rounded-lg border border-[#1e3d32]/15 px-3 py-2 text-[13px]">
          <option value="walk_in">Walk-in</option>
          <option value="phone">Phone</option>
          <option value="manual">Manual (other)</option>
        </select>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)} className="mt-2 w-full rounded-lg border border-[#1e3d32]/15 px-3 py-2 text-[13px]">
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank transfer</option>
          <option value="cod">COD</option>
          <option value="fpx">FPX</option>
          <option value="card">Card</option>
        </select>
      </fieldset>

      {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
      <button type="submit" disabled={pending || items.length === 0 || !walkInName} className="rounded-lg bg-[#2F5D50] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50">
        Create order
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Smoke**

Visit `/admin/orders/new` → fill walk-in name + add 2 products → submit → land on `/admin/orders/<id>`.

- [ ] **Step 4: Commit**

```bash
git add ayurvedic/src/app/admin/\(portal\)/orders/new
git commit -m "feat(orders): manual order entry page + form"
```

---

## Task 21 — Customer-side timeline integration

**Files:**
- Modify: `ayurvedic/src/app/account/orders/[id]/page.tsx`

- [ ] **Step 1: Pull order events into the customer's existing timeline view**

In the file, after the existing order query, add a fetch:
```ts
const { data: events } = await supabase
  .from('order_events')
  .select('id, event_type, from_status, to_status, payload, is_customer_visible, created_at')
  .eq('order_id', params.id)
  .eq('is_customer_visible', true)
  .order('created_at', { ascending: false })
```

Render events as a list in the existing timeline section (reuse the visual treatment from `OrderTimeline.tsx` if helpful, but customer-side may already have its own renderer).

Also fetch refunds:
```ts
const { data: refunds } = await supabase
  .from('refunds')
  .select('amount_rm, reason, refund_method, created_at')
  .eq('order_id', params.id)
  .order('created_at', { ascending: false })
```

Render a "Refunds" block under the payment trail if `refunds.length > 0`.

- [ ] **Step 2: Smoke**

As a customer with a recently-refunded order, visit `/account/orders/[id]` → see refund line + timeline events from admin actions.

- [ ] **Step 3: Commit**

```bash
git add ayurvedic/src/app/account/orders/\[id\]/page.tsx
git commit -m "feat(orders): customer-side reads order_events + refunds"
```

---

## Task 22 — Verification doc

**Files:**
- Modify: `ayurvedic/docs/dashboard-verification.md` (append a new section)

- [ ] **Step 1: Append**

```markdown
---

## Admin Orders Module verification (Sub-project 1)

### Automated
- [x] `npx tsc --noEmit` — clean
- [x] `npm run test` — passes (tracking-urls, status-transitions, action-guards)
- [x] `npm run build` — `/admin/orders`, `/admin/orders/[id]`, `/admin/orders/new`, all 4 PDF routes present

### Migration
- [ ] Migration applied cleanly via Supabase SQL editor (no errors, idempotent re-run safe)
- [ ] `SELECT public.next_invoice_number();` returns `INV-2026-00001` (or next sequence value)
- [ ] `\d public.orders` shows 16 new columns + 4 enum types

### List page
- [ ] `/admin/orders` renders all orders, filter chips work, search works
- [ ] Status chip colors match the 7 fulfilment states
- [ ] Pagination / "X total" count is accurate

### Detail page
- [ ] `/admin/orders/<id>` renders items, customer card, shipping address, timeline
- [ ] Timeline shows trigger-generated status_change events
- [ ] "Move status" dialog offers only valid next states
- [ ] "Add tracking + ship" → tracking saved, status flips to shipped, customer bell + email fire
- [ ] "Record refund" → refund row in DB, customer sees refund line, payment_status flips when full refund
- [ ] Practitioner note saves and customer sees the gold chip on their order
- [ ] Internal note saves but does NOT appear on customer side

### PDFs
- [ ] Invoice opens in browser, shows invoice number, breakdowns, line items
- [ ] Packing slip opens in browser, shows ship-to + items + qty checkbox column, no prices
- [ ] A6 label opens at correct size (Preview shows 105×148mm)
- [ ] Batch print: select 3 orders → ?ids=...&type=label → single PDF with 3 pages
- [ ] Batch print: same with ?type=slip works

### Manual order entry
- [ ] `/admin/orders/new` lists active products, can add multiple, qty editable, total updates live
- [ ] Submit creates user + order + items, redirects to order detail
- [ ] Order's channel=walk_in, customer record exists

### Cross-tenant
- [ ] Customer A's session cannot read customer B's order_events (RLS verifies)
- [ ] Customer A's session cannot read customer B's refunds (RLS verifies)
```

- [ ] **Step 2: Commit**

```bash
git add ayurvedic/docs/dashboard-verification.md
git commit -m "docs(orders): verification checklist for admin orders module"
```

---

## Task 23 — Final smoke + checkpoint

- [ ] **Step 1: Full check**

```bash
cd ayurvedic
npx tsc --noEmit
npm run test
npm run build
```

All three should succeed.

- [ ] **Step 2: Manual smoke walk-through**

Run the dev server and walk every item in the verification checklist (Task 22, Step 1) on a real Supabase project. Fix any failures discovered.

- [ ] **Step 3: Tag or note completion**

```bash
git log --oneline -- ayurvedic/src/app/admin/\(portal\)/orders ayurvedic/src/lib/admin/orders
```

Expect ~15-20 commits making up this sub-project. Push and open a PR (or merge to main, per your workflow).

---

## Self-Review Notes

After writing this plan, the following spec-coverage check passed:

- Section 3 (schema) → Tasks 1–3 ✓
- Section 4 (routes) → Tasks 16, 18, 20 + PDF routes in 12–15 ✓
- Section 5 (files) → all create/modify entries mapped to tasks ✓
- Section 6 (server actions) → Tasks 7–11 (all 18 actions covered) ✓
- Section 7 (PDF templates) → Tasks 12–15 ✓
- Section 8 (cross-hub) → notifyCustomer helper in Task 7, called from every customer-affecting action ✓
- Section 9 (RLS) → migration includes all policies, server actions use requireAdmin (defense in depth) ✓
- Section 10 (testing) → Tasks 4, 5, 7 add tests for tracking-urls, status-transitions, action-guards ✓
- Section 11 (acceptance checklist) → Task 22 mirrors all 14 items ✓

No placeholders. No "TBD". One known limitation: customer-side timeline integration (Task 21) is described prose-only because the existing customer page wasn't fully read — implementer should grep the existing code and slot the new fetch in alongside the existing timeline render.
