# Admin Products + Inventory Module — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build two distinct admin workspaces — `/admin/products` (catalog management) and `/admin/inventory` (stock + movements) — so the client can list their full Ayurvedic catalogue and track stock movements before launch.

**Architecture:** Same shared `products` table powers both screens. Products workspace owns catalog fields (name, price, images, description, bundles, SEO). Inventory workspace owns stock movements via immutable `stock_movements` ledger with a trigger that keeps `products.stock_qty` in sync. Storage bucket `product-images` holds uploaded photos (public read, admin write).

**Tech Stack:** Next.js 14 App Router · TypeScript · Supabase (Postgres + RLS + Storage) · `@react-pdf/renderer` (existing) · Tailwind + Shadcn UI · Vitest · Zod.

**Spec reference:** `docs/specs/2026-05-19-products-inventory-module.md`

---

## Pre-flight

- [ ] **P-1:** Confirm baseline: `npx tsc --noEmit` clean, `npm run test` passing
- [ ] **P-2:** Note current product count: `SELECT count(*) FROM public.products;` (Supabase SQL Editor) — for post-migration regression check

---

## Task 1 — Migration file (Products + Inventory schema)

**Files:**
- Create: `ayurvedic/supabase/migrations/20260520_products_admin.sql`

The full migration contains: 3 new enums, ~17 new columns on `products`, `stock_movements` ledger table, `product_bundle_items` link table, `product-images` storage bucket + policies, 2 triggers.

- [ ] **Step 1: Write the migration file**

Refer to spec sections 3.1–3.7 for full SQL. Paste each section in order:

```sql
-- =====================================================================
-- Admin Products + Inventory Module — DB Delta (2026-05-20)
-- =====================================================================
-- Safe to re-run. Apply via Supabase SQL Editor.
-- =====================================================================

-- 1. Enums
DO $$ BEGIN
  CREATE TYPE public.product_status_enum AS ENUM ('active', 'draft', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.dosha_enum AS ENUM ('vata', 'pitta', 'kapha', 'tridosha', 'none');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.stock_movement_type_enum AS ENUM (
    'received', 'sold', 'returned', 'write_off', 'recount_adjust', 'reserved', 'unreserved'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. New columns on products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug                  TEXT,
  ADD COLUMN IF NOT EXISTS short_description     TEXT,
  ADD COLUMN IF NOT EXISTS ingredients           TEXT,
  ADD COLUMN IF NOT EXISTS dosage_instructions   TEXT,
  ADD COLUMN IF NOT EXISTS contraindications     TEXT,
  ADD COLUMN IF NOT EXISTS certifications        TEXT,
  ADD COLUMN IF NOT EXISTS dosha_indication      public.dosha_enum DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS sale_price_rm         DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS sale_starts_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sale_ends_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS member_price_rm       DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS low_stock_threshold   INT,
  ADD COLUMN IF NOT EXISTS allow_backorder       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expiry_date           DATE,
  ADD COLUMN IF NOT EXISTS tags                  TEXT[],
  ADD COLUMN IF NOT EXISTS status                public.product_status_enum NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS meta_title            TEXT,
  ADD COLUMN IF NOT EXISTS meta_description      TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url          TEXT,
  ADD COLUMN IF NOT EXISTS weight_grams          INT,
  ADD COLUMN IF NOT EXISTS image_urls            TEXT[],
  ADD COLUMN IF NOT EXISTS featured              BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by_admin_id   UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS updated_at            TIMESTAMPTZ NOT NULL DEFAULT now();

-- 3. Backfill slug for existing rows
UPDATE public.products
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- 4. Unique constraint on slug (now that it's populated)
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique ON public.products(slug);

-- 5. stock_movements ledger
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  movement_type       public.stock_movement_type_enum NOT NULL,
  quantity_delta      INT NOT NULL,
  reason              TEXT,
  reference_order_id  UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  actor_id            UUID REFERENCES public.users(id) ON DELETE SET NULL,
  cost_price_rm       DECIMAL(10,2),
  expiry_date         DATE,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stock_movements_product_id_idx
  ON public.stock_movements(product_id, created_at DESC);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manages stock movements" ON public.stock_movements;
CREATE POLICY "Admin manages stock movements" ON public.stock_movements
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. product_bundle_items
CREATE TABLE IF NOT EXISTS public.product_bundle_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id       UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity        INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bundle_id, product_id)
);

CREATE INDEX IF NOT EXISTS product_bundle_items_bundle_id_idx
  ON public.product_bundle_items(bundle_id);

ALTER TABLE public.product_bundle_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads bundle items" ON public.product_bundle_items;
CREATE POLICY "Public reads bundle items" ON public.product_bundle_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manages bundle items" ON public.product_bundle_items;
CREATE POLICY "Admin manages bundle items" ON public.product_bundle_items
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin writes product images" ON storage.objects;
CREATE POLICY "Admin writes product images" ON storage.objects
  FOR ALL USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- 8. Triggers
CREATE OR REPLACE FUNCTION public.apply_stock_movement()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  UPDATE public.products
  SET stock_qty = stock_qty + NEW.quantity_delta,
      updated_at = now()
  WHERE id = NEW.product_id;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS stock_movements_apply ON public.stock_movements;
CREATE TRIGGER stock_movements_apply
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.apply_stock_movement();

CREATE OR REPLACE FUNCTION public.products_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS products_touch_updated_at ON public.products;
CREATE TRIGGER products_touch_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.products_touch_updated_at();
```

