# Homepage Burgundy + Emerald Recolor — Implementation Plan

> **For agentic workers:** This is a visual recolor. "Verification" per task = screenshot the
> section on the running dev server (localhost:3017) and confirm the tone + legibility, NOT unit
> tests. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Re-skin the homepage from forest-green to the approved A+B blend — burgundy-dominant,
emerald as a single isolated "apothecary" band, gold as the unifying thread, cream as light relief —
so it reads premium-but-youthful for tomorrow's launch.

**Architecture:** Most sections hardcode hex values inline, so the recolor is per-file. The SAME
green hex maps to DIFFERENT targets depending on the section's role in the rhythm, so each file gets
its own find-replace mapping (never a global replace). Theme tokens in `tailwind.config.ts` are
remapped for the class-based usages.

**Tech Stack:** Next.js 14, Tailwind, inline-style hex + framer-motion. Dev server: `PORT=3017 npm run dev`.

---

## Canonical Palette

**Burgundy zone (replaces forest green where a section is "burgundy"):**
- Wine (mid / gradient top): `#6E1023`
- Wine deep: `#4A0C18`
- Wine deepest: `#350710`
- Wine soft text rgba base: `rgba(110,16,35,X)`

**Emerald-jewel zone (Featured Products + Video Testimonials only — richer than old green):**
- Emerald: `#10543F`
- Emerald deep: `#0B3B2C`
- Emerald deepest: `#072A1F`
- Emerald soft rgba base: `rgba(16,84,63,X)`

**Shared / unchanged:**
- Gold: `#D4AF37` and script gold `#E5B53A` — KEEP everywhere (the thread)
- Cream `#F7F2E8`, ivory `#FAF8F2`, clay `#E9CBA6` — KEEP as light surfaces
- **Cards (non-white):** blush `#F3E2CE` (burgundy/light zones), sage `#EDF2E6` (emerald zone)

---

### Task 1: Theme tokens + shadows

**Files:** Modify `tailwind.config.ts`

- [ ] **Step 1: Remap color tokens.** In the `colors` block apply:
  - `primary: "#1E5B4B"` → `"#6E1023"`  (burgundy — drives bg-primary / text-primary)
  - `secondary: "#2E7D5A"` → `"#10543F"` (jewel emerald)
  - `tertiary: "#8FAE8B"` → `"#C98A93"` (dusty rose — was sage; FAQ fallback)
  - `accent` / `gold` → unchanged (`#D4AF37`)
  - `clay` → unchanged
  - `nearBlackGreen: "#0F2C24"` → `"#4A0C18"`
  - `nocturne: "#0A1F19"` → `"#350710"`,  `"nocturne-elev":"#0F2C24"` → `"#4A0C18"`
  - `"forest-700":"#163F33"` → `"#10543F"`,  `"forest-800":"#0F2C24"` → `"#0B3B2C"`,  `"forest-900":"#0A1F19"` → `"#072A1F"`
  - Add: `wine:"#6E1023"`, `"wine-deep":"#4A0C18"`, `"wine-900":"#350710"`, `blush:"#F3E2CE"`, `"sage-card":"#EDF2E6"`
- [ ] **Step 2: Retune shadows** — replace the green `rgba(30, 91, 75,…)` in `boxShadow.elevated/floating/luxe` with `rgba(74,12,24,…)` (burgundy). `gold-glow` unchanged.
- [ ] **Step 3: Verify** — `curl -s -o /dev/null -w "%{http_code}" http://localhost:3017/` returns 200 (no build break).
- [ ] **Step 4: Commit** — `feat(theme): remap tokens to burgundy+emerald blend` *(only if user asks to commit)*

---

### Task 2: Navbar — burgundy top bar

**Files:** Modify `src/components/Navbar.tsx`

- [ ] **Step 1:** Replace, within this file only:
  - `#163F33` → `#4A0C18` (top info bar + nav pill bg)
  - logo text emerald `#2E7D5A` (the "Lifestyle" word) → `#B0801E` (gold) OR keep — designer pick `#B0801E`
  - Cream nav bg `#F7F2E8` → unchanged. Gold buttons `#D4AF37` → unchanged.
- [ ] **Step 2: Verify** screenshot navbar — burgundy top, cream nav, gold Book Now intact, text legible.

