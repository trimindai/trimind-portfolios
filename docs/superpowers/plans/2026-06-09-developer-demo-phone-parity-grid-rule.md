# Developer Demo — Phone Parity + Grid Rule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the canonical `/demo/developer` (Maya) the phone keyboard behavior of Wadhah's portfolio (skills-driven grid, adaptive fit, auto-hover spotlight, touch scroll-lock, in-flow skill label) in EN + AR, and slim the now-redundant patches out of `scripts/render-wadhah-portfolio.mts`.

**Architecture:** `public/demo/developer/keyboard.js` is a standalone browser IIFE (also inlined by Wadhah's render script). We add two pure, marker-bracketed helper functions (`kbdGrid`, `kbdFitScale`) that are unit-tested in Node by extracting their source, plus DOM/WebGL interaction patches verified with playwright-core + chromium (swiftshader). All new *interaction* behavior is gated behind `matchMedia("(max-width:760px)")` so desktop stays byte-identical. For Maya (20 skills → 4×5) the grid rule and fit cap are no-ops, so there is no desktop regression.

**Tech Stack:** Vanilla JS + Three.js (browser IIFE), Node ESM test scripts (no test framework), `playwright-core` driving installed Chrome with `--use-gl=swiftshader`, `tsx` for the render script.

---

## Pre-flight (read once, do not skip)

- **Shared working tree** (other Claude sessions push to `origin/master`). Before starting:
  ```bash
  cd /home/trimind/trimind-portfolios && git status --short && git rev-list --left-right --count origin/master...master
  ```
  Expect `0  0` for the sync line. There are pre-existing untracked files from other sessions
  (`scripts/_*`, `convex/seedData/wadhah.ts`, `src/templates/_cv/cv-wadhah.hbs`). **Never `git add -A`.**
  Each commit step below stages only its own named files.
- **Spec:** `docs/superpowers/specs/2026-06-09-developer-demo-phone-parity-grid-rule-design.md`.
- The demo loads `THREE` as a page global and `keyboard.js` sets
  `document.documentElement.classList.add("kbd-live")` on the first painted WebGL frame
  (`keyboard.js:652`) — verification waits on that class.

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `public/demo/developer/keyboard.js` | 3D keyboard IIFE: grid layout, framing, interaction, label | Modify |
| `public/demo/developer/index.html` | EN demo markup + CSS | Modify |
| `public/demo/developer/index-ar.html` | AR (RTL) demo markup + CSS | Modify |
| `scripts/render-wadhah-portfolio.mts` | Clones demo → Wadhah HTML (inlines keyboard.js) | Modify |
| `scripts/dev-demo-grid-rule.test.mjs` | Node unit test for `kbdGrid` + `kbdFitScale` (extracted from source) | Create |
| `scripts/dev-demo-phone-verify.mjs` | Playwright phone/desktop verification (EN+AR) | Create |

---

## Task 1: Skills-driven grid rule (`kbdGrid`)

**Files:**
- Test: `scripts/dev-demo-grid-rule.test.mjs` (create)
- Modify: `public/demo/developer/keyboard.js:226-227` (+ helper above it)

- [ ] **Step 1: Write the failing test**

Create `scripts/dev-demo-grid-rule.test.mjs`:

```js
// Unit test for the pure layout helpers embedded in keyboard.js.
// We extract the marker-bracketed source so the test exercises the REAL code
// (single source of truth — the functions live only in keyboard.js).
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(resolve(HERE, "../public/demo/developer/keyboard.js"), "utf8");

function extract(tag) {
  const m = SRC.match(new RegExp("/\\*__" + tag + "_START__\\*/([\\s\\S]*?)/\\*__" + tag + "_END__\\*/"));
  if (!m) throw new Error(`marker __${tag}__ not found in keyboard.js`);
  return m[1];
}

const kbdGrid = new Function(extract("KBD_GRID") + "\nreturn kbdGrid;")();

let fails = 0;
function check(name, fn) { try { fn(); console.log("  ok  -", name); } catch (e) { fails++; console.log("  FAIL-", name, "\n      ", e.message); } }

// The rule table from the spec.
const cases = [
  [8,  { rows: 4, cols: 4 }],
  [16, { rows: 4, cols: 4 }],
  [17, { rows: 4, cols: 5 }],
  [20, { rows: 4, cols: 5 }],  // Maya
  [21, { rows: 4, cols: 6 }],
  [24, { rows: 4, cols: 6 }],
  [25, { rows: 4, cols: 7 }],
  [28, { rows: 4, cols: 7 }],
  [29, { rows: 5, cols: 7 }],
  [34, { rows: 5, cols: 7 }],  // Wadhah
  [35, { rows: 5, cols: 7 }],
  [36, { rows: 6, cols: 7 }],
  [42, { rows: 6, cols: 7 }],
  [43, { rows: 7, cols: 7 }],
];
for (const [n, want] of cases) {
  check(`kbdGrid(${n}) = ${want.rows}x${want.cols}`, () => assert.deepEqual(kbdGrid(n), want));
}
// Capacity must always hold enough slots for the stack.
check("capacity >= n for 1..60", () => {
  for (let n = 1; n <= 60; n++) { const g = kbdGrid(n); assert.ok(g.rows * g.cols >= n, `n=${n} -> ${g.rows}x${g.cols}`); }
});
// Columns never exceed 7; minimum 4 columns and 4 rows.
check("bounds: 4<=cols<=7, rows>=4", () => {
  for (let n = 1; n <= 60; n++) { const g = kbdGrid(n); assert.ok(g.cols >= 4 && g.cols <= 7 && g.rows >= 4, `n=${n}`); }
});

console.log(fails ? `\nGRID: ${fails} failing` : "\nGRID: all passing");
process.exit(fails ? 1 : 0);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/dev-demo-grid-rule.test.mjs`
Expected: throws `marker __KBD_GRID__ not found in keyboard.js` (helper not added yet).

- [ ] **Step 3: Add the `kbdGrid` helper and use it**

In `public/demo/developer/keyboard.js`, replace lines 226-227:

```js
  var ROWS_H = 4;                                   /* 4 vertical keycaps (fixed) */
  var COLS_H = Math.max(1, Math.ceil(SKILLS.length / ROWS_H)); /* horizontal keycaps scale with the stack */
```

with:

```js
  /*__KBD_GRID_START__*/
  /* Skills-driven grid: 4 rows while columns fit in 4..7; once a stack would need
     an 8th column (>28 skills) lock columns at 7 and grow rows instead. */
  function kbdGrid(n) {
    if (Math.ceil(n / 4) <= 7) return { rows: 4, cols: Math.max(4, Math.ceil(n / 4)) };
    return { rows: Math.ceil(n / 7), cols: 7 };
  }
  /*__KBD_GRID_END__*/
  var __grid = kbdGrid(SKILLS.length);
  var ROWS_H = __grid.rows;   /* vertical keycaps */
  var COLS_H = __grid.cols;   /* horizontal keycaps */
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/dev-demo-grid-rule.test.mjs`
Expected: `GRID: all passing`, exit 0.

- [ ] **Step 5: Commit**

```bash
git add public/demo/developer/keyboard.js scripts/dev-demo-grid-rule.test.mjs
git commit -m "feat(dev-demo): skills-driven keyboard grid rule (4 rows -> 7 cols, then grow rows)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Adaptive fit framing (`kbdFitScale`) + debug hook

**Files:**
- Modify: `scripts/dev-demo-grid-rule.test.mjs` (add fit assertions)
- Modify: `public/demo/developer/keyboard.js` (helper near `kbdGrid`; use at `:634`; debug hook after `layout()` `:550`)

- [ ] **Step 1: Add failing fit-scale assertions to the test**

Append to `scripts/dev-demo-grid-rule.test.mjs` BEFORE the final `console.log(fails ...)` lines:

```js
const kbdFitScale = new Function(extract("KBD_FIT") + "\nreturn kbdFitScale;")();

// Representative world-space viewport sizes at the board plane (from the camera
// formula vpH = 2*tan(fov/2)*|camZ|, vpW = vpH*aspect):
//   phone   : fov 58, camZ 10.0, aspect 390/844  -> vpH ~= 11.09, vpW ~= 5.12
//   desktop : fov 40, camZ 11.6, aspect 1440/900 -> vpH ~=  8.44, vpW ~= 13.5
const PH = { vpW: 5.12, vpH: 11.09 }, DK = { vpW: 13.5, vpH: 8.44 };
const boardW = (cols) => cols * 1.0, boardD = (rows) => rows * 1.0; // CG = RG = 1.0

check("fit: Maya phone (4x5) not shrunk below showcase 0.92", () =>
  assert.ok(kbdFitScale(boardW(5), boardD(4), PH.vpW, PH.vpH) >= 0.92,
    "fit=" + kbdFitScale(boardW(5), boardD(4), PH.vpW, PH.vpH)));
check("fit: Maya desktop (4x5) not shrunk below 1.0", () =>
  assert.ok(kbdFitScale(boardW(5), boardD(4), DK.vpW, DK.vpH) >= 1.0));
check("fit: 7-col phone shrinks below 0.92", () =>
  assert.ok(kbdFitScale(boardW(7), boardD(5), PH.vpW, PH.vpH) < 0.92));
check("fit: monotonic decrease as columns grow (phone)", () => {
  const a = kbdFitScale(boardW(5), boardD(4), PH.vpW, PH.vpH);
  const b = kbdFitScale(boardW(6), boardD(4), PH.vpW, PH.vpH);
  const c = kbdFitScale(boardW(7), boardD(5), PH.vpW, PH.vpH);
  assert.ok(a > b && b > c, `${a} ${b} ${c}`);
});
```

- [ ] **Step 2: Run test to verify the new assertions fail**

Run: `node scripts/dev-demo-grid-rule.test.mjs`
Expected: throws `marker __KBD_FIT__ not found in keyboard.js`.

- [ ] **Step 3: Add the `kbdFitScale` helper**

In `keyboard.js`, immediately AFTER the `/*__KBD_GRID_END__*/` line (before `var __grid = ...`), insert:

```js
  /*__KBD_FIT_START__*/
  /* One framing rule for phone AND desktop: cap the board scale so its footprint
     (boardW x boardD world units) fits inside the live viewport (vpW x vpH world
     units at the board plane) with a margin. Returns the MAX allowed scale; the
     render loop uses min(sectionScale, fit) so it only shrinks when a wide grid
     would otherwise clip. Tuned so a 4x5 board (Maya) is never shrunk. */
  function kbdFitScale(boardW, boardD, vpW, vpH) {
    var MARGIN_W = 0.92, MARGIN_H = 0.86;
    return Math.min((vpW * MARGIN_W) / boardW, (vpH * MARGIN_H) / boardD);
  }
  /*__KBD_FIT_END__*/
```

- [ ] **Step 4: Wire fit into the render loop**

In `keyboard.js`, find (`:634`):

```js
    var ts = isPhone ? (phoneText ? PHONE_SCALE_TEXT : PHONE_SCALE_SHOW) : (SECTION_SCALE[sid] || 1.0);
```

Replace with:

```js
    var ts = isPhone ? (phoneText ? PHONE_SCALE_TEXT : PHONE_SCALE_SHOW) : (SECTION_SCALE[sid] || 1.0);
    /* adaptive framing: never let the board clip, on phone or desktop */
    ts = Math.min(ts, kbdFitScale(COLS_H * CG, ROWS_H * RG, vpW, vpH));
```

- [ ] **Step 5: Add the debug hook for verification**

In `keyboard.js`, immediately AFTER `layout();` (`:550`), insert:

```js
  /* test-only inspection hook (harmless in prod): lets the verifier project cap
     world positions to screen-space and read the active grid. */
  window.__kbd = { caps: caps, camera: camera, get cols() { return COLS_H; }, get rows() { return ROWS_H; } };
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `node scripts/dev-demo-grid-rule.test.mjs`
Expected: `GRID: all passing`, exit 0.

- [ ] **Step 7: Commit**

```bash
git add public/demo/developer/keyboard.js scripts/dev-demo-grid-rule.test.mjs
git commit -m "feat(dev-demo): adaptive board fit so any grid fits phone+desktop (no Maya regression)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Touch scroll-lock (phone)

**Files:**
- Create: `scripts/dev-demo-phone-verify.mjs`
- Modify: `public/demo/developer/keyboard.js:522`

- [ ] **Step 1: Write the verification harness (failing check)**

Create `scripts/dev-demo-phone-verify.mjs`:

```js
// Phone + desktop verification for /demo/developer (EN + AR).
// Serves public/ statically, drives Chrome with swiftshader WebGL, and asserts:
//   - cap-drag does NOT scroll the page; empty-area drag DOES
//   - the skill label lives inside #kbd-label-host on phone and never overlaps the heading
//   - the auto-hover spotlight cycles the label across caps
//   - the board never clips the viewport (projected cap bounds within screen)
// Usage: node scripts/dev-demo-phone-verify.mjs
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".json": "application/json",
  ".ico": "image/x-icon", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
    const file = resolve(ROOT, "." + normalize(p));
    if (!file.startsWith(ROOT)) return res.writeHead(403).end();
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" }); res.end(body);
  } catch { res.writeHead(404).end("not found"); }
});
await new Promise((r) => server.listen(8787, r));
const BASE = "http://localhost:8787";

