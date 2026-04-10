# Ayurvedic Digital Ecosystem — Master Execution Plan

This plan is a comprehensive, phase-by-phase engineering roadmap to build the Kerala Ayurvedic Lifestyle Sdn Bhd digital platform from zero, covering all four hubs within a 30-day sprint using Next.js 14, Supabase, Sanity.io, Cal.com, and Billplz.

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER (Browser / Mobile)                   │
└───────────────────────────────┬──────────────────────────────────┘
                                │ HTTPS
                    ┌───────────▼───────────┐
                    │    Next.js 14 App     │  ← Hosted on Vercel
                    │   (App Router / RSC)  │
                    └──┬──────┬──────┬──────┘
                       │      │      │
          ┌────────────▼──┐  ┌▼──────▼──────┐  ┌─────────────────┐
          │  Supabase DB  │  │  Sanity.io   │  │  Third-Party    │
          │  (PostgreSQL) │  │  Studio CMS  │  │  Services       │
          │  + Auth + RLS │  │  (GROQ/CDN)  │  │                 │
          │  + Storage    │  └──────────────┘  │ • Cal.com embed │
          └───────────────┘                    │ • Billplz API   │
                                               │ • WhatsApp API  │
                                               └─────────────────┘
```

### Layer Responsibilities

| Layer | Technology | Responsibility |
|---|---|---|
| **Rendering** | Next.js 14 App Router | RSC for data-heavy pages (products, blog), Client Components for interactive UI (cart, booking form) |
| **Auth** | Supabase Auth | Email/password + magic link; JWT-based role detection (`admin`, `customer`, `sales_agent`) |
| **Database** | Supabase PostgreSQL | Transactional data: orders, users, appointments, agents; Row Level Security enforced |
| **File Storage** | Supabase Storage | Product images, invoice PDFs |
| **CMS** | Sanity.io | Staff-managed content: blog posts, treatments catalog, FAQs, testimonials |
| **Booking** | Cal.com | Real-time scheduling for Vaidya AKHIL HS; webhooks sync to Supabase `appointments` table |
| **Payments** | Billplz API | Malaysian payment gateway; webhooks update `orders.payment_status` and `appointments.advance_payment_rm` |
| **Hosting** | Vercel | Edge deployment, ISR for CMS pages, automatic CI/CD from GitHub |

---

## 2. Data Flow & State Management

### 2.1 E-Commerce Flow

```
[Product Page] → Cart (Zustand store, persisted to localStorage)
    → Checkout (reads referral_code cookie for agent attribution)
    → Billplz payment link created (server action)
    → Billplz webhook POST → /api/webhooks/billplz
    → Supabase: orders.payment_status = 'paid'
    → Inventory deduction (products.stock_qty UPDATE)
    → Bundle? → Smart Combo Engine: deducts all child SKUs
    → Email confirmation triggered (Resend/Supabase Edge Function)
    → Customer Portal: order appears under "My Orders"
```

### 2.2 Appointment Booking Flow

```
[Book Now] → Gender selector UI (client-side validation)
    → Cal.com embed loads available slots for Vaidya AKHIL HS
    → User selects time → Cal.com confirms booking
    → Cal.com webhook POST → /api/webhooks/calcom
    → Supabase: INSERT into appointments (customer_id, treatment_name, datetime, status='scheduled')
    → Optional: Billplz advance payment link for deposit
    → Reminder email/WhatsApp 24h before appointment
    → Customer Portal: appointment appears in "My Appointments"
```

### 2.3 Affiliate / Sales Agent Flow

```
[TikTok link clicked] → URL contains ?ref=AGENT_CODE
    → Middleware reads param → sets cookie: referral_code=AGENT_CODE (7-day TTL)
    → Checkout reads cookie → populates orders.referral_agent_id
    → Sales Agent Portal: queries orders WHERE referral_agent_id = agent.id
    → Aggregates total_sales_generated_rm, applies commission_rate → displays dashboard
