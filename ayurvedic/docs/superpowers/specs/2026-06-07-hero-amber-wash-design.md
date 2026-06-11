# Hero "Amber Wash" Palette Refinement — Design

**Date:** 2026-06-07
**Component:** `src/components/HeroSection.tsx`
**Type:** Visual refinement (palette + texture), no structural change

## Goal

The client's brand reference (printed Kerala Ayurvedic brochure) lives in a warm
world: honey gold, amber, copper, oxblood maroon, cream, and a gold-foil mandala
texture. The current hero uses a cold forest-green tint (`INK = #0A1F19`) that
fights this direction. Re-skin the existing hero into the brochure's warm
"Amber Wash" palette and add a few precise polish moves so it reads as
heritage-luxury — **without changing the layout, copy, or navbar.**

## Constraints / Out of Scope

- **Layout unchanged.** Centered stack (eyebrow → lotus → headline → flourish →
  tagline → CTA row → floating stats bar) stays exactly as built.
- **Copy unchanged.** Headline, tagline, eyebrow, stat numbers all stay.
- **Navbar untouched** this pass (it is still green; a sitewide palette follow-up
  is noted as future work, not part of this spec).
- Single file: `src/components/HeroSection.tsx`. Fully reversible.

## Palette tokens (hero-local)

Replace the current hero-local constants and introduce warm equivalents:

| Role            | Old (green)        | New (Amber Wash)         |
|-----------------|--------------------|--------------------------|
| Base / dim ink  | `#0A1F19` (forest) | `#3D1A0E` (espresso-oxblood) |
| Maroon ground   | —                  | `#4A1C10` (stat bar / deep anchor) |
| Saffron accent  | `#D4AF37`          | `#D4AF37` (keep, primary gold) |
| Script gold     | `#D4AF37`          | `#E5B53A` (warmer, for "Ayurveda") |
| Cream text      | `rgba(247,242,232,…)` | `rgba(251,243,226,…)` (slightly warmer cream) |
| Mandala foil    | —                  | `rgba(255,225,150,…)` low-opacity pattern |

## Changes

### 1. Warm the stage (core fix)
- `INK` constant `#0A1F19` → `#3D1A0E`.
- Every overlay gradient currently keyed on `rgba(10,31,25,…)` (the three layered
  `div`s: even-dim linear, center radial, and the top/bottom continuity stops) →
  warm `rgba(74,28,16,…)` / `rgba(61,26,14,…)`. Photo glows golden-hour, not green.
- Keep the existing saffron-glow overlay layer (already gold); optionally nudge its
  opacity up slightly now that it harmonizes instead of fighting green.

### 2. Gold-foil mandala texture (signature cue) — INCLUDED
- New `aria-hidden` layer behind the headline content, above the photo/dim.
- Implementation: low-opacity radial repeating pattern, `mix-blend-mode: overlay`,
  concentrated center-top behind the headline so it never reduces text legibility.
- Opacity tuned low (~0.12–0.18 effective) — a hint, not wallpaper.

### 3. Vignette (depth + legibility) — INCLUDED
- Gentle edge-darkening radial layer (transparent center → warm-dark edges).
- Focuses the eye on the centered headline and lifts text contrast on the busy
  spice photo. Warm tone (`rgba(40,18,8,…)`), not neutral black.

### 4. Film grain — EXCLUDED
- Deliberately skipped. The spice photo is already highly textured; grain would
  muddy it and dull the gold. Keep the gold crisp.

### 5. Richen gold accents
- Script "Ayurveda" headline → `#E5B53A` with a warm amber glow shadow
  (`rgba(180,120,30,…)`) replacing the current green-context gold shadow.
- Gold frame inset, corner accents, lotus crest, and flourish: confirm they read
  correctly on the warm base; adjust border/stroke alpha if they wash out.

### 6. Stats bar → oxblood maroon
- Background `rgba(10,31,25,.78)` → `rgba(74,28,16,.82)`.
- Keep gold top-border (`rgba(212,175,55,.22)`) and saffron stat numbers.

### 7. CTA contrast recheck
- The peach CTA pill and the white/cream tagline sit on a warmer, slightly lighter
  backdrop now. Verify text + CTA contrast still passes WCAG AA; tighten the
  dim/vignette locally behind the headline+tagline if needed.

## Verification

- Screenshot desktop (1440) + mobile after change; compare against
  `hero-final-desktop.png` for regressions in spacing/animation.
- Confirm headline, tagline, CTA, and stat text remain legible (AA) over the photo.
- Confirm no green tones remain anywhere in the hero.

## Future work (not this spec)

- Sitewide green → amber palette migration, including the navbar, so the rest of
  the page follows the hero. Tracked separately.
