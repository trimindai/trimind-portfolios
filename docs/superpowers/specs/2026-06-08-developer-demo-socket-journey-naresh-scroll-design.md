# Developer demo — Socket Journey + Naresh-faithful scroll (Spec C)

**Date:** 2026-06-08
**Target (DEMO ONLY):** `public/demo/developer/index.html` (EN) + `index-ar.html` (AR/RTL) + the orb (`orb.js`) + the keyboard scene (currently `stack/index.html`). **NOT** `src/templates/developer/template.hbs`, the builder, or the standalone `tech-keyboard/`. Palette stays "Soft Daylight" (unchanged).
**Reference:** github.com/Naresh-Khatri/3d-portfolio (branch `main`) + nareshkhatri.site. Replicate its **section arrangement + scroll experience**; keep only OUR differences: the orb+socket mechanic, our colors, our keyboard, our sound.
**Supersedes:** the Phase-3 keyboard-dock handoff (the orb no longer docks into the trackball — the dock is removed) and the large-hero-orb sizing. Builds on the Phase-6 fallback system.

## Goals (what "done" means)
1. **Scrolling is smooth AND easy to navigate** — no more getting trapped at the keyboard; Naresh's buttery-but-free feel.
2. **The orb is small (trackball-sized) and falls into a fixed Davy `#4b5056` socket in EVERY section**, detached from the keyboard, arranged so the drop zig-zags down the page (fun to scroll). Gravity-fall + bounce-settle + roll-spin + a **click** on each landing. **Sound on, with a mute toggle.**
3. **Sections are arranged + animated like Naresh's** (sticky centered headings, oversized sections, a universal opacity+scale reveal), keeping our content/colors.
4. **The keyboard stays OURS** (same scene, visuals, keycap sounds) but is presented Naresh-style as a **fixed, scroll-driven background** that never traps the wheel.

---

## Root cause of today's bad scroll (fix both)
1. **The keyboard `<iframe>` traps the wheel.** Wheel/touch over an iframe scrolls the iframe (fixed height → nothing) and never reaches the parent page → stuck at Skills. Iframes isolate scroll by design.
2. **Smoothing config:** Lenis `lerp:0.09` (heavy floaty lerp) + `html{scroll-behavior:smooth}` fighting it.

**Naresh avoids #1 entirely:** his keyboard is a `position:fixed` full-screen Spline canvas behind a `pointer-events:none` content layer (interactive children re-enabled), so the page always scrolls freely past it and clicks still reach the canvas. We adopt the same architecture.

---

## Architecture — the layered stage (matches Naresh)

Three fixed background layers + one scrolling content overlay:

```
z-index  layer
  -3     #stars / gradient field (existing)
  -2     #kbd-stage   ← keyboard canvas (NEW: ported out of the iframe), fixed, scroll-driven
  -1     #orb-stage   ← orb canvas (existing), fixed; the ball falls socket→socket
   0     .orb-socket  ← per-section Davy cradles (DOM, inside each section; occlude ball base)
   1+    page content ← .wrap/cards/text; the content layer is pointer-events:none,
                         interactive children (a,button,input,headings,p,.key,…) re-enabled to auto
```