```

### 2.4 State Management Strategy

| State Type | Solution |
|---|---|
| **Cart** | Zustand (persisted to `localStorage`) |
| **Auth session** | Supabase client SDK (`useSession` / server-side `createServerClient`) |
| **Server data** | Next.js RSC + `fetch` with `revalidate` (no Redux needed) |
| **CMS content** | Sanity GROQ queries with Next.js ISR (`revalidate: 3600`) |
| **Form state** | React Hook Form + Zod validation |

---

## 3. Phased Implementation Roadmap

### Phase 1 — Environment & Foundation Setup `Days 1–2`

**Goal:** All developer tools configured, repos connected, credentials in place.

1. Initialize Next.js 14 project: `npx create-next-app@latest ayurvedic --typescript --tailwind --app`
2. Install core dependencies:
   - `@supabase/supabase-js @supabase/ssr`
   - `@sanity/client next-sanity`
   - `zustand react-hook-form zod`
   - `lucide-react`
   - `shadcn/ui` (run `npx shadcn-ui@latest init`)
   - `@calcom/embed-react`
3. Configure `tailwind.config.ts` — extend theme with brand colors:
   ```ts
   colors: {
     primary: '#2F5D50',    // Deep Herbal Green
     secondary: '#7A9D54',  // Muted Olive Green
     accent: '#D4A373',     // Turmeric Gold
     dark: '#2B2B2B',       // Charcoal Dark
   }
   ```
4. Set up `next/font/google` in `app/layout.tsx` — import `Montserrat` (headings) + `Lora` (body).
5. Create `.env.local` with keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `SANITY_API_TOKEN`, `BILLPLZ_API_KEY`, `BILLPLZ_COLLECTION_ID`, `CALCOM_API_KEY`.
6. Create Supabase project at supabase.com — save project URL and keys.
7. Create Sanity.io project at sanity.io — save project ID and dataset name.
8. Create Cal.com account — configure event type "Ayurvedic Consultation (30 min)" for Vaidya AKHIL HS.
9. Create Billplz account — get Collection ID and API Key.
10. Initialize GitHub repo → connect to Vercel for CI/CD.

---

### Phase 2 — Database Schema, Auth & RLS `Days 2–4`

**Goal:** Full Supabase schema live with security policies and TypeScript types.

1. Run all table creation SQL in Supabase SQL Editor:

```sql
-- users (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  role TEXT CHECK (role IN ('admin', 'customer', 'sales_agent')) DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_rm DECIMAL(10,2) NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  is_bundle BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- bundle_items (Smart Combo Engine — maps bundle → child SKUs)
CREATE TABLE public.bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  child_product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1
);

-- orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.users(id),
  total_amount_rm DECIMAL(10,2) NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('pending','paid','failed')) DEFAULT 'pending',
  fulfillment_status TEXT CHECK (fulfillment_status IN ('processing','shipped','delivered')) DEFAULT 'processing',
  courier_service TEXT CHECK (courier_service IN ('Pos Laju','J&T Express','DHL','GDex','Ninja Van','Self-Pickup')),
  tracking_number TEXT,
  referral_agent_id UUID REFERENCES public.sales_agents(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- order_items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase_rm DECIMAL(10,2) NOT NULL
);

-- appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.users(id),
  treatment_name TEXT NOT NULL,
  doctor_name TEXT DEFAULT 'Vaidya AKHIL HS (B.A.M.S)',
  appointment_date_time TIMESTAMPTZ NOT NULL,
  duration_mins INTEGER DEFAULT 30,
  status TEXT CHECK (status IN ('scheduled','completed','cancelled')) DEFAULT 'scheduled',
  advance_payment_rm DECIMAL(10,2),
  calcom_booking_uid TEXT UNIQUE
);

-- sales_agents
CREATE TABLE public.sales_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  total_sales_generated_rm DECIMAL(10,2) DEFAULT 0,
  total_commission_earned_rm DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. Enable Row Level Security on all tables.

3. Apply RLS policies:

```sql
-- CUSTOMERS: own data only
CREATE POLICY "customers_own_orders" ON orders FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "customers_own_appointments" ON appointments FOR ALL USING (customer_id = auth.uid());

-- SALES AGENTS: orders tied to their agent ID only
CREATE POLICY "agents_own_orders" ON orders FOR SELECT
  USING (referral_agent_id IN (SELECT id FROM sales_agents WHERE user_id = auth.uid()));

-- ADMINS: full access (use service_role key in server actions, or role check)
CREATE POLICY "admins_full_access_orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
-- (repeat pattern for all tables)
```