const b = await chromium.launch({ channel: "chrome", headless: true, args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
let fails = 0;
const ok = (n, c, extra = "") => { console.log(`  ${c ? "ok  " : "FAIL"}- ${n}${extra ? "  " + extra : ""}`); if (!c) fails++; };

async function liveSkills(page) {
  await page.waitForFunction(() => document.documentElement.classList.contains("kbd-live"), { timeout: 25000 });
  await page.evaluate(() => document.getElementById("skills")?.scrollIntoView({ behavior: "instant", block: "center" }));
  await page.waitForTimeout(900);
}

async function checkPhone(path, label) {
  console.log(`\n[phone ${label}] ${path}`);
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
  await liveSkills(page);

  // --- scroll-lock: drag starting ON a keycap should not scroll the page ---
  const dragDelta = async (x, y0) => {
    const before = await page.evaluate(() => Math.round(window.scrollY));
    let y = y0;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let i = 0; i < 8; i++) { y -= 22; await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] }); await page.waitForTimeout(35); }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => Math.round(window.scrollY));
    return after - before;
  };
  // keyboard sits in the lower-centre on phone; caps around y560, board centre x195
  const capDrag = await dragDelta(195, 600);
  ok("cap-drag does not scroll the page (|delta| <= 8px)", Math.abs(capDrag) <= 8, `delta=${capDrag}`);
  await page.evaluate(() => document.getElementById("skills")?.scrollIntoView({ behavior: "instant", block: "center" }));
  await page.waitForTimeout(500);
  // empty area near the very top edge of the section (above the board) should still scroll
  const emptyDrag = await dragDelta(40, 120);
  ok("empty-area drag still scrolls the page (delta > 40px)", emptyDrag > 40, `delta=${emptyDrag}`);

  await ctx.close();
}

