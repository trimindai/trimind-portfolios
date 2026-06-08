# Developer Template — Full Live-Demo Parity

**Date:** 2026-06-08
**Status:** Approved design (full parity scope), pending implementation plan
**Template:** `developer` (`src/templates/developer/template.hbs`)
**Reference / asset host (keep, do not delete):** the live demo `/demo/developer`
(`public/demo/developer/index.html`, `index-ar.html`, `keyboard.js`, `vendor/*`, `stack/icons/*`)

## Goal

Make a real user's published **developer** portfolio a **data-driven clone of the live
demo** at `/demo/developer`. The demo is the finished, "ready", sellable design; the current
`template.hbs` is an older design. We rebuild `template.hbs` from the demo's `index.html`,
binding every hardcoded "Maya Okafor" value to the real portfolio data, and replace the
template's older CSS keyboard with the demo's actual **three.js keyboard** (`keyboard.js`),
fed by the user's stack + a trackball badge. The shared CV step stays fixed for all templates.

**Nothing is deleted.** The demo keeps working unchanged (it remains the canonical host for
the vendored assets + keycap icons). `keyboard.js` gains data inputs with fallbacks to its
current hardcoded values, so `/demo/developer` is byte-for-byte unaffected.

## Approach

Rebuild `template.hbs` using `public/demo/developer/index.html` as the **visual base** (its
full CSS + JS + section markup), then replace hardcoded content with Handlebars bindings that
mirror the data the template already consumes today. EN/AR is unified in the single
`template.hbs` via the existing `{{#if isRTL}}` pattern (the demo's `index-ar.html` is the AR
reference for copy/RTL details). This is a port, not an incremental restyle — it is the only
reliable way to reach pixel parity.

## Section-by-section data binding map

The demo's sections already match the template's section IDs (`hero, skills, experience,
projects, contact`), so the demo's scroll-driven floating keyboard works as-is.

| Demo (index.html) | Bind to portfolio data |
|---|---|
| Preloader, custom cursor, `#stars`, `#kbd-stage`, `#progress` | Chrome — ported verbatim |
| Nav (Home/Stack/Work/Projects/Contact) | Static labels (RTL via `isRTL`); items `isHidden`-gated per section |
| Hero `hello` / `h1` name | `basics.fullName` |
| Hero `role` | `basics.title` (+ ` · ` `basics.subtitle` when present) |
| Hero `pitch` | `basics.valueProposition` |
| Hero CTA: Resume / Get in touch / GitHub / LinkedIn / Instagram / Website | `basics.resumeUrl`, `#contact`, `basics.github`, `basics.linkedin`, `basics.instagram`, `basics.website` — each icon hidden when its field is empty |
| Hero stats (3 counters) | `{{#each metrics}}` → `value` + `label` (animated counters) |
| Skills (`#kbd-fallback` + hint) | Live 3D keyboard from `skills` (below); `#kbd-fallback` populated with an accessible text list of the user's skills (SEO + screen readers; canvas is `aria-hidden`) |
| Experience timeline cards | `{{#each experience}}` → `role/title`, `company`, `date` range, `description`, `bullets[]` |
| Projects grid + per-project modals | `{{#each projects}}` → title, category/tag, placeholder initial, description, metrics, tech `badges[]`, live/source links; modal per project |
| Contact form (name/email/message) | Ported; submit wired to the template's existing contact behavior (mailto/`basics.email`) |
| Contact list strip | `basics.email`, `basics.linkedin`, `basics.github`, `basics.phone`, `basics.location` — each hidden when empty |
| Footer (© year name · title, socials, credit) | `basics.fullName`, `basics.title`, social fields; keep the "Design inspired by Naresh Khatri" credit |

Empty sections/fields use the template's existing `isHidden` + `{{#if}}` gating so a sparse
portfolio degrades gracefully (no empty timelines, dead icons, or blank modals).

## Data-driven keyboard

`keyboard.js` currently hardcodes `SKILLS` (line 40) and the trackball `"Maya"` badge. Change
both to read injected globals **with fallback to the current hardcoded values** (demo stays
identical):

```js
var SKILLS = (window.__KBD_SKILLS && window.__KBD_SKILLS.length) ? window.__KBD_SKILLS : [ /* current hardcoded demo list */ ];
var TRACKBALL = window.__KBD_TRACKBALL || "Maya";   // used where it currently draws "Maya"
```

- `ICON_BASE` already derives from `currentScript.src`. The template loads the **same**
  `/demo/developer/keyboard.js`, so icons resolve to `/demo/developer/stack/icons/` and the
  keycap logos work on published portfolios.
- Layout rule is already the demo's: **4 rows fixed, columns = `ceil(skills/4)`, grows
  horizontally** — inherited for free by adopting `keyboard.js`.

**Template injects (inline `<script>` before three.js + keyboard.js):**
```js
window.__KBD_SKILLS   = {{{kbdSkillsJSON skills}}};                       // [{slug,label,tag,color}, ...]
window.__KBD_TRACKBALL = "{{trackballBadge customization.trackballLabel basics.fullName}}";
```

New Handlebars helpers in `src/lib/template-engine.ts`:

- **`kbdSkillsJSON(skills)`** → JSON string of `flattenSkills(skills)` mapped through a
  name→`{slug, color, tag}` resolver:
  - `slug`: normalized name → simple-icons slug **restricted to icons that exist in
    `stack/icons/`** (e.g. React→`react`, Next.js→`nextdotjs`, Node.js→`nodedotjs`,
    AWS→`amazonwebservices`, Three.js→`threedotjs`); unknown → `null` (keyboard.js draws a
    3-letter text cap).
  - `color`: reuse/extend the existing `BRAND` map; near-black brands (Next.js, Three.js) →
    tasteful dark-slate; unknown → a neutral default.
  - `tag`: the skill's `description` if present, else its `category` (e.g. "Frontend").
- **`trackballBadge(explicit, fullName)`** → `explicit` (trimmed) → else first word of
  `fullName` → else `"you"`; ≤ 10 chars.

`stack/icons/` only ships ~20 logos today; tools without a local SVG fall back to a text cap.
Adding more brand SVGs is a follow-up, not a blocker.

## Assets & CSP

Published portfolios load, all **same-origin** from the existing demo folder (CSP `'self'`,
no CDN — respects the strict portfolio CSP): `/demo/developer/vendor/three.min.js`,
`/demo/developer/vendor/lenis.min.js`, `/demo/developer/vendor/fa/all.min.css` (+ webfonts),
`/demo/developer/keyboard.js`, `/demo/developer/stack/icons/*`. The demo folder becomes the
shared asset host. **Risk noted:** couples published portfolios to the `/demo/developer` path;
acceptable now, extractable to `/assets/dev/` later if the demo is ever removed.

The inline `window.__KBD_*` injection follows the template's existing inline-script pattern;
verify it passes the published portfolio's CSP (nonce/`'self'`).

## Builder changes (`src/components/builder/steps/DeveloperStackStep.tsx`)

- **Trackball badge** — short text input (≤ 12 chars) near the keyboard hint → writes
  `customization.trackballLabel`. Default at render = first name.
- **Paste-a-list** — textarea to write/drop a whole stack (comma/newline separated); split,
  dedupe, auto-route into curated categories (else "Tools"). Curated chips + single-add stay.
- (Optional) per-skill one-line **tag**; if omitted, the keycap tag falls back to category.

Convex checkpoint: confirm the portfolio schema accepts `customization.trackballLabel`
(customization is expected to be a flexible object — verify it isn't a closed validator).

## i18n (`src/messages/en.json` + `src/messages/ar.json`)

New `builder.developer` keys: `trackballLabel`, `trackballPlaceholder`, `trackballHint`,
`bulkLabel`, `bulkPlaceholder`, `bulkAdd`, `bulkHint`. EN **and** AR. Template UI copy uses the
existing `{{#if isRTL}}` inline-bilingual pattern (matching `index-ar.html`).

## Out of scope

- `CvFieldsStep` (shared, fixed across all templates) — **untouched**.
- `/demo/developer/*` design + content — reference/asset host; only `keyboard.js` gains
  data-input fallbacks, producing **no visible change** to the demo.
- Other templates (general / engineer / creative / creator).

## Error / edge handling

- 0 skills → skills section hidden (`{{#if skills}}`) and `__KBD_SKILLS` empty → keyboard
  hidden/skipped; rest of page renders.
- Missing socials/resume/phone/location → that CTA/icon/row is omitted, not rendered empty.
- No experience / no projects → those sections hidden.
- Unknown custom tool → `slug:null` text cap + default color.
- Empty trackball label + empty name → `"you"`.
- No-JS / WebGL-lost → `#kbd-fallback` accessible skills list remains; page still works.

## Files touched

- `src/templates/developer/template.hbs` — rebuilt from the demo (markup + CSS + JS), data-bound.
- `public/demo/developer/keyboard.js` — `SKILLS`/`TRACKBALL` read injected globals w/ fallback.
- `src/lib/template-engine.ts` — `kbdSkillsJSON`, `trackballBadge` helpers (+ brand/slug maps).
- `src/components/builder/steps/DeveloperStackStep.tsx` — trackball badge + paste-a-list.
- `src/messages/en.json`, `src/messages/ar.json` — new builder keys.
- `src/templates/developer/manifest.json` — only if colors/metadata need to match the demo.
- `scripts/developer-parity-check.mjs` — new Playwright verification.

## Verification

Playwright (mirroring `scripts/creator-game-check.mjs`) against a **real rendered developer
portfolio** seeded with sample data (name, ~14 skills, 3 jobs, 4 projects, socials, a trackball
word), asserting against the live demo as the bar:

1. All five sections render and are visually styled like the demo (hero, keyboard, timeline,
   project grid + working modals, contact form + strip, footer).
2. Live keyboard renders: exactly **4 rows**, columns == `ceil(nSkills/4)`, keycaps carry the
   user's tools (brand logo where available, brand color cap), trackball shows the typed word
   (and first-name fallback when blank).
3. Hero counters animate; nav highlights the active section on scroll.
4. True-**390px phone**: keyboard holds 4 rows, no vertical overflow, page scrolls (keyboard
   never traps the wheel); **EN and AR (RTL)** both pass.
5. Sparse-portfolio pass: empty sections/icons are cleanly omitted.
6. **0 console errors** in all cases.