**Pointer-events overlay (the key trick):** a wrapper around the scrolling content gets `pointer-events:none` so wheel/touch fall through to the fixed canvases (page scrolls; keycaps clickable). Re-enable `pointer-events:auto` on `a, button, input, textarea, select, label, .key, [role], nav, .proj, summary` etc. (Naresh's `canvas-overlay-mode` pattern). This is what lets the keyboard be clickable WITHOUT trapping the wheel.

### Keyboard: iframe → parent fixed canvas (port, not rewrite)
- Port the Three.js scene from `stack/index.html` into a parent-page classic script **`keyboard.js`** rendering into a fixed `<canvas id="kbd-stage">` (mirrors how `orb.js` works). Same geometry, materials, keycaps, **synth keycap sounds** — OUR keyboard, unchanged visually.
- **Remove drag-to-orbit** (that's what traps scroll). Motion becomes **scroll-driven**: per-section keyboard "states" (position/scale/rotation) interpolated on scroll, à la Naresh's ScrollTrigger `scrub` (hero = prominent on one side; recedes/teardown later). A gentle idle Y-rotation in hero.
- **Keep keycap interaction:** click/tap a keycap → press sound + skill label (existing), via events on the fixed canvas (now reachable through the pointer-events overlay).
- `stack/index.html` (the iframe) is removed from the Skills section; Skills becomes Naresh-style empty/short runway whose content is the keyboard (now a bg) + the section heading.
- **Choreography (keyboard vs orb, avoid clutter):** keyboard is most present in **Hero + Skills** (its home — skills live on keycaps), then shrinks/recedes for Experience→Contact (Naresh "teardown"). The **orb+sockets are the through-line** carrying every section.

### Orb: smaller + socket journey (detached from keyboard)
- Ball shrinks to a consistent **trackball size** (~0.5 scale; down from hero 1.30). Blue glass, palette unchanged.
- **Remove** the Phase-3 dock-to-trackball logic entirely.
- **Targets come from the DOM sockets** (read each `.orb-socket`'s `getBoundingClientRect` → on-screen target), exactly the technique the old dock used for the trackball. The ball always lands precisely in its section's socket, responsive by construction.
- **Motion = fall + settle + roll:** vertical approach accelerates (gravity ease) as the ball nears a socket, then a damped **bounce-settle**; horizontal eased; **rotation tied to horizontal displacement** so it visibly rolls.
- **Landing detector:** when the ball arrives within a small threshold of a socket with low velocity, fire ONCE per section entry → **click sound** + a brief squash/contact-shadow pulse.

### Davy sockets (DOM, one per section)
- `<div class="orb-socket" aria-hidden="true">` inside each of the 6 sections (hero, skills, experience, projects, extras, contact).
- Style: Davy `#4b5056` **cradle/cup** — concave top, soft contact shadow; the orb (z-index −1, behind content) is **occluded at its base** by the socket → reads as "seated in the cradle." On the dark Contact background, add a lighter rim/inner-shadow so the socket still reads.
- **Zig-zag arrangement (the "fun fall")** — alternating sides so the ball drops left↔right down the page (RTL mirrors X):

  | Section | Socket X (of half-viewport) | Note |
  |---|---|---|
  | Hero | +0.45 (right) | ball enters/blooms, drops into hero socket |
  | Skills | −0.45 (left) | opposite side from the keyboard's hero position |
  | Experience | +0.55 (right) | beside the timeline |
  | Projects | −0.10 (center-left) | in a visible gutter, not behind cards |
  | Extras | +0.45 (right) | beside education/cert cards |
  | Contact | 0.0 (center) | final settle on the dark panel |

  (Exact placements tuned in the harness so a socket never overlaps text.)

---

## Scroll + reveal (replicate Naresh)
- **Lenis:** replace `lerp:0.09` with Naresh's config — `new Lenis({ duration: 1.2 })` (his is `2`; we start a touch snappier and tune — the slowness only felt bad because of the trap, now fixed). Keep `body{scroll-behavior:smooth}` for hash-anchor glides; drop the competing `html{scroll-behavior:smooth}` while Lenis is active. Single clean raf loop (existing pattern).
- **Universal section reveal (the signature feel):** each section maps its scroll progress to **opacity `[0→1→1→0]` + scale `[0.8→1→1→0.8]`** (enter and leave). Implement with a small IntersectionObserver/scroll-progress helper (no GSAP dependency needed; vanilla, reduced-motion-safe). Replaces the current one-shot `.box-reveal`.
- **Sticky centered headings + oversized sections:** section headings become `position:sticky; top:~70px`, centered, with generous bottom margin so the title hangs while content scrolls under it; section min-heights bumped toward 120–150vh for scroll runway. Keep our copy + Soft Daylight styling.
- **No scroll-snap** (Naresh has none); nav anchors + scrollspy + progress bar stay.

---

## Sound (orb landings + keyboard) — on, with mute
- One shared Web-Audio context (reuse/extend the keyboard's synth approach). **Orb landing = a short marble-click** distinct from keycap switch sounds.
- **AudioContext unlock** on first user gesture (pointer/touch/key/scroll) — browsers block audio before activation; a silent 1-sample buffer unlocks (the keyboard already does this on iOS).
- **Mute button** (small, fixed corner, like the creator game's), default **un-muted**; state in `localStorage`. Mutes both orb clicks and keycap sounds.
- Reduced-motion/low-end: no live motion → no orb clicks (keycap sounds still on click if the static keyboard is interactive; see fallback).

---

## Perf / reduced-motion / fallback (extend Phase 6)
- **Orb:** keep Phase-6 behavior — `#orb-fallback` static CSS sphere shows for reduced-motion / low-end / no-WebGL / pre-load; `.orb-live` hides it once the live orb paints. In fallback mode the **sockets still render** (inert Davy cradles); the static ball rests in the hero socket. No sound, no falling.
- **Keyboard:** add an equivalent static fallback for reduced-motion / low-end / WebGL-fail (a static image or the existing photoreal `.hero-kbd` treatment / a CSS placeholder) so the bg layer degrades instead of going blank. Tier-gate its lazy injection like the orb (skip the heavy 3D on `reduce`/low-end).
- **Pause** both canvases on `visibilitychange`; guard WebGL creation (try/catch); `webglcontextlost` → graceful static.
- Targets: no layout shift, no scroll jank, mid-range phone > 50fps, sockets never overflow (phone overflowPx 0).

---

## RTL (Arabic, `index-ar.html`)
- Mirror socket X (already negated in `orb.js` for `dir=rtl`), keyboard hero side, and the zig-zag. Sticky headings + reveals identical. Verify RTL has no overflow and the fall mirrors cleanly.

---

## Verification (headless: playwright-core + swiftshader, serve `public/`, EN+AR × phone+desktop)
Extend `scripts/orb-phase6-check.mjs` (or a new `scripts/socket-journey-check.mjs`):
1. **Scroll is free:** programmatic scroll top→bottom reaches the contact section (no point where scrollY stalls); the keyboard layer does not block `window.scrollY` advancing while the cursor is over it.
2. **One orb, lands in each socket:** at each section anchor, the orb's screen position is within tolerance of that section's `.orb-socket` centre; exactly one orb canvas.
3. **Sockets present + sized** in all 6 sections, EN + AR (mirrored X).
4. **Reveal:** sections reach full opacity when centered and reduce when leaving.
5. **Keyboard:** `#kbd-stage` WebGL context healthy; a synthetic keycap click still fires (sound path reachable) without preventing a subsequent page scroll.
6. **Reduced-motion / low-end:** fallback orb visible, sockets inert, no `.orb-live`, 3D not injected; zero console errors; no phone overflow.
7. Zero console errors everywhere; screenshots saved.

---

## Out of scope
- The data-driven `src/templates/developer/template.hbs`, builder steps, and standalone `tech-keyboard/` — DEMO only.
- Palette changes (Soft Daylight stays).
- Naresh's exact tech (Next/Spline/GSAP/Framer) — we replicate the *feel* in vanilla static HTML/JS.

## Suggested phasing (writing-plans will detail)
- **P1 — Scroll + arrangement:** Lenis retune, pointer-events overlay scaffold, sticky headings + oversized sections, universal opacity+scale reveal. (No keyboard/orb change yet; verify navigation is already fixed if the iframe is made non-trapping as an interim.)
- **P2 — Keyboard to fixed bg:** port `stack/` scene → `keyboard.js` + `#kbd-stage`, scroll-driven states, keep click+sound, remove drag-orbit, remove the iframe, add keyboard fallback.
- **P3 — Orb socket journey:** smaller orb, remove dock, DOM sockets (zig-zag), fall+bounce+roll, landing click, mute button, sound unlock.
- **P4 — RTL + fallback + perf hardening + full verify harness.**
