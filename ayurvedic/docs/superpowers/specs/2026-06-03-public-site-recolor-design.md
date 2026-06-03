# Public Website Recolor — Kerala Ayurvedic Lifestyle Palette

**Date:** 2026-06-03
**Scope:** Public-facing website only (all 17 routes + shared chrome). Admin, customer
(`/account`), and agent portals are explicitly **out of scope** for this pass — they
follow in later passes.

## Goal

Recolor the entire public website to the new "Kerala Ayurvedic Lifestyle Brickfields"
brand palette. The site currently uses a hand-tuned system of ~40 hardcoded hex values
plus the Tailwind token set. We are migrating both the Tailwind tokens **and** the
hardcoded hexes onto the new palette, with a disciplined shade ramp so layered dark
sections (heroes, footer, nocturne product frames) keep their depth.

## The New Brand Palette (source of truth)

| Name | Hex | Role |
|---|---|---|
| Primary Green (Deep Forest) | `#1E5B4B` | Primary brand green |
| Secondary Green (Emerald) | `#2E7D5A` | Secondary green |
| Tertiary Green (Sage) | `#8FAE8B` | Soft green / muted accents |
| Accent Gold (Vibrant Gold) | `#D4AF37` | Single warm accent (gold) |
| Warm Clay (Earthy Peach) | `#E9CBA6` | Warm neutral surfaces |
| Cream (Natural Cream) | `#F7F2E8` | Light surfaces |
| Soft Ivory (Calm & Clean) | `#FAF8F2` | Lightest background |
| Dark Charcoal | `#1F1F1F` | Text / contrast |

### Key brand decisions (confirmed with stakeholder)
1. **Orphan dark tokens** (`heroCream`, `nearBlackGreen`, `nocturne`, `nocturne-elev`):
   tune-and-keep — names stay, hex harmonizes to the new forest ramp. No mass rename.
2. **Warm amber/saffron family** (`#e8941a`, `#c8741a`, `#c2410c`, `#f2b25a`, `#e2632f`…):
   **collapse into the new gold `#D4AF37`.** Strict palette — no separate saffron token.

## Color System Strategy

To avoid flattening the layered design, the new Tailwind config defines the 8 brand
colors plus a **4-step forest ramp** for the deep-green dark sections.

### Tailwind token changes (`tailwind.config.ts`)

```
primary:        #2F5D50 → #1E5B4B
secondary:      #7A9D54 → #2E7D5A
accent:         #D4A373 → #D4AF37   (now "gold"; keep `accent` name to avoid mass rename)
dark:           #2B2B2B → #1F1F1F   (charcoal)
background:     #F9F9F9 → #FAF8F2   (soft ivory)
cream:          #FAF6EE → #F7F2E8
heroCream:      #f0ede5 → #F7F2E8   (tuned to new cream)
nearBlackGreen: #1a2e26 → #0F2C24   (forest-800)
nocturne:       #0E1E1A → #0A1F19   (forest-900)
nocturne-elev:  #112520 → #0F2C24   (forest-800)
```
**Add new tokens:** `tertiary #8FAE8B`, `clay #E9CBA6`, and aliases
`gold #D4AF37`, `charcoal #1F1F1F`, `ivory #FAF8F2` for new/clarified usage.
**Add forest ramp:** `forest-700 #163F33`, `forest-800 #0F2C24`, `forest-900 #0A1F19`.

### Hardcoded hex → target mapping (applied across all public files)

**Greens**
| Old hex(es) | → New |
|---|---|
| `#2f5d50`, `#3d6b4f` | `#1E5B4B` (primary) |
| `#7a9d54` | `#2E7D5A` (secondary) |
| `#1e3d32`, `#1a3b2e`, `#264d42`, `#264a40`, `#234a3e`, `#1d3d31`, `#1e3830`, `#173329`, `#152b22` | `#163F33` (forest-700) |
| `#1a2e26`, `#142e24`, `#0e2620` | `#0F2C24` (forest-800) |
| `#0e1e1a`, `#0a1914` | `#0A1F19` (forest-900) |
| `#d8dec8`, `#c5cfb6` | `#8FAE8B` (tertiary) |

**Gold (incl. collapsed saffron/amber)**
| Old hex(es) | → New |
|---|---|
| `#d4a373`, `#c4935f`, `#c08a55`, `#8d5d33`, `#e8941a`, `#c8741a`, `#f2b25a`, `#c2410c`, `#e2632f` | `#D4AF37` (gold) |

**Creams / Clay / Ivory**
| Old hex(es) | → New |
|---|---|
| `#faf6ee`, `#fbf6ec`, `#f7f3ee`, `#f8f6f0` | `#F7F2E8` (cream) |
| `#f4e9d2`, `#f3e6cb`, `#e9bf90` | `#E9CBA6` (clay) |
| lightest page backgrounds | `#FAF8F2` (ivory) |

**Darks / Text**
| Old hex(es) | → New |
|---|---|
| `#2b2b2b`, `#1a1a1a`, `#1c1917`, `#44403c` | `#1F1F1F` (charcoal) |

**Preserved (not ours):** `#ffffff` (white), `#25d366` (official WhatsApp green).

## Page & Component Coverage

**Routes (17):**
- `/` homepage (`(public)/page.tsx`)
- `/treatments`, `/treatments/[categorySlug]`, `/treatments/[categorySlug]/[treatmentSlug]`
- `/products`, `/products/[slug]`
- `/book`, `/book/consultation`, `/book/treatment`
- `/cart` (+ `CartContents`)
- `/blog`, `/blog/[slug]`
- `/about`, `/contact`, `/partners`
- `(public)/layout.tsx`

**Shared chrome & components:**
- `components/Navbar.tsx`, `components/Footer.tsx`, `components/HeroSection.tsx`,
  `components/WhatsAppWidget.tsx`
- `components/sections/*`, `components/products/*` (incl. `atmosphere/` nocturne frames),
  `components/treatments/*`, `components/blog/*`, `components/contact/*`,
  `components/about/*`, `components/booking/*`, `components/ui/*`

**Config:** `tailwind.config.ts`, `src/app/globals.css`.

## Implementation Approach

1. Update `tailwind.config.ts` (token hex remap + new tokens + forest ramp).
2. Update `globals.css` CSS variables to match.
3. Apply the hardcoded-hex mapping across the public scope, file by file, using
   case-insensitive exact-hex replacement (both `#RRGGBB` and any `#rgb` shorthand).
4. Sweep each file for context-correctness (a hex used as a green border vs. a gold
   highlight must land on the right target — the mapping table is per-hex, not per-class,
   so this is deterministic, but dark-section files get a visual check).

## Verification

- After replacement, grep the public scope for any **old** hex value → must return zero.
- `npm run build` (or `tsc`/`next build`) succeeds with no errors.
- Visual spot-check of the highest-risk layered pages: homepage hero, treatments hero,
  product detail (nocturne frames), footer. Screenshots compared against intent.
- Confirm WhatsApp green and pure white were untouched.

## Out of Scope (future passes)
- `/account/*` customer portal
- `/admin/*` admin portal
- `/agent/*` agent portal
- Email templates, invoice/PDF documents (`lib/email`, `lib/invoice`)