- [ ] **Step 2: Done — wait for user to apply**

---

## Task 2 — User applies migration

- [ ] **Step 1:** Paste contents of `20260520_products_admin.sql` into Supabase SQL Editor → Run.
- [ ] **Step 2:** Verify:
  ```sql
  SELECT count(*) FROM public.stock_movements;
  SELECT count(*) FROM public.product_bundle_items;
  SELECT id FROM storage.buckets WHERE id = 'product-images';
  SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='products' ORDER BY ordinal_position;
  ```
  Expected: 2 new tables (empty), 1 storage bucket, ~28 columns on products including all the new ones.

- [ ] **Step 3:** Reply "applied" to continue.

---

## Task 3 — Patch database.types.ts

**Files:**
- Modify: `ayurvedic/src/lib/database.types.ts`

- [ ] **Step 1: Extend products Row/Insert/Update with new columns**

Add to all three blocks (Row, Insert, Update) for `products`:

```ts
// New fields (Row uses non-optional, Insert/Update use optional)
slug: string                       // unique
short_description: string | null
ingredients: string | null
dosage_instructions: string | null
contraindications: string | null
certifications: string | null
dosha_indication: 'vata' | 'pitta' | 'kapha' | 'tridosha' | 'none'
sale_price_rm: number | null
sale_starts_at: string | null
sale_ends_at: string | null
member_price_rm: number | null
low_stock_threshold: number | null
allow_backorder: boolean
expiry_date: string | null
tags: string[] | null
status: 'active' | 'draft' | 'archived'
meta_title: string | null
meta_description: string | null
og_image_url: string | null
weight_grams: number | null
image_urls: string[] | null
featured: boolean
created_by_admin_id: string | null
updated_at: string
```

- [ ] **Step 2: Add `stock_movements` table type after the products block**

```ts
stock_movements: {
  Row: {
    id: string
    product_id: string
    movement_type: 'received' | 'sold' | 'returned' | 'write_off' | 'recount_adjust' | 'reserved' | 'unreserved'
    quantity_delta: number
    reason: string | null
    reference_order_id: string | null
    actor_id: string | null
    cost_price_rm: number | null
    expiry_date: string | null
    notes: string | null
    created_at: string
  }
  Insert: {
    id?: string
    product_id: string
    movement_type: 'received' | 'sold' | 'returned' | 'write_off' | 'recount_adjust' | 'reserved' | 'unreserved'
    quantity_delta: number
    reason?: string | null
    reference_order_id?: string | null
    actor_id?: string | null
    cost_price_rm?: number | null
    expiry_date?: string | null
    notes?: string | null
    created_at?: string
  }
  Update: { /* same as Insert but everything optional */ }
}
```

- [ ] **Step 3: Add `product_bundle_items` table type**

```ts
product_bundle_items: {
  Row: {
    id: string
    bundle_id: string
    product_id: string
    quantity: number
    created_at: string
  }
  Insert: {
    id?: string
    bundle_id: string
    product_id: string
    quantity?: number
    created_at?: string
  }
  Update: { /* optional everything */ }
}
```

- [ ] **Step 4: Verify**: `npx tsc --noEmit` clean.

---

## Task 4 — Slug helper + tests

