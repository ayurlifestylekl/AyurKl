# Sub-Project 2 — Admin Products + Inventory Module

> **Status:** Approved 2026-05-19, ready for implementation plan
> **Owner:** Sanjay Gunabalan / Aurexis Solution
> **Hard deadline:** 2026-06-02/03 (handover)
> **Source:** `docs/admin-master-inventory.md` Section A.2 (Products) + A.3 (Inventory) + Section E (build order #2)
> **Est. effort:** ~3 days of focused work

## 1. Goal

Build the admin-side Products + Inventory module so the client can list, edit, and manage their full Ayurvedic catalogue (medicines, oils, capsules, churnas, kits) and track stock movements with an immutable ledger. The storefront already renders products from Supabase; this sub-project adds the back-office tools needed before the client can enter the first 20 SKUs (per Week 4 of their timeline).

## 2. Scope

### In v1
- Schema migration: add 15+ new columns to `products` + `stock_movements` ledger table + `product_bundle_items` link table
- Admin products list with filters + search
- Add/edit product form (all Ayurvedic-specific fields: ingredients, dosage, contraindications, dosha indication, certifications)
- Image upload (multi-image, Supabase Storage `product-images` bucket)
- Bundle composition (link multiple products as a kit)
- Stock levels view with low-stock + out-of-stock + expiring-soon filters
- Stock adjustment modal (receive / write-off / recount with reason + actor)
- Per-product stock movement log
- CSV export of all products
- CSV import with row-level validation
- Active / draft / archived workflow
- Demo-data mocks for `demo-admin@kerala-ayurvedic.dev`

### Out of v1 (deferred)
- Sanity bidirectional sync
- Variants table (use separate product rows per variant for now)
- Proper category taxonomy (text column suffices for 20 SKUs)
- Sales velocity + re-order suggestions
- Stocktake / physical count mode
- Barcode generator
- Bulk price update across category
- Product reviews moderation (separate module, Section B.10)

## 3. Schema migration

File: `supabase/migrations/20260520_products_admin.sql` (idempotent, safe to re-run)

### 3.1. New enums

```sql
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
```

### 3.2. New columns on `products`

```sql
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug                  TEXT UNIQUE,
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
  ADD COLUMN IF NOT EXISTS low_stock_threshold   INT,                       -- null = use global default
  ADD COLUMN IF NOT EXISTS allow_backorder       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expiry_date           DATE,
  ADD COLUMN IF NOT EXISTS tags                  TEXT[],
  ADD COLUMN IF NOT EXISTS status                public.product_status_enum NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS meta_title            TEXT,
  ADD COLUMN IF NOT EXISTS meta_description      TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url          TEXT,
  ADD COLUMN IF NOT EXISTS weight_grams          INT,
  ADD COLUMN IF NOT EXISTS image_urls            TEXT[],                    -- additional images beyond image_url
  ADD COLUMN IF NOT EXISTS featured              BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by_admin_id   UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS updated_at            TIMESTAMPTZ NOT NULL DEFAULT now();

-- Backfill slug for existing rows if any (from name)
UPDATE public.products
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;
```

### 3.3. `stock_movements` ledger table

```sql
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  movement_type       public.stock_movement_type_enum NOT NULL,
  quantity_delta      INT NOT NULL,                  -- positive = stock added, negative = stock removed
  reason              TEXT,
  reference_order_id  UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  actor_id            UUID REFERENCES public.users(id) ON DELETE SET NULL,
  cost_price_rm       DECIMAL(10,2),                 -- for 'received' movements (PO cost)
  expiry_date         DATE,                          -- for 'received' (track batch expiry)
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stock_movements_product_id_idx
  ON public.stock_movements(product_id, created_at DESC);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manages stock movements" ON public.stock_movements;
CREATE POLICY "Admin manages stock movements" ON public.stock_movements
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
```

### 3.4. `product_bundle_items` link table

```sql
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

-- Public can read bundle composition for storefront rendering
DROP POLICY IF EXISTS "Public reads bundle items" ON public.product_bundle_items;
CREATE POLICY "Public reads bundle items" ON public.product_bundle_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manages bundle items" ON public.product_bundle_items;
CREATE POLICY "Admin manages bundle items" ON public.product_bundle_items
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
```

### 3.5. Storage bucket for product images

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read product images (public storefront)
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Only admins can upload/update/delete
CREATE POLICY "Admin writes product images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'product-images' AND public.is_admin()
  ) WITH CHECK (
    bucket_id = 'product-images' AND public.is_admin()
  );
