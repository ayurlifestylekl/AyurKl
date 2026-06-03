# Public Website Recolor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recolor the entire public website to the new Kerala Ayurvedic Lifestyle palette by remapping Tailwind tokens and replacing all hardcoded hex values across public pages and shared components.

**Architecture:** Two layers of change. (1) **Token layer** — `tailwind.config.ts` token hexes are remapped and a 4-step forest ramp is added, which automatically recolors every element using Tailwind color classes (`bg-primary`, `text-accent`, etc.). (2) **Hardcoded-hex layer** — a deterministic, case-insensitive per-hex find-and-replace across the ~33 public-scope files that hardcode colors in `style={}` / template strings. Because each old hex maps to exactly one new hex, replacement is mechanical and verifiable by grep.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, TypeScript. Replacement via `perl -i`. Verification via `grep` + `next build`.

**Spec:** `docs/superpowers/specs/2026-06-03-public-site-recolor-design.md`

**Working directory for all commands:**
```
cd "/Users/sanjaygunabalan2626gmail.com/Documents/Ayurvedic /Ayurvedic /ayurvedic"
```

---

## Canonical Hex Mapping (single source of truth for this plan)

Every task below uses exactly these mappings. Preserved (never touched): `#ffffff` (white), `#25d366` (official WhatsApp green).

| Old hex(es) | New hex | Meaning |
|---|---|---|
| `#2f5d50`, `#3d6b4f` | `#1E5B4B` | primary |
| `#7a9d54` | `#2E7D5A` | secondary |
| `#1e3d32`, `#1a3b2e`, `#264d42`, `#264a40`, `#234a3e`, `#1d3d31`, `#1e3830`, `#173329`, `#152b22` | `#163F33` | forest-700 |
| `#1a2e26`, `#142e24`, `#0e2620` | `#0F2C24` | forest-800 |
| `#0e1e1a`, `#0a1914` | `#0A1F19` | forest-900 |
| `#d8dec8`, `#c5cfb6` | `#8FAE8B` | tertiary |
| `#d4a373`, `#c4935f`, `#c08a55`, `#8d5d33`, `#e8941a`, `#c8741a`, `#f2b25a`, `#c2410c`, `#e2632f` | `#D4AF37` | gold (saffron collapsed in) |
| `#faf6ee`, `#fbf6ec`, `#f7f3ee`, `#f8f6f0` | `#F7F2E8` | cream |
| `#f4e9d2`, `#f3e6cb`, `#e9bf90` | `#E9CBA6` | clay |
| `#2b2b2b`, `#1a1a1a`, `#1c1917`, `#44403c` | `#1F1F1F` | charcoal |

---

## File Structure

**Config (Task 1–2):**
- Modify: `tailwind.config.ts` (colors block, lines ~11–22)
- Modify: `src/app/globals.css` (`:root` vars, lines 6–7)

**Public-scope files with hardcoded hexes (Task 3 applies the mapping to all of these):**
- `src/app/(public)/blog/[slug]/page.tsx`
- `src/app/(public)/partners/page.tsx`
- `src/app/(public)/cart/CartContents.tsx`
- `src/components/Navbar.tsx`
- `src/components/HeroSection.tsx`
- `src/components/WhatsAppWidget.tsx`
- `src/components/sections/FeaturedProducts.tsx`
- `src/components/sections/FAQs.tsx`
- `src/components/sections/FinalBookingCTA.tsx`
- `src/components/sections/PromoBanners.tsx`
- `src/components/sections/ClinicTherapies.tsx`
- `src/components/sections/EmpathyBridge.tsx`
- `src/components/sections/VideoTestimonials.tsx`
- `src/components/sections/Reviews.tsx`
- `src/components/sections/ShopByCategory.tsx`
- `src/components/products/ProductGrid.tsx`
- `src/components/products/ProductPlateCard.tsx`
- `src/components/products/ProductsHeroManifesto.tsx`
- `src/components/products/atmosphere/NocturneFrame.tsx`
- `src/components/products/atmosphere/KeralaSigil.tsx`
- `src/components/products/atmosphere/BotanicalSprig.tsx`
- `src/components/treatments/TreatmentsHero.tsx`
- `src/components/blog/PostHero.tsx`
- `src/components/blog/PostCard.tsx`
- `src/components/blog/PostBody.tsx`
- `src/components/blog/BlogIndex.tsx`
- `src/components/contact/Threshold.tsx`
- `src/components/contact/Footnotes.tsx`
- `src/components/contact/CallingCard.tsx`
- `src/components/about/CommitmentCTA.tsx`
- `src/components/booking/BookingChooser.tsx`
- `src/components/ui/CTAButton.tsx`
- `src/components/ui/Decorations.tsx`
- `src/components/ui/ComingSoon.tsx`

