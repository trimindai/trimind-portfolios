# Developer Template — Builder ⇄ Demo Parity

**Date:** 2026-06-08
**Status:** Approved design, pending implementation plan
**Template:** `developer` (real, data-driven `src/templates/developer/template.hbs`)
**Reference (do not modify):** the "ready" live demo at `/demo/developer` (`public/demo/developer/keyboard.js`, three.js)

## Goal

When a real user builds a **developer** portfolio, the published result should match the
"ready" demo's keyboard: a **4-row grid of brand-colored keycaps that grows horizontally
as skills are added**, and a **trackball with a badge showing a word the user types**
(their name by default). The shared CV step stays fixed for all templates.

## Scope

In scope (4 surfaces):

1. **Builder — `src/components/builder/steps/DeveloperStackStep.tsx`**
   - Add a **"Trackball badge"** short text input (≤ 12 chars) near the keyboard hint →
     writes `customization.trackballLabel`.
   - Add a **"paste your whole stack"** textarea (write-or-drop a list) above the curated
     categories → splits on commas/newlines, dedupes, auto-routes each tool into its
     curated category when recognized, else a "Tools" bucket.
   - Keep existing curated category chips + single "add other" input.

2. **Template render JS + CSS — `src/templates/developer/template.hbs`**
   - Replace the fixed 24-key **split-hand** layout (`COLS=4, ROWS=3, HALF=12, CAP=24`,
     overflow-removed-to-list) with a **single 4-row grid**: `ROWS = 4`,
     `COLS = ceil(totalSkills / 4)`, column-major fill, **every skill is a keycap**
     (no 24-cap, no overflow dump). Last cells in the final column may be decorative blanks.
   - Trackball moves to a **centered housing below the grid** (demo silhouette), no longer
     nested in a right-hand thumb cluster.
   - Trackball renders a **badge label** from `#kbd-deck[data-trackball]`
     (`tb.textContent` + `aria-label`, drop `aria-hidden`).
   - Keep existing per-tool brand tinting (`BRAND` map + `tint()` already set `--kc`);
     **extend `BRAND`** to cover the full curated builder set and replace near-black brand
     values (Next.js, Three.js, Express) with a tasteful dark-slate so caps don't read dead
     on the dark board.
   - Rework keyboard CSS: remove `.kbd-hand/.kbd-cols/.kbd-col` stagger, `.kbd-thumb*`,
     `.kbd-palm`; add a grid deck + housing + centered trackball. **Always 4 rows.**

3. **Template markup — `src/templates/developer/template.hbs` (Handlebars)**
   - Emit `data-trackball="{{trackballBadge customization.trackballLabel basics.fullName}}"`
     on `#kbd-deck`.
   - Keycap loop (`{{#each (flattenSkills skills)}}`) unchanged structurally; the JS does the
     grid arrangement + tint. The "All skills" list below stays as the accessible full list.

4. **Helpers — `src/lib/template-engine.ts`**
   - New helper **`trackballBadge(explicit, fullName)`** → `explicit` (trimmed) → else first
     word of `fullName` → else `"you"`; truncated to ≤ 10 chars for the ball.
   - (Brand color stays in the template JS `BRAND` map — no new `techColor` Handlebars helper
     needed, since tinting already happens client-side.)

5. **i18n — `src/messages/en.json` + `src/messages/ar.json`**
   - New `builder.developer` keys: `trackballLabel`, `trackballPlaceholder`, `trackballHint`,
     `bulkLabel`, `bulkPlaceholder`, `bulkAdd`, `bulkHint`. EN **and** AR (RTL).

Out of scope:
- `CvFieldsStep` — shared/fixed across all templates. **Untouched.**
- The `/demo/developer` demo and its three.js `keyboard.js` — reference only. **Untouched.**
- Other templates (general / engineer / creative / creator).

## Layout rule (the core change)

```
ROWS = 4 (fixed, vertical)
COLS = ceil(totalSkills / 4)        // grows horizontally as skills are added
fill = column-major                  // each new group of 4 skills = a new column on the right
trailing empty cells = decorative blank caps
trackball = centered on a housing directly below the grid, showing the badge word
```

This is the demo's exact model (`ROWS_H = 4`, `COLS_H = ceil(SKILLS.length / ROWS_H)`).

## Responsiveness

Vertical is **always 4 rows** — never wraps to more rows. Horizontal growth is handled by:

- **Scale-to-fit:** the grid scales down to fit the container width, down to a **minimum
  keycap size** (`--ks` floor).
- **Scroll past the floor:** once at the minimum size, the stage becomes
  **horizontally scrollable** (`overflow-x:auto`) with a subtle scroll affordance.
- True-390px phone + desktop, EN + AR (RTL) must all hold 4 rows with **no vertical overflow
  and no layout break**.

## Data flow

- `data.skills` = `[{ category, items: string[] }]` (existing). `flattenSkills` already
  flattens to ordered `{ name, category, catIndex, description }`.
- `data.customization.trackballLabel` = new optional string. Flows through the existing
  `customization` object already consumed by the template (e.g. `customization.keyboardBody`).
  **Implementation checkpoint:** confirm the Convex portfolio schema accepts the new
  `customization.trackballLabel` field (customization is expected to be a flexible object;
  verify it isn't a closed validator that would reject the key).
- `basics.fullName` already reaches the template → used as the trackball fallback.

## Error / edge handling

- **0 skills:** skills section is already gated by `{{#if skills}}`; no keyboard renders.
- **1–3 skills:** a single partial column of 4 rows with blank fillers; trackball still shows.
- **Unknown custom tool:** no `BRAND` match → keycap falls back to the category-cycle color
  (`kc-0…kc-5`) it already uses today; icon falls back to `techIcon` → abbr.
- **Empty trackball label + empty name:** badge shows `"you"`.
- **Very long stack (40+):** scale-to-fit floor → horizontal scroll; still 4 rows.

## Verification

A Playwright check (mirroring `scripts/creator-game-check.mjs`) against a **real rendered
developer portfolio** (seeded sample skills + a trackball label), asserting:

1. Keyboard renders **exactly 4 rows**; column count == `ceil(nSkills / 4)`.
2. Keycaps carry per-tool brand colors (`--kc` set; sample a known tool, e.g. React = cyan).
3. Trackball badge shows the typed word (and first-name fallback when blank).
4. True-390px phone: 4 rows hold, **no vertical overflow**, board scales/scrolls horizontally.
5. EN and **AR (RTL)** both pass.
6. **0 console errors** in all cases.

## Files touched

- `src/components/builder/steps/DeveloperStackStep.tsx` (trackball input + bulk paste)
- `src/templates/developer/template.hbs` (grid rebuild, trackball badge, CSS, BRAND extend)
- `src/lib/template-engine.ts` (`trackballBadge` helper)
- `src/messages/en.json`, `src/messages/ar.json` (new builder.developer keys)
- `scripts/developer-keyboard-check.mjs` (new verify script)

## Not touched

- `src/components/builder/steps/CvFieldsStep.tsx` (shared, fixed)
- `public/demo/developer/*` (reference demo)