```

### 3.6. Trigger: keep `products.stock_qty` in sync with movements

```sql
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
```

### 3.7. Trigger: bump `updated_at` on products updates

```sql
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

## 4. Routes

Two distinct workspaces — **Products** (catalog) and **Inventory** (stock & movements). Same underlying `products` table; different perspectives, different filters, different actions.

### `/admin/products` — catalog workspace

| Path | Purpose |
|---|---|
| `/admin/products` | List with catalog columns (name, SKU, price, category, status, featured). Filters: status, category, featured, tags |
| `/admin/products/new` | Add product form (all Ayurvedic catalog fields) |
| `/admin/products/[id]` | Edit product (catalog fields, images, bundles, SEO). Sidebar shows current stock + link to `/admin/inventory/[id]` |
| `/admin/products/import` | CSV import flow |
| `/admin/products/export` | CSV export GET endpoint |

### `/admin/inventory` — stock workspace

| Path | Purpose |
|---|---|
| `/admin/inventory` | List with stock columns (name, SKU, current stock, threshold, last received, expiry, status chip). Filters: low stock, out of stock, expiring ≤60 days, recently received, by category |
| `/admin/inventory/[id]` | Stock detail for one SKU: current qty + low-stock threshold + expiry, full stock movement log (newest first), action buttons: Receive / Write-off / Recount. Sidebar shows product summary + link to `/admin/products/[id]` |

### Cross-links
- Each product detail page links to its inventory page ("View stock history →")
- Each inventory detail page links to its product page ("Edit product details →")
- Dashboard "Low stock" card already links to `/admin/inventory?filter=low-stock` (or will, after this build)

## 5. Files to create / modify

### Create — schema + helpers
- `supabase/migrations/20260520_products_admin.sql`
- `src/lib/admin/products/queries.ts`
- `src/lib/admin/products/actions.ts`
- `src/lib/admin/products/mocks.ts`
- `src/lib/admin/products/slug.ts`
- `src/lib/admin/products/csv.ts`
- `src/lib/admin/products/__tests__/slug.test.ts`
- `src/lib/admin/products/__tests__/csv.test.ts`

### Create — Products workspace UI
- `src/app/admin/(portal)/products/page.tsx`                    — list
- `src/app/admin/(portal)/products/ProductsTable.tsx`           — table with catalog columns
- `src/app/admin/(portal)/products/ProductsFilters.tsx`         — status / category / featured filters
- `src/app/admin/(portal)/products/BulkActionsBar.tsx`          — bulk archive / set status
- `src/app/admin/(portal)/products/new/page.tsx`
- `src/app/admin/(portal)/products/new/ProductForm.tsx`         — full add/edit form (catalog fields only)
- `src/app/admin/(portal)/products/[id]/page.tsx`               — edit page
- `src/app/admin/(portal)/products/[id]/BundleComposition.tsx`  — link bundle members
- `src/app/admin/(portal)/products/[id]/ImageUploader.tsx`      — multi-image upload
- `src/app/admin/(portal)/products/[id]/StockSummaryCard.tsx`   — sidebar widget: "Current stock: 42 · View history →"
- `src/app/admin/(portal)/products/import/page.tsx`
- `src/app/admin/(portal)/products/import/CsvImportForm.tsx`
- `src/app/admin/(portal)/products/export/route.ts`

### Create — Inventory workspace UI
- `src/app/admin/(portal)/inventory/page.tsx`                   — list with stock columns + filters
- `src/app/admin/(portal)/inventory/InventoryTable.tsx`         — table with stock columns + status chips
- `src/app/admin/(portal)/inventory/InventoryFilters.tsx`       — low / out / expiring / recently received chips
- `src/app/admin/(portal)/inventory/[id]/page.tsx`              — stock detail page for one SKU
- `src/app/admin/(portal)/inventory/[id]/StockMovementsLog.tsx` — full movement history
- `src/app/admin/(portal)/inventory/[id]/ReceiveStockDialog.tsx` — receive new stock with cost + expiry
- `src/app/admin/(portal)/inventory/[id]/WriteOffDialog.tsx`    — damaged/expired write-off
- `src/app/admin/(portal)/inventory/[id]/RecountDialog.tsx`     — physical count reconciliation
- `src/app/admin/(portal)/inventory/[id]/ProductSummaryCard.tsx` — sidebar widget: "Product: Kesha Thailam · Edit →"