await checkPhone("/demo/developer/index.html", "EN");
await checkPhone("/demo/developer/index-ar.html", "AR");
await b.close();
server.close();
console.log(fails ? `\nVERIFY: ${fails} failing` : "\nVERIFY: all passing");
process.exit(fails ? 1 : 0);
```

- [ ] **Step 2: Run to verify the cap-drag check fails (page currently scrolls)**

Run: `node scripts/dev-demo-phone-verify.mjs`
Expected: `cap-drag does not scroll the page` reports **FAIL** with a non-trivial `delta` (the page scrolls today because touch listeners are passive).

- [ ] **Step 3: Add the non-passive touchmove scroll-lock**

In `keyboard.js`, find (`:522`):

```js
  window.addEventListener("pointercancel", function () { isDown = false; dragging = false; downCap = null; }, { passive: true });
```

Add immediately AFTER it:

```js
  /* phone: while a touch is interacting with the keyboard (isDown — the touch
     started on a cap/board) stop the page from ALSO scrolling, so dragging the
     caps doesn't jolt the heading. Empty-space touches keep isDown=false and
     scroll normally. */
  window.addEventListener("touchmove", function (e) { if (isDown && e.cancelable) e.preventDefault(); }, { passive: false });
```

- [ ] **Step 4: Run to verify both drag checks pass**

Run: `node scripts/dev-demo-phone-verify.mjs`
Expected: `cap-drag does not scroll the page` = **ok**, `empty-area drag still scrolls` = **ok** (both EN and AR).

- [ ] **Step 5: Commit**

```bash
git add public/demo/developer/keyboard.js scripts/dev-demo-phone-verify.mjs
git commit -m "feat(dev-demo): keep page still while touching the phone keyboard

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: In-flow skill label under the heading (phone) — keyboard.js + EN/AR HTML