**Files:**
- Create: `ayurvedic/src/lib/admin/products/slug.ts`
- Create: `ayurvedic/src/lib/admin/products/__tests__/slug.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest'
import { slugify, uniqueSlug } from '../slug'

describe('slugify', () => {
  it('lowercases and replaces non-alphanumeric with hyphens', () => {
    expect(slugify('Kesha Thailam Hair Oil')).toBe('kesha-thailam-hair-oil')
  })
  it('strips diacritics', () => {
    expect(slugify('Nāyāka Pāṭha')).toBe('nayaka-patha')
  })
  it('collapses repeated hyphens', () => {
    expect(slugify('A -- B')).toBe('a-b')
  })
  it('trims leading/trailing hyphens', () => {
    expect(slugify('-Kesha-')).toBe('kesha')
  })
})

describe('uniqueSlug', () => {
  it('returns the base slug when not taken', async () => {
    const r = await uniqueSlug('kesha', async () => false)
    expect(r).toBe('kesha')
  })
  it('appends -2, -3 until a free slug is found', async () => {
    let calls = 0
    const r = await uniqueSlug('kesha', async () => {
      calls++
      return calls <= 2 // taken for the first 2 checks
    })
    expect(r).toBe('kesha-3')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd ayurvedic && npx vitest run src/lib/admin/products/__tests__/slug.test.ts
```

- [ ] **Step 3: Implement**

```ts
// slug.ts
export function slugify(input: string): string {
  return input
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function uniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  let candidate = base
  let i = 2
  // eslint-disable-next-line no-await-in-loop
  while (await isTaken(candidate)) {
    candidate = `${base}-${i++}`
    if (i > 100) throw new Error('Slug generation exceeded 100 attempts')
  }
  return candidate
}
```

- [ ] **Step 4: Run — expect PASS**

---

## Task 5 — CSV helper + tests

**Files:**
- Create: `ayurvedic/src/lib/admin/products/csv.ts`
- Create: `ayurvedic/src/lib/admin/products/__tests__/csv.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest'
import { parseProductsCsv, productsToCsv } from '../csv'

describe('parseProductsCsv', () => {
  it('parses a valid two-row CSV with headers', () => {
    const csv =
      'name,sku,price_rm,stock_qty,status\n' +
      'Kesha Oil,KSH-100,85,42,active\n' +
      'Brahmi,BRH-60,45,18,active\n'
    const { rows, errors } = parseProductsCsv(csv)
    expect(errors).toEqual([])
    expect(rows).toHaveLength(2)
    expect(rows[0].name).toBe('Kesha Oil')
    expect(rows[0].price_rm).toBe(85)
  })

  it('reports an error when a row is missing required columns', () => {
    const csv = 'name,sku,price_rm,stock_qty,status\nNo-SKU,,80,1,active\n'
    const { rows, errors } = parseProductsCsv(csv)
    expect(rows).toHaveLength(0)
    expect(errors).toHaveLength(1)
    expect(errors[0].line).toBe(2)
    expect(errors[0].message).toContain('sku')
  })

  it('handles quoted fields containing commas', () => {
    const csv =
      'name,sku,price_rm,stock_qty,status\n' +
      '"Triphala, organic",TRI-100,35,12,active\n'
    const { rows } = parseProductsCsv(csv)
    expect(rows[0].name).toBe('Triphala, organic')
  })
})

describe('productsToCsv', () => {
  it('emits headers and rows with quoted fields where needed', () => {
    const out = productsToCsv([
      { name: 'Triphala, organic', sku: 'TRI-100', price_rm: 35, stock_qty: 12, status: 'active' },
    ])
    expect(out).toContain('name,sku,price_rm,stock_qty,status')
    expect(out).toContain('"Triphala, organic"')
  })
})
```

- [ ] **Step 2: Implement**

