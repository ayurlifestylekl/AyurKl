# Treatments Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-page treatments catalogue with a 3-level hub-and-spoke architecture (`/treatments` → `/treatments/[category]` → `/treatments/[category]/[treatment]`) where each therapy gets a dedicated, image-rich detail page editable from Sanity.

**Architecture:** Sanity-driven static pages with ISR (`revalidate = 30`). Sanity schema gets new fields (slug, hero image, gallery, long-form body, benefits, procedure steps, contraindications). Three new presentation routes use brand-token Tailwind classes and the existing `urlForImage()` + PortableText infrastructure. Level 3 detail page uses a 3-column desktop layout (marginalia ▏ ≤720px text column ▏ sticky booking card) collapsing to a single column on mobile with a fixed bottom booking bar.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Sanity (schema + GROQ + image-url builder), Tailwind CSS, framer-motion, `@portabletext/react`, vitest.

**Spec:** [`docs/specs/2026-05-26-treatments-page-redesign.md`](2026-05-26-treatments-page-redesign.md)

---

## File map

### Modify

- `src/sanity/schemaTypes/treatmentCategory.ts` — add `slug`, `image`, `description`.
- `src/sanity/schemaTypes/treatment.ts` — add `slug`, `heroImage`, `gallery`, `body`, `benefits`, `procedureSteps`, `sessionsRecommended`, `contraindications`, `order`, `origin`, `sanskritName`.
- `src/sanity/queries.ts` — extend `TREATMENT_CATEGORIES_QUERY` + `TREATMENTS_QUERY`; add `CATEGORY_BY_SLUG_QUERY`, `TREATMENT_BY_SLUG_QUERY`, `TREATMENT_SIBLINGS_QUERY`, `CATEGORY_SLUGS_QUERY`, `TREATMENT_SLUG_PAIRS_QUERY`.
- `src/types/treatments.ts` — expand `TreatmentCategory` + `Treatment`; add `TreatmentSibling`, `ProcedureStep`, `SanityImageRef`.
- `src/app/(public)/treatments/page.tsx` — replace `<TreatmentsMenu>` with new hero + `<CategoryGrid>` + `<FreeConsultationBlock>`.
- `src/components/treatments/TreatmentsHero.tsx` — verify the `onBrowseTreatments` callback still works; no API change.
- `next.config.mjs` — already has `cdn.sanity.io`; no change needed (verify only).

### Create

- `src/app/(public)/treatments/[categorySlug]/page.tsx` — Level 2 server component.
- `src/app/(public)/treatments/[categorySlug]/[treatmentSlug]/page.tsx` — Level 3 server component.
- `src/components/treatments/CategoryGrid.tsx`
- `src/components/treatments/CategoryBox.tsx`
- `src/components/treatments/CategoryPageHeader.tsx`
- `src/components/treatments/TherapyGrid.tsx`
- `src/components/treatments/TherapyCard.tsx`
- `src/components/treatments/FreeConsultationBlock.tsx` (extracted from current inline section)
- `src/components/treatments/TherapyHero.tsx`
- `src/components/treatments/TherapyMarginalia.tsx`
- `src/components/treatments/BookingSidebar.tsx`
- `src/components/treatments/MobileBookingBar.tsx`
- `src/components/treatments/TherapyStickyBar.tsx`
- `src/components/treatments/TherapySwitcher.tsx`
- `src/components/treatments/TherapyBenefits.tsx`
- `src/components/treatments/TherapyProcedure.tsx`
- `src/components/treatments/TherapyContraindications.tsx`
- `src/components/treatments/TherapyGallery.tsx`
- `src/components/treatments/TherapyMidCTA.tsx`
- `src/components/treatments/RelatedTherapies.tsx`
- `src/components/treatments/TherapyPager.tsx`
- `src/lib/treatments/pager.ts` — pure prev/next computation (testable).
- `src/lib/treatments/__tests__/pager.test.ts` — vitest unit test.
- `scripts/backfill-treatment-slugs.ts` — one-shot data migration.

### Delete (Task 36)

- `src/components/treatments/TreatmentsMenu.tsx`
- `src/components/treatments/TreatmentRow.tsx`
- `src/components/treatments/CategoryTabs.tsx`
- `src/components/treatments/TreatmentCard.tsx`
- `src/components/treatments/FreeConsultationBanner.tsx`

---

## Phase A — Schema, queries, types, data backfill

### Task 1: Extend `treatmentCategory` Sanity schema

**Files:**
- Modify: `src/sanity/schemaTypes/treatmentCategory.ts`

- [ ] **Step 1: Add `slug`, `image`, `description` fields**

Replace the file contents with:

```ts
import { defineField, defineType } from 'sanity'

export const treatmentCategory = defineType({
  name: 'treatmentCategory',
  title: 'Treatment Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      description:
        'Auto-generated from the title. Used in the public URL: /treatments/<slug>.',
      options: { source: 'title', maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Category image',
      description:
        'Shown in the image panel of the category box on /treatments. ' +
        'If absent, a brand-coloured fallback panel is rendered.',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'description',
      title: 'Short description',
      description:
        'One-sentence teaser. Used on the category box and as the category page dek. ' +
        'Keep under 140 characters.',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Controls category order on /treatments. Lower numbers appear first.',
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'order' },
    prepare: ({ title, subtitle }) => ({
      title,
      subtitle: subtitle != null ? `Order: ${subtitle}` : 'No order set',
    }),
  },
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})
```

- [ ] **Step 2: Verify Sanity Studio loads**

Run: `npm run dev`
Open `http://localhost:3000/studio`. Open a treatment category document; confirm the three new fields appear.

- [ ] **Step 3: Commit**

```bash
git add src/sanity/schemaTypes/treatmentCategory.ts
git commit -m "feat(sanity): add slug, image, description to treatmentCategory schema"
```

---

### Task 2: Extend `treatment` Sanity schema

**Files:**
- Modify: `src/sanity/schemaTypes/treatment.ts`

- [ ] **Step 1: Replace file contents with expanded schema**

```ts
import { defineField, defineType } from 'sanity'

export const treatment = defineType({
  name: 'treatment',
  title: 'Treatment',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      description:
        'Auto-generated from the title. Used in the public URL: /treatments/<category>/<slug>.',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'treatmentCategory' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display order within category',
      type: 'number',
      description:
        'Lower numbers appear first in the category grid and switcher. ' +
        'Drives the roman-numeral ordering.',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Free-text duration label, e.g. "1 Hour 30 min".',
    }),
    defineField({
      name: 'description',
      title: 'Short description (dek)',
      description: 'Shown on the therapy card and as the detail-page dek. 1–3 short sentences.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'requiresConsultation',
      title: 'Requires practitioner consultation',
      type: 'boolean',
      initialValue: false,
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
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
        },
      ],
      validation: (rule) => rule.min(0).max(6),
    }),
    defineField({
      name: 'body',
      title: 'Long-form overview',
      description: 'Portable Text. Multiple paragraphs about the therapy.',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'benefits',
      title: 'Benefits',
      description: 'Short bullet points. 4–8 recommended.',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.max(12),
    }),
    defineField({
      name: 'procedureSteps',
      title: 'What to expect (procedure steps)',
      description: 'Numbered session flow.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Step title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Step description',
              type: 'text',
              rows: 2,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        },
      ],
      validation: (rule) => rule.max(10),
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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'duration',
      categoryTitle: 'category.title',
    },
    prepare: ({ title, subtitle, categoryTitle }) => ({
      title,
      subtitle: [categoryTitle, subtitle].filter(Boolean).join(' · '),
    }),
  },
})
```

- [ ] **Step 2: Verify Sanity Studio loads**

Run: `npm run dev`
Open `/studio`. Open an existing treatment document. Confirm all new fields appear. Sanity will surface validation warnings for missing required fields (slug) — this is expected; backfill in Task 3.

- [ ] **Step 3: Commit**

```bash
git add src/sanity/schemaTypes/treatment.ts
git commit -m "feat(sanity): expand treatment schema with image, body, benefits, procedure, marginalia"
```

---

### Task 3: Slug backfill script

**Files:**
- Create: `scripts/backfill-treatment-slugs.ts`

- [ ] **Step 1: Write the backfill script**

```ts
/**
 * One-shot: generate slugs for every existing treatmentCategory and treatment
 * that doesn't already have one, derived from the document title.
 *
 * Run: `npx tsx scripts/backfill-treatment-slugs.ts`
 * Requires `SANITY_API_WRITE_TOKEN` in env.
 */
import 'dotenv/config'
import { createClient } from '@sanity/client'
import {
  projectId,
  dataset,
  apiVersion,
  writeToken,
} from '../src/sanity/env'

if (!projectId || !writeToken) {
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: writeToken,
  useCdn: false,
})

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')        // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

interface Doc { _id: string; title: string; slug?: { current?: string } | null }

async function backfill(type: 'treatmentCategory' | 'treatment') {
  const docs = await client.fetch<Doc[]>(
    `*[_type == $type && !defined(slug.current)] { _id, title, slug }`,
    { type },
  )
  if (docs.length === 0) {
    console.log(`[${type}] no docs need slugs`)
    return
  }
  console.log(`[${type}] backfilling ${docs.length} document(s)`)

  const taken = new Set<string>(
    await client.fetch<string[]>(
      `*[_type == $type && defined(slug.current)].slug.current`,
      { type },
    ),
  )

  let tx = client.transaction()
  for (const doc of docs) {
    let candidate = slugify(doc.title)
    if (!candidate) {
      console.warn(`  · ${doc._id}: title yields empty slug, skipping`)
      continue
    }
    let unique = candidate
    let n = 2
    while (taken.has(unique)) {
      unique = `${candidate}-${n++}`
    }
    taken.add(unique)
    console.log(`  · ${doc._id} → ${unique}`)
    tx = tx.patch(doc._id, (p) =>
      p.set({ slug: { _type: 'slug', current: unique } }),
    )
  }
  const result = await tx.commit()
  console.log(`[${type}] committed ${result.results.length} patch(es)`)
}

async function main() {
  await backfill('treatmentCategory')
  await backfill('treatment')
  console.log('done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: Run backfill against the Sanity dataset**

```bash
cd "/path/to/ayurvedic" && npx tsx scripts/backfill-treatment-slugs.ts
```

Expected: `[treatmentCategory] backfilling N document(s)` then `[treatment] backfilling N document(s)` then `done`. Re-run is idempotent (skips docs that already have slugs).

- [ ] **Step 3: Verify in Studio**

Open `/studio`, open one category and one treatment doc, confirm the `slug.current` field now has a value.

- [ ] **Step 4: Commit**

```bash
git add scripts/backfill-treatment-slugs.ts
git commit -m "chore(scripts): one-shot slug backfill for treatment + category docs"
```

---

### Task 4: Expand TypeScript types

**Files:**
- Modify: `src/types/treatments.ts`

- [ ] **Step 1: Replace file contents**

```ts
import type { PortableTextBlock } from '@portabletext/types'

export interface SanityImageRef {
  _type?: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; height: number; width: number }
  alt?: string
}