**Files:**
- Modify: `public/demo/developer/keyboard.js:414`
- Modify: `public/demo/developer/index.html` (skills head `:523`, phone CSS `:208`)
- Modify: `public/demo/developer/index-ar.html` (skills head `:524`, phone CSS `:212`)
- Modify: `scripts/dev-demo-phone-verify.mjs` (add label checks)

- [ ] **Step 1: Add the label-overlap + host checks to the verifier**

In `scripts/dev-demo-phone-verify.mjs`, inside `checkPhone`, add BEFORE `await ctx.close();`:

```js
  // --- label hosting + no overlap with the heading on scroll ---
  const hostId = await page.evaluate(() => document.getElementById("kbd-label")?.parentElement?.id || "");
  ok("skill label is hosted inside #kbd-label-host on phone", hostId === "kbd-label-host", `parent=#${hostId}`);

  // sweep the skills section through the viewport; the in-flow label must never
  // vertically overlap the section heading.
  let worstOverlap = -1e9;
  const skillsTop = await page.evaluate(() => { const s = document.getElementById("skills"); return s.getBoundingClientRect().top + window.scrollY; });
  for (let off = -120; off <= 640; off += 160) {
    await page.evaluate((y) => window.scrollTo(0, y), skillsTop + off);
    await page.waitForTimeout(450);
    const o = await page.evaluate(() => {
      const h = document.querySelector("#skills h2"), l = document.getElementById("kbd-label");
      if (!h || !l || getComputedStyle(l).opacity === "0") return -1e9;
      const hr = h.getBoundingClientRect(), lr = l.getBoundingClientRect();
      return Math.min(hr.bottom, lr.bottom) - Math.max(hr.top, lr.top); // >0 means overlap
    });
    worstOverlap = Math.max(worstOverlap, o);
  }
  ok("in-flow label never overlaps the heading across scroll", worstOverlap <= 2, `worstOverlap=${Math.round(worstOverlap)}px`);