**Dark-section files needing a focused visual review (Task 4):**
`HeroSection.tsx`, `Footer.tsx`, `TreatmentsHero.tsx`, `products/atmosphere/NocturneFrame.tsx`, `sections/EmpathyBridge.tsx`, `sections/FinalBookingCTA.tsx`.

> Note: public pages such as `about/page.tsx`, `contact/page.tsx`, `products/page.tsx`, `treatments/*`, `book/*` use Tailwind token classes only (no hardcoded hex) and are recolored automatically by Task 1. No per-file edit needed for them.

---

### Task 1: Remap Tailwind color tokens + add forest ramp

**Files:**
- Modify: `tailwind.config.ts` (colors block)

- [ ] **Step 1: Snapshot current state for verification**

Run:
```bash
cd "/Users/sanjaygunabalan2626gmail.com/Documents/Ayurvedic /Ayurvedic /ayurvedic"
grep -nE "#2F5D50|#7A9D54|#D4A373|#2B2B2B|#F9F9F9|#FAF6EE|#f0ede5|#1a2e26|#0E1E1A|#112520" tailwind.config.ts
```
Expected: matches on the `colors` block lines (the old palette).

- [ ] **Step 2: Replace the entire `colors` block**

Find this block in `tailwind.config.ts`:
```ts
      colors: {
        primary:        "#2F5D50",
        secondary:      "#7A9D54",
        accent:         "#D4A373",
        dark:           "#2B2B2B",
        background:     "#F9F9F9",
        foreground:     "#2B2B2B",
        cream:          "#FAF6EE",
        heroCream:      "#f0ede5",
        nearBlackGreen: "#1a2e26",
        nocturne:       "#0E1E1A",
        "nocturne-elev":"#112520",
      },
```

Replace it with:
```ts
      colors: {
        // ── Kerala Ayurvedic Lifestyle brand palette ──
        primary:        "#1E5B4B", // Deep Forest Green
        secondary:      "#2E7D5A", // Emerald Green
        tertiary:       "#8FAE8B", // Sage Green
        accent:         "#D4AF37", // Accent Gold (name kept to avoid mass class rename)
        gold:           "#D4AF37", // alias for new usage
        clay:           "#E9CBA6", // Warm Clay
        dark:           "#1F1F1F", // Charcoal (name kept)
        charcoal:       "#1F1F1F", // alias for new usage
        background:     "#FAF8F2", // Soft Ivory
        foreground:     "#1F1F1F",
        ivory:          "#FAF8F2", // alias for new usage
        cream:          "#F7F2E8", // Natural Cream
        // ── tuned orphan tokens (names kept, hex harmonized) ──
        heroCream:      "#F7F2E8",
        nearBlackGreen: "#0F2C24",
        nocturne:       "#0A1F19",
        "nocturne-elev":"#0F2C24",
        // ── forest ramp for layered dark sections ──
        "forest-700":   "#163F33",
        "forest-800":   "#0F2C24",
        "forest-900":   "#0A1F19",
      },
```

- [ ] **Step 3: Verify no old palette hexes remain in config**

Run:
```bash
grep -nE "#2F5D50|#7A9D54|#D4A373|#2B2B2B|#F9F9F9|#FAF6EE|#f0ede5|#0E1E1A|#112520" tailwind.config.ts
```
Expected: **no output** (exit code 1). Note `#1a2e26` is intentionally gone too.

- [ ] **Step 4: Type-check the config compiles**

