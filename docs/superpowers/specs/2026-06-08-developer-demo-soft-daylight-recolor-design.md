# Developer demo — "Soft Daylight" recolor (Spec A)

**Date:** 2026-06-08
**Scope:** The developer template's **live demo only**. No changes to `template.hbs`, builder presets, or the builder default. This is a self-contained recolor of static demo files plus a keycap re-color.
**Sibling:** Spec B (trackball journey rebuild) is a separate, later spec — see *Appendix: Spec B preview*.

---

## 1. Goal

Recolor the developer live demo from its current near-black violet/cyan dark theme to a **light, airy "Soft Daylight" theme** built from the user-supplied **"Muted Blues & Grays"** palette, with the **keyboard keycaps switched to each tool's real brand color**. The result must feel calm, premium, and editorial — "muted, soothing, neither too bold nor bright, with a little edge" — while remaining fully legible (WCAG AA) on every surface.

The current palette is **already preserved** as the `Spacebar` preset in `DeveloperCustomizeStep.tsx` (`#7c5cff / #38bdf8 / #020617`), so no real user loses access to the old look. That requirement is satisfied; this spec does not touch it.

## 2. Source palette — "Muted Blues & Grays"

| Token name | Hex | Role in Soft Daylight |
|---|---|---|
| Mischka | `#CCD1DA` | Page background (lightest) |
| Casper | `#A6BAD0` | Experience + Projects cards/boxes |
| Blue-Gray | `#6D99CE` | Brand accent (fills) + keyboard trackball |
| Shuttle Gray | `#5F6B7A` | Generic surfaces (nav pill, buttons, chips, sound toggle) |
| Davy's Gray | `#4B5056` | Contact section background + keyboard body/chassis (darkest) |

The palette has **no dark background and no near-white text color** — those are *derived* (see §4) because Soft Daylight is a light theme with mixed light/dark surfaces.

## 3. Files in scope

1. `public/demo/developer/index.html` — main demo page (EN). The `:root` block + section styles.
2. `public/demo/developer/index-ar.html` — Arabic (RTL) mirror. Same `:root` and section styles; recolor identically.
3. `public/demo/developer/stack/index.html` — the 3D canvas keyboard (loaded via iframe in `#skills`). Keycap colors (`SKILLS[]` array), trackball color, keyboard body color.

Out of scope: `src/templates/developer/template.hbs`, `src/components/builder/steps/DeveloperCustomizeStep.tsx`, `manifest.json` defaults.

## 4. Color mapping — page (`index.html` + `index-ar.html`)

The demo's `:root` currently is a dark theme. Replace with the Soft Daylight light theme. Because the palette has mixed-luminance surfaces, **text color is contextual per surface** (this is the core `taste`/`impeccable` work and must be verified live for AA).

### 4.1 Root tokens (proposed)

