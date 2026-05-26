# Treatments Page Redesign — 3-Level Architecture

> **Status:** Drafted 2026-05-26, awaiting user review before plan
> **Owner:** Sanjay Gunabalan / Aurexis Solution
> **Source:** Brainstorm session 2026-05-25/26 (see `.superpowers/brainstorm/59727-1779723709/content/*.html`)
> **Replaces:** Existing single-page `TreatmentsMenu` ("Gilt Manuscript") at `/treatments`

---

## 1. Goal

Replace the current single-page treatments catalogue with a three-level hub-and-spoke architecture so each therapy gets a dedicated, image-rich landing page that the clinic can edit independently from Sanity.

- **Level 1** — `/treatments`: hero + grid of category boxes (one per `treatmentCategory`).
- **Level 2** — `/treatments/[categorySlug]`: hero strip + grid of therapy cards for that category.
- **Level 3** — `/treatments/[categorySlug]/[treatmentSlug]`: full editorial detail page with hero image, gallery, overview, benefits, procedure, contraindications, booking CTAs, and related therapies. Includes a horizontal therapy switcher at the top + prev/next pager at the bottom for in-category navigation.

Each therapy page must be reachable at its own URL for SEO. No public price field — pricing happens via consultation.

## 2. Scope

### In v1

- Sanity schema additions on `treatmentCategory` (slug, image, description) and `treatment` (slug, heroImage, gallery, body, benefits, procedureSteps, sessionsRecommended, contraindications).
- Three new routes under `src/app/(public)/treatments/`:
  - `page.tsx` (replaces existing — hero + category grid)
  - `[categorySlug]/page.tsx` (new)
  - `[categorySlug]/[treatmentSlug]/page.tsx` (new)
- New GROQ queries for category-by-slug, treatment-by-slug, and in-category siblings (for the switcher + pager).
- All new presentation components (see Section 7).
- `generateStaticParams` + ISR (`revalidate = 30`) so Sanity edits propagate within ~30s without manual rebuilds.
- Metadata + canonical URLs + OG tags per page.
- Mobile collapse rules (sticky bottom booking bar at Level 3; single-column flow throughout).
- Retire the current `TreatmentsMenu`, `TreatmentRow`, `CategoryTabs`, `TreatmentCard` components.

### Out of v1 (deferred)

- Per-therapy pricing display.
- Booking-flow deep-link of a *specific* therapy (Level 3 "Book this treatment" goes to existing `/book/consultation` for now; deferred until the booking module is reviewed).
- A–Z/full-menu index page (the existing "Gilt Manuscript" view is retired with no replacement).
- Therapy reviews / testimonials section.
- Therapist bios beyond the existing Vaidya Akhil credit.
- Search across treatments.
- Filter by condition / dosha.
- i18n (Bahasa Malaysia, Tamil) — copy stays English-only.

### Not changing

- `TreatmentsHero` component — reused at Level 1 (its CTA repoints to anchor the new category grid).
- Brand tokens in `tailwind.config.ts` (cream, primary, accent, fonts).
- Booking destination (`/book/consultation`) and WhatsApp URL.
- Free consultation block — extracted to a shared component but content unchanged.

## 3. Routes & user flow

```
/treatments
  → Hero (existing TreatmentsHero, scroll-to-grid CTA)
  → Grid of N category boxes (Style B with corner accents)
  → Free consultation CTA block
  → Click a box ─────────────────────────────────────────┐
                                                          ▼
/treatments/face-care                                     │
  → Breadcrumb · Chapter number · Title · Description    │
  → Gold rule + therapy count                            │
  → 2-up grid of therapy cards (image + roman numeral    │
    + name + teaser + duration + Read →)                  │
  → Free consultation CTA block                          │
  → Click a card ─────────────────────────────────────────┤
                                                          ▼
/treatments/face-care/mukhalepam                          │
  → Sticky top bar (treatment name + Book →) on scroll   │
  → Therapy switcher strip (chips for siblings, current  │
    highlighted)                                          │
  → Hero image (with category + number tag overlay)      │
  → 3-col editorial body:                                 │
    · Left margin: marginalia (Origin, Sanskrit,         │
      Practitioner, Category)                            │
    · Center column (≤720px): chapter label, title, dek, │
      overview prose, breakout gallery, benefits,        │
      procedure steps, contraindications panel,          │
      bottom CTA block, related therapies                │
    · Right margin: sticky booking card (duration,       │
      sessions, "On consultation", Book + WhatsApp)      │
  → Prev/Next pager at end (sibling therapies)           │
  → Free consultation CTA block                          ┘
```