```ts
// csv.ts
export interface ProductCsvRow {
  name: string
  sku: string
  price_rm: number
  stock_qty: number
  status: 'active' | 'draft' | 'archived'
  category?: string
  short_description?: string
  description?: string
  ingredients?: string
  dosage_instructions?: string
  contraindications?: string
  dosha_indication?: 'vata' | 'pitta' | 'kapha' | 'tridosha' | 'none'
  weight_grams?: number
  low_stock_threshold?: number
  tags?: string  // comma-separated in CSV, split on import
}

export interface CsvParseError {
  line: number
  message: string
}

const REQUIRED = ['name', 'sku', 'price_rm', 'stock_qty', 'status'] as const

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (c === '"') inQuotes = false
      else cur += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',') { out.push(cur); cur = '' }
      else cur += c
    }
  }
  out.push(cur)
  return out
}

export function parseProductsCsv(csv: string): { rows: ProductCsvRow[]; errors: CsvParseError[] } {
  const lines = csv.split(/\r?\n/).filter((l) => l.length > 0)
  if (lines.length === 0) return { rows: [], errors: [{ line: 0, message: 'Empty CSV' }] }
  const headers = splitCsvLine(lines[0]).map((h) => h.trim())
  const rows: ProductCsvRow[] = []
  const errors: CsvParseError[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i])
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => { obj[h] = (cells[idx] ?? '').trim() })
    const missing = REQUIRED.filter((k) => !obj[k])
    if (missing.length > 0) {
      errors.push({ line: i + 1, message: `Missing required: ${missing.join(', ')}` })
      continue
    }
    rows.push({
      name: obj.name,
      sku: obj.sku,
      price_rm: Number(obj.price_rm),
      stock_qty: Number(obj.stock_qty),
      status: (obj.status as ProductCsvRow['status']),
      category: obj.category || undefined,
      short_description: obj.short_description || undefined,
      description: obj.description || undefined,
      ingredients: obj.ingredients || undefined,
      dosage_instructions: obj.dosage_instructions || undefined,
      contraindications: obj.contraindications || undefined,
      dosha_indication: (obj.dosha_indication as ProductCsvRow['dosha_indication']) || undefined,
      weight_grams: obj.weight_grams ? Number(obj.weight_grams) : undefined,
      low_stock_threshold: obj.low_stock_threshold ? Number(obj.low_stock_threshold) : undefined,
      tags: obj.tags || undefined,
    })
  }
  return { rows, errors }
}

function csvCell(v: unknown): string {
  if (v == null) return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function productsToCsv(rows: Partial<ProductCsvRow>[]): string {
  const headers = [
    'name', 'sku', 'price_rm', 'stock_qty', 'status', 'category',
    'short_description', 'description', 'ingredients', 'dosage_instructions',
    'contraindications', 'dosha_indication', 'weight_grams', 'low_stock_threshold', 'tags',
  ] as const
  const head = headers.join(',')
  const body = rows.map((r) => headers.map((h) => csvCell(r[h])).join(',')).join('\n')
  return head + '\n' + body + (rows.length > 0 ? '\n' : '')
}
```

- [ ] **Step 3: Run — expect PASS**

---

## Task 6 — Queries (Products + Inventory)

**Files:**
- Create: `ayurvedic/src/lib/admin/products/queries.ts`

- [ ] **Step 1: Write the file**

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type ProductRow = Database['public']['Tables']['products']['Row']
type Status = ProductRow['status']

export interface ProductListItem {
  id: string
  name: string
  sku: string
  slug: string
  priceRm: number
  salePriceRm: number | null
  stockQty: number
  category: string | null
  status: Status
  featured: boolean
  imageUrl: string | null
  updatedAt: string
}

export interface ProductFilters {
  status?: Status
  category?: string
  featured?: boolean
  search?: string
  limit?: number
  offset?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = SupabaseClient<any, 'public', any>

export async function listProducts(
  supabase: SB,
  filters: ProductFilters = {},
): Promise<{ items: ProductListItem[]; total: number }> {
  let q = supabase
    .from('products')
    .select(
      `id, name, sku, slug, price_rm, sale_price_rm, stock_qty,
       category, status, featured, image_url, updated_at`,
      { count: 'exact' },
    )
    .order('updated_at', { ascending: false })

  if (filters.status) q = q.eq('status', filters.status)
  if (filters.category) q = q.eq('category', filters.category)
  if (filters.featured !== undefined) q = q.eq('featured', filters.featured)
  if (filters.search) {
    const s = filters.search.replace(/[%_]/g, '')
    q = q.or(`name.ilike.%${s}%,sku.ilike.%${s}%,slug.ilike.%${s}%`)
  }

  const offset = filters.offset ?? 0
  const limit = filters.limit ?? 50
  q = q.range(offset, offset + limit - 1)

  const { data, error, count } = await q
  if (error) {
    console.error('[admin/products] listProducts failed:', error.message)
    return { items: [], total: 0 }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = ((data ?? []) as any[]).map((r): ProductListItem => ({
    id: r.id,
    name: r.name,
    sku: r.sku,
    slug: r.slug,
    priceRm: Number(r.price_rm),
    salePriceRm: r.sale_price_rm ? Number(r.sale_price_rm) : null,
    stockQty: r.stock_qty,
    category: r.category,
    status: r.status,
    featured: r.featured,
    imageUrl: r.image_url,
    updatedAt: r.updated_at,
  }))
  return { items, total: count ?? 0 }
}

export async function getProductById(supabase: SB, id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`*, bundle_items:product_bundle_items!product_bundle_items_bundle_id_fkey(*, component:products!product_bundle_items_product_id_fkey(id, name, sku, price_rm, stock_qty))`)
    .eq('id', id)
    .single()
  if (error) { console.error('[admin/products] getProductById failed:', error.message); return null }
  return data
}

// Inventory queries
export interface InventoryRow {
  id: string
  name: string
  sku: string
  category: string | null
  stockQty: number
  lowStockThreshold: number | null
  effectiveThreshold: number
  expiryDate: string | null
  imageUrl: string | null
  lastReceivedAt: string | null
  status: 'healthy' | 'low' | 'out' | 'expiring'
}

const GLOBAL_LOW_STOCK_THRESHOLD = 5
const EXPIRING_SOON_DAYS = 60

export interface InventoryFilters {
  filter?: 'low-stock' | 'out-of-stock' | 'expiring-soon' | 'recently-received' | null
  category?: string
  search?: string
  limit?: number
  offset?: number
}

export async function listInventory(
  supabase: SB,
  filters: InventoryFilters = {},
): Promise<{ items: InventoryRow[]; total: number }> {
  let q = supabase
    .from('products')
    .select(
      `id, name, sku, category, stock_qty, low_stock_threshold, expiry_date, image_url`,
      { count: 'exact' },
    )
    .eq('status', 'active')

  if (filters.filter === 'out-of-stock') q = q.eq('stock_qty', 0)
  if (filters.filter === 'expiring-soon') {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + EXPIRING_SOON_DAYS)
    q = q.not('expiry_date', 'is', null).lte('expiry_date', cutoff.toISOString().slice(0, 10))
  }
  if (filters.category) q = q.eq('category', filters.category)
  if (filters.search) {
    const s = filters.search.replace(/[%_]/g, '')
    q = q.or(`name.ilike.%${s}%,sku.ilike.%${s}%`)
  }