Run:
```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | head -20
```
Expected: no new errors referencing `tailwind.config.ts`.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat(theme): remap Tailwind tokens to Kerala Ayurvedic palette + forest ramp"
```

---

### Task 2: Update globals.css root variables

**Files:**
- Modify: `src/app/globals.css` (lines 6–7)

- [ ] **Step 1: Replace the `:root` color variables**

Find:
```css
:root {
  --background: #F9F9F9;
  --foreground: #2B2B2B;
}
```

Replace with:
```css
:root {
  --background: #FAF8F2; /* Soft Ivory */
  --foreground: #1F1F1F; /* Charcoal */
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -nE "#F9F9F9|#2B2B2B" src/app/globals.css
```
Expected: **no output** (exit code 1).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(theme): update globals.css root vars to ivory/charcoal"
```

---

### Task 3: Replace hardcoded hexes across public-scope files

This task applies the Canonical Hex Mapping to every public-scope file via one deterministic `perl` pass. Case-insensitive (`gi`) so `#D4A373` and `#d4a373` both match; output hexes are written uppercase.

**Files:** all 34 files listed under "public-scope files" in File Structure above.

- [ ] **Step 1: Record the pre-change hex inventory (baseline)**

Run:
```bash
cd "/Users/sanjaygunabalan2626gmail.com/Documents/Ayurvedic /Ayurvedic /ayurvedic"
PUBFILES=$(printf '%s\n' \
  "src/app/(public)/blog/[slug]/page.tsx" \
  "src/app/(public)/partners/page.tsx" \
  "src/app/(public)/cart/CartContents.tsx" \
  src/components/Navbar.tsx src/components/HeroSection.tsx src/components/WhatsAppWidget.tsx \
  src/components/sections/FeaturedProducts.tsx src/components/sections/FAQs.tsx \
  src/components/sections/FinalBookingCTA.tsx src/components/sections/PromoBanners.tsx \
  src/components/sections/ClinicTherapies.tsx src/components/sections/EmpathyBridge.tsx \
  src/components/sections/VideoTestimonials.tsx src/components/sections/Reviews.tsx \
  src/components/sections/ShopByCategory.tsx \
  src/components/products/ProductGrid.tsx src/components/products/ProductPlateCard.tsx \
  src/components/products/ProductsHeroManifesto.tsx \
  src/components/products/atmosphere/NocturneFrame.tsx \
  src/components/products/atmosphere/KeralaSigil.tsx \
  src/components/products/atmosphere/BotanicalSprig.tsx \
  src/components/treatments/TreatmentsHero.tsx \
  src/components/blog/PostHero.tsx src/components/blog/PostCard.tsx \
  src/components/blog/PostBody.tsx src/components/blog/BlogIndex.tsx \
  src/components/contact/Threshold.tsx src/components/contact/Footnotes.tsx \
  src/components/contact/CallingCard.tsx src/components/about/CommitmentCTA.tsx \
  src/components/booking/BookingChooser.tsx src/components/ui/CTAButton.tsx \
  src/components/ui/Decorations.tsx src/components/ui/ComingSoon.tsx)
echo "$PUBFILES" > /tmp/pubfiles.txt
grep -rhoEi "#[0-9a-f]{3,6}" $PUBFILES | tr 'A-F' 'a-f' | sort | uniq -c | sort -rn > /tmp/hex_before.txt
cat /tmp/hex_before.txt
```
Expected: the ~40-line frequency list (matching the spec audit), including `#25d366` and `#ffffff` which must NOT change.

- [ ] **Step 2: Run the deterministic replacement**

Run:
```bash
cd "/Users/sanjaygunabalan2626gmail.com/Documents/Ayurvedic /Ayurvedic /ayurvedic"
perl -i -pe '
  s/#2f5d50/#1E5B4B/gi; s/#3d6b4f/#1E5B4B/gi;
  s/#7a9d54/#2E7D5A/gi;
  s/#1e3d32/#163F33/gi; s/#1a3b2e/#163F33/gi; s/#264d42/#163F33/gi;
  s/#264a40/#163F33/gi; s/#234a3e/#163F33/gi; s/#1d3d31/#163F33/gi;
  s/#1e3830/#163F33/gi; s/#173329/#163F33/gi; s/#152b22/#163F33/gi;
  s/#1a2e26/#0F2C24/gi; s/#142e24/#0F2C24/gi; s/#0e2620/#0F2C24/gi;
  s/#0e1e1a/#0A1F19/gi; s/#0a1914/#0A1F19/gi;
  s/#d8dec8/#8FAE8B/gi; s/#c5cfb6/#8FAE8B/gi;
  s/#d4a373/#D4AF37/gi; s/#c4935f/#D4AF37/gi; s/#c08a55/#D4AF37/gi;
  s/#8d5d33/#D4AF37/gi; s/#e8941a/#D4AF37/gi; s/#c8741a/#D4AF37/gi;
  s/#f2b25a/#D4AF37/gi; s/#c2410c/#D4AF37/gi; s/#e2632f/#D4AF37/gi;
  s/#f4e9d2/#E9CBA6/gi; s/#f3e6cb/#E9CBA6/gi; s/#e9bf90/#E9CBA6/gi;
  s/#faf6ee/#F7F2E8/gi; s/#fbf6ec/#F7F2E8/gi; s/#f7f3ee/#F7F2E8/gi; s/#f8f6f0/#F7F2E8/gi;
  s/#2b2b2b/#1F1F1F/gi; s/#1a1a1a/#1F1F1F/gi; s/#1c1917/#1F1F1F/gi; s/#44403c/#1F1F1F/gi;
' $(cat /tmp/pubfiles.txt)
echo "Replacement done."
```
Expected: prints `Replacement done.` with no perl errors.

- [ ] **Step 3: Verify ZERO old hexes remain (the core test)**

Run:
```bash
cd "/Users/sanjaygunabalan2626gmail.com/Documents/Ayurvedic /Ayurvedic /ayurvedic"
grep -rEi "#2f5d50|#3d6b4f|#7a9d54|#1e3d32|#1a3b2e|#264d42|#264a40|#234a3e|#1d3d31|#1e3830|#173329|#152b22|#1a2e26|#142e24|#0e2620|#0e1e1a|#0a1914|#d8dec8|#c5cfb6|#d4a373|#c4935f|#c08a55|#8d5d33|#e8941a|#c8741a|#f2b25a|#c2410c|#e2632f|#f4e9d2|#f3e6cb|#e9bf90|#faf6ee|#fbf6ec|#f7f3ee|#f8f6f0|#2b2b2b|#1a1a1a|#1c1917|#44403c" $(cat /tmp/pubfiles.txt)
```
Expected: **no output** (exit code 1). Every old hex is gone.

- [ ] **Step 4: Verify preserved colors are intact**

Run:
```bash
cd "/Users/sanjaygunabalan2626gmail.com/Documents/Ayurvedic /Ayurvedic /ayurvedic"
echo "WhatsApp green (expect >=1):"; grep -rci "#25d366" src/components/WhatsAppWidget.tsx
```
Expected: WhatsApp green count unchanged (>= 1) — proves preserved colors were not collateral-damaged.

- [ ] **Step 5: Type-check**

Run:
```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | head -20
```
Expected: no new type errors (hex strings are inside `style`/className strings, so types are unaffected — this confirms no file was structurally corrupted by the edit).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(theme): replace hardcoded hexes with new palette across public site"
```

---

### Task 4: Visual review of layered dark sections

Mechanical replacement is correct per-hex, but layered dark sections stack greens for depth. Confirm they still read well after collapsing onto the 3-step forest ramp.

**Files (read-only inspection, edit only if a contrast problem is found):**
`src/components/HeroSection.tsx`, `src/components/Footer.tsx`, `src/components/treatments/TreatmentsHero.tsx`, `src/components/products/atmosphere/NocturneFrame.tsx`, `src/components/sections/EmpathyBridge.tsx`, `src/components/sections/FinalBookingCTA.tsx`.

- [ ] **Step 1: Start the dev server**

Run:
```bash
cd "/Users/sanjaygunabalan2626gmail.com/Documents/Ayurvedic /Ayurvedic /ayurvedic"
npm run dev
```
Expected: server starts on `http://localhost:3000`.

- [ ] **Step 2: Inspect each dark section in the browser**

Visit and visually check for sufficient contrast / no muddy or invisible text:
- `/` — hero (HeroSection) + EmpathyBridge + FinalBookingCTA + footer
- `/treatments` — TreatmentsHero
- `/products` then open any product — NocturneFrame atmosphere

For each: gold/cream text must remain legible over the forest backgrounds. If any element lost contrast, bump that specific element from `forest-800` to `forest-700` (lighter) or text to `cream`/`gold`, editing only the offending file.

- [ ] **Step 3: Commit any fixes (skip if none)**

```bash
git add -A
git commit -m "fix(theme): tune dark-section contrast after recolor"
```

---

### Task 5: Final build verification

**Files:** none (verification only).

- [ ] **Step 1: Production build**

Run:
```bash
cd "/Users/sanjaygunabalan2626gmail.com/Documents/Ayurvedic /Ayurvedic /ayurvedic"
npm run build 2>&1 | tail -30
```
Expected: build completes successfully (`✓ Compiled` / route table printed), no errors.

- [ ] **Step 2: Full-scope sanity grep (public files only)**

Run:
```bash
cd "/Users/sanjaygunabalan2626gmail.com/Documents/Ayurvedic /Ayurvedic /ayurvedic"
grep -rEi "#2f5d50|#7a9d54|#d4a373|#2b2b2b|#faf6ee|#0e1e1a" $(cat /tmp/pubfiles.txt) tailwind.config.ts src/app/globals.css
```
Expected: **no output** — confirms the public surface is fully migrated.

- [ ] **Step 3: Final confirmation**

Report: public website recolor complete, build green, zero old palette hexes remain in public scope. Portals (`/admin`, `/account`, `/agent`) and email/invoice templates remain on the old palette and are tracked as future passes per the spec.

---

## Self-Review Notes

- **Spec coverage:** Token remap (spec §"Tailwind token changes") → Task 1. globals.css → Task 2. Hardcoded-hex mapping (spec §"Hardcoded hex → target mapping") → Task 3 (every one of the 40 audited hexes appears in the mapping). Dark-section depth preservation (spec §"Color System Strategy") → forest ramp in Task 1 + review in Task 4. Verification (spec §"Verification") → Tasks 3,5. Out-of-scope portals → noted in Task 5 Step 3.
- **Both brand decisions encoded:** orphan tokens tuned-and-kept (Task 1); saffron family collapsed into gold (Task 3 mapping).
- **No placeholders:** every code/command step is concrete.
- **Token-name consistency:** `accent`/`dark`/`background` names are retained, so existing class names (`bg-accent`, `text-dark`) keep working — no class renames required anywhere.