---

### Task 3: Hero — burgundy

**Files:** Modify `src/components/HeroSection.tsx`

- [ ] **Step 1:** Replace the hero-local warm-espresso palette with burgundy:
  - `INK = '#3D1A0E'` → `'#4A0C18'`
  - Even-dim gradient: change `rgba(61,26,14,…)` → `rgba(110,16,35,…)` and the bottom `rgba(74,28,16,0.84)` → `rgba(53,7,16,0.86)`
  - Center radial `rgba(61,26,14,0.28)` → `rgba(74,12,24,0.30)`
  - Vignette `rgba(40,18,8,0.55)` → `rgba(30,5,12,0.58)`
  - Stats bar bg `rgba(74,28,16,0.82)` → `rgba(53,7,16,0.85)`
  - KEEP: saffron glow layers, mandala texture, `SAFFRON #D4AF37`, `SCRIPT_GOLD #E5B53A`, gold borders.
- [ ] **Step 2: Verify** screenshot hero — deep wine backdrop, gold script "Ayurveda" + mandala still pop, headline/CTA legible.

---

### Task 4: Trust Strip — burgundy

**Files:** Modify `src/components/sections/TrustStrip.tsx`

- [ ] **Step 1:** `bg-primary` already resolves to burgundy via Task 1 (token now `#6E1023`). Confirm gold hairline `rgba(212,175,55,0.25)` and `bg-white/20` dividers unchanged. No hex edits expected unless any `#1E5B4B`/`#163F33` is hardcoded — if so → `#6E1023`.
- [ ] **Step 2: Verify** screenshot — burgundy band, white text, gold icons.

---

### Task 5: Empathy Bridge — burgundy left / cream right

**Files:** Modify `src/components/sections/EmpathyBridge.tsx`

- [ ] **Step 1: Left panel** (dark): `#163F33` → `#6E1023`, `#0F2C24` → `#4A0C18`, body text `rgba(22,63,51,0.78)` → `rgba(110,16,35,0.78)` where it's on the DARK side it's actually cream — leave cream text as-is; only swap the green structural hexes. Glows `rgba(212,175,55,…)` unchanged.
- [ ] **Step 2: Right panel** (cream): bg `#F7F2E8`/`#E9CBA6` unchanged. Text `#163F33` → `#6E1023`. `rgba(22,63,51,0.78)` → `rgba(110,16,35,0.78)`. Gold accents unchanged.
- [ ] **Step 3: Verify** screenshot — burgundy left, cream right, gold thread, both legible.

---

### Task 6: Clinic Therapies — cream + burgundy text + blush cards

**Files:** Modify `src/components/sections/ClinicTherapies.tsx`

- [ ] **Step 1:** Background gradient cream→clay unchanged. Replace:
  - text/foreground `#163F33` → `#6E1023`
  - `rgba(22,63,51,0.78)` → `rgba(110,16,35,0.78)`, `rgba(22,63,51,0.10)` → `rgba(110,16,35,0.10)`, `rgba(22,63,51,0.18)` → `rgba(110,16,35,0.18)`
  - botanical lotus SVG fill `#163F33` → `#6E1023` (gold center unchanged)
  - card dark-gradient overlay `rgba(10,31,25,…)` → `rgba(53,7,16,…)`
  - buttons `bg-primary` now burgundy via token — OK
  - **Cards: any near-white card surface → blush `#F3E2CE`** (user wants non-white)
- [ ] **Step 2: Verify** screenshot — cream section, burgundy headings, blush category cards, gold accents.

---

### Task 7: Promo Banners — cream, burgundy accents

**Files:** Modify `src/components/sections/PromoBanners.tsx`

- [ ] **Step 1:** bg `#F7F2E8` unchanged. `#1E5B4B` (border/text via primary token) now burgundy — confirm. Any hardcoded `#1E5B4B` → `#6E1023`. Code badge `accent` unchanged.
- [ ] **Step 2: Verify** screenshot — light bar, burgundy text, gold code badge.

---

### Task 8: Featured Products — EMERALD zone + sage cards

**Files:** Modify `src/components/sections/FeaturedProducts.tsx`