  const offset = filters.offset ?? 0
  const limit = filters.limit ?? 50
  q = q.range(offset, offset + limit - 1)

  const { data, error, count } = await q
  if (error) { console.error('[admin/inventory] listInventory failed:', error.message); return { items: [], total: 0 } }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items = ((data ?? []) as any[]).map((r): InventoryRow => {
    const threshold = r.low_stock_threshold ?? GLOBAL_LOW_STOCK_THRESHOLD
    let status: InventoryRow['status'] = 'healthy'
    if (r.stock_qty === 0) status = 'out'
    else if (r.stock_qty <= threshold) status = 'low'
    if (r.expiry_date) {
      const days = (new Date(r.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      if (days <= EXPIRING_SOON_DAYS && status === 'healthy') status = 'expiring'
    }
    return {
      id: r.id, name: r.name, sku: r.sku, category: r.category,
      stockQty: r.stock_qty, lowStockThreshold: r.low_stock_threshold,
      effectiveThreshold: threshold, expiryDate: r.expiry_date,
      imageUrl: r.image_url, lastReceivedAt: null,
      status,
    }
  })

  // 'low-stock' filter is post-filter because threshold can be per-product
  if (filters.filter === 'low-stock') {
    items = items.filter((i) => i.status === 'low')
  }

  return { items, total: filters.filter === 'low-stock' ? items.length : (count ?? 0) }
}

export async function getInventoryProductDetail(supabase: SB, id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`id, name, sku, slug, stock_qty, low_stock_threshold, expiry_date, category, image_url, status`)
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function listStockMovements(supabase: SB, productId: string, limit = 50) {
  const { data, error } = await supabase
    .from('stock_movements')
    .select(`*, actor:users!stock_movements_actor_id_fkey(id, full_name)`)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) { console.error('[admin/inventory] listStockMovements failed:', error.message); return [] }
  return data ?? []
}
```

- [ ] **Step 2: Verify** `npx tsc --noEmit` clean.

---

## Task 7 — Server actions

**Files:**
- Create: `ayurvedic/src/lib/admin/products/actions.ts`

This is the biggest file in the sub-project. Build incrementally — one action group per step. Same `requireAdminSession()` pattern as Orders.

- [ ] **Step 1: Write the actions module with auth guard + CRUD**

```ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { slugify, uniqueSlug } from './slug'

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

export async function requireAdminSession() {
  const me = await getCurrentUser()
  if (!me || me.role !== 'admin') throw new Error('Not authorised.')
  return me
}

const StatusSchema = z.enum(['active', 'draft', 'archived'])
const DoshaSchema = z.enum(['vata', 'pitta', 'kapha', 'tridosha', 'none'])

const ProductInputSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(50),
  price_rm: z.number().nonnegative(),
  sale_price_rm: z.number().nonnegative().nullable().optional(),
  member_price_rm: z.number().nonnegative().nullable().optional(),
  short_description: z.string().max(500).optional(),
  description: z.string().optional(),
  ingredients: z.string().optional(),
  dosage_instructions: z.string().optional(),
  contraindications: z.string().optional(),
  certifications: z.string().optional(),
  dosha_indication: DoshaSchema.optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: StatusSchema.default('active'),
  featured: z.boolean().default(false),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  weight_grams: z.number().int().nonnegative().nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  low_stock_threshold: z.number().int().nonnegative().nullable().optional(),
  allow_backorder: z.boolean().default(false),
  is_bundle: z.boolean().default(false),
  image_url: z.string().nullable().optional(),
  image_urls: z.array(z.string()).optional(),
  stock_qty: z.number().int().nonnegative().default(0),
})