export interface ProcedureStep {
  title: string
  description: string
}

export interface TreatmentCategory {
  _id: string
  title: string
  slug: string
  description: string | null
  image: SanityImageRef | null
  order: number | null
  treatmentCount?: number
}

export interface TreatmentSummary {
  _id: string
  title: string
  slug: string
  duration: string | null
  description: string | null
  heroImage: SanityImageRef | null
  requiresConsultation: boolean
  order: number | null
}

export interface TreatmentDetail {
  _id: string
  title: string
  slug: string
  duration: string | null
  description: string | null
  body: PortableTextBlock[] | null
  benefits: string[] | null
  procedureSteps: ProcedureStep[] | null
  sessionsRecommended: string | null
  contraindications: string | null
  origin: string | null
  sanskritName: string | null
  requiresConsultation: boolean
  heroImage: SanityImageRef | null
  gallery: SanityImageRef[] | null
  order: number | null
  category: {
    _id: string
    title: string
    slug: string
    order: number | null
  }
}

export interface TreatmentSibling {
  _id: string
  title: string
  slug: string
  categorySlug: string
  order: number | null
  duration: string | null
  heroImage: SanityImageRef | null
}

/**
 * Back-compat for the existing TREATMENTS_QUERY shape consumed by
 * the legacy TreatmentsMenu. Once Task 36 deletes the menu, this
 * type and the legacy query can be removed.
 */