```

- [ ] **Step 2: Run to verify the host check fails**

Run: `node scripts/dev-demo-phone-verify.mjs`
Expected: `skill label is hosted inside #kbd-label-host` = **FAIL** (`parent=#` empty — label still appended to `<body>` and host doesn't exist yet).

- [ ] **Step 3: Append the label into `#kbd-label-host` on phone**

In `keyboard.js`, find (`:414`):

```js
      document.body.appendChild(labelEl);
```

Replace with:

```js
      var __lh = (window.matchMedia && window.matchMedia("(max-width:760px)").matches) ? document.getElementById("kbd-label-host") : null;
      (__lh || document.body).appendChild(labelEl);
```

- [ ] **Step 4: Add the host slot to the EN skills heading**

In `public/demo/developer/index.html`, find (`:521-524`):

```html
    <div class="sec-head sticky-head">
      <div class="eyebrow">Tech Stack</div>
      <h2>Tech Stack</h2>
    </div>
```

Replace with:

```html
    <div class="sec-head sticky-head">
      <div class="eyebrow">Tech Stack</div>
      <h2>Tech Stack</h2>
      <div id="kbd-label-host"></div>
    </div>
```

- [ ] **Step 5: Make the EN phone label in-flow + centred**

In `public/demo/developer/index.html`, inside the `@media(max-width:760px)` block, replace (`:208`):

```css
  #kbd-label{top:158px!important;left:20px!important;max-width:72vw!important}
```

with:

```css
  #kbd-label-host{width:100%}
  #kbd-label{position:static!important;top:auto!important;left:auto!important;right:auto!important;bottom:auto!important;transform:none!important;max-width:100%!important;width:auto!important;margin:10px auto 0!important;text-align:center!important;pointer-events:none}
```

(Leave the existing `#kbd-label .kbd-label-name` / `.kbd-label-tag` phone rules as they are.)

- [ ] **Step 6: Add the host slot to the AR skills heading**

In `public/demo/developer/index-ar.html`, find the skills `sticky-head` (`:522-525`, the one whose `<h2>` is `التقنيات`):

```html
    <div class="sec-head sticky-head">
      <div class="eyebrow">التقنيات</div>
      <h2>التقنيات</h2>
    </div>
```

Replace with:

```html
    <div class="sec-head sticky-head">
      <div class="eyebrow">التقنيات</div>
      <h2>التقنيات</h2>
      <div id="kbd-label-host"></div>
    </div>
```

> If the eyebrow text differs from `التقنيات`, keep whatever is there — only insert the `<div id="kbd-label-host"></div>` line directly after the `<h2>` inside the **skills** section's `sticky-head`.

- [ ] **Step 7: Make the AR phone label in-flow + centred**

In `public/demo/developer/index-ar.html`, inside the `@media (max-width:768px)` / `760px` block, replace (`:212`):

```css
  #kbd-label{top:158px!important;right:20px!important;left:auto!important;max-width:72vw!important;text-align:right!important}
```

with:

```css
  #kbd-label-host{width:100%}
  #kbd-label{position:static!important;top:auto!important;left:auto!important;right:auto!important;bottom:auto!important;transform:none!important;max-width:100%!important;width:auto!important;margin:10px auto 0!important;text-align:center!important;pointer-events:none}
```

