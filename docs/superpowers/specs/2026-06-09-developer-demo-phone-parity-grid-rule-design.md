# Developer Demo — Phone Parity with Wadhah + Skills-Driven Grid Rule

**Date:** 2026-06-09
**Status:** Design — awaiting user review
**Scope:** `public/demo/developer/` (the Maya demo) + `scripts/render-wadhah-portfolio.mts`

## Problem

The live developer demo at `/demo/developer` (persona "Maya Okafor") feels dead on phones
compared with Wadhah's published portfolio at `https://portfolio-trimind.com/p/wadhah-almutairi`.
Wadhah's phone view got a series of keyboard/scroll enhancements that were applied **only** to her
render script (`scripts/render-wadhah-portfolio.mts`) as string-patches over an inlined copy of
`keyboard.js`; the shared canonical demo files were deliberately left untouched.

The user wants the Maya demo to have the same phone behavior: the board fits the screen, the caps
come alive while scrolling (hover/click feel), touching the board doesn't scroll the page, and the
skill-name label rides with the heading instead of colliding with it.

Additionally, the user defined a new **skills-driven grid rule** for the keyboard (replacing the
hardcoded `4 rows` constant), and asked that **one framing rule fit both phone and desktop** for any
column count.

## Goals

1. Maya demo (`/demo/developer`, EN **and** AR) matches Wadhah's phone feel: fit, auto-hover
   spotlight, scroll-lock, in-flow label.
2. Keyboard grid sized by the user's rule, generally (any skill count), on phone and desktop.
3. One adaptive framing rule so any grid (5, 7, more columns) fits the viewport — phone and desktop.
4. `scripts/render-wadhah-portfolio.mts` still runs clean against the updated source.

## Non-Goals / Out of scope

- **No republish of Wadhah's live page.** Her stored HTML already has these enhancements; we only
  keep her render script working. Re-running it (not part of this task) would render her at 5×7 via
  the shared rule — acceptable, but not published here.
- **Desktop content unchanged.** All new *interaction* behavior (auto-hover, scroll-lock, in-flow
  label) is gated to phone via `matchMedia("(max-width:760px)")`. Desktop keeps real mouse-hover.
  The grid rule and adaptive framing are the only things that touch desktop, and for Maya (20 skills)
  they reproduce the current 4×5 framing.
- **The data-driven developer *template* project** (`src/templates/developer/template.hbs`, the
  separate "builder ⇄ demo parity" effort) is not in scope here. This spec only touches the demo and
  Wadhah's render script. The grid rule and adaptive framing landed here are reusable by that project
  later.

## The Grid Rule

Replaces `ROWS_H = 4; COLS_H = ceil(n/4)` (keyboard.js ~226–227).

- **4 rows** while columns fit in 4–7. Columns = `ceil(n/4)`, floored at **4**.
- Once a stack would need an **8th column** (n > 28), **lock columns at 7** and grow **rows**:
  `ROWS = ceil(n/7)`.

| Skills (n) | Rows × Cols | Capacity |
|---|---|---|
| ≤ 16 | 4 × 4 | 16 |
| 17–20 | 4 × 5 | 20 ← **Maya (20)** |
| 21–24 | 4 × 6 | 24 |
| 25–28 | 4 × 7 | 28 |
| 29–35 | 5 × 7 | 35 ← *Wadhah (34)* |
| 36–42 | 6 × 7 | 42 |
| 43–49 | 7 × 7 | 49 |

Algorithm:

```js
var n = SKILLS.length;
var ROWS_H, COLS_H;
if (Math.ceil(n / 4) <= 7) {        // n <= 28
  ROWS_H = 4;
  COLS_H = Math.max(4, Math.ceil(n / 4));
} else {                            // n >= 29
  COLS_H = 7;
  ROWS_H = Math.ceil(n / 7);
}
```

For Maya (n=20) this yields **4 rows × 5 columns** on both desktop and phone — identical to today's
desktop layout, so no desktop regression.

## Adaptive Framing (one rule, phone + desktop)

Today the camera is fixed per orientation (keyboard.js ~545–546) and the board is scaled by hardcoded
constants (`PHONE_SCALE_SHOW`, `SECTION_SCALE`). Neither reacts to column count, so a wider board
overflows.

**Approach:** derive a fit-scale from the board's footprint versus the available viewport, reusing the
per-frame world-space viewport dimensions already computed in the render loop (`vpW`, `vpH` at
keyboard.js ~608–609).

- Board footprint in world units: `boardW = COLS_H * CG`, `boardDepth = ROWS_H * RG` (`CG = RG = 1.0`).
  The board is near-flat (`rotation.x = -0.16`), so screen-vertical extent ≈ depth.
- `fitScale = min( (vpW * MARGIN_W) / boardW, (vpH * MARGIN_H) / boardDepth )`, where `MARGIN_W/H`
  (~0.8–0.9) leave breathing room and are tuned so that at **5 columns the result matches today's
  Maya framing**, then shrink monotonically as columns/rows grow.
- This fit-scale folds into the existing per-section scale `ts` for the *showcase* sections
  (skills/experience/projects). The hero/contact "backdrop" scale (`PHONE_SCALE_TEXT` /
  `SECTION_SCALE` text values) and the phone Y-offset (`PHONE_Y_SHOW`/`PHONE_Y_TEXT`) keep their
  current intent; the fit-scale only guarantees the board never clips.
- Applies on both phone and desktop (one rule), satisfying "same rule is good for phone and desktop".

Exact constants are settled during implementation against visual verification (below); the rule, not
the magic numbers, is the contract.

## Keyboard.js changes (`public/demo/developer/keyboard.js`)