| Var | Current (dark) | New (Soft Daylight) | Notes |
|---|---|---|---|
| `--bg` | `#020617` | `#CCD1DA` (Mischka) | page background |
| `--bg-2` | `#0b1222` | `#BBC2CE` (derived, slightly deeper Mischka) | gradient floor |
| `--card` | `rgba(15,23,42,.55)` | `#A6BAD0` (Casper) | experience/project cards |
| `--card-hover` | `rgba(20,30,55,.72)` | `#9CB2CC` (derived, deeper Casper) | hover |
| `--fg` | `#f8fafc` | `#222831` (derived near-black) | primary text on light surfaces |
| `--muted` | `#94a3b8` | `#4B5056` (Davy's) | body/secondary on light |
| `--muted-2` | `#64748b` | `#5F6B7A` (Shuttle) | tertiary on light |
| `--border` | `rgba(148,163,184,.14)` | `rgba(75,80,86,.16)` (Davy α) | hairlines on light |
| `--border-strong` | `rgba(148,163,184,.28)` | `rgba(75,80,86,.30)` | stronger hairlines |
| `--brand` | `#7c5cff` | `#6D99CE` (Blue-Gray) | accent **fills** only |
| `--brand-ink` | — (new) | `#3C6FAE` (derived darkened blue) | accent **text/links/eyebrows on light** (AA-safe) |
| `--accent` | `#38bdf8` | `#5F6B7A` (Shuttle) | secondary accent |
| `--surface-dark` | — (new) | `#5F6B7A` (Shuttle) | nav pill / buttons / chips (dark-on-light) |
| `--on-dark` | — (new) | `#EEF1F5` (derived near-white) | text on Shuttle/Davy surfaces |
| `--contact-bg` | — (new) | `#4B5056` (Davy's) | contact section |

### 4.2 Surface → text pairing (AA targets, verify live)

- **Page (Mischka `#CCD1DA`)**: headings `#222831`; body `#4B5056`; muted `#5F6B7A`; links/eyebrows `--brand-ink #3C6FAE`.
- **Cards (Casper `#A6BAD0`)**: headings `#222831`; body `#4B5056`; border `rgba(75,80,86,.30)`.
- **Generic surfaces (Shuttle `#5F6B7A`)** — nav pill, buttons, sound toggle, chips: text `--on-dark #EEF1F5`.
- **Contact (Davy's `#4B5056`)**: text `--on-dark #EEF1F5`; muted `#A6BAD0`; inputs = translucent light fill `rgba(255,255,255,.08)` with `#EEF1F5` text.
- **Primary button**: background `--brand-ink #3C6FAE` (NOT raw `#6D99CE` — white text on `#6D99CE` fails AA ~2.9:1; on `#3C6FAE` ≈ 4.6:1) with `#FFFFFF` text. Hover deepens.

### 4.3 Depth / shadows

Dark theme used glows + `rgba(0,0,0,.4)` drops. Light theme needs **soft realistic shadows**:
- Card/elevation: `0 8px 24px rgba(34,40,49,.10)`, `0 2px 6px rgba(34,40,49,.06)`.
- Remove brand "glow" box-shadows; replace `::selection` `color:#fff` with `--on-dark` on `--brand-ink` background.
- Timeline node dots, eyebrow rules, preloader bar, custom cursor: retint from violet/cyan to `--brand` / `--brand-ink`.

### 4.4 Hero (Spec A interim)

Keep `/assets/hero-orb.png` but **neutralize it for the light page**: remove/replace the dark drop-glow behind it, adjust any dark vignette so the orb sits cleanly on Mischka. No new artwork in Spec A — the real particle-core trackball is Spec B (Appendix).

## 5. Color mapping — keyboard (`stack/index.html`)

### 5.1 Keycaps → real tool brand colors (exact)

Replace the current palette-grouped `color:` values in the `SKILLS[]` array (lines ~52–78) with each tool's brand color:

| label | slug | brand hex |
|---|---|---|
| React | react | `#61DAFB` |
| Next.js | nextdotjs | `#000000` *(exact, per decision)* |
| TypeScript | typescript | `#3178C6` |
| JavaScript | javascript | `#F7DF1E` |
| Tailwind | tailwindcss | `#06B6D4` |
| Three.js | threedotjs | `#000000` *(exact, per decision)* |
| WebGL | webgl | `#990000` |
| Framer | framer | `#0055FF` |
| Node.js | nodedotjs | `#5FA04E` |
| Python | python | `#3776AB` |
| GraphQL | graphql | `#E10098` |
| PostgreSQL | postgresql | `#4169E1` |
| Redis | redis | `#FF4438` |
| AWS | amazonwebservices | `#FF9900` *(recognizable AWS orange; simple-icons-exact alt = `#232F3E`)* |
| Docker | docker | `#2496ED` |
| Kubernetes | kubernetes | `#326CE5` |
| Actions | githubactions | `#2088FF` |
| Git | git | `#F05032` |
| Figma | figma | `#F24E1E` |
| A11y | (null) | `#4B5056` *(no brand → neutral Davy's)* |

### 5.2 Trackball + body

- **Trackball** → Blue-Gray `#6D99CE`.
- **Keyboard body/chassis** → Davy's Gray `#4B5056`.
- **Watch-out:** the two pure-black caps (Next.js, Three.js) on a `#4B5056` charcoal body are low-contrast; the render's bevel highlights/sheen keep them readable. Accept per "exact brand" decision; verify they don't fully vanish in the screenshot pass.
- The keyboard sits inside the `#skills` iframe over the light page — ensure the iframe/stage background reads as part of the light section (no leftover dark canvas fill).

## 6. Non-goals

- No `template.hbs` edits; real user portfolios stay dark by default.
- No builder preset/default changes (the `Spacebar` preset already preserves the old palette).
- No Three.js / particle hero / scroll journey (that is Spec B).

## 7. Verification

1. **Build:** `npm run build` succeeds; demo routes 200 (`/demo/developer`).
2. **Visual (Playwright):** screenshots of EN + AR at **390px (phone)** and **desktop** for hero, skills/keyboard, experience, projects, contact. Reuse the existing `scripts/_dev-*.png` harness pattern.
3. **Contrast (AA):** verify each surface→text pair meets WCAG AA (≥4.5 normal text, ≥3 large) using computed colors in the browser — special attention to brand-ink links on Mischka, on-dark text on Shuttle/Casper/Davy, and primary-button text.
4. **Keycaps:** confirm each cap renders its real brand color and the icon still reads; confirm trackball `#6D99CE` and body `#4B5056`.
5. **No regressions:** keyboard interactions, sound toggle, scroll-spy nav, RTL mirror all still function.

## 8. Success criteria

- Demo (EN + AR) renders as a coherent, calm light theme using exactly the 5 palette colors for the mapped surfaces, with derived near-black/near-white text only where the palette provides none.
- Every surface passes AA.
- Keycaps show real tool brand colors; trackball Blue-Gray; body Davy's Gray.
- Hero orb reads cleanly on light.
- Zero console errors; phone has no horizontal overflow.

---

## Appendix: Spec B preview (NOT built here)

For continuity, capturing the agreed hero/journey vision so it isn't lost:

- **Hero artwork (Council verdict):** a **conserved GPU particle core** — "order from chaos" — resting ~90% of the time as a calm rotating fibonacci-sphere lattice, blooming into a dissolve→reform cycle every ~8s, **inside a `MeshPhysicalMaterial` glass shell** (`transmission:1`, `ior≈1.45`). Particles tinted with the blue-gray palette (not pure additive bloom — it washes out on the light Mischka page; lean on the glass for luminosity). Not a knowledge-graph, not glyphs.
- **The journey (user):** the hero particle core **is** the keyboard's trackball (Blue-Gray `#6D99CE`). One conserved object: hero GPU core → **falls/docks into the keyboard** as its trackball (`#skills`) → on continued scroll the trackball **falls down through sections** → settles in the **Contact** section. Spring/ease motion.
- **Dependencies (not yet delivered):** `scroll-portfolio.html` (source-of-truth to port faithfully), finished orb + keyboard HTML, the tech-keyboard repo, and the orb images already received (`photo_012559` white-bg, `photo_012716` dark-bg) in `/home/trimind/dalal-inbox/2026-06-08/`.
- Spec B gets its own design doc + plan when those files arrive.