(The desktop RTL rule at `index-ar.html:208` — `right:clamp(...)` — stays untouched; desktop is unchanged.)

- [ ] **Step 8: Run to verify host + overlap checks pass**

Run: `node scripts/dev-demo-phone-verify.mjs`
Expected: `skill label is hosted inside #kbd-label-host` = **ok** and `in-flow label never overlaps the heading` = **ok**, for EN and AR.

- [ ] **Step 9: Commit**

```bash
git add public/demo/developer/keyboard.js public/demo/developer/index.html public/demo/developer/index-ar.html scripts/dev-demo-phone-verify.mjs
git commit -m "feat(dev-demo): phone skill label rides in-flow under the heading (EN+AR)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Auto-hover spotlight (phone, skills section)

**Files:**
- Modify: `public/demo/developer/keyboard.js:484` (state), `:605` (pickHover guard), `:631` (tick)
- Modify: `scripts/dev-demo-phone-verify.mjs` (add label-cycle check)

- [ ] **Step 1: Add the auto-hover cycle check to the verifier**

In `scripts/dev-demo-phone-verify.mjs`, inside `checkPhone`, add BEFORE `await ctx.close();`:

```js
  // --- auto-hover spotlight: the label must cycle across multiple skills while idle ---
  await page.evaluate(() => document.getElementById("skills")?.scrollIntoView({ behavior: "instant", block: "center" }));
  const seen = new Set();
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(800);
    const name = await page.evaluate(() => document.querySelector("#kbd-label .kbd-label-name")?.textContent?.trim() || "");
    if (name) seen.add(name);
  }
  ok("auto-hover spotlight cycles the label across >= 3 skills", seen.size >= 3, `distinct=${seen.size} [${[...seen].join(", ")}]`);
```

- [ ] **Step 2: Run to verify the cycle check fails**

Run: `node scripts/dev-demo-phone-verify.mjs`
Expected: `auto-hover spotlight cycles the label` = **FAIL** (`distinct=1` — label stays on a single fallback skill, no sweep yet).

- [ ] **Step 3: Add auto-hover state**

In `keyboard.js`, find (`:484`):

```js
  var hovered = null;
```

Replace with:

```js
  var hovered = null;
  var __autoT = 0, __autoIdx = -1, __AUTO_STEP = 1.4; /* phone auto-hover spotlight */
```

- [ ] **Step 4: Guard pickHover so auto-hover keeps ownership on phone**

In `keyboard.js`, find (`:605`):

```js
    if (!isDown) pickHover();
```

Replace with:

```js
    if (!isDown && !(isPhone && labelEnabled)) pickHover();
```

- [ ] **Step 5: Drive the spotlight off real elapsed time**

In `keyboard.js`, find (`:631`):

```js
    var sm = 1 - Math.exp(-k * dt);
```

Replace with:

```js
    var sm = 1 - Math.exp(-k * dt);
    /* phone auto-hover: sweep a gentle spotlight across the caps so the board stays
       alive while scrolling; paced by real elapsed time (dt) so it's identical at
       any fps; pauses while a finger is scrubbing keys (isDown). */
    if (isPhone && labelEnabled && !isDown && caps.length) {
      __autoT += dt;
      if (__autoIdx < 0 || __autoT >= __AUTO_STEP) {
        __autoT = 0; __autoIdx = (__autoIdx + 1) % caps.length;
        hovered = caps[__autoIdx]; setLabel(hovered.userData.skill);
      }
    }
```

- [ ] **Step 6: Run to verify the cycle check passes**

Run: `node scripts/dev-demo-phone-verify.mjs`
Expected: `auto-hover spotlight cycles the label across >= 3 skills` = **ok** (EN and AR), all other checks still **ok**.

- [ ] **Step 7: Commit**

```bash
git add public/demo/developer/keyboard.js scripts/dev-demo-phone-verify.mjs
git commit -m "feat(dev-demo): phone auto-hover spotlight keeps the keyboard alive on scroll

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: De-duplicate `render-wadhah-portfolio.mts` (keep it runnable; no republish)

**Files:**
- Modify: `scripts/render-wadhah-portfolio.mts`

The source now carries the grid rule, adaptive fit, scroll-lock, label-host append, and auto-hover. The script's `kbdRep()` throws on a missing anchor, so each obsolete patch must be removed completely.

- [ ] **Step 1: Remove the obsolete `kbdRep` keyboard patches**