URLs use slugs (kebab-case from Sanity). Old `/treatments` deep links continue to work — only Level 1 changes layout; routes don't redirect.

## 4. Sanity schema changes

File edits: `src/sanity/schemaTypes/treatment.ts`, `src/sanity/schemaTypes/treatmentCategory.ts`.

### 4.1. `treatmentCategory` — additions

```ts
defineField({
  name: 'slug',
  title: 'URL slug',
  type: 'slug',
  options: { source: 'title', maxLength: 64 },
  validation: r => r.required(),
}),
defineField({
  name: 'image',
  title: 'Category image',
  description:
    'Used as the image panel on the category box on /treatments and on the category page hero.',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: r => r.required() }),
  ],
}),
defineField({
  name: 'description',
  title: 'Short description',
  description:
    'One sentence teaser used on the category box and as the category page dek. Keep under 140 chars.',
  type: 'text',
  rows: 2,
  validation: r => r.max(140),
}),
```

### 4.2. `treatment` — additions

```ts
defineField({
  name: 'slug',
  title: 'URL slug',
  type: 'slug',
  options: { source: 'title', maxLength: 96 },
  validation: r => r.required(),
}),
defineField({
  name: 'heroImage',
  title: 'Hero image',
  description:
    'Strongly recommended. If absent, the page renders a brand-matched fallback panel until a photo is added.',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
  ],
}),
defineField({
  name: 'gallery',
  title: 'Gallery (3–6 images)',
  type: 'array',
  of: [{
    type: 'image',
    options: { hotspot: true },
    fields: [
      defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: r => r.required() }),
    ],
  }],
  validation: r => r.min(3).max(6),
}),
defineField({
  name: 'body',
  title: 'Long-form overview',
  description: 'Portable Text — multiple paragraphs explaining the therapy.',
  type: 'array',
  of: [{ type: 'block' }],
}),
defineField({
  name: 'benefits',
  title: 'Benefits',
  description: 'Short bullet points. 4–8 recommended.',
  type: 'array',
  of: [{ type: 'string' }],
  validation: r => r.min(3),
}),
defineField({
  name: 'procedureSteps',
  title: 'What to expect (procedure steps)',
  type: 'array',
  of: [{
    type: 'object',
    fields: [
      defineField({ name: 'title', title: 'Step title', type: 'string', validation: r => r.required() }),
      defineField({ name: 'description', title: 'Step description', type: 'text', rows: 2, validation: r => r.required() }),
    ],
    preview: { select: { title: 'title', subtitle: 'description' } },
  }],
  validation: r => r.min(2),
}),
defineField({
  name: 'sessionsRecommended',
  title: 'Sessions recommended',
  description: 'Free-text label, e.g. "3–7 sessions" or "Single session".',
  type: 'string',
}),
defineField({
  name: 'contraindications',
  title: 'Not suitable for',
  description: 'Free-text disclaimer paragraph.',
  type: 'text',
  rows: 3,
}),
defineField({
  name: 'order',
  title: 'Display order within category',
  type: 'number',
  description: 'Lower numbers appear first. Controls roman-numeral ordering on category page and switcher.',
  validation: r => r.integer().min(0),
}),
defineField({
  name: 'origin',
  title: 'Origin (marginalia)',
  description: 'Short note for the left margin, e.g. "Kerala tradition, c. 12th century".',
  type: 'string',
}),
defineField({
  name: 'sanskritName',
  title: 'Sanskrit name (marginalia)',
  description: 'Devanagari + transliteration, e.g. "मुख लेपम् · Mukha-lepam".',
  type: 'string',
}),
```

`title`, `duration`, `description`, `category`, `requiresConsultation` remain unchanged. No `price` field is added.

### 4.3. Existing data — backfill plan

