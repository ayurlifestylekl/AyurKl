# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Always Do First
- **Invoke the `frontend-design` skill** (registered at [.claude/skills/frontend-design/](.claude/skills/frontend-design/)) before writing any frontend code, every session, no exceptions.

## Repository Layout

This directory is a project workspace, not the app root. The actual Next.js codebase lives in [ayurvedic/](ayurvedic/). Sibling files at the top level are planning/spec docs:

- [projectbrief.md](projectbrief.md) — client, scope, business rules (Kerala Ayurvedic Lifestyle Sdn Bhd, Brickfields KL).
- [frontend_context.md](frontend_context.md) — brand colors, typography, copy, contact details. **Source of truth for design tokens.**
- [supabase_schema.md](supabase_schema.md) — canonical DB schema (users, products, orders, order_items, appointments, sales_agents) and RLS rules.
- [master_execution_plan.md](master_execution_plan.md) — 30-day sprint plan.
- [SKILL1.md](SKILL1.md) — workflow notes.
- Reference images at project root: `Ayur1.png`, `ayur2.png`, `bnr-img-bg.png` — use these as design references when relevant.

When making product, schema, or UI decisions, consult these docs first — they encode requirements that aren't in code yet.

## Commands

All commands run from [ayurvedic/](ayurvedic/):

```bash
npm run dev      # next dev (http://localhost:3000)
npm run build    # next build
npm run start    # next start
npm run lint     # next lint
```

Supabase schema bootstrap: [ayurvedic/supabase/setup.sql](ayurvedic/supabase/setup.sql).

## Architecture

**Hybrid stack** (per projectbrief.md): Next.js 14 App Router for frontend/SEO, Supabase (PostgreSQL + Auth) for transactional data, Sanity.io for CMS content (blogs/FAQs/treatments — not yet wired), Cal.com for booking, Billplz for MYR payments.

**Four hubs sharing one Next.js app:**
1. Public Storefront — products, bundles ("Combo Engine"), blog, booking CTA.
2. Customer Portal — auth-gated order tracking + appointment management.
3. Admin Command Center — inventory, invoices, content, comms.
4. Sales Agent Portal — TikTok referral tracking, commission dashboards.

These are separated by `role` on the `users` table (`admin` | `customer` | `sales_agent`), enforced via Supabase RLS — see [supabase_schema.md](supabase_schema.md) for the policy contract.

**Supabase access pattern:** SSR via `@supabase/ssr`. Two clients exist:
- [ayurvedic/src/lib/supabase/server.ts](ayurvedic/src/lib/supabase/server.ts) — server components, route handlers, server actions.
- [ayurvedic/src/lib/supabase/client.ts](ayurvedic/src/lib/supabase/client.ts) — client components only.
- [ayurvedic/src/middleware.ts](ayurvedic/src/middleware.ts) — refreshes auth cookies on every request.

Generated DB types live in [ayurvedic/src/lib/database.types.ts](ayurvedic/src/lib/database.types.ts) and must stay in sync with `supabase_schema.md` / `setup.sql`.

**Server actions** go in [ayurvedic/src/actions/](ayurvedic/src/actions/) (e.g. [db-test.ts](ayurvedic/src/actions/db-test.ts)). Prefer server actions over API routes for mutations.

**Local content** (FAQs, therapies, products, categories, etc.) lives in [ayurvedic/src/data/](ayurvedic/src/data/) as typed TS arrays until Sanity is wired in.

## Design System (non-negotiable)

From [frontend_context.md](frontend_context.md) — use these exact values, not Tailwind defaults:

- **Primary** Deep Herbal Green `#2F5D50` — primary buttons, navbar.
- **Secondary** Muted Olive `#7A9D54`.
- **Accent** Turmeric Gold `#D4A373` — "Book Now" / CTA buttons only.
- **Text** Charcoal `#2B2B2B`.
- **Headings** Montserrat (600–800), **Body** Lora — load via `next/font/google` in root layout.
- Icons: `lucide-react`. Animations: `framer-motion`.
- Mobile-first, generous spacing (`py-16`, `gap-8`), luxury wellness mood.

Tailwind theme tokens: [ayurvedic/tailwind.config.ts](ayurvedic/tailwind.config.ts).

## Business Rules That Affect Code

- All bookings default to **Vaidya AKHIL HS (B.A.M.S)** — hardcode as default for `appointments.doctor_name`.
- Therapies are **strictly same-gender** (male↔male, female↔female) — booking flow must enforce.
- **48-hour cancellation** notice; advance payments are **non-refundable** — surface in booking UI and reflect in `appointments.advance_payment_rm`.
- Pricing is in **MYR (RM)**; payment gateway is **Billplz**.
- WhatsApp floating button routes to **+601165043436**.

## RLS Contract

When writing queries or new tables, preserve:
- Customers: read/update only their own `orders` and `appointments`.
- Sales agents: read only `orders` where `referral_agent_id` matches their agent id.
- Admins: full CRUD.

## Anti-Generic Design Guardrails

These apply to all frontend work — Next.js components and one-off prototypes alike.

- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Use the project palette above; derive shades from those.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair Montserrat (display) with Lora (body). Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules

- Do not add sections, features, or content not in the reference.
- Do not "improve" a reference design — match it.
- Do not use `transition-all`.
- Do not use default Tailwind blue/indigo as primary color.

---

## One-Off HTML Prototype Workflow

Use this section **only when explicitly asked to build a single-file HTML mockup** (e.g. "build me a quick prototype of section X"). Do not apply these rules to the real Next.js app in [ayurvedic/](ayurvedic/).

### Output defaults for prototypes
- Single `index.html` file, all styles inline.
- Tailwind via CDN: `<script src="https://cdn.tailwindcss.com"></script>`.
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`.
- Mobile-first responsive.

### Reference image discipline
- If a reference image is provided, match layout, spacing, typography, and color exactly. Swap in placeholder content; do not improve or add to the design.
- Iterate with at least 2 comparison rounds: screenshot → compare → fix mismatches → re-screenshot. Stop only when no visible differences remain or the user says so.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px".
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing.

### Local server & screenshots
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Two helper scripts live at the workspace root:
  - [serve.mjs](serve.mjs) — zero-dep static server. Serves `cwd` on `http://localhost:3000`. Override with `PORT=4000 node serve.mjs`.
  - [screenshot.mjs](screenshot.mjs) — Puppeteer headless screenshot CLI. Saves to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Workflow:
  - Start the dev server: `node serve.mjs` (run in background; do not start a second instance if one is already running — check with `lsof -ti:3000`).
  - Take a screenshot: `node screenshot.mjs http://localhost:3000` → `./temporary screenshots/screenshot-N.png`.
  - Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → `screenshot-N-label.png`.
  - Override viewport: `VIEWPORT=375x812 node screenshot.mjs http://localhost:3000 mobile`.
  - Override full-page: `FULL_PAGE=false node screenshot.mjs http://localhost:3000` (viewport only, no scroll capture).
  - Read the PNG from `temporary screenshots/` with the Read tool — Claude can analyze the image directly.
- Dependency: `screenshot.mjs` needs Puppeteer. Install once with `npm install` from the workspace root (uses [package.json](package.json)). Puppeteer downloads its own Chromium build (~170MB) on first install.