In `scripts/render-wadhah-portfolio.mts`, delete these patch calls entirely (they live around `:93-145`):
- `kbdRep("rows-phone", ...)` — superseded by the grid rule in source.
- `kbdRep("phone-camera", ...)`, `kbdRep("phone-scale", ...)`, `kbdRep("phone-y-show", ...)` — superseded by adaptive fit in source.
- `kbdRep("touch-no-scroll", ...)` — now in source.
- `kbdRep("label-host-append", ...)` — now in source.
- `kbdRep("auto-hover-state", ...)`, `kbdRep("auto-hover-pickhover", ...)`, `kbdRep("auto-hover-tick", ...)` — now in source.

Keep the Wadhah-specific keyboard edits: `kbd.replace(/var SKILLS = \[...\]/, WADHAH_SKILLS)` and the `"Maya"` → `"WA"` trackball badge replace. You may delete the now-unused `kbdRep` helper function (`:89-92`) if no `kbdRep(...)` calls remain.

- [ ] **Step 2: Remove the now-redundant HTML host injection**

Delete the `rep("skills-label-host", ...)` call (`:297-306`) — the demo source now ships `<div id="kbd-label-host"></div>`, which Wadhah's clone inherits.

- [ ] **Step 3: Drop the duplicated phone-label CSS from `hero-name-fit`**

In the `rep("hero-name-fit", "</head>", ...)` call (`:321-335`), remove the `@media(max-width:760px){ #kbd-label-host... #kbd-label{position:static...} ... }` block (now in the demo source). Keep the Wadhah-specific `#hero h1{font-size:...}` / `#hero .grid{max-width:520px}` rules. The call becomes:

```js
rep("hero-name-fit", "</head>",
  '<style>#hero h1{font-size:clamp(2.2rem,6vw,4.6rem)!important;line-height:.96!important}@media(min-width:900px){#hero .grid{max-width:520px}}' +
  '</style></head>');
```

- [ ] **Step 4: Run the render script and confirm it completes with passing self-checks**

Run: `npx tsx scripts/render-wadhah-portfolio.mts`
Expected output (no thrown `KBD REPLACE FAILED` / `anchor not found`):
```
rendered: portfolio <N>b → /tmp/wadhah-portfolio.html
leftover demo-persona refs (should be 0): 0
phone on page (should be 0): 0
```
Confirm exit code 0: `echo $?` → `0`. **Do not run `publishWadhah`** — Wadhah's live page is intentionally left as-is.

- [ ] **Step 5: Sanity-check the generated HTML inherits the source enhancements**

Run:
```bash
grep -c 'kbd-label-host' /tmp/wadhah-portfolio.html && grep -c 'kbdGrid\|touchmove\|__autoIdx' /tmp/wadhah-portfolio.html
```
Expected: `kbd-label-host` count `>= 1`, and the keyboard-feature count `>= 1` (the inlined keyboard.js carries the new code).

- [ ] **Step 6: Commit**

```bash
git add scripts/render-wadhah-portfolio.mts
git commit -m "refactor(wadhah-render): inherit keyboard enhancements from shared demo source

The grid rule, adaptive fit, scroll-lock, in-flow label, and auto-hover now live
in public/demo/developer/*, so drop the duplicate string-patches here. Script still
runs clean; Wadhah's live page is not republished.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Full visual verification (no-clip EN+AR phone, desktop unchanged) + final review

**Files:**
- Modify: `scripts/dev-demo-phone-verify.mjs` (add no-clip + desktop checks)

- [ ] **Step 1: Add the no-clip (phone) and desktop-unchanged checks**

In `scripts/dev-demo-phone-verify.mjs`, add this helper near the top (after `ok` is defined):

```js
// Project every cap's world position with the live camera and return the
// screen-space horizontal extent in CSS pixels.
async function capScreenExtent(page) {
  return await page.evaluate(() => {
    const k = window.__kbd; if (!k || !k.caps?.length) return null;
    const v = new window.THREE.Vector3(); let minX = Infinity, maxX = -Infinity;
    for (const cap of k.caps) {
      cap.getWorldPosition(v); v.project(k.camera);
      const x = (v.x * 0.5 + 0.5) * window.innerWidth;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
    }
    return { minX, maxX, w: window.innerWidth, cols: k.cols, rows: k.rows };
  });
}
```

Inside `checkPhone`, before `await ctx.close();`:

```js
  await page.evaluate(() => document.getElementById("skills")?.scrollIntoView({ behavior: "instant", block: "center" }));
  await page.waitForTimeout(700);
  const ext = await capScreenExtent(page);
  ok("keyboard does not clip the phone viewport (caps within 0..width)", !!ext && ext.minX >= 0 && ext.maxX <= ext.w,
     ext ? `minX=${Math.round(ext.minX)} maxX=${Math.round(ext.maxX)} w=${ext.w} grid=${ext.rows}x${ext.cols}` : "no __kbd");