The clinic currently has treatments in Sanity without slugs or images. Implementation must:
- Add `slug` and `heroImage` without `required()` initially. Run a one-shot script to populate slugs from existing titles for all existing docs. After backfill, add `required()` on `slug` only; keep `heroImage` non-required so the clinic can ship therapies before all photos are ready.
- The page renders a deep-green diamond-pattern fallback panel ("photo coming soon" caption) for any treatment missing `heroImage`.
- The clinic fills in images, body, benefits, procedure steps, and Sanskrit names progressively.

## 5. Sanity queries

File: `src/sanity/queries.ts`.

### 5.1. Level 1 — categories with treatment count

```groq
*[_type == "treatmentCategory"] | order(order asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  image,
  "treatmentCount": count(*[_type == "treatment" && references(^._id)])
}
```

### 5.2. Level 2 — category by slug + its treatments

```groq
*[_type == "treatmentCategory" && slug.current == $slug][0] {
  _id, title, description, image, order,
  "slug": slug.current,
  "treatments": *[_type == "treatment" && references(^._id)] | order(order asc, title asc) {
    _id, title, duration, description,
    "slug": slug.current,
    heroImage,
    requiresConsultation
  }
}
```

### 5.3. Level 3 — single treatment + siblings (for switcher + pager)

Use two queries (cleaner than nested `^.category._ref` referencing across projection scope). Run with `Promise.all`:

```groq
// TREATMENT_BY_SLUG  (params: $categorySlug, $treatmentSlug)
*[_type == "treatment" && slug.current == $treatmentSlug && category->slug.current == $categorySlug][0] {
  _id, title, duration, description, body, benefits,
  procedureSteps, sessionsRecommended, contraindications,
  origin, sanskritName, requiresConsultation,
  "slug": slug.current,
  heroImage, gallery,
  category-> {
    _id, title, order,
    "slug": slug.current
  }
}

// TREATMENT_SIBLINGS  (params: $categoryId)
*[_type == "treatment" && category._ref == $categoryId] | order(order asc, title asc) {
  _id, title,
  "slug": slug.current,
  "categorySlug": category->slug.current
}
```

The siblings array includes the current treatment — the switcher highlights the matching slug. Pager computes prev/next from this array (wrap-around).

### 5.4. Static params

```groq
// All category slugs
*[_type == "treatmentCategory" && defined(slug.current)][].slug.current

// All category+treatment slug pairs
*[_type == "treatment" && defined(slug.current) && defined(category->slug.current)] {
  "categorySlug": category->slug.current,
  "treatmentSlug": slug.current
}
```

## 6. Page-level designs