1. **Grid rule** — replace the `ROWS_H`/`COLS_H` definition with the algorithm above.
2. **Adaptive framing** — compute `fitScale` from board footprint vs `vpW`/`vpH`; apply to showcase
   `ts`. Replace reliance on the fixed showcase scale where it would clip.
3. **Scroll-lock (phone)** — after the `pointercancel` listener, add a **non-passive** `touchmove`
   that `preventDefault()`s only while `isDown` (a touch began on the board). Empty-space swipes keep
   `isDown=false` and still scroll the page.
4. **Label host (phone)** — append `labelEl` into `#kbd-label-host` when
   `matchMedia("(max-width:760px)")` matches, else `document.body` (desktop keeps the fixed float).
5. **Auto-hover spotlight (phone, skills section)** — add state (`__autoT`, `__autoIdx`,
   `__AUTO_STEP = 1.4`); guard `pickHover()` so it doesn't null `hovered` while auto-hover owns it
   (`if (!isDown && !(isPhone && labelEnabled)) pickHover();`); and a `dt`-driven tick that sweeps
   lift+glow+label across caps so the pace is identical at any frame rate. Pauses while a finger
   scrubs a key.

All of 3–5 are the exact patches currently in `render-wadhah-portfolio.mts`, moved to source.

## HTML changes (`public/demo/developer/index.html` + `index-ar.html`)

1. **Label host slot** — inject `<div id="kbd-label-host"></div>` inside the skills
   `.sec-head.sticky-head` (after the `<h2>`), in both EN and AR.
2. **Phone label CSS** — under `@media (max-width:760px)`:
   ```css
   #kbd-label-host{width:100%}
   #kbd-label{position:static!important;top:auto!important;left:auto!important;right:auto!important;
     bottom:auto!important;transform:none!important;max-width:100%!important;width:auto!important;
     margin:10px auto 0!important;text-align:center!important;pointer-events:none}
   #kbd-label .kbd-label-name{font-size:24px!important;line-height:1.05!important}
   #kbd-label .kbd-label-tag{max-width:90vw!important;margin:6px auto 0!important}
   ```
   This supersedes the current fixed-position phone rule for `#kbd-label` (the `top/left` overrides at
   index.html ~208–210). Centred text works for RTL, so AR uses the same rule.

## Render-script changes (`scripts/render-wadhah-portfolio.mts`)

The source now carries the interaction patches and the grid rule, so the script's duplicate patches
would either fail (anchor gone) or double-apply. Update it to run clean:

- **Remove** the now-redundant `kbdRep` calls: `rows-phone` (obsolete — the grid rule supersedes it),
  `touch-no-scroll`, `label-host-append`, `auto-hover-state`, `auto-hover-pickhover`,
  `auto-hover-tick`.
- **Remove** the `phone-camera` / `phone-scale` / `phone-y-show` patches **if** adaptive framing now
  fits her 5×7 board (verified during implementation); otherwise keep only what adaptive framing
  doesn't cover.
- **Remove** the `skills-label-host` HTML injection (the demo now ships `#kbd-label-host`, which her
  clone inherits) and the phone-label CSS block in `hero-name-fit` (now in the demo source) — keeping
  only her genuinely Wadhah-specific styling (e.g. the `#hero h1` size fit).
- **Keep** all Wadhah content swaps (skills array, "WA" badge, title/meta/JSON-LD, hero, experience,
  projects, contact, global stragglers).
- The script must complete end-to-end and its self-checks (`leftover === 0`, phone count `=== 0`)
  must pass. **Do not run `publishWadhah`.**

## Verification

WebGL truthfully requires headless GPU: `playwright-core` + pinned chromium + `--use-gl=swiftshader`
(see project harness notes). Screenshot/measure at a **390px** phone viewport and a desktop viewport.

**Maya demo phone (EN + AR):**
- Board (4×5) fully visible, no edge clipping; sits under the heading with no dead gap.
- Auto-hover label cycles through the stack while the skills section is active (e.g. label text
  changes across caps on a scroll hold).
- Cap-drag → page scroll ≈ **0px** (heading stays put); empty-area drag → page **scrolls** normally.
- Across a multi-point scroll sweep, the in-flow label never overlaps the "Tech Stack"/Arabic heading.

**Maya demo desktop:** board framing ≈ current (4×5); real mouse-hover lift+label still works;
no regression.

**Adaptive framing sanity:** temporarily feed a 34-skill stack (or assert via the fit formula) and
confirm a 5×7 board also fits the phone viewport with margin — proving the rule generalizes.

**Render script:** `render-wadhah-portfolio.mts` runs to completion with passing self-checks
(no publish).

## Risks / watch-outs

- **Shared working tree** ([[feedback_shared_working_tree]]): other sessions have uncommitted files
  (`scripts/_*`, `convex/seedData/wadhah.ts`, `src/templates/_cv/cv-wadhah.hbs`). Stage **only** the
  four files this spec touches. Check `git status` before committing.
- **Desktop must stay byte-identical in behavior** for Maya: grid rule gives 4×5 (= today), and all
  interaction additions are phone-`matchMedia`-gated.
- **Don't leave the render script broken** — its `kbdRep` throws on a missing anchor, so every removed
  patch must be fully removed, not partially.
- **`/demo/developer` is the canonical asset host** — keep it self-contained/CSP-clean (no new CDNs).

## Files changed

| File | Change |
|---|---|
| `public/demo/developer/keyboard.js` | grid rule, adaptive framing, scroll-lock, label-host append, auto-hover spotlight |
| `public/demo/developer/index.html` | `#kbd-label-host` slot + phone label CSS |
| `public/demo/developer/index-ar.html` | `#kbd-label-host` slot + phone label CSS (RTL) |
| `scripts/render-wadhah-portfolio.mts` | drop patches now in source; keep content swaps; still runs, no publish |