```

Then add a desktop check function and call it after the phone checks (before `await b.close();`):

```js
async function checkDesktop(path, label) {
  console.log(`\n[desktop ${label}] ${path}`);
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
  await liveSkills(page);
  const ext = await capScreenExtent(page);
  ok("desktop: grid is 4x5 for Maya (rule no-op)", !!ext && ext.rows === 4 && ext.cols === 5, ext ? `grid=${ext.rows}x${ext.cols}` : "no __kbd");
  ok("desktop: keyboard does not clip", !!ext && ext.minX >= 0 && ext.maxX <= ext.w, ext ? `minX=${Math.round(ext.minX)} maxX=${Math.round(ext.maxX)} w=${ext.w}` : "no __kbd");
  // label stays a fixed top-left float on desktop (NOT hosted in-flow)
  const parent = await page.evaluate(() => document.getElementById("kbd-label")?.parentElement?.id || "body");
  ok("desktop: label is NOT in #kbd-label-host (stays floating)", parent !== "kbd-label-host", `parent=${parent}`);
  await ctx.close();
}
await checkDesktop("/demo/developer/index.html", "EN");
```

- [ ] **Step 2: Run the full verification suite**

Run: `node scripts/dev-demo-phone-verify.mjs`
Expected: every line prints `ok  -` for phone EN, phone AR, and desktop EN; final line `VERIFY: all passing`, exit 0. Key checks:
- cap-drag |delta| ≤ 8px; empty-area drag > 40px
- label hosted in `#kbd-label-host` (phone) / floating (desktop)
- label never overlaps the heading
- auto-hover cycles ≥ 3 distinct skills
- caps within `0..width` (no clip) on phone EN/AR and desktop
- desktop grid is `4x5`

- [ ] **Step 3: If any framing check fails, tune the fit margins**

Only if `keyboard does not clip` fails or the board looks too small: adjust `MARGIN_W` / `MARGIN_H` in `kbdFitScale` (`keyboard.js`, `/*__KBD_FIT_*__*/`). Lower margin = more padding (smaller board); higher = larger. Re-run `node scripts/dev-demo-grid-rule.test.mjs` (must still pass the "Maya not shrunk" assertions) and `node scripts/dev-demo-phone-verify.mjs`. Commit any tune:

```bash
git add public/demo/developer/keyboard.js
git commit -m "fix(dev-demo): tune adaptive-fit margins for clean phone framing

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 4: Confirm the demo is byte-stable where it must be & commit the verifier**

Run the grid-rule unit test once more and confirm no stray files are staged:
```bash
node scripts/dev-demo-grid-rule.test.mjs
git add scripts/dev-demo-phone-verify.mjs
git status --short
```
Expected: `GRID: all passing`; `git status` shows only `scripts/dev-demo-phone-verify.mjs` staged (plus nothing from other sessions).

```bash
git commit -m "test(dev-demo): playwright phone+desktop verification (fit, scroll-lock, label, auto-hover)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 5: Push and confirm clean sync**

```bash
git rev-list --left-right --count origin/master...master
git push origin master
```
Expected: after push, branch is in sync. (Vercel auto-deploys `/demo/developer`; per project notes, if the prod alias lags, verify it points at the new SHA.)

---

## Self-Review notes (traceability to spec)

- **Grid rule** → Task 1 (`kbdGrid`, full table tested).
- **Adaptive framing, phone+desktop** → Task 2 (`kbdFitScale`, `ts = min(ts, fit)`), verified no-clip in Task 7.
- **Scroll-lock** → Task 3 (non-passive `touchmove`), verified cap-drag vs empty-drag.
- **In-flow label (EN+AR)** → Task 4 (keyboard append + host slot + CSS), verified host + overlap.
- **Auto-hover spotlight** → Task 5, verified label cycles ≥3 skills.
- **render-wadhah still runs, no republish** → Task 6 (remove duplicates, run script, no `publishWadhah`).
- **Desktop byte-identical for Maya** → Task 7 desktop checks (grid 4×5, label floating, no clip).
- **Shared working tree safety** → every commit stages only named files; Pre-flight + Task 7 Step 4 check `git status`.