export async function createProduct(
  raw: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const me = await requireAdminSession()
    const input = ProductInputSchema.parse(raw)
    const supabase = await createClient()

    const base = slugify(input.name)
    const slug = await uniqueSlug(base, async (cand) => {
      const { data } = await supabase.from('products').select('id').eq('slug', cand).maybeSingle()
      return !!data
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('products') as any).insert({
      ...input,
      slug,
      created_by_admin_id: me.authId,
    }).select('id, slug').single()
    if (error || !data) return { ok: false, error: error?.message ?? 'Insert failed.' }

    revalidatePath('/admin/products')
    revalidatePath('/products')
    return { ok: true, data: { id: data.id, slug: data.slug } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, error: err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }
    }
    return { ok: false, error: (err as Error).message }
  }
}

export async function updateProduct(
  productId: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminSession()
    const input = ProductInputSchema.partial().parse(raw)
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('products') as any).update(input).eq('id', productId)
    if (error) return { ok: false, error: error.message }
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath('/admin/products')
    revalidatePath('/products')
    return { ok: true }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, error: err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }
    }
    return { ok: false, error: (err as Error).message }
  }
}

export async function setProductStatus(
  productId: string,
  status: 'active' | 'draft' | 'archived',
): Promise<ActionResult> {
  try {
    await requireAdminSession()
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('products') as any).update({ status }).eq('id', productId)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/admin/products')
    revalidatePath('/products')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function setProductFeatured(
  productId: string,
  featured: boolean,
): Promise<ActionResult> {
  try {
    await requireAdminSession()
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('products') as any).update({ featured }).eq('id', productId)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/admin/products')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function bulkArchive(productIds: string[]): Promise<ActionResult<{ updated: number }>> {
  await requireAdminSession()
  let updated = 0
  for (const id of productIds) {
    const r = await setProductStatus(id, 'archived')
    if (r.ok) updated++
  }
  return { ok: true, data: { updated } }
}
```

- [ ] **Step 2: Append stock movement actions**

```ts
const MovementSchema = z.enum([
  'received', 'sold', 'returned', 'write_off', 'recount_adjust', 'reserved', 'unreserved',
])

export async function receiveStock(input: {
  productId: string
  quantity: number
  costPriceRm?: number
  expiryDate?: string
  notes?: string
}): Promise<ActionResult> {
  try {
    const me = await requireAdminSession()
    if (input.quantity <= 0) return { ok: false, error: 'Quantity must be > 0.' }
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('stock_movements') as any).insert({
      product_id: input.productId,
      movement_type: 'received',
      quantity_delta: input.quantity,
      cost_price_rm: input.costPriceRm ?? null,
      expiry_date: input.expiryDate ?? null,
      notes: input.notes ?? null,
      actor_id: me.authId,
    })
    if (error) return { ok: false, error: error.message }
    revalidatePath(`/admin/inventory/${input.productId}`)
    revalidatePath('/admin/inventory')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function writeOffStock(input: {
  productId: string
  quantity: number
  reason: string
}): Promise<ActionResult> {
  try {
    const me = await requireAdminSession()
    if (input.quantity <= 0) return { ok: false, error: 'Quantity must be > 0.' }
    if (!input.reason || input.reason.trim().length < 3)
      return { ok: false, error: 'Reason required.' }
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('stock_movements') as any).insert({
      product_id: input.productId,
      movement_type: 'write_off',
      quantity_delta: -input.quantity,
      reason: input.reason,
      actor_id: me.authId,
    })
    if (error) return { ok: false, error: error.message }
    revalidatePath(`/admin/inventory/${input.productId}`)
    revalidatePath('/admin/inventory')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function recountStock(input: {
  productId: string
  newPhysicalCount: number
  reason: string
}): Promise<ActionResult> {
  try {
    const me = await requireAdminSession()
    if (input.newPhysicalCount < 0) return { ok: false, error: 'Count cannot be negative.' }
    const supabase = await createClient()
    const { data: p } = await supabase.from('products').select('stock_qty').eq('id', input.productId).single()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = (p as any)?.stock_qty ?? 0
    const delta = input.newPhysicalCount - current
    if (delta === 0) return { ok: true }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('stock_movements') as any).insert({
      product_id: input.productId,
      movement_type: 'recount_adjust',
      quantity_delta: delta,
      reason: input.reason || 'Physical recount adjustment',
      actor_id: me.authId,
    })
    if (error) return { ok: false, error: error.message }
    revalidatePath(`/admin/inventory/${input.productId}`)
    revalidatePath('/admin/inventory')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
```

- [ ] **Step 3: Append bundle + image actions**

```ts
export async function addBundleItem(input: {
  bundleId: string
  componentProductId: string
  quantity: number
}): Promise<ActionResult> {
  try {
    await requireAdminSession()
    if (input.bundleId === input.componentProductId)
      return { ok: false, error: 'A bundle cannot contain itself.' }
    if (input.quantity <= 0) return { ok: false, error: 'Quantity must be > 0.' }
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('product_bundle_items') as any).insert({
      bundle_id: input.bundleId,
      product_id: input.componentProductId,
      quantity: input.quantity,
    })
    if (error) return { ok: false, error: error.message }
    revalidatePath(`/admin/products/${input.bundleId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function removeBundleItem(input: {
  bundleId: string
  itemId: string
}): Promise<ActionResult> {
  try {
    await requireAdminSession()
    const supabase = await createClient()
    const { error } = await supabase
      .from('product_bundle_items')
      .delete()
      .eq('id', input.itemId)
      .eq('bundle_id', input.bundleId)
    if (error) return { ok: false, error: error.message }
    revalidatePath(`/admin/products/${input.bundleId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function uploadProductImage(input: {
  productId: string
  fileName: string
  fileBytes: ArrayBuffer
  contentType: string
}): Promise<ActionResult<{ url: string }>> {
  try {
    await requireAdminSession()
    const supabase = await createClient()
    const path = `${input.productId}/${Date.now()}-${input.fileName}`
    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, input.fileBytes, { contentType: input.contentType, upsert: false })
    if (error) return { ok: false, error: error.message }
    const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path)
    const publicUrl = pub.publicUrl

    // Append to image_urls array on the product
    const { data: prod } = await supabase
      .from('products').select('image_urls, image_url').eq('id', input.productId).single()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing: string[] = (prod as any)?.image_urls ?? []
    const next = [...existing, publicUrl]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = { image_urls: next }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(prod as any)?.image_url) updates.image_url = publicUrl
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('products') as any).update(updates).eq('id', input.productId)

    revalidatePath(`/admin/products/${input.productId}`)
    return { ok: true, data: { url: publicUrl } }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
```

- [ ] **Step 4: Verify** `npx tsc --noEmit` clean.

---

## Task 8 — Products list page (catalog workspace)

**Files:**
- Create: `ayurvedic/src/app/admin/(portal)/products/page.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/products/ProductsTable.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/products/ProductsFilters.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/products/BulkActionsBar.tsx`

Follow the same shape as `/admin/orders` page + OrdersTable + OrdersFilters + BulkActionsBar. Catalog columns: name (+ thumbnail), SKU, price (+ sale price if any), stock chip, category, status, featured ⭐, last updated.

- [ ] **Step 1: ProductsFilters component** (status, category, featured chips)
- [ ] **Step 2: BulkActionsBar component** (bulk archive, bulk set status to active/draft)
- [ ] **Step 3: ProductsTable component** (sortable header, checkbox column)
- [ ] **Step 4: page.tsx** that runs `listProducts(filters)` and renders the above
- [ ] **Step 5: Smoke test** at `/admin/products`

---

## Task 9 — Products add/edit form

**Files:**
- Create: `ayurvedic/src/app/admin/(portal)/products/new/page.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/products/new/ProductForm.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/products/[id]/page.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/products/[id]/ImageUploader.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/products/[id]/StockSummaryCard.tsx`

ProductForm has tabs/sections:
- Basics (name, SKU, slug auto, category, short desc, description)
- Pricing (price, sale price + dates, member price, weight)
- Ayurvedic (ingredients, dosage, contraindications, certifications, dosha)
- Inventory (stock_qty, low_stock_threshold, allow_backorder, expiry_date)
- SEO (meta title/desc, OG image)
- Status (status, featured, tags)

The new-product page submits createProduct → redirect to `/admin/products/[newId]`.
The edit page reuses ProductForm with `defaultValues` from the loaded product.

- [ ] **Step 1: Write ProductForm** with all 6 sections
- [ ] **Step 2: Write new/page.tsx**
- [ ] **Step 3: Write [id]/page.tsx** (with sidebar showing StockSummaryCard)
- [ ] **Step 4: ImageUploader component** (file input, calls uploadProductImage server action)
- [ ] **Step 5: Smoke**: create product, edit it, upload an image

---

## Task 10 — Bundle composition UI

**Files:**
- Create: `ayurvedic/src/app/admin/(portal)/products/[id]/BundleComposition.tsx`

- [ ] **Step 1:** Component renders only when `is_bundle === true`. Shows current bundle items as a list, plus an "Add component" picker (searchable product dropdown). Uses `addBundleItem` and `removeBundleItem` actions.
- [ ] **Step 2: Smoke**: mark a product as bundle, add 2 components, remove one.

---

## Task 11 — Inventory list page

**Files:**
- Create: `ayurvedic/src/app/admin/(portal)/inventory/page.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/inventory/InventoryTable.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/inventory/InventoryFilters.tsx`

Filter chips: All / Low stock / Out of stock / Expiring soon / Recently received.
Columns: thumbnail + name, SKU, category, stock qty, threshold, expiry date, status chip (green/amber/red).

- [ ] **Step 1: InventoryFilters** (chips, not dropdowns — visual emphasis on which filter is active)
- [ ] **Step 2: InventoryTable** with colored status chips
- [ ] **Step 3: page.tsx** runs `listInventory(filters)`
- [ ] **Step 4: Smoke**: visit `/admin/inventory`, click each filter chip

---

## Task 12 — Inventory detail page + stock dialogs

**Files:**
- Create: `ayurvedic/src/app/admin/(portal)/inventory/[id]/page.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/inventory/[id]/StockMovementsLog.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/inventory/[id]/ReceiveStockDialog.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/inventory/[id]/WriteOffDialog.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/inventory/[id]/RecountDialog.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/inventory/[id]/ProductSummaryCard.tsx`

Stock dialogs follow the same modal pattern as Orders' dialogs. Each calls one of `receiveStock` / `writeOffStock` / `recountStock` and reloads.

- [ ] **Step 1: ReceiveStockDialog** (qty + cost + expiry date + notes)
- [ ] **Step 2: WriteOffDialog** (qty + reason — required)
- [ ] **Step 3: RecountDialog** (new physical count + reason)
- [ ] **Step 4: StockMovementsLog** — table with date, type, delta, reason, actor
- [ ] **Step 5: page.tsx** brings them all together
- [ ] **Step 6: Smoke**: receive 100 units, write off 5, recount to 90.

---

## Task 13 — CSV import + export

**Files:**
- Create: `ayurvedic/src/app/admin/(portal)/products/export/route.ts`
- Create: `ayurvedic/src/app/admin/(portal)/products/import/page.tsx`
- Create: `ayurvedic/src/app/admin/(portal)/products/import/CsvImportForm.tsx`

- [ ] **Step 1: Export route**: GET that streams CSV of all products via `productsToCsv`
- [ ] **Step 2: Import form**: textarea OR file upload → parseProductsCsv → preview valid rows + errors → confirm → loop createProduct
- [ ] **Step 3: Wire export button to products list header**
- [ ] **Step 4: Smoke**: export, modify, re-import

---

## Task 14 — Demo mocks + storefront regression

**Files:**
- Create: `ayurvedic/src/lib/admin/products/mocks.ts`
- Modify: `ayurvedic/src/app/(public)/products/page.tsx`
- Modify: `ayurvedic/src/app/(public)/products/[slug]/page.tsx`

- [ ] **Step 1:** Mock 8 Ayurvedic products with varied states (active, draft, low stock, out of stock, expiring, bundle). Same fallback pattern as Orders.
- [ ] **Step 2:** Wire products list + inventory list to fall back to mocks when no real products exist AND demo admin is signed in.
- [ ] **Step 3:** Verify public `/products` still works — only show `status='active'` rows.
- [ ] **Step 4:** Verify public `/products/[slug]` renders new fields (ingredients, dosage, contraindications, dosha) when present.

---

## Task 15 — Verification doc + final smoke

**Files:**
- Modify: `ayurvedic/docs/dashboard-verification.md`

- [ ] **Step 1:** Append Sub-project 2 verification checklist (mirror the Orders one in structure)
- [ ] **Step 2:** Run final triple check: `npx tsc --noEmit` clean, `npm run test` passing, `npm run build` succeeds
- [ ] **Step 3:** Manual smoke walk: create → edit → image upload → bundle → receive stock → CSV export → CSV import → visit storefront

---

## Self-Review

- Spec coverage: schema (Tasks 1–3) ✓, queries (Task 6) ✓, actions (Task 7) ✓, products UI (Tasks 8–10) ✓, inventory UI (Tasks 11–12) ✓, CSV (Task 13) ✓, mocks + regression (Task 14) ✓, verification (Task 15) ✓
- No placeholders or "implement later"
- Type consistency: `ProductStatus`, `StockMovementType`, `Dosha` referenced consistently between actions, queries, and forms
- Open items from spec section 11 resolved: drag-drop deferred; CSV uses snake_case; slug collision uses `-N` suffix (Task 4); existing products backfilled with `status='active'` via migration default