All three levels use brand tokens from `tailwind.config.ts` (`cream`, `primary` #2F5D50, `accent` #D4A373, Montserrat heading / Lora body / Playfair display). All keep the existing diamond-pattern overlay + gold gradient hairlines used elsewhere on the site.

### 6.1. Level 1 — `/treatments`

- **Hero** — reuse existing `TreatmentsHero`. Its `onBrowseTreatments` callback now scrolls to the new category grid (`#category-grid` anchor).
- **Category grid** — responsive grid:
  - Mobile (<640px): 1 column
  - Tablet (640–1024px): 2 columns
  - Desktop (≥1024px): 3 columns (max 4 if N≥12)
- **Each box** — Style B with corner accents (locked 2026-05-25):
  - Two-column card: image panel (left, 130–160px wide, ~200px tall) + content panel (right, cream background).
  - Image panel has **gold L-corner accents** at all four corners (10px, accent color, 2px stroke).
  - Content: chapter number (e.g. "01") in accent gold, category title in primary green Montserrat 800, gold gradient hairline, italic Lora teaser (from `description` field), foot row with treatment count + "View →".
  - Whole card is `<Link>` to `/treatments/[slug]`.
  - Hover: `translateY(-3px)` + soft elevated shadow.
- **Fallback** — if a category has no image, image panel renders a deep-green textured block with the diamond pattern, corner accents still present.
- **Free consultation block** — extracted shared component, full-width dark green section, identical to existing.

### 6.2. Level 2 — `/treatments/[categorySlug]`

- **Breadcrumb** — `Treatments / [Category]` in Montserrat 10px tracking 0.22em.
- **Category header**:
  - `CHAPTER 0N` label in accent gold.
  - Title in Montserrat 800, ~36px desktop / 28px mobile.
  - Description (from Sanity) in italic Lora 17px, max-width 620px.
  - Gold gradient hairline.
  - "N Therapies in this chapter" count label.
- **Therapy grid** — 2-column on desktop, 1-column on mobile. Each `TherapyCard`:
  - 130px square image (left) with corner accents.
  - Content: roman numeral (`i.` `ii.` …) in accent gold + Playfair italic, therapy name in primary green Montserrat 800, italic Lora teaser (1 line, from `description`), gold hairline, foot row with duration + "Read →".
  - Whole card is `<Link>` to `/treatments/[categorySlug]/[treatmentSlug]`.
- **Free consultation block** — shared component.
- **No price** anywhere.
- If a category has zero treatments, render an empty state matching the current "Index in preparation" pattern from `TreatmentsMenu`.

### 6.3. Level 3 — `/treatments/[categorySlug]/[treatmentSlug]`

#### 6.3.1. Sticky compact top bar
- Appears once user scrolls past the hero (IntersectionObserver on a sentinel `<div>` above the hero, OR scroll-Y > hero height).
- Deep-green background with 4% accent-gold bottom border.
- Left: "TREATMENT" label (10px, accent, tracking 0.22em) + therapy name (Montserrat 800).
- Right: "Book →" pill (accent background, white text).
- Hidden on initial render (no flash).
- Mobile: same bar, smaller padding.

#### 6.3.2. Therapy switcher strip
- Below sticky bar (always visible on Level 3, not sticky itself — top of page).
- Pale background (4% primary), accent-gold bottom border.
- "Browse this chapter · [Category Name]" mini-label.
- Horizontal scrolling chip row:
  - Each chip: roman numeral (accent) + therapy name (primary).
  - Current chip: deep-green background, white text, roman numeral still accent gold.
  - Touch-scroll on mobile; mouse-drag on desktop (or visible scrollbar).
- Below chips: prev/next text row — `← Previous [name]` (left) and `[name] Next →` (right).
- All entries link to sibling URLs; no JS state, hard navigations.

#### 6.3.3. Hero image
- Full-width, aspect-ratio 21:9 desktop, 4:3 mobile.
- `next/image` with `priority` flag, `sizes="100vw"`.
- Tag overlay top-left: deep-green pill with accent text — `[Category Name] · No. 0N`.
- Fallback: deep-green diamond-pattern panel with "Photo coming soon" italic Lora caption (centered).

#### 6.3.4. 3-column editorial body
- CSS grid: `grid-template-columns: 1fr 720px 1fr`. Gap: 0; padding: ~48px 32px on desktop.
- Above 1280px the center column is 720px wide; the side margins inflate naturally with viewport.
- Below 1024px (tablet/mobile): collapses to single column. Marginalia tucks into a small "About this therapy" panel above the overview. Right-margin booking card moves to a fixed bottom bar.

##### Left margin — marginalia
Four blocks vertically stacked, each with: a 24px gold rule, an accent uppercase label, an italic Lora value. Fields:
- **Origin** ← `treatment.origin` (omit block if null)
- **Sanskrit** ← `treatment.sanskritName` (Devanagari font from existing `--font-devanagari`)
- **Practitioner** — hardcoded "Vaidya Akhil H.S., B.A.M.S., M.D. (Ayu)"
- **Category** — linked to Level 2

##### Center column — editorial body
Order of sections (every section uses the gold-rule section head: `[Roman numeral] · [Section name]`):
1. **Chapter label** (`Therapy · No. 0N`) + **Title** (Montserrat 800, 42px) + **Dek** (italic Lora 18px from `description`).
2. **I · Overview** — Portable Text from `body` rendered via PortableText with project styling (reuse `prose-journal` typography). Includes a breakout image (wider than text column on desktop) drawn from `gallery[0]` if present.
3. **II · Gallery** — 4-column grid of remaining gallery images, lightboxable (use existing pattern if any; otherwise simple click-to-zoom can be deferred to v1.1).
4. **III · Benefits** — 2-column grid; each item has a 6px gold dot and Lora 14px text. Bottom border between rows.
5. **IV · What to expect** — list of `procedureSteps[]`. Each step has a Playfair italic roman numeral (`i.`), Montserrat 700 title, Lora 14px description.
6. **V · Not suitable for** — accent-bordered callout box with the `contraindications` paragraph.
7. **CTA block** (mid-page) — full-width-of-center deep-green dark block with accent label, white headline ("Book [Treatment Name] with a Kerala Vaidya"), three buttons:
   - "Book this treatment" → `/book/consultation` (deferred deep-link)
   - "Free Consultation" → `/book/consultation`
   - "WhatsApp" → existing wa.me URL with prefilled message including the treatment name
8. **VI · You may also like** — 3-card grid of related therapies. Pulled from siblings array, excluding current, ordered by `order asc`, take first 3. Each card: 4:3 image (with corner accents), therapy name, duration. Links to the relevant detail page.

##### Right margin — sticky booking card
- White card, accent-bordered, gold "STICKY" label tag on top-right.
- Fields:
  - "DURATION" | `treatment.duration`
  - "SESSIONS" | `treatment.sessionsRecommended`
  - "PRICE" | "On consultation" (always — accent gold)
- Buttons: "Book Treatment" (accent fill) + "WhatsApp Us" (outline).
- `position: sticky; top: 24px;` from end of hero through end of content body.

#### 6.3.5. Prev/Next pager
- After the related-therapies block, before the free-consultation banner.
- Two columns: left card = `← Previous: [prev sibling]`, right card = `Next: [next sibling] →`.
- Wraps around: previous of first = last; next of last = first.
- Each card: card-style with thumb + name + duration.

#### 6.3.6. Free consultation block
Shared component at the bottom of every Level 3 page.

## 7. Component inventory

### 7.1. New components (under `src/components/treatments/`)

| Component | Used at | Responsibility |
|---|---|---|
| `CategoryGrid.tsx` | L1 | Renders the responsive grid of category boxes. |
| `CategoryBox.tsx` | L1 | Single category box (Style B + corner accents). |
| `CategoryPageHeader.tsx` | L2 | Breadcrumb, chapter number, title, dek, gold rule, count. |
| `TherapyGrid.tsx` | L2 | 2-up grid of therapy cards. |
| `TherapyCard.tsx` | L2 | Single therapy card with image + roman + name + teaser + duration. |
| `TherapyStickyBar.tsx` | L3 | Compact top bar that slides in after hero scroll. |
| `TherapySwitcher.tsx` | L3 | Horizontal chip strip + below-prev/next text row. |
| `TherapyHero.tsx` | L3 | 21:9 hero image with category tag overlay. |
| `TherapyMarginalia.tsx` | L3 | Left-margin metadata blocks (desktop only; collapses on mobile). |
| `BookingSidebar.tsx` | L3 | Sticky right-margin booking card. On mobile, renders as a `MobileBookingBar` (different DOM, same data). |
| `MobileBookingBar.tsx` | L3 (mobile) | Fixed bottom bar with name + Book button. |
| `TherapyBenefits.tsx` | L3 | 2-col benefits list with gold dots. |
| `TherapyProcedure.tsx` | L3 | Numbered steps list. |
| `TherapyContraindications.tsx` | L3 | Accent-bordered callout. |
| `TherapyGallery.tsx` | L3 | 4-col gallery grid + optional breakout image. |
| `TherapyMidCTA.tsx` | L3 | Mid-page dark-green CTA block. |
| `RelatedTherapies.tsx` | L3 | 3-card related grid. |
| `TherapyPager.tsx` | L3 | Prev/Next sibling cards. |
| `FreeConsultationBlock.tsx` | L1, L2, L3 | Extracted from current `TreatmentsMenu` bottom section. Shared. |

### 7.2. Components reused without change

- `TreatmentsHero` (L1) — repoint `onBrowseTreatments` to scroll to category grid.
- `CTAButton` (everywhere).
- All `ui/` primitives.
- `PortableText` rendering (existing setup for `prose-journal`).

### 7.3. Components retired

| Component | Reason |
|---|---|
| `TreatmentsMenu` | Replaced by `page.tsx` orchestrating new components. |
| `TreatmentRow` | No longer used — old menu-row format. |
| `CategoryTabs` | Replaced by sticky bar + switcher on L3. |
| `TreatmentCard` | Replaced by new `TherapyCard` (different data shape + accents). |
| Existing `FreeConsultationBanner.tsx` | Replaced by extracted shared `FreeConsultationBlock.tsx` (functionally equivalent). |

Remove these in the same PR; do not keep dead components.

## 8. TypeScript types

File: `src/types/treatments.ts` — extend existing types.

```ts
export interface TreatmentCategory {
  _id: string
  title: string
  slug: string
  description?: string
  image?: SanityImage
  order?: number
  treatmentCount?: number
}

export interface Treatment {
  _id: string
  title: string
  slug: string
  duration?: string
  description?: string                // short, for cards/dek
  body?: PortableTextBlock[]          // long-form overview
  benefits?: string[]
  procedureSteps?: { title: string; description: string }[]
  sessionsRecommended?: string
  contraindications?: string
  origin?: string
  sanskritName?: string
  requiresConsultation?: boolean
  heroImage?: SanityImage             // required on new docs
  gallery?: SanityImage[]
  categoryId: string                  // kept for back-compat
  category?: { _id: string; title: string; slug: string; order?: number }
  siblings?: TreatmentSibling[]       // populated on L3 only
}

export interface TreatmentSibling {
  _id: string
  title: string
  slug: string
  categorySlug: string
}

export interface SanityImage {
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; height: number; width: number }
  alt: string
}
```

Use existing `next-sanity` image-url builder for rendering; configure `next.config.mjs` if not already done (verify `images.remotePatterns` includes `cdn.sanity.io`).

## 9. Booking integration

- All "Book this treatment" buttons in v1 go to `/book/consultation` (no deep-link with treatment ID).
- WhatsApp buttons use `https://wa.me/601165043436?text=` with a URL-encoded prefilled message that includes the treatment name when context permits, e.g. `Hi, I'd like to book a Mukhalepam session.`
- `requiresConsultation` flag is *not* surfaced in the UI in v1 — practitioner-only therapies still book through the consultation route. Re-evaluate in v1.1 after the booking module review.

## 10. SEO & metadata

Every page generates metadata in `generateMetadata`:

- **L1** — title `Treatments — Authentic Kerala Ayurveda Therapies` (existing); description mentions category count.
- **L2** — title `[Category Title] — Kerala Ayurvedic Lifestyle`; description from category description; canonical `/treatments/[slug]`.
- **L3** — title `[Treatment Title] — [Category] | Kerala Ayurvedic Lifestyle`; description from treatment `description`; canonical `/treatments/[categorySlug]/[treatmentSlug]`; OG image from `heroImage`.

JSON-LD on L3: `MedicalProcedure` schema (better fit than generic `Service` for therapy listings; cite the practitioner via `performer` and the clinic via `provider`). Out of scope: Speakable, FAQ, and Review schemas.

Sitemap update: emit all category and treatment URLs from a Sanity-driven `sitemap.ts` (check if existing `sitemap.ts` already pulls Sanity data; extend it if so).

## 11. Performance & images

- Use `next/image` everywhere with Sanity image URL builder.
- Hero images use `priority` flag + 16:9 LQIP placeholder via `@sanity/image-url`'s `blur` param or `next-sanity`'s built-in LQIP if available.
- Gallery uses lazy loading.
- ISR: `export const revalidate = 30` on all three routes (matches current `/treatments` cadence).
- `generateStaticParams` returns all slugs at build time so production prerenders every page; ISR refreshes the data on the 30s cadence.

## 12. Accessibility

- Every image has an `alt` (validated as required in Sanity).
- Color contrast: accent gold (#D4A373) on cream (#FAF6EE) is borderline for body text — restrict accent gold to ≥600 weight or as labels (≥10px tracked-out caps). Already the pattern.
- Therapy switcher: chips are `<a>` not buttons; keyboard tabbable; current chip has `aria-current="page"`.
- Sticky top bar: hidden via `aria-hidden` when off-screen; toggled on scroll.
- Booking sidebar respects `prefers-reduced-motion` (no enter animation when reduced).
- Mobile sticky bottom bar uses `role="region"` + label.

## 13. Mobile rules

- L1: category grid stacks to 1 column; cards become full-width with same image-left + content-right layout (image panel shrinks to ~100px).
- L2: therapy grid stacks to 1 column.
- L3:
  - Marginalia → tucked into a small "About this therapy" block above Overview.
  - Right-margin booking card → fixed bottom bar (`MobileBookingBar`) with therapy name (truncated) + Book pill.
  - 3-col grid collapses to single column at `<1024px`.
  - Gallery becomes horizontal swipe carousel.
  - Switcher chips still horizontally scrollable.

## 14. Migration

1. **Phase A — schema & data prep** (no UI change):
   - Add new Sanity fields with `slug` optional, `heroImage` optional, etc.
   - Run a one-shot script (or Sanity Studio bulk-edit) to backfill slugs from existing titles using `slugify`.
   - Clinic begins populating `heroImage`, `body`, `benefits`, etc. for priority therapies.
2. **Phase B — new routes ship behind a toggle**:
   - Build new components and routes.
   - Land them but keep `page.tsx` rendering the old `TreatmentsMenu` until ready.
3. **Phase C — flip Level 1**:
   - Replace `TreatmentsMenu` mount in `page.tsx` with the new `CategoryGrid`.
   - Retire old components.
4. **Phase D — go live**:
   - Verify all category and treatment slugs resolve.
   - Verify the L3 fallback for treatments missing `heroImage` looks acceptable.
   - Update sitemap, submit to Search Console.

Phases A → B → C → D can mostly happen in one PR if Sanity backfill is done first. Recommended to split into two PRs (A + B-D) to let the clinic populate content while the engineering happens in parallel.

## 15. Risks & open items

| Risk | Mitigation |
|---|---|
| Clinic doesn't have photos for every category/therapy in time. | Brand-matched deep-green diamond-pattern fallback panel on L1 + L3 hero. Caption: "Photo coming soon". |
| Sanity slug collisions on titles like "Abhyanga" (could exist in multiple categories). | Slug uniqueness validated by Sanity; if conflict, editor disambiguates manually (e.g. `abhyanga-face`). |
| Long Sanskrit names + long English titles overflowing the L3 hero tag. | Tag has `max-width` and `truncate`; full title still in body. |
| 60+ procedure-step entries to populate. | `procedureSteps` is min 2 — clinic can ship therapies with skeletal steps and enrich later. |
| Sticky bar + switcher both pinned causes too much chrome on small screens. | On mobile, sticky bar is the only sticky element. Switcher scrolls with content. |
| Sanity image CDN not in next.config remotePatterns. | Verify in Phase B; add if missing. |

No open *decisions* — all branches resolved during brainstorm. Open *items* are implementation-time verifications, listed in Section 16.

## 16. Implementation-time checks

The implementer should verify these before claiming complete:

- `cdn.sanity.io` is in `next.config.mjs` `images.remotePatterns`.
- Existing `sitemap.ts` (if any) — extend to include treatment URLs.
- `tailwind.config.ts` has no missing tokens (it doesn't — all needed colors and fonts exist).
- `PortableText` setup currently renders `prose-journal` correctly for treatment bodies (verify with a sample doc).
- Mobile sticky bottom bar doesn't overlap WhatsApp floating button or any other fixed UI from the global layout.

## 17. What we explicitly chose not to build

- **A–Z full menu page** — current "Gilt Manuscript" view is retired with no replacement.
- **In-page tabs replacing per-treatment URLs** — rejected for SEO reasons.
- **Public pricing** — rejected. Stays on consultation.
- **Deep-link a specific therapy into booking** — deferred until booking module review.
- **Therapy reviews / testimonials** — deferred.
- **Search & filter (by condition, dosha)** — deferred.
- **Hybrid Style B + Style A "image-led tile"** — rejected. Style B with corner accents only.
- **Magazine-spread alternating panels (Layout 3)** — rejected, photo-cost prohibitive.
- **Sticky-sidebar-only layout (Layout 2)** — partially adopted; the *sticky booking card* idea was kept on the right margin of Layout 1 V2, but the overall page reads top-to-bottom in Layout 1's editorial flow.