### Modify
- `src/lib/database.types.ts` — add new columns + tables
- `src/app/(public)/products/page.tsx` — respect new `status='active'` filter (so draft products don't show)
- `src/app/(public)/products/[slug]/page.tsx` — respect status + render new fields (ingredients, dosage, contraindications, dosha)
- `src/lib/admin/queries.ts` — update `getLowStockProducts` to use per-product threshold

## 6. Server actions

All in `src/lib/admin/products/actions.ts`. Each is `'use server'` with `requireAdminSession()`, Zod validation, and revalidate hooks.

```ts
createProduct(input)
updateProduct(productId, input)
archiveProduct(productId)
restoreProduct(productId)
deleteProduct(productId)             // hard delete — only if never ordered

// stock
adjustStock(productId, type, quantityDelta, reason, costPrice?, expiryDate?, notes?)
// Convenience wrappers:
receiveStock(productId, quantity, costPrice, expiryDate?, notes?)
writeOffStock(productId, quantity, reason)
recountStock(productId, newPhysicalCount, reason)

// bundles
addToBundle(bundleId, componentProductId, quantity)
removeFromBundle(bundleId, componentProductId)

// images
uploadProductImage(productId, file)
deleteProductImage(productId, imageUrl)
reorderProductImages(productId, urls)

// SEO / meta
setProductFeatured(productId, featured)
setProductTags(productId, tags)

// CSV
parseCsvForImport(csvText)           // parse + validate, returns rows + errors
importProductsFromCsv(validatedRows)

// bulk
bulkArchive(productIds)
bulkSetStatus(productIds, status)
```

## 7. Cross-hub effects (Admin → public storefront)

The storefront already reads from `products`. Changes propagate immediately via RLS-bypassed customer reads of `status='active'` rows. There are no `notifications` writes from this module — products are not user-specific.

| Admin action | Storefront effect |
|---|---|
| Create product (status='draft') | Not visible |
| Set status='active' | Appears on `/products` and `/products/[slug]` |
| Adjust price | New price shows on next page load |
| Archive | Removed from listings, existing carts handle gracefully (already-cart logic) |
| Upload image | Image renders from Supabase Storage public URL |
| Update bundle composition | Bundle page shows updated components |

## 8. RLS posture

- `products` already has RLS allowing public SELECT. Add WITH CHECK `is_admin()` on INSERT/UPDATE/DELETE if not already present.
- `stock_movements` — admin only
- `product_bundle_items` — public SELECT, admin all-ops
- Storage `product-images` bucket — public SELECT, admin INSERT/UPDATE/DELETE
- All server actions enforce `requireAdminSession()` (defense in depth)

## 9. Testing approach

### Automated (Vitest)
- Unit tests for `slug.ts` (slugify, ensure unique, handle special chars)
- Unit tests for `csv.ts` (parse, validate rows, handle quoted fields, error reporting)
- Integration test for `createProduct` (happy path + validation failures)
- Integration test for `adjustStock` (delta math + trigger correctness)
- Integration test for bundle composition (cycle prevention: a bundle can't contain itself)

### Manual smoke
- Create a product end-to-end, see it on `/products`
- Archive a product, verify it disappears from storefront but stays in admin list
- Upload 3 images, reorder, delete one
- Build a bundle from 3 component products, verify storefront renders correctly
- Receive 100 units of stock, verify `stock_qty` updated + movement log shows row
- CSV export → modify → import → verify changes applied
- Cross-tenant: signed-out user can read products but not insert/update

## 10. Verification checklist (acceptance)

- [ ] Migration applied cleanly to a fresh DB
- [ ] Migration applied to existing DB (with seeded products) without data loss
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run test` passes
- [ ] `npm run build` succeeds; all new admin routes present
- [ ] Admin products list renders, filters work
- [ ] Add product → product appears with all fields preserved
- [ ] Edit product → changes persist + storefront reflects
- [ ] Multi-image upload works; images render on storefront product page
- [ ] Stock adjustment creates movement row + updates `stock_qty`
- [ ] Stock movement log shows history per product, newest first
- [ ] Low-stock products surface on `/admin/inventory` view
- [ ] Expiring-soon products surface (expiry within 60 days)
- [ ] Bundle composition: bundle of A+B+C renders correctly on storefront
- [ ] CSV export downloads file with all products + correct headers
- [ ] CSV import validates rows, reports errors per line, imports valid rows
- [ ] Demo admin sees mock products when DB has none
- [ ] Public storefront still works (regression check)
- [ ] Existing dashboard low-stock card uses per-product threshold

## 11. Open items (resolve at impl)

- Image upload UX: drag-drop or button-click? → start with button-click, drag-drop polish optional
- CSV column headers: standardise on snake_case matching DB columns
- Slug collision handling: append `-2`, `-3` etc.
- Should existing seeded products be backfilled with `status='active'`? → Yes, via migration (single UPDATE)