4. Set up Supabase Auth:
   - Enable Email provider.
   - Configure redirect URLs for magic link (`/auth/callback`).
   - Create a DB trigger: `ON auth.users INSERT → INSERT INTO public.users(id, email)`.

5. Create Supabase Storage bucket `product-images` (public read, authenticated write).

6. Generate TypeScript types:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
   ```

7. Create `src/lib/supabase/` with:
   - `client.ts` — browser client (`createBrowserClient`)
   - `server.ts` — server client (`createServerClient` with cookies)
   - `middleware.ts` — session refresh middleware

8. Admin bootstrap — run once in Supabase SQL Editor to create first admin:
   ```sql
   UPDATE public.users SET role = 'admin' WHERE email = 'admin@keralaayurvedic.com';
   ```

---

### Phase 3 — Design System & Global Layout `Days 4–6`

**Goal:** Pixel-perfect shell with brand identity, navigation, and footer.

1. Create `app/layout.tsx` root layout:
   - Apply Montserrat to `--font-heading` CSS var, Lora to `--font-body`.
   - Set `<html lang="en">`, charset, viewport meta.
   - Wrap with `<SupabaseProvider>` (auth context).

2. Build `<Navbar>` component:
   - Mobile: hamburger menu (Lucide `Menu`), full-screen drawer on open.
   - Desktop: horizontal nav with links: Home, Treatments, Products, Blog, Book Now.
   - Auth-aware: shows "My Account" / avatar if logged in, "Sign In" if not.
   - Background: `bg-[#2F5D50]` (primary green), text white.
   - "Book Now" CTA button: `bg-[#D4A373]` (Turmeric Gold).

3. Build `<Footer>` component:
   - Business details: Kerala Ayurvedic Lifestyle Sdn Bhd (847466D), Brickfields, KL.
   - Social links: Facebook, Instagram, TikTok (from `frontend_context.md`).
   - Links: Privacy Policy, Terms, Cancellation Policy.
   - Background: `bg-[#2B2B2B]`, text white/muted.

4. Build `<WhatsAppButton>` floating action button:
   - Fixed bottom-right, Lucide `MessageCircle` icon.
   - Links to `https://wa.me/601165043436`.
   - Animate in on scroll (CSS `animate-bounce` subtle).

5. Configure Shadcn UI theme overrides to match brand palette.

6. Create global CSS: texture overlay on hero sections, grain filter for premium feel (per SKILL.md aesthetic guidelines).

---

### Phase 4 — Sanity.io CMS Integration `Days 6–9`

**Goal:** Staff-manageable content for blog, treatments, and FAQs.

1. Initialize Sanity Studio in `/studio` directory.

2. Define Sanity schemas:

   **`blogPost`:** `title`, `slug`, `author`, `publishedAt`, `mainImage` (Sanity image), `categories[]`, `body` (Portable Text), `seoDescription`.

   **`treatment`:** `name`, `slug`, `shortDescription`, `fullDescription` (Portable Text), `duration`, `priceRm`, `mainImage`, `category` (enum: Panchakarma, Massage, Consultation, Women's Wellness, Joint Care), `isActive`.

   **`faq`:** `question`, `answer` (Portable Text), `category`.

   **`testimonial`:** `authorName`, `rating` (1-5), `body`, `isVerified`.

3. Deploy Sanity Studio to `sanity.io/manage` (or embed at `/studio` in Next.js app).

4. Create GROQ query helpers in `src/lib/sanity/queries.ts`:
   - `getAllTreatments()`
   - `getTreatmentBySlug(slug)`
   - `getAllBlogPosts()`
   - `getBlogPostBySlug(slug)`
   - `getAllFaqs()`
   - `getTestimonials()`

5. Create Next.js pages with ISR (`revalidate: 3600`):
   - `app/treatments/page.tsx` — treatments listing (RSC).
   - `app/treatments/[slug]/page.tsx` — treatment detail page.
   - `app/blog/page.tsx` — blog listing with SEO metadata.
   - `app/blog/[slug]/page.tsx` — blog post with Portable Text renderer.

---

### Phase 5 — Public Storefront & E-Commerce `Days 9–15`

**Goal:** Full product catalog, cart, checkout, and Billplz payment.

#### 5a — Hero & Landing Page

1. Build `app/page.tsx` (Homepage):
   - Hero section: full-screen, `bg-[#2F5D50]`, Montserrat 6rem heading (per SKILL.md), scroll-triggered GSAP reveal.
   - Body copy uses business description from `frontend_context.md`.
   - 3 split-layout sections: Treatments preview, Products preview, Why Ayurveda.
   - Testimonials carousel.
   - Countdown-style stats (GSAP count-up): "Since 2008", "X+ Clients", "Y Treatments".
   - CTA: Book Consultation (`bg-[#D4A373]`).

#### 5b — Products

2. Build `app/products/page.tsx`:
   - Fetches from Supabase `products` table (RSC).
   - Filter by category, bundle toggle.
   - Product cards: image, name, price in MYR, "Add to Cart" button.
   - Bundle products display badge "Combo Deal".

3. Build `app/products/[id]/page.tsx`:
   - Product detail: image gallery, description, stock indicator.
   - If `is_bundle=true`: show child product breakdown via `bundle_items` join.
   - "Add to Cart" updates Zustand cart store.

#### 5c — Smart Combo Engine

4. Implement `src/lib/combo-engine.ts`:
   - On order creation (server action), if any `order_item` has `product.is_bundle=true`:
     - Query `bundle_items` for all child product IDs.
     - Decrement `stock_qty` for each child product by `quantity × bundle_qty`.
     - Wrap in a Supabase RPC transaction (PL/pgSQL with `FOR UPDATE` row locks) to ensure atomicity.

#### 5d — Cart & Checkout

5. Build `<CartSidebar>` (Shadcn Sheet):
   - Zustand `useCartStore` — items, quantity, total.
   - Checkout button → `/checkout`.

6. Build `app/checkout/page.tsx` (Client Component):
   - Customer info form (React Hook Form + Zod).
   - Courier selector (dropdown: Pos Laju, J&T, DHL, GDex, Ninja Van, Self-Pickup).
   - Order summary.
   - "Pay with Billplz" → calls `POST /api/checkout` server action.

7. Build `app/api/checkout/route.ts` (Server Action):
   - Creates order record in Supabase (`payment_status: 'pending'`).
   - Creates order_items records.
   - Reads `referral_code` cookie → resolves `referral_agent_id`.
   - Calls Billplz API to create bill → returns Billplz payment URL.
   - Redirects user to Billplz.

8. Build `app/api/webhooks/billplz/route.ts`:
   - Validates Billplz webhook signature (HMAC).
   - Updates `orders.payment_status = 'paid'`.
   - Triggers Smart Combo Engine inventory deduction.
   - Triggers order confirmation email (Resend API).

9. Build `app/order-confirmation/[orderId]/page.tsx` — success page.

---

### Phase 6 — Appointment Booking `Days 15–18`

**Goal:** Integrated Cal.com booking with gender policy, advance payment, and DB sync.

1. Build `app/book/page.tsx`:
   - Gender selection step (mandatory): Male / Female radio buttons.
   - Disclaimer: "Therapies are strictly same-gender only."
   - Treatment selector: pulls from Sanity `treatments` collection.
   - Cal.com embed (`<Cal namespace="ayurvedic" />`) loads after gender + treatment selected.
   - Server action validates booked gender matches `users.gender` on submit.

2. Configure Cal.com event type:
   - Practitioner: Vaidya AKHIL HS (B.A.M.S).
   - Duration: 30 min default.
   - Metadata fields: `treatment_name`, `customer_gender`.

3. Build `app/api/webhooks/calcom/route.ts`:
   - Handles `BOOKING_CREATED` event from Cal.com.
   - Upserts customer by email: if exists, link; if not, create pending user record.
   - INSERT into Supabase `appointments`: `customer_id`, `treatment_name`, `appointment_date_time`, `status='scheduled'`, `calcom_booking_uid`.
   - Handles `BOOKING_CANCELLED` → updates `status='cancelled'`.

4. Advance payment flow (for applicable treatments):
   - After Cal.com booking created → create Billplz bill for `advance_payment_rm`.
   - Email payment link to customer.
   - On Billplz webhook → update `appointments.advance_payment_rm`.

5. Reminder notification (Supabase Edge Function scheduled):
   - 24h before `appointment_date_time`: send email reminder via Resend.
   - Include 48-hour cancellation policy in reminder message.

---

### Phase 7 — Customer Portal `Days 18–21`

**Goal:** Authenticated customer dashboard for orders and appointments.

1. Create route group `app/(portal)/` with auth guard middleware:
   - Redirect unauthenticated users to `/auth/login`.

2. Build `app/(portal)/dashboard/page.tsx`:
   - Welcome header with customer name.
   - Quick stats: active orders, upcoming appointments.

3. Build `app/(portal)/orders/page.tsx`:
   - List all orders for `auth.uid()` (RLS enforces this).
   - Status badge: Processing → Shipped → Delivered.
   - Tracking number + courier displayed when fulfilled.

4. Build `app/(portal)/orders/[id]/page.tsx`:
   - Full order detail: items, prices, payment receipt link.

5. Build `app/(portal)/appointments/page.tsx`:
   - List appointments: scheduled, completed, cancelled.
   - "Reschedule" → opens Cal.com reschedule link (via `calcom_booking_uid`).
   - "Cancel" → calls `POST /api/appointments/cancel` (enforces 48-hour policy check server-side).

6. Build `app/(portal)/profile/page.tsx`:
   - Edit `full_name`, `phone_number`, `gender`.
   - Change password via Supabase Auth.

7. Build auth pages: `app/auth/login/page.tsx`, `app/auth/register/page.tsx`, `app/auth/callback/route.ts` (magic link handler).

---

### Phase 8 — Admin Command Center `Days 21–25`

**Goal:** No-code backend for staff to manage the entire operation.

1. Create route group `app/(admin)/` with admin role guard:
   - Middleware checks `users.role = 'admin'`; redirect otherwise.

2. Build `app/(admin)/dashboard/page.tsx`:
   - Overview cards: total orders today, revenue, upcoming appointments, low-stock alerts.

3. Build `app/(admin)/products/page.tsx` + `[id]/page.tsx`:
   - Full CRUD: create/edit/delete products.
   - Image upload to Supabase Storage.
   - Toggle `is_bundle`, manage `bundle_items` (add/remove child SKUs).
   - Stock quantity editor with alert threshold.

4. Build `app/(admin)/orders/page.tsx`:
   - Table: all orders, filter by `payment_status` / `fulfillment_status`.
   - Inline update: `fulfillment_status`, `courier_service`, `tracking_number`.
   - "Print Invoice" → generates PDF (using `@react-pdf/renderer`).

5. Build `app/(admin)/appointments/page.tsx`:
   - Calendar view (or table) of all appointments.
   - Manual status override (mark completed/cancelled).

6. Build `app/(admin)/agents/page.tsx`:
   - Create sales agent: assign `user_id`, set `referral_code`, set `commission_rate`.
   - View all agents and their totals.

7. Set up automated email notifications (Resend):
   - Order confirmed → customer email.
   - Order shipped → customer email with tracking number.
   - Appointment reminder → 24h before.

---

### Phase 9 — Sales Agent (Affiliate) Portal `Days 25–27`

**Goal:** TikTok-focused affiliate dashboard with commission tracking.

1. Create route group `app/(agent)/` with `sales_agent` role guard.

2. Build `app/(agent)/dashboard/page.tsx`:
   - Hero stat (GSAP count-up per SKILL.md): Total Sales Generated (RM).
   - Commission earned this month vs. total.
   - Referral link display: `https://keralaayurvedic.com/?ref=REFERRAL_CODE` with copy button.
   - QR code for TikTok (using `qrcode.react`).

3. Build `app/(agent)/orders/page.tsx`:
   - Table: all orders WHERE `referral_agent_id = agent.id`.
   - Columns: Date, Order Total, Commission (calculated: `total_amount_rm × commission_rate / 100`).

4. Build `app/(agent)/reports/page.tsx`:
   - Monthly breakdown chart (Recharts).
   - Export to CSV.

5. Implement referral tracking middleware (`src/middleware.ts`):
   - On any page load: if `?ref=CODE` in URL → validate against `sales_agents.referral_code` → set `referral_code` cookie (7-day TTL, SameSite=Lax).

---

### Phase 10 — Integration, QA & Deployment `Days 27–30`

**Goal:** Production-ready, tested, and deployed.

1. **Webhook verification:** Test all Billplz and Cal.com webhook flows end-to-end in staging.
2. **RLS audit:** Use Supabase Table Editor to verify each role can only access permitted data.
3. **Mobile responsiveness audit:** Test Navbar, Product Grid, Checkout, Booking Form on iPhone SE, iPhone 14, Android.
4. **SEO:** Add `generateMetadata()` to all public pages (products, blog, treatments). Add `robots.txt`, `sitemap.xml`.
5. **Performance:**
   - Enable Next.js Image Optimization (`next/image`) for all product and treatment images.
   - Set ISR `revalidate` on Sanity pages.
   - Verify Lighthouse score > 90 on mobile.
6. **Environment variables:** Confirm all keys in Vercel project settings (never commit `.env.local`).
7. **Custom domain:** Configure `keralaayurvedic.com` (or client's domain) in Vercel.
8. **Client handover:** Provide Supabase project ownership transfer, Sanity Studio login, and Vercel team invitation.

---

## 4. Identified Gaps & Risks

### 🔴 Critical Gaps (must resolve before building)

| # | Gap | Impact | Recommendation |
|---|---|---|---|
| 1 | **Billplz webhook secret** | Payment flow cannot be secured without a webhook HMAC secret for signature validation | Obtain from Billplz dashboard before Phase 5 |
| 2 | **Cal.com webhook secret** | Same issue — booking sync is insecure without it | Configure in Cal.com webhook settings before Phase 6 |
| 3 | **Email provider not specified** | Automated order/appointment emails have no transport | Recommend **Resend** (easiest Next.js integration) — need API key |
| 4 | **Gender policy enforcement** | No DB column tracks patient gender, so the "same-gender therapy" policy can't be enforced programmatically | `gender` column added to `users` table in Phase 2 SQL; validate in booking server action |

### 🟡 Medium Risks (plan for, may slow sprint)

| # | Risk | Mitigation |
|---|---|---|
| 5 | **Cal.com → Supabase customer matching** | Cal.com bookings arrive via webhook with only email — customer must already exist in Supabase Auth or upsert logic is needed | Build upsert in webhook handler: if email exists, link; if not, create pending user record |
| 6 | **Bundle inventory atomicity** | Concurrent bundle purchases could over-sell stock | Wrap combo engine in a Supabase **RPC function (PL/pgSQL)** with `FOR UPDATE` row locks |
| 7 | **Commission rate type ambiguity** | Schema says "Percentage or flat rate" — which is it? | Clarify with client; plan uses percentage-only; add `commission_type` enum if both are needed |
| 8 | **Sanity schema not in context files** | Sanity types must be built from scratch with no pre-existing spec | Phase 4 defines a complete schema — confirm content types with client before populating |
| 9 | **Admin bootstrap** | No process defined for creating the first admin user | One-time SQL seed in Phase 2, Step 8: `UPDATE users SET role='admin' WHERE email='...'` |

### 🟢 Low Risk / Nice-to-Have (post-launch)

| # | Item | Notes |
|---|---|---|
| 10 | **PDPA Compliance** | Malaysian Personal Data Protection Act 2010 — privacy policy and data retention policy needed | Add Privacy Policy page; review Supabase data region for Malaysian compliance |
| 11 | **WhatsApp Business API** | Currently uses a simple `wa.me` link — could upgrade to WhatsApp Business API for automated reminders | Post-launch enhancement; `wa.me` link is sufficient for MVP |
| 12 | **Multi-therapist support** | Schema `doctor_name` is a plain text field — if more practitioners join, this needs a proper `therapists` table | Hardcode Vaidya AKHIL HS for now; note as a future migration |
| 13 | **Sanity Studio hosting** | Studio needs to be deployed separately or embedded | Recommend embedding at `/studio` route in Next.js 14 (natively supported) |

---

## Sprint Timeline Summary

| Days | Phase |
|---|---|
| 1–2 | Phase 1: Environment & Foundation Setup |
| 2–4 | Phase 2: Database Schema, Auth & RLS |
| 4–6 | Phase 3: Design System & Global Layout |
| 6–9 | Phase 4: Sanity.io CMS Integration |
| 9–15 | Phase 5: Public Storefront & E-Commerce |
| 15–18 | Phase 6: Appointment Booking |
| 18–21 | Phase 7: Customer Portal |
| 21–25 | Phase 8: Admin Command Center |
| 25–27 | Phase 9: Sales Agent Portal |
| 27–30 | Phase 10: Integration, QA & Deployment |