- [ ] **Step 1:** Upgrade green to jewel emerald (this is the isolated emerald moment):
  - `#163F33` → `#10543F`, `#0F2C24` → `#0B3B2C`, `#0A1F19` → `#072A1F`
  - `rgba(22,63,51,…)` → `rgba(16,84,63,…)`
  - **Product card bg `#FCFAF4` (near-white) → sage `#EDF2E6`** (non-white)
  - Gold buttons/badges `#D4AF37` unchanged.
- [ ] **Step 2: Verify** screenshot — rich emerald gradient, sage product cards, gold accents, cream title legible.

---

### Task 9: Video Testimonials — EMERALD zone

**Files:** Modify `src/components/sections/VideoTestimonials.tsx`

- [ ] **Step 1:** Same emerald mapping as Task 8: `#163F33`→`#10543F`, `#0F2C24`→`#0B3B2C`, `rgba(22,63,51,…)`→`rgba(16,84,63,…)`, vignette `rgba(10,31,25,…)`→`rgba(7,42,31,…)`. Gold/white unchanged.
- [ ] **Step 2: Verify** screenshot — emerald continues seamlessly from products, video cards moody, gold accents.

---

### Task 10: Reviews — cream (text to burgundy)

**Files:** Modify `src/components/sections/Reviews.tsx`

- [ ] **Step 1:** bg `#F7F2E8` unchanged. Text `#1F1F1F` may stay charcoal (fine on cream) OR → `#6E1023` for brand cohesion — use `#6E1023` for headings, keep charcoal for body. Gold stars/borders unchanged.
- [ ] **Step 2: Verify** screenshot — light cream, legible reviews, gold stars.

---

### Task 11: FAQs — blush/cream (was sage green)

**Files:** Modify `src/components/sections/FAQs.tsx`

- [ ] **Step 1:** Replace sage with a warm light surface so it stays in the light family:
  - `#8FAE8B` (BG_SAGE + BG_SAGE_DEEP) → `#F6ECD6` (warm cream) / `#EFE0C9` for the deep stop
  - text `#163F33` → `#6E1023`
  - `rgba(22,63,51,X)` text/hairline → `rgba(110,16,35,X)`
  - open-accordion gold + gold accents unchanged.
- [ ] **Step 2: Verify** screenshot — warm light FAQ, burgundy text, gold open-state.

---

### Task 12: Final Booking CTA — burgundy

**Files:** Modify `src/components/sections/FinalBookingCTA.tsx`

- [ ] **Step 1:** `#163F33` → `#6E1023`, `#0F2C24` → `#4A0C18`. Photo overlay `rgba(22,63,51,0.42)` → `rgba(110,16,35,0.42)`. Saffron washes/edge `rgba(212,175,55,…)` unchanged. Grain unchanged.
- [ ] **Step 2: Verify** screenshot — burgundy CTA panel, photo warm, gold buttons.

---

### Task 13: Footer — deepest burgundy

**Files:** Modify `src/components/Footer.tsx`

- [ ] **Step 1:** `bg-dark` (`#1F1F1F`) → deepest burgundy `#350710` (use a literal `bg-[#350710]` or new `wine-900` token). "Lifestyle" gold + white text + gold hovers unchanged.
- [ ] **Step 2: Verify** screenshot — burgundy footer closes the page, gold accents.

---

### Task 14: Full-page verification + contrast

- [ ] **Step 1:** Screenshot the FULL homepage (desktop 1440 + mobile 390) on localhost:3017.
- [ ] **Step 2:** Confirm the rhythm reads burgundy → cream → emerald → cream → burgundy with emerald appearing once.
- [ ] **Step 3:** Spot-check WCAG AA contrast on: hero headline, burgundy text on cream, white/cream text on emerald, CTA pills. Fix any failing pair by deepening the bg or lightening the text locally.
- [ ] **Step 4:** Confirm NO forest-green (`#1E5B4B`, `#163F33`, `#8FAE8B`) remains via:
  `grep -rn "1E5B4B\|163F33\|8FAE8B\|2E7D5A" src/ --include=*.tsx | grep -v node_modules` → expect no homepage hits.

---

## Notes / Future
- Navbar top-bar + drawer recolored here; full About/Treatments/Blog/Contact pages follow tomorrow.
- Real hero photography still recommended post-launch (current photo is busy).
- Do NOT commit unless the user explicitly asks.