export interface Treatment {
  _id: string
  title: string
  duration: string | null
  description: string | null
  requiresConsultation: boolean
  categoryId: string
  categoryTitle: string
  categoryOrder: number | null
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/treatments.ts
git commit -m "feat(types): expand treatments types for new schema fields"
```

---

### Task 5: Add new GROQ queries

**Files:**
- Modify: `src/sanity/queries.ts`

- [ ] **Step 1: Replace the existing treatment queries and add new ones**

Replace the existing `TREATMENT_CATEGORIES_QUERY` and `TREATMENTS_QUERY` exports (keep `TREATMENTS_QUERY` intact — the legacy `TreatmentsMenu` still uses it until Task 36). Add the new queries after them:

```ts
/* ──────────────────────────────────────────────────────────────────────
 * Treatments — Level 1: categories index with treatment counts
 * ────────────────────────────────────────────────────────────────────── */
export const TREATMENT_CATEGORIES_INDEX_QUERY = groq`
  *[_type == "treatmentCategory" && defined(slug.current)]
    | order(coalesce(order, 9999) asc, title asc) {
      _id,
      title,
      "slug": slug.current,
      description,
      image,
      order,
      "treatmentCount": count(*[_type == "treatment" && references(^._id)])
    }
`

/* ──────────────────────────────────────────────────────────────────────
 * Treatments — Level 2: category by slug + its treatments
 * ────────────────────────────────────────────────────────────────────── */
export const CATEGORY_BY_SLUG_QUERY = groq`
  *[_type == "treatmentCategory" && slug.current == $slug][0] {
    _id, title, description, image, order,
    "slug": slug.current,
    "treatments": *[_type == "treatment" && references(^._id) && defined(slug.current)]
      | order(coalesce(order, 9999) asc, title asc) {
        _id, title, duration, description, requiresConsultation, order,
        "slug": slug.current,
        heroImage
      }
  }
`

/* ──────────────────────────────────────────────────────────────────────
 * Treatments — Level 3: single treatment by category+treatment slug
 * ────────────────────────────────────────────────────────────────────── */
export const TREATMENT_BY_SLUG_QUERY = groq`
  *[_type == "treatment" && slug.current == $treatmentSlug
      && category->slug.current == $categorySlug][0] {
    _id, title, duration, description, body, benefits,
    procedureSteps, sessionsRecommended, contraindications,
    origin, sanskritName, requiresConsultation, order,
    "slug": slug.current,
    heroImage, gallery,
    category->{
      _id, title, order,
      "slug": slug.current
    }
  }
`

/**
 * Siblings of a treatment within its category. Used by:
 *  - the switcher (needs _id, title, slug)
 *  - the prev/next pager (needs same)
 *  - the related-therapies grid (needs duration + heroImage too)
 *
 * Includes the current treatment — caller filters it out when needed.
 */
export const TREATMENT_SIBLINGS_QUERY = groq`
  *[_type == "treatment" && category._ref == $categoryId && defined(slug.current)]
    | order(coalesce(order, 9999) asc, title asc) {
      _id, title, order, duration,
      "slug": slug.current,
      "categorySlug": category->slug.current,
      heroImage
    }
`

/* ──────────────────────────────────────────────────────────────────────
 * Treatments — static params for prerendering
 * ────────────────────────────────────────────────────────────────────── */
export const CATEGORY_SLUGS_QUERY = groq`
  *[_type == "treatmentCategory" && defined(slug.current)][].slug.current
`

export const TREATMENT_SLUG_PAIRS_QUERY = groq`
  *[_type == "treatment" && defined(slug.current) && defined(category->slug.current)] {
    "categorySlug": category->slug.current,
    "treatmentSlug": slug.current
  }
`
```

- [ ] **Step 2: Commit**

```bash
git add src/sanity/queries.ts
git commit -m "feat(sanity): add Level 1/2/3 treatment queries + static-params slug queries"
```

---

### Task 6: Pure prev/next pager logic + test

**Files:**
- Create: `src/lib/treatments/pager.ts`
- Create: `src/lib/treatments/__tests__/pager.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/treatments/__tests__/pager.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { findPrevNext } from '../pager'
import type { TreatmentSibling } from '@/types/treatments'

const mkSibling = (slug: string, title: string, order: number): TreatmentSibling => ({
  _id: slug,
  title,
  slug,
  categorySlug: 'face',
  order,
  duration: null,
  heroImage: null,
})

const siblings: TreatmentSibling[] = [
  mkSibling('a', 'A', 1),
  mkSibling('b', 'B', 2),
  mkSibling('c', 'C', 3),
]

describe('findPrevNext', () => {
  it('returns prev=last and next=second for the first item (wrap-around)', () => {
    const { prev, next } = findPrevNext(siblings, 'a')
    expect(prev?.slug).toBe('c')
    expect(next?.slug).toBe('b')
  })

  it('returns prev=first and next=first for the last item (wrap-around)', () => {
    const { prev, next } = findPrevNext(siblings, 'c')
    expect(prev?.slug).toBe('b')
    expect(next?.slug).toBe('a')
  })

  it('returns adjacent siblings for a middle item', () => {
    const { prev, next } = findPrevNext(siblings, 'b')
    expect(prev?.slug).toBe('a')
    expect(next?.slug).toBe('c')
  })

  it('returns null/null when the current slug is not in the list', () => {
    const { prev, next } = findPrevNext(siblings, 'z')
    expect(prev).toBeNull()
    expect(next).toBeNull()
  })

  it('returns null/null for an empty list', () => {
    const { prev, next } = findPrevNext([], 'a')
    expect(prev).toBeNull()
    expect(next).toBeNull()
  })

  it('returns null/null for a single-item list', () => {
    const single = [siblings[0]]
    const { prev, next } = findPrevNext(single, 'a')
    expect(prev).toBeNull()
    expect(next).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/treatments/__tests__/pager.test.ts`
Expected: FAIL — module `../pager` not found.

- [ ] **Step 3: Implement the pager**

`src/lib/treatments/pager.ts`:

```ts
import type { TreatmentSibling } from '@/types/treatments'

/**
 * Given an ordered siblings array and the slug of the current item,
 * return its previous and next siblings. Wraps around at the ends.
 *
 * Returns prev=null, next=null when:
 *   - the list is empty,
 *   - the list has a single item,
 *   - or the current slug is not present in the list.
 */
export function findPrevNext(
  siblings: TreatmentSibling[],
  currentSlug: string,
): { prev: TreatmentSibling | null; next: TreatmentSibling | null } {
  if (siblings.length < 2) return { prev: null, next: null }
  const idx = siblings.findIndex((s) => s.slug === currentSlug)
  if (idx === -1) return { prev: null, next: null }
  const prev = siblings[(idx - 1 + siblings.length) % siblings.length]
  const next = siblings[(idx + 1) % siblings.length]
  return { prev, next }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/treatments/__tests__/pager.test.ts`
Expected: PASS — all six tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/treatments/pager.ts src/lib/treatments/__tests__/pager.test.ts
git commit -m "feat(treatments): pure findPrevNext helper for sibling pager"
```

---

## Phase B — Shared components

### Task 7: Extract `FreeConsultationBlock` from `TreatmentsMenu`

**Files:**
- Create: `src/components/treatments/FreeConsultationBlock.tsx`

- [ ] **Step 1: Create the component**

Copy the JSX of the `<section aria-labelledby="free-consult-heading">…</section>` block currently inside `src/components/treatments/TreatmentsMenu.tsx` (lines ~214–342 — the "ZONE 3 — FULL-WIDTH CTA SECTION" through to its closing `</section>`) into a standalone component.

```tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Calendar } from 'lucide-react'

import CTAButton from '@/components/ui/CTAButton'
import { staggerParent, fadeUp, inViewOnce } from '@/lib/motion'

/* Gold-diamond pattern — duplicated from the original site so this
 * component stands alone. */
const heroDiamondPattern = {
  backgroundImage: `
    radial-gradient(circle, rgba(212,163,115,0.04) 1px, transparent 1px),
    radial-gradient(circle, rgba(212,163,115,0.04) 1px, transparent 1px)
  `,
  backgroundSize: '28px 28px',
  backgroundPosition: '0 0, 14px 14px',
}

interface FreeConsultationBlockProps {
  /** Optional override for the WhatsApp prefilled message. */
  whatsappMessage?: string
}

/**
 * Full-width dark-green CTA block used at the bottom of every public
 * treatments page (L1, L2, L3). Visually mirrors the hero with the
 * same diamond pattern + gold frame.
 */
export default function FreeConsultationBlock({
  whatsappMessage = "Hi, I'd like to book a free Ayurveda consultation.",
}: FreeConsultationBlockProps) {
  const whatsappHref = `https://wa.me/601165043436?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <section
      aria-labelledby="free-consult-heading"
      className="relative overflow-hidden bg-primary"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 5% 0%, rgba(212,163,115,0.25) 0%, transparent 45%), radial-gradient(ellipse at 95% 100%, rgba(26,46,38,0.4) 0%, transparent 50%), radial-gradient(ellipse at 50% 40%, rgba(212,163,115,0.06) 0%, transparent 35%)',
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0" style={heroDiamondPattern} aria-hidden />
      <div className="grain-overlay-dark pointer-events-none absolute inset-0" aria-hidden />

      <div className="pointer-events-none absolute inset-3 border border-accent/12 sm:inset-6 md:inset-8" aria-hidden />
      <div className="pointer-events-none absolute inset-5 border border-accent/6 sm:inset-8 md:inset-10" aria-hidden />

      <div className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-accent/20 sm:left-6 sm:top-6 md:left-8 md:top-8" aria-hidden />
      <div className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-accent/20 sm:right-6 sm:top-6 md:right-8 md:top-8" aria-hidden />
      <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-accent/20 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8" aria-hidden />
      <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-accent/20 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8" aria-hidden />

      <motion.div
        variants={staggerParent(0.1, 0.05)}
        initial="initial"
        whileInView="animate"
        viewport={inViewOnce}
        className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-8 py-20 sm:px-14 md:py-28 lg:grid-cols-[3fr_2fr] lg:gap-16 lg:px-16 lg:py-32"
      >
        <div className="flex flex-col gap-5">
          <motion.div variants={fadeUp(0)} className="flex items-center gap-3">
            <span className="h-[2px] w-14 rounded-full bg-accent" aria-hidden />
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
              Free Consultation
            </span>
          </motion.div>

          <motion.h2
            id="free-consult-heading"
            variants={fadeUp(0)}
            className="max-w-xl font-heading font-extrabold leading-[0.98] text-white"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', letterSpacing: '-0.035em' }}
          >
            A free consultation
            <br />
            with a <span className="font-body italic text-accent">Kerala Vaidya.</span>
          </motion.h2>

          <motion.p variants={fadeUp(0)} className="max-w-md font-body text-[16px] leading-[1.75] text-white/50">
            We provide free consultations with our KKM-registered Ayurveda practitioner from Kerala,
            who holds a B.A.M.S degree and specialises in personalised treatment protocols.
          </motion.p>

          <motion.div variants={fadeUp(0)} className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {['KKM-Registered', 'B.A.M.S Kerala', 'Vaidya Akhil H.S., B.A.M.S., M.D. (Ayu)'].map((cred, i, arr) => (
              <React.Fragment key={cred}>
                <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  {cred}
                </span>
                {i < arr.length - 1 && <span className="h-3 w-px bg-accent/25" aria-hidden />}
              </React.Fragment>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp(0)}
            className="h-px w-20"
            style={{ background: 'linear-gradient(to right, rgba(212,163,115,0.45), transparent)' }}
            aria-hidden
          />

          <motion.div variants={fadeUp(0)} className="mt-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <CTAButton href="/book/consultation" variant="primary" size="lg" icon={<Calendar className="h-4 w-4" />}>
              Book Free Consultation
            </CTAButton>
            <CTAButton href={whatsappHref} variant="outlineLight" size="lg" icon={<MessageCircle className="h-4 w-4" />}>
              WhatsApp Us
            </CTAButton>
          </motion.div>
        </div>

        <motion.aside variants={fadeUp(0.1)} className="relative w-full">
          <div className="rounded-xl bg-white/[0.06] p-7 ring-1 ring-white/12 sm:p-8">
            <div className="mb-4 h-px w-10" style={{ background: 'linear-gradient(to right, rgba(212,163,115,0.5), transparent)' }} aria-hidden />
            <span className="font-heading text-[11px] font-bold uppercase tracking-[0.25em] text-accent">We treat</span>

            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3.5 font-body text-[14px] leading-[1.5] text-white/75">
              {['Chronic back pain', 'Joint stiffness', 'Sciatica', 'Skin conditions', 'Eczema & psoriasis', 'Gastric issues', 'Stress & anxiety', 'Sleep disorders', 'Migraine & headache', 'Hair fall'].map(item => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5">
              <span className="h-px w-6 bg-accent/40" aria-hidden />
              <span className="font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-white/45">
                Consultation is always free
              </span>
            </div>
          </div>
        </motion.aside>
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/FreeConsultationBlock.tsx
git commit -m "feat(treatments): extract FreeConsultationBlock as shared bottom CTA"
```

---

## Phase C — Level 1 (categories index)

### Task 8: Build `CategoryBox` component

**Files:**
- Create: `src/components/treatments/CategoryBox.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { urlForImage } from '@/sanity/image'
import { fadeUp } from '@/lib/motion'
import type { TreatmentCategory } from '@/types/treatments'

interface CategoryBoxProps {
  category: TreatmentCategory
  index: number
}

/**
 * Style B with corner accents (locked 2026-05-25).
 * Image-left + content-right card. Gold L-corners on the image panel.
 * Whole card links to /treatments/<slug>.
 */
export default function CategoryBox({ category, index }: CategoryBoxProps) {
  const number = String(index + 1).padStart(2, '0')
  const count = category.treatmentCount ?? 0
  const href = `/treatments/${category.slug}`

  return (
    <motion.div variants={fadeUp(0)}>
      <Link
        href={href}
        className="group block overflow-hidden rounded-2xl border border-accent/25 bg-cream transition-[transform,box-shadow] duration-300 hover:-translate-y-[3px] hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        aria-label={`${category.title} — ${count} ${count === 1 ? 'therapy' : 'therapies'}`}
      >
        <div className="grid h-full grid-cols-[140px_1fr] sm:grid-cols-[160px_1fr]">
          {/* Image panel with corner accents */}
          <div className="relative overflow-hidden">
            {category.image ? (
              <Image
                src={urlForImage(category.image).width(400).height(500).fit('crop').url()}
                alt={category.image.alt ?? `${category.title} image`}
                fill
                sizes="(max-width: 640px) 140px, 160px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className="absolute inset-0 bg-primary"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(212,163,115,0.18) 1px, transparent 1px)',
                  backgroundSize: '14px 14px',
                }}
                aria-hidden
              />
            )}
            {/* Gold L-corners */}
            <span className="pointer-events-none absolute left-1 top-1 h-2.5 w-2.5 border-l-2 border-t-2 border-accent" aria-hidden />
            <span className="pointer-events-none absolute right-1 top-1 h-2.5 w-2.5 border-r-2 border-t-2 border-accent" aria-hidden />
            <span className="pointer-events-none absolute bottom-1 left-1 h-2.5 w-2.5 border-b-2 border-l-2 border-accent" aria-hidden />
            <span className="pointer-events-none absolute bottom-1 right-1 h-2.5 w-2.5 border-b-2 border-r-2 border-accent" aria-hidden />
          </div>

          {/* Content panel */}
          <div className="flex flex-col justify-between p-5 sm:p-6">
            <div>
              <div className="font-heading text-[14px] font-black tracking-[0.12em] text-accent">
                {number}
              </div>
              <h3 className="mt-1 font-heading text-[18px] font-extrabold leading-tight tracking-[-0.018em] text-primary sm:text-[20px]">
                {category.title}
              </h3>
              <div
                className="my-2.5 h-px"
                style={{
                  background:
                    'linear-gradient(to right, rgba(212,163,115,0.5), transparent)',
                }}
                aria-hidden
              />
              {category.description && (
                <p className="font-body text-[13px] italic leading-[1.5] text-dark/70">
                  {category.description}
                </p>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-dark/55">
              <span>
                {count} {count === 1 ? 'Therapy' : 'Therapies'}
              </span>
              <span className="text-primary transition-transform duration-300 group-hover:translate-x-0.5">
                View →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/CategoryBox.tsx
git commit -m "feat(treatments): CategoryBox — Style B card with gold corner accents"
```

---

### Task 9: Build `CategoryGrid` component

**Files:**
- Create: `src/components/treatments/CategoryGrid.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { motion } from 'framer-motion'

import CategoryBox from '@/components/treatments/CategoryBox'
import { staggerParent, inViewOnce } from '@/lib/motion'
import type { TreatmentCategory } from '@/types/treatments'

interface CategoryGridProps {
  categories: TreatmentCategory[]
}

const diamondPattern = {
  backgroundImage: `
    radial-gradient(circle, rgba(47,93,80,0.028) 1px, transparent 1px),
    radial-gradient(circle, rgba(47,93,80,0.028) 1px, transparent 1px)
  `,
  backgroundSize: '32px 32px',
  backgroundPosition: '0 0, 16px 16px',
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section
      id="category-grid"
      aria-labelledby="categories-heading"
      className="relative overflow-hidden bg-cream"
    >
      <div className="pointer-events-none absolute inset-0" style={diamondPattern} aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="mb-12 max-w-2xl">
          <div className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
            The Catalogue
          </div>
          <h2
            id="categories-heading"
            className="mt-3 font-heading text-[2rem] font-extrabold leading-tight tracking-[-0.02em] text-primary sm:text-[2.4rem]"
          >
            Therapy categories
          </h2>
          <div
            className="mt-4 h-px w-20"
            style={{
              background:
                'linear-gradient(to right, rgba(212,163,115,0.6), transparent)',
            }}
            aria-hidden
          />
        </div>

        {categories.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-8 py-20 text-center">
            <span
              aria-hidden
              className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_5px_rgba(212,163,115,0.18)]"
            />
            <p className="mt-6 font-body text-[20px] italic leading-[1.3] text-primary">
              Catalogue in preparation.
            </p>
            <p className="mt-3 font-heading text-[10.5px] font-semibold uppercase tracking-[0.24em] text-dark/40">
              Awaiting category entries from the clinic
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerParent(0.06, 0.04)}
            initial="initial"
            whileInView="animate"
            viewport={inViewOnce}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {categories.map((cat, i) => (
              <CategoryBox key={cat._id} category={cat} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/CategoryGrid.tsx
git commit -m "feat(treatments): CategoryGrid — responsive 1/2/3-col grid for Level 1"
```

---

### Task 10: Wire up Level 1 — replace `TreatmentsMenu` in `page.tsx`

**Files:**
- Modify: `src/app/(public)/treatments/page.tsx`

- [ ] **Step 1: Replace the page contents**

```tsx
import type { Metadata } from 'next'

import CategoryGrid from '@/components/treatments/CategoryGrid'
import FreeConsultationBlock from '@/components/treatments/FreeConsultationBlock'
import TreatmentsHero from '@/components/treatments/TreatmentsHero'
import { sanityClient } from '@/sanity/client'
import { isSanityConfigured } from '@/sanity/env'
import { TREATMENT_CATEGORIES_INDEX_QUERY } from '@/sanity/queries'
import type { TreatmentCategory } from '@/types/treatments'

export const metadata: Metadata = {
  title: 'Treatments — Authentic Kerala Ayurveda Therapies',
  description:
    'Browse the full library of authentic Kerala Ayurveda therapies offered at Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur — face care, massage, stress relief, joint care, rehabilitation, kids, and more. Free consultation with Vaidya Akhil H.S., B.A.M.S., M.D. (Ayu).',
  alternates: { canonical: '/treatments' },
  openGraph: {
    title: 'Treatments — Kerala Ayurvedic Lifestyle',
    description:
      'Authentic Ayurveda therapies across the clinic catalogue. Personal protocols designed by a KKM-registered Kerala Vaidya in Brickfields, KL.',
    url: 'https://keralaayurvedic.com/treatments',
    type: 'website',
  },
}

export const revalidate = 30

async function loadCategories(): Promise<TreatmentCategory[]> {
  if (!isSanityConfigured) return []
  try {
    const categories = await sanityClient.fetch<TreatmentCategory[]>(
      TREATMENT_CATEGORIES_INDEX_QUERY,
    )
    return categories ?? []
  } catch (err) {
    console.error('[treatments] Sanity fetch failed:', err)
    return []
  }
}

export default async function TreatmentsPage() {
  const categories = await loadCategories()
  const therapyCount = categories.reduce(
    (sum, c) => sum + (c.treatmentCount ?? 0),
    0,
  )
  return (
    <>
      <TreatmentsHero
        therapyCount={therapyCount || undefined}
        onBrowseTreatments={undefined}
      />
      <CategoryGrid categories={categories} />
      <FreeConsultationBlock />
    </>
  )
}
```

- [ ] **Step 2: Verify `TreatmentsHero` still accepts undefined `onBrowseTreatments`**

Open `src/components/treatments/TreatmentsHero.tsx`. If the `onBrowseTreatments` prop is typed as required, change it to optional (`onBrowseTreatments?: () => void`). If the button click handler depends on the callback, fall back to a plain `<a href="#category-grid">` when undefined.

If the hero contains:
```tsx
onClick={onBrowseTreatments}
```
change to:
```tsx
onClick={onBrowseTreatments}
href={onBrowseTreatments ? undefined : '#category-grid'}
```
(or whatever the simplest swap is — keep the existing animation behaviour intact).

- [ ] **Step 3: Smoke test in browser**

Run: `npm run dev`
Visit `http://localhost:3000/treatments`.
Expected: hero renders, "Browse treatments" CTA scrolls to / anchors to the new category grid, each category appears as a Style-B card with corner accents, FreeConsultationBlock renders at the bottom. Hover a card — confirm the lift + shadow.

- [ ] **Step 4: Verify mobile responsiveness**

In Chrome DevTools, set viewport to 375px. Confirm the grid collapses to 1 column and each card remains image-left + content-right.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(public\)/treatments/page.tsx src/components/treatments/TreatmentsHero.tsx
git commit -m "feat(treatments): /treatments now renders hero + CategoryGrid + FreeConsultationBlock"
```

---

## Phase D — Level 2 (category page)

### Task 11: Build `CategoryPageHeader` component

**Files:**
- Create: `src/components/treatments/CategoryPageHeader.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

import { fadeUp, staggerParent, inViewOnce } from '@/lib/motion'

interface CategoryPageHeaderProps {
  title: string
  description: string | null
  order: number | null
  treatmentCount: number
}

export default function CategoryPageHeader({
  title,
  description,
  order,
  treatmentCount,
}: CategoryPageHeaderProps) {
  const chapterNumber =
    order != null ? String(order + 1).padStart(2, '0') : '—'

  return (
    <motion.header
      variants={staggerParent(0.08, 0.05)}
      initial="initial"
      animate="animate"
      className="relative mx-auto max-w-5xl px-6 pt-12 sm:px-8 sm:pt-16 lg:px-12"
    >
      {/* Breadcrumb */}
      <motion.nav
        variants={fadeUp(0)}
        aria-label="Breadcrumb"
        className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-dark/50"
      >
        <Link href="/treatments" className="text-accent transition-colors hover:text-primary">
          Treatments
        </Link>
        <span className="mx-2 text-dark/30">/</span>
        <span>{title}</span>
      </motion.nav>

      <motion.div
        variants={fadeUp(0)}
        className="mt-6 font-heading text-[14px] font-black tracking-[0.18em] text-accent"
      >
        CHAPTER {chapterNumber}
      </motion.div>

      <motion.h1
        variants={fadeUp(0)}
        className="mt-2 font-heading font-extrabold leading-[1.05] tracking-[-0.025em] text-primary"
        style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)' }}
      >
        {title}
      </motion.h1>

      {description && (
        <motion.p
          variants={fadeUp(0)}
          className="mt-4 max-w-2xl font-body text-[17px] italic leading-[1.6] text-dark/72"
        >
          {description}
        </motion.p>
      )}

      <motion.div
        variants={fadeUp(0)}
        className="mt-9 h-px"
        style={{
          background:
            'linear-gradient(to right, rgba(212,163,115,0.5), rgba(212,163,115,0.1) 60%, transparent)',
        }}
        aria-hidden
      />

      <motion.div
        variants={fadeUp(0)}
        className="mt-6 font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-dark/50"
      >
        {treatmentCount} {treatmentCount === 1 ? 'Therapy' : 'Therapies'} in this chapter
      </motion.div>
    </motion.header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/CategoryPageHeader.tsx
git commit -m "feat(treatments): CategoryPageHeader — breadcrumb, chapter number, title, dek"
```

---

### Task 12: Build `TherapyCard` component (Level 2 cards)

**Files:**
- Create: `src/components/treatments/TherapyCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { urlForImage } from '@/sanity/image'
import { fadeUp } from '@/lib/motion'
import type { TreatmentSummary } from '@/types/treatments'

interface TherapyCardProps {
  treatment: TreatmentSummary
  categorySlug: string
  romanIndex: string
}

export default function TherapyCard({
  treatment,
  categorySlug,
  romanIndex,
}: TherapyCardProps) {
  const href = `/treatments/${categorySlug}/${treatment.slug}`

  return (
    <motion.div variants={fadeUp(0)}>
      <Link
        href={href}
        className="group block h-full overflow-hidden rounded-xl border border-accent/30 bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-[2px] hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <div className="grid h-full grid-cols-[130px_1fr] sm:grid-cols-[150px_1fr]">
          {/* Image with corner accents */}
          <div className="relative overflow-hidden">
            {treatment.heroImage ? (
              <Image
                src={urlForImage(treatment.heroImage).width(320).height(500).fit('crop').url()}
                alt={treatment.heroImage.alt ?? `${treatment.title} image`}
                fill
                sizes="(max-width: 640px) 130px, 150px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className="absolute inset-0 bg-primary"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(212,163,115,0.18) 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                }}
                aria-hidden
              />
            )}
            <span className="pointer-events-none absolute left-1 top-1 h-2 w-2 border-l-2 border-t-2 border-accent" aria-hidden />
            <span className="pointer-events-none absolute right-1 top-1 h-2 w-2 border-r-2 border-t-2 border-accent" aria-hidden />
            <span className="pointer-events-none absolute bottom-1 left-1 h-2 w-2 border-b-2 border-l-2 border-accent" aria-hidden />
            <span className="pointer-events-none absolute bottom-1 right-1 h-2 w-2 border-b-2 border-r-2 border-accent" aria-hidden />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-between p-4 sm:p-5">
            <div>
              <div className="font-display text-[18px] italic leading-none text-accent">
                {romanIndex}
              </div>
              <h3 className="mt-1 font-heading text-[16px] font-extrabold leading-tight tracking-[-0.015em] text-primary sm:text-[18px]">
                {treatment.title}
              </h3>
              {treatment.description && (
                <p className="mt-1.5 line-clamp-2 font-body text-[12.5px] italic leading-[1.45] text-dark/65">
                  {treatment.description}
                </p>
              )}
            </div>

            <div
              className="mt-3 h-px"
              style={{
                background:
                  'linear-gradient(to right, rgba(212,163,115,0.5), transparent)',
              }}
              aria-hidden
            />

            <div className="mt-2 flex items-center justify-between font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-dark/55">
              <span>{treatment.duration ?? 'See practitioner'}</span>
              <span className="text-primary transition-transform duration-300 group-hover:translate-x-0.5">
                Read →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/TherapyCard.tsx
git commit -m "feat(treatments): TherapyCard — 130px image + roman + title + duration card"
```

---

### Task 13: Build `TherapyGrid` component

**Files:**
- Create: `src/components/treatments/TherapyGrid.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { motion } from 'framer-motion'

import TherapyCard from '@/components/treatments/TherapyCard'
import { staggerParent, inViewOnce } from '@/lib/motion'
import type { TreatmentSummary } from '@/types/treatments'

interface TherapyGridProps {
  categorySlug: string
  treatments: TreatmentSummary[]
}

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
                'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx']

export default function TherapyGrid({ categorySlug, treatments }: TherapyGridProps) {
  if (treatments.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center justify-center text-center">
          <span
            aria-hidden
            className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_5px_rgba(212,163,115,0.18)]"
          />
          <p className="mt-6 font-body text-[20px] italic leading-[1.3] text-primary">
            Chapter in preparation.
          </p>
          <p className="mt-3 font-heading text-[10.5px] font-semibold uppercase tracking-[0.24em] text-dark/40">
            Awaiting therapy entries from the clinic
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerParent(0.05, 0.03)}
      initial="initial"
      whileInView="animate"
      viewport={inViewOnce}
      className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-6 pb-20 pt-10 sm:px-8 md:grid-cols-2 md:pb-28 lg:px-12"
    >
      {treatments.map((t, i) => (
        <TherapyCard
          key={t._id}
          treatment={t}
          categorySlug={categorySlug}
          romanIndex={`${ROMAN[i] ?? String(i + 1)}.`}
        />
      ))}
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/TherapyGrid.tsx
git commit -m "feat(treatments): TherapyGrid — 2-up grid with roman numbering"
```

---

### Task 14: Build Level 2 route — `/treatments/[categorySlug]/page.tsx`

**Files:**
- Create: `src/app/(public)/treatments/[categorySlug]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import CategoryPageHeader from '@/components/treatments/CategoryPageHeader'
import FreeConsultationBlock from '@/components/treatments/FreeConsultationBlock'
import TherapyGrid from '@/components/treatments/TherapyGrid'
import { sanityClient } from '@/sanity/client'
import { isSanityConfigured } from '@/sanity/env'
import { CATEGORY_BY_SLUG_QUERY, CATEGORY_SLUGS_QUERY } from '@/sanity/queries'
import type { TreatmentCategory, TreatmentSummary } from '@/types/treatments'

export const revalidate = 30
export const dynamicParams = true

interface CategoryPageData extends TreatmentCategory {
  treatments: TreatmentSummary[]
}

async function loadCategory(slug: string): Promise<CategoryPageData | null> {
  if (!isSanityConfigured) return null
  try {
    return await sanityClient.fetch<CategoryPageData | null>(
      CATEGORY_BY_SLUG_QUERY,
      { slug },
    )
  } catch (err) {
    console.error(`[treatments/${slug}] Sanity fetch failed:`, err)
    return null
  }
}

export async function generateStaticParams(): Promise<Array<{ categorySlug: string }>> {
  if (!isSanityConfigured) return []
  try {
    const slugs = await sanityClient.fetch<string[]>(CATEGORY_SLUGS_QUERY)
    return (slugs ?? []).map((slug) => ({ categorySlug: slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: { categorySlug: string }
}): Promise<Metadata> {
  const category = await loadCategory(params.categorySlug)
  if (!category) {
    return {
      title: 'Category not found',
      robots: { index: false, follow: true },
    }
  }
  return {
    title: `${category.title} — Kerala Ayurvedic Lifestyle`,
    description: category.description ?? undefined,
    alternates: { canonical: `/treatments/${category.slug}` },
    openGraph: {
      title: `${category.title} — Kerala Ayurvedic Lifestyle`,
      description: category.description ?? undefined,
      type: 'website',
      url: `https://keralaayurvedic.com/treatments/${category.slug}`,
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: { categorySlug: string }
}) {
  const category = await loadCategory(params.categorySlug)
  if (!category) notFound()

  return (
    <>
      <section className="relative overflow-hidden bg-cream pb-12">
        <CategoryPageHeader
          title={category.title}
          description={category.description}
          order={category.order}
          treatmentCount={category.treatments.length}
        />
        <TherapyGrid
          categorySlug={category.slug}
          treatments={category.treatments}
        />
      </section>
      <FreeConsultationBlock />
    </>
  )
}
```

- [ ] **Step 2: Smoke test in browser**

Run: `npm run dev` (if not running).
Visit `http://localhost:3000/treatments` → click a category box → land on `/treatments/<slug>`.
Expected: breadcrumb, chapter number, title, italic dek, gold rule, therapy count, 2-up grid of TherapyCards (1-col on mobile), FreeConsultationBlock at bottom. Click a therapy card → 404 (Level 3 route doesn't exist yet, expected until Task 32).

- [ ] **Step 3: Verify 404 for nonexistent slug**

Visit `/treatments/this-does-not-exist`.
Expected: Next.js 404 page.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/treatments/\[categorySlug\]/page.tsx
git commit -m "feat(treatments): Level 2 /treatments/[categorySlug] page with ISR"
```

---

## Phase E — Level 3 (treatment detail) atoms

### Task 15: Build `TherapyHero` component

**Files:**
- Create: `src/components/treatments/TherapyHero.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Image from 'next/image'

import { urlForImage } from '@/sanity/image'
import type { SanityImageRef } from '@/types/treatments'

interface TherapyHeroProps {
  image: SanityImageRef | null
  categoryTitle: string
  treatmentOrder: number | null
  treatmentTitle: string
}

export default function TherapyHero({
  image,
  categoryTitle,
  treatmentOrder,
  treatmentTitle,
}: TherapyHeroProps) {
  const number =
    treatmentOrder != null ? String(treatmentOrder + 1).padStart(2, '0') : null
  const tagText = number ? `${categoryTitle} · No. ${number}` : categoryTitle

  return (
    <div className="relative w-full overflow-hidden bg-primary">
      <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]">
        {image ? (
          <Image
            src={urlForImage(image).width(2400).fit('crop').url()}
            alt={image.alt ?? `${treatmentTitle} hero image`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center bg-primary"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(212,163,115,0.12) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            <p className="font-body text-[15px] italic text-white/60">
              Photo coming soon
            </p>
          </div>
        )}
        <div className="absolute left-4 top-4 max-w-[80%] truncate bg-primary/85 px-3 py-1.5 text-accent sm:left-6 sm:top-6">
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em]">
            {tagText}
          </span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/TherapyHero.tsx
git commit -m "feat(treatments): TherapyHero with category+number tag + fallback panel"
```

---

### Task 16: Build `TherapyMarginalia` component

**Files:**
- Create: `src/components/treatments/TherapyMarginalia.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from 'next/link'

interface MarginaliaEntry {
  label: string
  value: string
  isDevanagari?: boolean
  href?: string
}

interface TherapyMarginaliaProps {
  origin: string | null
  sanskritName: string | null
  practitioner: string
  categoryTitle: string
  categorySlug: string
  /** When true, renders the inline mobile variant (no sticky positioning). */
  variant?: 'desktop' | 'mobile'
}

export default function TherapyMarginalia({
  origin,
  sanskritName,
  practitioner,
  categoryTitle,
  categorySlug,
  variant = 'desktop',
}: TherapyMarginaliaProps) {
  const entries: MarginaliaEntry[] = []
  if (origin) entries.push({ label: 'Origin', value: origin })
  if (sanskritName) entries.push({ label: 'Sanskrit', value: sanskritName, isDevanagari: true })
  entries.push({ label: 'Practitioner', value: practitioner })
  entries.push({
    label: 'Category',
    value: categoryTitle,
    href: `/treatments/${categorySlug}`,
  })

  const containerClass =
    variant === 'mobile'
      ? 'grid grid-cols-1 gap-5 rounded-lg border border-accent/25 bg-white/60 p-5 sm:grid-cols-2'
      : 'space-y-7'

  return (
    <aside aria-label="About this therapy" className={containerClass}>
      {entries.map((entry) => (
        <div key={entry.label}>
          <div className="mb-2 h-px w-6 bg-accent" aria-hidden />
          <div className="font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-accent">
            {entry.label}
          </div>
          <div
            className={`mt-1.5 font-body text-[13px] italic leading-[1.45] text-dark/70 ${
              entry.isDevanagari ? 'font-devanagari' : ''
            }`}
          >
            {entry.href ? (
              <Link href={entry.href} className="not-italic underline decoration-accent/40 underline-offset-2 hover:text-primary">
                {entry.value}
              </Link>
            ) : (
              entry.value
            )}
          </div>
        </div>
      ))}
    </aside>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/TherapyMarginalia.tsx
git commit -m "feat(treatments): TherapyMarginalia — desktop sidebar + mobile inline variants"
```

---

### Task 17: Build `BookingSidebar` component

**Files:**
- Create: `src/components/treatments/BookingSidebar.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from 'next/link'

interface BookingSidebarProps {
  treatmentTitle: string
  duration: string | null
  sessionsRecommended: string | null
  whatsappHref: string
}

export default function BookingSidebar({
  treatmentTitle,
  duration,
  sessionsRecommended,
  whatsappHref,
}: BookingSidebarProps) {
  return (
    <div className="sticky top-24 hidden lg:block">
      <div className="relative rounded-xl border border-accent/40 bg-white p-5 shadow-elevated">
        <span className="absolute -top-2 right-3 rounded bg-accent px-2 py-0.5 font-heading text-[8px] font-bold uppercase tracking-[0.2em] text-white">
          Booking
        </span>

        <div className="mb-3 font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-accent">
          {treatmentTitle}
        </div>

        <dl className="divide-y divide-accent/20">
          <Row label="Duration" value={duration ?? 'See practitioner'} />
          <Row label="Sessions" value={sessionsRecommended ?? 'Per consultation'} />
          <Row label="Price" value="On consultation" valueClass="text-accent" />
        </dl>

        <Link
          href="/book/consultation"
          className="mt-4 block rounded bg-accent px-4 py-3 text-center font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Book Treatment
        </Link>
        <Link
          href={whatsappHref}
          className="mt-2 block rounded border border-primary/40 px-4 py-3 text-center font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          WhatsApp Us
        </Link>
      </div>
    </div>
  )
}

function Row({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2 font-heading text-[11px]">
      <dt className="tracking-[0.1em] text-dark/55">{label.toUpperCase()}</dt>
      <dd className={`font-bold text-dark ${valueClass}`}>{value}</dd>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/BookingSidebar.tsx
git commit -m "feat(treatments): BookingSidebar — sticky desktop card with Book + WhatsApp"
```

---

### Task 18: Build `MobileBookingBar` component

**Files:**
- Create: `src/components/treatments/MobileBookingBar.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from 'next/link'

interface MobileBookingBarProps {
  treatmentTitle: string
}

/**
 * Fixed bottom bar on mobile/tablet. Hidden at ≥lg breakpoint where
 * BookingSidebar takes over.
 */
export default function MobileBookingBar({ treatmentTitle }: MobileBookingBarProps) {
  return (
    <div
      role="region"
      aria-label={`Book ${treatmentTitle}`}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-accent/30 bg-cream/95 px-4 py-3 backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-accent">
            Book
          </div>
          <div className="truncate font-heading text-[13px] font-extrabold tracking-[-0.01em] text-primary">
            {treatmentTitle}
          </div>
        </div>
        <Link
          href="/book/consultation"
          className="shrink-0 rounded bg-accent px-4 py-2.5 font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Book →
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/MobileBookingBar.tsx
git commit -m "feat(treatments): MobileBookingBar — fixed bottom CTA below lg breakpoint"
```

---

### Task 19: Build `TherapyStickyBar` component

**Files:**
- Create: `src/components/treatments/TherapyStickyBar.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface TherapyStickyBarProps {
  treatmentTitle: string
  /** Pixel scroll-Y above which the bar is hidden. */
  showAfter?: number
}

/**
 * Compact deep-green bar that slides in after the user scrolls past
 * the hero (default 320px). Hidden at the top of the page so it doesn't
 * compete with the page title. Hidden on mobile to avoid stacking with
 * the MobileBookingBar.
 */
export default function TherapyStickyBar({
  treatmentTitle,
  showAfter = 320,
}: TherapyStickyBarProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [showAfter])

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 top-0 z-30 hidden border-b border-accent/40 bg-primary/96 text-white backdrop-blur-md transition-transform duration-300 lg:block ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2.5 lg:px-12">
        <div className="flex min-w-0 items-center gap-3">
          <span className="font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-white/50">
            Treatment
          </span>
          <span className="truncate font-heading text-[13px] font-extrabold tracking-[-0.01em]">
            {treatmentTitle}
          </span>
        </div>
        <Link
          href="/book/consultation"
          className="shrink-0 rounded bg-accent px-4 py-1.5 font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-accent/90"
        >
          Book →
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/TherapyStickyBar.tsx
git commit -m "feat(treatments): TherapyStickyBar — slides in after scrolling past hero"
```

---

### Task 20: Build `TherapySwitcher` component

**Files:**
- Create: `src/components/treatments/TherapySwitcher.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

import { findPrevNext } from '@/lib/treatments/pager'
import type { TreatmentSibling } from '@/types/treatments'

interface TherapySwitcherProps {
  categoryTitle: string
  categorySlug: string
  siblings: TreatmentSibling[]
  currentSlug: string
}

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
                'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx']

export default function TherapySwitcher({
  categoryTitle,
  categorySlug,
  siblings,
  currentSlug,
}: TherapySwitcherProps) {
  const stripRef = useRef<HTMLDivElement>(null)
  const activeChipRef = useRef<HTMLAnchorElement>(null)

  // Scroll the active chip into view on mount.
  useEffect(() => {
    const chip = activeChipRef.current
    const strip = stripRef.current
    if (!chip || !strip) return
    const chipRect = chip.getBoundingClientRect()
    const stripRect = strip.getBoundingClientRect()
    if (chipRect.left < stripRect.left || chipRect.right > stripRect.right) {
      chip.scrollIntoView({ block: 'nearest', inline: 'center' })
    }
  }, [currentSlug])

  if (siblings.length === 0) return null

  const { prev, next } = findPrevNext(siblings, currentSlug)

  return (
    <nav
      aria-label="Browse therapies in this category"
      className="relative border-b border-accent/25 bg-primary/[0.04]"
    >
      <div className="mx-auto max-w-7xl px-6 py-3.5 sm:px-8 lg:px-12">
        <div className="font-heading text-[9px] font-bold uppercase tracking-[0.28em] text-primary/55">
          Browse this chapter · {categoryTitle}
        </div>

        <div
          ref={stripRef}
          className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-1"
        >
          {siblings.map((s, i) => {
            const isActive = s.slug === currentSlug
            return (
              <Link
                key={s._id}
                ref={isActive ? activeChipRef : undefined}
                href={`/treatments/${s.categorySlug}/${s.slug}`}
                aria-current={isActive ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 font-heading text-[11px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'border border-accent/30 bg-white text-primary/65 hover:text-primary'
                }`}
              >
                <span className={`font-display italic text-[10px] tracking-[0.06em] ${isActive ? 'text-accent' : 'text-accent/80'}`}>
                  {ROMAN[i] ?? String(i + 1)}.
                </span>
                <span>{s.title}</span>
              </Link>
            )
          })}
        </div>

        {(prev || next) && (
          <div className="mt-3 flex items-center justify-between font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-primary/55">
            {prev ? (
              <Link
                href={`/treatments/${prev.categorySlug}/${prev.slug}`}
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <span>←</span>
                <span>Previous</span>
                <span className="font-body text-[12px] italic tracking-normal normal-case text-primary">
                  {prev.title}
                </span>
              </Link>
            ) : <span />}
            {next ? (
              <Link
                href={`/treatments/${next.categorySlug}/${next.slug}`}
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <span className="font-body text-[12px] italic tracking-normal normal-case text-primary">
                  {next.title}
                </span>
                <span>Next</span>
                <span>→</span>
              </Link>
            ) : <span />}
          </div>
        )}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/TherapySwitcher.tsx
git commit -m "feat(treatments): TherapySwitcher — chip strip + prev/next pager at top of L3"
```

---

### Task 21: Build `TherapyBenefits` component

**Files:**
- Create: `src/components/treatments/TherapyBenefits.tsx`

- [ ] **Step 1: Create the component**

```tsx
interface TherapyBenefitsProps {
  items: string[]
}

export default function TherapyBenefits({ items }: TherapyBenefitsProps) {
  if (items.length === 0) return null
  return (
    <ul className="grid grid-cols-1 gap-x-7 gap-y-1 sm:grid-cols-2">
      {items.map((b) => (
        <li
          key={b}
          className="flex items-start gap-3 border-b border-accent/15 py-2.5 font-body text-[14px] leading-[1.5] text-dark/78"
        >
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
            aria-hidden
          />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/TherapyBenefits.tsx
git commit -m "feat(treatments): TherapyBenefits — 2-col list with gold dot markers"
```

---

### Task 22: Build `TherapyProcedure` component

**Files:**
- Create: `src/components/treatments/TherapyProcedure.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { ProcedureStep } from '@/types/treatments'

interface TherapyProcedureProps {
  steps: ProcedureStep[]
}

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x']

export default function TherapyProcedure({ steps }: TherapyProcedureProps) {
  if (steps.length === 0) return null
  return (
    <ol className="divide-y divide-accent/20">
      {steps.map((step, i) => (
        <li key={i} className="grid grid-cols-[56px_1fr] items-start gap-5 py-4">
          <span
            aria-hidden
            className="font-display text-[32px] italic leading-none text-accent"
          >
            {ROMAN[i] ?? String(i + 1)}.
          </span>
          <div>
            <h4 className="font-heading text-[15px] font-bold text-primary">
              {step.title}
            </h4>
            <p className="mt-1 font-body text-[14px] leading-[1.55] text-dark/72">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/TherapyProcedure.tsx
git commit -m "feat(treatments): TherapyProcedure — numbered roman-italic steps"
```

---

### Task 23: Build `TherapyContraindications` component

**Files:**
- Create: `src/components/treatments/TherapyContraindications.tsx`

- [ ] **Step 1: Create the component**

```tsx
interface TherapyContraindicationsProps {
  text: string
}

export default function TherapyContraindications({ text }: TherapyContraindicationsProps) {
  if (!text) return null
  return (
    <div className="rounded-r border-l-[3px] border-accent bg-accent/10 px-5 py-4">
      <div className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
        Please book a consultation if you have
      </div>
      <p className="mt-2 font-body text-[14px] leading-[1.6] text-dark/75">
        {text}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/TherapyContraindications.tsx
git commit -m "feat(treatments): TherapyContraindications — accent-bordered callout"
```

---

### Task 24: Build `TherapyGallery` component

**Files:**
- Create: `src/components/treatments/TherapyGallery.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Image from 'next/image'

import { urlForImage } from '@/sanity/image'
import type { SanityImageRef } from '@/types/treatments'

interface TherapyGalleryProps {
  images: SanityImageRef[]
}

export default function TherapyGallery({ images }: TherapyGalleryProps) {
  if (images.length === 0) return null
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {images.map((img, i) => (
        <div key={i} className="relative aspect-square overflow-hidden rounded">
          <Image
            src={urlForImage(img).width(500).height(500).fit('crop').url()}
            alt={img.alt ?? `Treatment gallery image ${i + 1}`}
            fill
            sizes="(max-width: 640px) 50vw, 200px"
            className="object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/TherapyGallery.tsx
git commit -m "feat(treatments): TherapyGallery — lazy-loaded 4-col gallery"
```

---

### Task 25: Build `TherapyMidCTA` component

**Files:**
- Create: `src/components/treatments/TherapyMidCTA.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from 'next/link'

interface TherapyMidCTAProps {
  treatmentTitle: string
  whatsappHref: string
}

export default function TherapyMidCTA({
  treatmentTitle,
  whatsappHref,
}: TherapyMidCTAProps) {
  return (
    <div className="my-10 rounded-xl bg-primary p-8 text-center text-white sm:p-12">
      <div className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
        Begin your journey
      </div>
      <h3 className="mt-3 font-heading text-[24px] font-extrabold leading-[1.15] tracking-[-0.02em] sm:text-[30px]">
        Book {treatmentTitle}
        <br />
        with a Kerala Vaidya
      </h3>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/book/consultation"
          className="rounded bg-accent px-5 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          Book this treatment
        </Link>
        <Link
          href="/book/consultation"
          className="rounded border border-white/40 px-5 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          Free Consultation
        </Link>
        <Link
          href={whatsappHref}
          className="rounded border border-white/40 px-5 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          WhatsApp
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/TherapyMidCTA.tsx
git commit -m "feat(treatments): TherapyMidCTA — mid-page dark-green conversion block"
```

---

### Task 26: Build `RelatedTherapies` component

**Files:**
- Create: `src/components/treatments/RelatedTherapies.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Image from 'next/image'
import Link from 'next/link'

import { urlForImage } from '@/sanity/image'
import type { SanityImageRef } from '@/types/treatments'

interface RelatedItem {
  _id: string
  title: string
  slug: string
  categorySlug: string
  duration: string | null
  heroImage: SanityImageRef | null
  categoryTitle: string
}

interface RelatedTherapiesProps {
  items: RelatedItem[]
}

export default function RelatedTherapies({ items }: RelatedTherapiesProps) {
  if (items.length === 0) return null
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((t) => (
        <Link
          key={t._id}
          href={`/treatments/${t.categorySlug}/${t.slug}`}
          className="group overflow-hidden rounded-lg border border-accent/25 bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-[2px] hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-primary">
            {t.heroImage ? (
              <Image
                src={urlForImage(t.heroImage).width(600).height(450).fit('crop').url()}
                alt={t.heroImage.alt ?? t.title}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(212,163,115,0.18) 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                }}
                aria-hidden
              />
            )}
            <span className="pointer-events-none absolute left-1 top-1 h-2 w-2 border-l-2 border-t-2 border-accent" aria-hidden />
            <span className="pointer-events-none absolute right-1 top-1 h-2 w-2 border-r-2 border-t-2 border-accent" aria-hidden />
            <span className="pointer-events-none absolute bottom-1 left-1 h-2 w-2 border-b-2 border-l-2 border-accent" aria-hidden />
            <span className="pointer-events-none absolute bottom-1 right-1 h-2 w-2 border-b-2 border-r-2 border-accent" aria-hidden />
          </div>
          <div className="p-3.5">
            <div className="font-heading text-[14px] font-bold tracking-[-0.01em] text-primary">
              {t.title}
            </div>
            <div className="mt-1 font-heading text-[9px] font-semibold uppercase tracking-[0.2em] text-dark/50">
              {t.categoryTitle}
              {t.duration ? ` · ${t.duration}` : ''}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/RelatedTherapies.tsx
git commit -m "feat(treatments): RelatedTherapies — 3-card grid at bottom of L3"
```

---

### Task 27: Build `TherapyPager` component

**Files:**
- Create: `src/components/treatments/TherapyPager.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from 'next/link'

import type { TreatmentSibling } from '@/types/treatments'

interface TherapyPagerProps {
  prev: TreatmentSibling | null
  next: TreatmentSibling | null
}

export default function TherapyPager({ prev, next }: TherapyPagerProps) {
  if (!prev && !next) return null
  return (
    <nav
      aria-label="Adjacent therapies in this chapter"
      className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/treatments/${prev.categorySlug}/${prev.slug}`}
          className="group rounded-lg border border-accent/30 bg-white p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-[2px] hover:shadow-elevated"
        >
          <div className="font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-accent">
            ← Previous
          </div>
          <div className="mt-1.5 font-heading text-[16px] font-extrabold tracking-[-0.01em] text-primary">
            {prev.title}
          </div>
        </Link>
      ) : <span />}

      {next ? (
        <Link
          href={`/treatments/${next.categorySlug}/${next.slug}`}
          className="group rounded-lg border border-accent/30 bg-white p-5 text-right transition-[transform,box-shadow] duration-300 hover:-translate-y-[2px] hover:shadow-elevated"
        >
          <div className="font-heading text-[9px] font-bold uppercase tracking-[0.22em] text-accent">
            Next →
          </div>
          <div className="mt-1.5 font-heading text-[16px] font-extrabold tracking-[-0.01em] text-primary">
            {next.title}
          </div>
        </Link>
      ) : <span />}
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/treatments/TherapyPager.tsx
git commit -m "feat(treatments): TherapyPager — prev/next cards below related grid"
```

---

## Phase F — Level 3 page assembly

### Task 28: Verify PortableText component already exists

**Files:**
- Read: `src/components/blog/PortableTextComponents.tsx`

- [ ] **Step 1: Read the existing setup**

The blog already renders Portable Text via `<PortableText components={...}>` in `src/components/blog/PostBody.tsx`. Confirm the file exists and is importable. We'll reuse the same `components` object for treatment bodies.

- [ ] **Step 2: Note any blog-specific renderers**

If `PortableTextComponents` includes blog-only types (e.g. inline-image breakouts referencing posts), they should still work for treatments — `block` and standard marks are universal. If a renderer specifically queries blog data, document the limitation in a code comment in Task 29.

No commit (read-only step).

---

### Task 29: Build Level 3 route — `/treatments/[categorySlug]/[treatmentSlug]/page.tsx`

**Files:**
- Create: `src/app/(public)/treatments/[categorySlug]/[treatmentSlug]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'

import BookingSidebar from '@/components/treatments/BookingSidebar'
import FreeConsultationBlock from '@/components/treatments/FreeConsultationBlock'
import MobileBookingBar from '@/components/treatments/MobileBookingBar'
import RelatedTherapies from '@/components/treatments/RelatedTherapies'
import TherapyBenefits from '@/components/treatments/TherapyBenefits'
import TherapyContraindications from '@/components/treatments/TherapyContraindications'
import TherapyGallery from '@/components/treatments/TherapyGallery'
import TherapyHero from '@/components/treatments/TherapyHero'
import TherapyMarginalia from '@/components/treatments/TherapyMarginalia'
import TherapyMidCTA from '@/components/treatments/TherapyMidCTA'
import TherapyPager from '@/components/treatments/TherapyPager'
import TherapyProcedure from '@/components/treatments/TherapyProcedure'
import TherapyStickyBar from '@/components/treatments/TherapyStickyBar'
import TherapySwitcher from '@/components/treatments/TherapySwitcher'
import { portableTextComponents } from '@/components/blog/PortableTextComponents'
import { sanityClient } from '@/sanity/client'
import { urlForImage } from '@/sanity/image'
import { isSanityConfigured } from '@/sanity/env'
import {
  TREATMENT_BY_SLUG_QUERY,
  TREATMENT_SIBLINGS_QUERY,
  TREATMENT_SLUG_PAIRS_QUERY,
} from '@/sanity/queries'
import { findPrevNext } from '@/lib/treatments/pager'
import type {
  TreatmentDetail,
  TreatmentSibling,
} from '@/types/treatments'

export const revalidate = 30
export const dynamicParams = true

const PRACTITIONER = 'Vaidya Akhil H.S., B.A.M.S., M.D. (Ayu)'

async function loadDetail(
  categorySlug: string,
  treatmentSlug: string,
): Promise<{ treatment: TreatmentDetail | null; siblings: TreatmentSibling[] }> {
  if (!isSanityConfigured) return { treatment: null, siblings: [] }
  try {
    const treatment = await sanityClient.fetch<TreatmentDetail | null>(
      TREATMENT_BY_SLUG_QUERY,
      { categorySlug, treatmentSlug },
    )
    if (!treatment) return { treatment: null, siblings: [] }
    const siblings = await sanityClient.fetch<TreatmentSibling[]>(
      TREATMENT_SIBLINGS_QUERY,
      { categoryId: treatment.category._id },
    )
    return { treatment, siblings: siblings ?? [] }
  } catch (err) {
    console.error(`[treatments/${categorySlug}/${treatmentSlug}] fetch failed:`, err)
    return { treatment: null, siblings: [] }
  }
}

export async function generateStaticParams(): Promise<
  Array<{ categorySlug: string; treatmentSlug: string }>
> {
  if (!isSanityConfigured) return []
  try {
    const pairs = await sanityClient.fetch<
      Array<{ categorySlug: string; treatmentSlug: string }>
    >(TREATMENT_SLUG_PAIRS_QUERY)
    return pairs ?? []
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: { categorySlug: string; treatmentSlug: string }
}): Promise<Metadata> {
  const { treatment } = await loadDetail(params.categorySlug, params.treatmentSlug)
  if (!treatment) {
    return { title: 'Treatment not found', robots: { index: false, follow: true } }
  }
  const ogImage = treatment.heroImage
    ? urlForImage(treatment.heroImage).width(1200).height(630).fit('crop').url()
    : undefined
  return {
    title: `${treatment.title} — ${treatment.category.title} | Kerala Ayurvedic Lifestyle`,
    description: treatment.description ?? undefined,
    alternates: {
      canonical: `/treatments/${treatment.category.slug}/${treatment.slug}`,
    },
    openGraph: {
      title: `${treatment.title} — Kerala Ayurvedic Lifestyle`,
      description: treatment.description ?? undefined,
      type: 'article',
      url: `https://keralaayurvedic.com/treatments/${treatment.category.slug}/${treatment.slug}`,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function TreatmentDetailPage({
  params,
}: {
  params: { categorySlug: string; treatmentSlug: string }
}) {
  const { treatment, siblings } = await loadDetail(
    params.categorySlug,
    params.treatmentSlug,
  )
  if (!treatment) notFound()

  const { prev, next } = findPrevNext(siblings, treatment.slug)
  const whatsappMessage = `Hi, I'd like to book a ${treatment.title} session.`
  const whatsappHref = `https://wa.me/601165043436?text=${encodeURIComponent(whatsappMessage)}`

  // Related: siblings excluding current, max 3.
  const related = siblings
    .filter((s) => s.slug !== treatment.slug)
    .slice(0, 3)
    .map((s) => ({
      _id: s._id,
      title: s.title,
      slug: s.slug,
      categorySlug: s.categorySlug,
      duration: s.duration,
      heroImage: s.heroImage,
      categoryTitle: treatment.category.title,
    }))

  // JSON-LD MedicalProcedure
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: treatment.title,
    description: treatment.description ?? undefined,
    bodyLocation: undefined,
    procedureType: 'TherapeuticProcedure',
    performer: { '@type': 'Person', name: PRACTITIONER },
    provider: {
      '@type': 'MedicalBusiness',
      name: 'Kerala Ayurvedic Lifestyle',
      url: 'https://keralaayurvedic.com',
    },
    url: `https://keralaayurvedic.com/treatments/${treatment.category.slug}/${treatment.slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <TherapyStickyBar treatmentTitle={treatment.title} />
      <TherapySwitcher
        categoryTitle={treatment.category.title}
        categorySlug={treatment.category.slug}
        siblings={siblings}
        currentSlug={treatment.slug}
      />

      <TherapyHero
        image={treatment.heroImage}
        categoryTitle={treatment.category.title}
        treatmentOrder={treatment.category.order}
        treatmentTitle={treatment.title}
      />

      <section className="relative bg-cream pb-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 sm:px-8 lg:grid-cols-[220px_minmax(0,720px)_minmax(0,260px)] lg:gap-12 lg:px-12 lg:py-16">

          {/* LEFT — desktop marginalia (hidden <lg) */}
          <div className="hidden lg:block">
            <TherapyMarginalia
              origin={treatment.origin}
              sanskritName={treatment.sanskritName}
              practitioner={PRACTITIONER}
              categoryTitle={treatment.category.title}
              categorySlug={treatment.category.slug}
              variant="desktop"
            />
          </div>

          {/* CENTER — body */}
          <article className="min-w-0">
            {/* breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-dark/50"
            >
              <Link href="/treatments" className="text-accent hover:text-primary">
                Treatments
              </Link>
              <span className="mx-2 text-dark/30">/</span>
              <Link
                href={`/treatments/${treatment.category.slug}`}
                className="text-accent hover:text-primary"
              >
                {treatment.category.title}
              </Link>
              <span className="mx-2 text-dark/30">/</span>
              <span>{treatment.title}</span>
            </nav>

            <div className="mt-5 font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
              Therapy · No. {String((treatment.category.order ?? 0) + 1).padStart(2, '0')}
            </div>
            <h1
              className="mt-2 font-heading font-extrabold leading-[1.05] tracking-[-0.025em] text-primary"
              style={{ fontSize: 'clamp(2rem, 5.2vw, 2.6rem)' }}
            >
              {treatment.title}
            </h1>
            {treatment.description && (
              <p className="mt-4 font-body text-[18px] italic leading-[1.55] text-dark/72">
                {treatment.description}
              </p>
            )}

            {/* Mobile-only marginalia (hidden ≥lg where the sidebar takes over) */}
            <div className="mt-8 lg:hidden">
              <TherapyMarginalia
                origin={treatment.origin}
                sanskritName={treatment.sanskritName}
                practitioner={PRACTITIONER}
                categoryTitle={treatment.category.title}
                categorySlug={treatment.category.slug}
                variant="mobile"
              />
            </div>

            {/* I · Overview */}
            {treatment.body && treatment.body.length > 0 && (
              <section className="mt-12">
                <SectionHead numeral="I" label="Overview" />
                <div className="prose prose-journal mt-4 max-w-none">
                  <PortableText
                    value={treatment.body}
                    components={portableTextComponents}
                  />
                </div>
              </section>
            )}

            {/* II · Gallery */}
            {treatment.gallery && treatment.gallery.length > 0 && (
              <section className="mt-12">
                <SectionHead numeral="II" label="Gallery" />
                <div className="mt-4">
                  <TherapyGallery images={treatment.gallery} />
                </div>
              </section>
            )}

            {/* III · Benefits */}
            {treatment.benefits && treatment.benefits.length > 0 && (
              <section className="mt-12">
                <SectionHead numeral="III" label="Benefits" />
                <h3 className="mt-4 font-heading text-[22px] font-extrabold tracking-[-0.02em] text-primary">
                  What this therapy supports
                </h3>
                <div className="mt-4">
                  <TherapyBenefits items={treatment.benefits} />
                </div>
              </section>
            )}

            {/* IV · What to expect */}
            {treatment.procedureSteps && treatment.procedureSteps.length > 0 && (
              <section className="mt-12">
                <SectionHead numeral="IV" label="What to expect" />
                <h3 className="mt-4 font-heading text-[22px] font-extrabold tracking-[-0.02em] text-primary">
                  The session, step by step
                </h3>
                <div className="mt-4">
                  <TherapyProcedure steps={treatment.procedureSteps} />
                </div>
              </section>
            )}

            {/* V · Not suitable for */}
            {treatment.contraindications && (
              <section className="mt-12">
                <SectionHead numeral="V" label="Not suitable for" />
                <div className="mt-4">
                  <TherapyContraindications text={treatment.contraindications} />
                </div>
              </section>
            )}

            {/* Mid CTA */}
            <TherapyMidCTA
              treatmentTitle={treatment.title}
              whatsappHref={whatsappHref}
            />

            {/* VI · Related */}
            {related.length > 0 && (
              <section className="mt-12">
                <SectionHead numeral="VI" label="You may also like" />
                <div className="mt-4">
                  <RelatedTherapies items={related} />
                </div>
              </section>
            )}

            <TherapyPager prev={prev} next={next} />
          </article>

          {/* RIGHT — sticky desktop booking card */}
          <BookingSidebar
            treatmentTitle={treatment.title}
            duration={treatment.duration}
            sessionsRecommended={treatment.sessionsRecommended}
            whatsappHref={whatsappHref}
          />
        </div>
      </section>

      <MobileBookingBar treatmentTitle={treatment.title} />

      <div className="pb-16 lg:pb-0" aria-hidden />
      <FreeConsultationBlock whatsappMessage={whatsappMessage} />
    </>
  )
}

/* ───────────────────────────────────────────────────────────────────
 * Reusable section heading — Roman numeral + label with gold rule.
 * ─────────────────────────────────────────────────────────────────── */
function SectionHead({ numeral, label }: { numeral: string; label: string }) {
  return (
    <div className="flex items-center gap-3 font-heading text-[10.5px] font-bold uppercase tracking-[0.28em] text-accent">
      <span>
        {numeral} · {label}
      </span>
      <span
        className="h-px flex-1"
        style={{
          background: 'linear-gradient(to right, rgba(212,163,115,0.5), transparent)',
        }}
        aria-hidden
      />
    </div>
  )
}
```

- [ ] **Step 2: Check `portableTextComponents` export name**

If `src/components/blog/PortableTextComponents.tsx` exports the components object under a different name (e.g. default export or `components`), adjust the import line. Open the file and verify the export name.

If the file uses `export default`:
```tsx
import portableTextComponents from '@/components/blog/PortableTextComponents'
```

If it uses a named export like `export const components`:
```tsx
import { components as portableTextComponents } from '@/components/blog/PortableTextComponents'
```

Update the import line accordingly.

- [ ] **Step 3: Smoke test in browser**

Run: `npm run dev` (if not running).
Visit `http://localhost:3000/treatments` → click a category → click a therapy.

Expected on desktop (≥1024px):
- Sticky switcher chip strip + prev/next text at top of page.
- Hero image (or fallback panel) with category tag overlay.
- 3-column body: left marginalia, center editorial column, right sticky booking card.
- Sections render only if their data is present.
- After scrolling past hero, the top sticky bar slides in.
- Mid-page green CTA block.
- Related therapies grid (siblings without hero images on first render — that's fine, they show corner-pattern fallback).
- Pager at the end.
- FreeConsultationBlock at the bottom.

Expected on mobile (375px):
- Switcher horizontally scrolls.
- Marginalia tucks into the body as an inline card above the overview.
- BookingSidebar is hidden; MobileBookingBar is fixed at the bottom.
- Body is single column.

- [ ] **Step 4: Test 404 path**

Visit `/treatments/face-care/this-does-not-exist`.
Expected: Next.js 404.

- [ ] **Step 5: Verify JSON-LD**

View page source. Confirm a `<script type="application/ld+json">` block with `"@type": "MedicalProcedure"`.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(public\)/treatments/\[categorySlug\]/\[treatmentSlug\]/page.tsx
git commit -m "feat(treatments): Level 3 detail page with switcher, sticky bar, sidebar, JSON-LD"
```

---

## Phase G — Cleanup, sitemap, verification

### Task 30: Update sitemap to include treatments

**Files:**
- Find existing sitemap; create if missing: `src/app/sitemap.ts`

- [ ] **Step 1: Locate sitemap**

```bash
find "src" -name "sitemap*" 2>/dev/null
```

- [ ] **Step 2A: If a `sitemap.ts` already exists, extend it**

Add a Sanity-driven block that pulls all category and treatment slug pairs and appends them. The existing file's pattern should be followed; below is the snippet to integrate:

```ts
import { sanityClient } from '@/sanity/client'
import { isSanityConfigured } from '@/sanity/env'
import {
  CATEGORY_SLUGS_QUERY,
  TREATMENT_SLUG_PAIRS_QUERY,
} from '@/sanity/queries'

// ... inside the default-export sitemap function:
const base = 'https://keralaayurvedic.com'
const now = new Date()

const treatmentRoutes: MetadataRoute.Sitemap = []
if (isSanityConfigured) {
  try {
    const [categorySlugs, treatmentPairs] = await Promise.all([
      sanityClient.fetch<string[]>(CATEGORY_SLUGS_QUERY),
      sanityClient.fetch<Array<{ categorySlug: string; treatmentSlug: string }>>(
        TREATMENT_SLUG_PAIRS_QUERY,
      ),
    ])
    for (const slug of categorySlugs ?? []) {
      treatmentRoutes.push({
        url: `${base}/treatments/${slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
    for (const pair of treatmentPairs ?? []) {
      treatmentRoutes.push({
        url: `${base}/treatments/${pair.categorySlug}/${pair.treatmentSlug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  } catch (err) {
    console.error('[sitemap] treatments fetch failed:', err)
  }
}

// Merge `treatmentRoutes` into the final returned array.
```

- [ ] **Step 2B: If no `sitemap.ts` exists, create one at `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'

import { sanityClient } from '@/sanity/client'
import { isSanityConfigured } from '@/sanity/env'
import {
  CATEGORY_SLUGS_QUERY,
  TREATMENT_SLUG_PAIRS_QUERY,
} from '@/sanity/queries'

const BASE = 'https://keralaayurvedic.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, priority: 1.0 },
    { url: `${BASE}/treatments`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/about`, lastModified: now, priority: 0.6 },
    { url: `${BASE}/blog`, lastModified: now, priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: now, priority: 0.5 },
  ]

  const treatmentRoutes: MetadataRoute.Sitemap = []
  if (isSanityConfigured) {
    try {
      const [categorySlugs, treatmentPairs] = await Promise.all([
        sanityClient.fetch<string[]>(CATEGORY_SLUGS_QUERY),
        sanityClient.fetch<Array<{ categorySlug: string; treatmentSlug: string }>>(
          TREATMENT_SLUG_PAIRS_QUERY,
        ),
      ])
      for (const slug of categorySlugs ?? []) {
        treatmentRoutes.push({
          url: `${BASE}/treatments/${slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
      for (const pair of treatmentPairs ?? []) {
        treatmentRoutes.push({
          url: `${BASE}/treatments/${pair.categorySlug}/${pair.treatmentSlug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    } catch (err) {
      console.error('[sitemap] treatments fetch failed:', err)
    }
  }

  return [...staticRoutes, ...treatmentRoutes]
}
```

- [ ] **Step 3: Verify sitemap**

Run: `npm run dev`
Visit `http://localhost:3000/sitemap.xml`.
Expected: every category and treatment URL appears.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(seo): include treatment categories + treatments in sitemap"
```

---

### Task 31: Delete retired components

**Files:**
- Delete: `src/components/treatments/TreatmentsMenu.tsx`
- Delete: `src/components/treatments/TreatmentRow.tsx`
- Delete: `src/components/treatments/CategoryTabs.tsx`
- Delete: `src/components/treatments/TreatmentCard.tsx`
- Delete: `src/components/treatments/FreeConsultationBanner.tsx`

- [ ] **Step 1: Verify no remaining imports**

```bash
grep -rln "TreatmentsMenu\|TreatmentRow\|CategoryTabs\|TreatmentCard\|FreeConsultationBanner" src
```

Expected output: empty (no matches). If anything matches outside of the files being deleted, open it and remove the import.

- [ ] **Step 2: Delete the files**

```bash
rm "src/components/treatments/TreatmentsMenu.tsx"
rm "src/components/treatments/TreatmentRow.tsx"
rm "src/components/treatments/CategoryTabs.tsx"
rm "src/components/treatments/TreatmentCard.tsx"
rm "src/components/treatments/FreeConsultationBanner.tsx"
```

- [ ] **Step 3: Also drop the legacy `TREATMENTS_QUERY` and back-compat `Treatment` type**

The legacy `TREATMENTS_QUERY` in `src/sanity/queries.ts` and the back-compat `Treatment` interface in `src/types/treatments.ts` are no longer used. Remove both.

- [ ] **Step 4: Run typecheck + lint**

```bash
npm run lint
npx tsc --noEmit
```

Expected: both succeed with no new errors. (Pre-existing project warnings are fine.)

- [ ] **Step 5: Commit**

```bash
git add src/components/treatments src/sanity/queries.ts src/types/treatments.ts
git commit -m "chore(treatments): remove retired catalogue components + legacy query/type"
```

---

### Task 32: Manual cross-device verification

- [ ] **Step 1: Desktop verification (≥1280px)**

Run: `npm run dev`. Use Chrome at 1440px. Walk the flow:

1. `/treatments` — hero, category grid renders 3 columns, FreeConsultationBlock visible.
2. Click a category — Level 2 loads, 2-up therapy grid.
3. Click a therapy — Level 3 loads. Verify:
   - Switcher chips visible at top, current highlighted in green.
   - Hero image fills 21:9, tag overlay top-left.
   - 3-column body: left marginalia, center text (≤720px), right sticky booking card.
   - Scroll past hero — sticky top bar slides in.
   - Sticky booking card remains visible throughout scroll.
   - Sections only render when data present.
   - Mid-CTA dark green block in the middle.
   - Related therapies grid at bottom (3 cards).
   - Pager at the end with prev/next.
   - FreeConsultationBlock at the very bottom.

- [ ] **Step 2: Tablet verification (768px)**

DevTools → iPad Mini. Walk the same flow. Verify:
- L1 grid is 2 columns.
- L2 grid is 1 column.
- L3: sidebar still desktop (hidden); marginalia inline; mobile booking bar at the bottom.

- [ ] **Step 3: Mobile verification (375px)**

DevTools → iPhone SE. Walk the flow. Verify:
- All grids 1 column.
- L3 switcher horizontally swipeable.
- Marginalia inline (2-col on this width).
- Fixed mobile booking bar at the bottom — does NOT overlap any global WhatsApp floating button (if present).
- Gallery is 2-col (responsive `sm:grid-cols-4` collapses to 2).

- [ ] **Step 4: 404 verification**

Visit a nonexistent category and nonexistent treatment slug — each returns the project's 404.

- [ ] **Step 5: Image-missing fallback verification**

Pick a treatment in Sanity with no `heroImage`. Visit its detail page. Confirm the deep-green "Photo coming soon" fallback panel renders cleanly.

- [ ] **Step 6: Sticky top bar does not overlap mobile booking bar**

On mobile, scroll a long detail page. The sticky top bar should be desktop-only (hidden below `lg`) — confirm it does not appear. Only the bottom mobile booking bar should be visible.

No commit (verification step).

---

### Task 33: Production build + final commit

- [ ] **Step 1: Run full production build**

```bash
npm run build
```

Expected: succeeds. The build log should show prerendered routes for every category and treatment slug pair. Note any warnings about missing alt text or oversized images — flag in the next sprint, do not block.

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: all tests pass including the new `pager.test.ts`.

- [ ] **Step 3: Final smoke test against production build**

```bash
npm run build && npm start
```

Visit each route on `http://localhost:3000` once more. Same expectations as Task 32.

- [ ] **Step 4: Final commit (if anything was tweaked during verification)**

```bash
git status
# If anything is staged, commit; otherwise skip.
git commit -m "fix(treatments): post-verification adjustments" 2>/dev/null || true
```

---

## Self-review checklist (run by implementer before declaring done)

- [ ] Every spec section (1–17 in `2026-05-26-treatments-page-redesign.md`) has at least one task implementing it.
- [ ] All Sanity schema fields from spec §4 are present in the schema files.
- [ ] All five GROQ queries from spec §5 are exported from `src/sanity/queries.ts`.
- [ ] Every component listed in spec §7.1 exists at the path specified in the file map above.
- [ ] No `TreatmentsMenu`, `TreatmentRow`, `CategoryTabs`, `TreatmentCard`, `FreeConsultationBanner` imports remain.
- [ ] `next.config.mjs` `images.remotePatterns` includes `cdn.sanity.io` (verified — pre-existing).
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` succeeds and prerenders all treatment routes.
- [ ] Sitemap includes treatment URLs.
- [ ] Manual cross-device verification in Task 32 completed.
