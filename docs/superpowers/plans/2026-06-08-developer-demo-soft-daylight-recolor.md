# Developer Demo — "Soft Daylight" Recolor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recolor the developer template's live demo from its dark violet/cyan theme to a light "Soft Daylight" theme built from the "Muted Blues & Grays" palette, with keyboard keycaps switched to each tool's real brand color — demo files only.

**Architecture:** The demo is three static files heavily driven by CSS custom properties. The primary lever is replacing the `:root` token block (recolors ~80% of the page); a bounded set of hard-coded values and the WebGL keyboard colors get targeted edits. Correctness is enforced by an objective Playwright harness that asserts the computed palette, WCAG AA contrast per surface, zero console errors, and no horizontal overflow — run red (against the current dark theme) → green (after recolor). Per-surface visual judgment (derived text colors, light-theme shadows) is done with the `impeccable` and `taste` skills and validated by that harness.

**Tech Stack:** Static HTML/CSS, Three.js r128 (WebGL keyboard, `stack/index.html`), Next.js dev server for serving `/demo/developer`, Playwright (Node) for verification.

---

## Source of truth

Spec: `docs/superpowers/specs/2026-06-08-developer-demo-soft-daylight-recolor-design.md`. Read it before starting. The color map and keycap table below are copied from it; if they ever disagree, the spec wins.

## Files

- **Modify:** `public/demo/developer/index.html` — page `:root` + section styles (EN).
- **Modify:** `public/demo/developer/index-ar.html` — identical recolor (Arabic/RTL mirror).
- **Modify:** `public/demo/developer/stack/index.html` — WebGL keyboard: trackball color, body (`caseMat`), keycap `SKILLS[].color`, drop "Maya" badge.
- **Create:** `scripts/dev-daylight-check.mjs` — Playwright verification harness (the objective gate).
- **Do NOT touch:** `src/templates/developer/template.hbs`, `src/components/builder/**`, `src/templates/developer/manifest.json`. (Demo-only scope; the `Spacebar` builder preset already preserves the old palette.)

## Target color map (from spec)

| Token | Old | New |
|---|---|---|
| `--bg` | `#020617` | `#ccd1da` Mischka |
| `--bg-2` | `#0b1222` | `#bbc2ce` derived |
| `--card` | `rgba(15,23,42,.55)` | `#a6bad0` Casper |
| `--card-hover` | `rgba(20,30,55,.72)` | `#9cb2cc` derived |
| `--fg` | `#f8fafc` | `#222831` near-black |
| `--muted` | `#94a3b8` | `#4b5056` Davy's |
| `--muted-2` | `#64748b` | `#5f6b7a` Shuttle |
| `--border` | `rgba(148,163,184,.14)` | `rgba(75,80,86,.16)` |
| `--border-strong` | `rgba(148,163,184,.28)` | `rgba(75,80,86,.30)` |
| `--brand` | `#7c5cff` | `#6d99ce` Blue-Gray (fills) |
| `--brand-ink` (new) | — | `#3c6fae` (links/eyebrows/buttons on light, AA-safe) |
| `--accent` | `#38bdf8` | `#5f6b7a` Shuttle |
| `--surface-dark` (new) | — | `#5f6b7a` (nav pill/buttons/chips) |
| `--on-dark` (new) | — | `#eef1f5` (text on Shuttle/Davy) |
| `--contact-bg` (new) | — | `#4b5056` Davy's |

Keyboard: trackball `0x3a5a82`→`0x6d99ce`; body `caseMat 0x141519`→`0x4b5056`; keycaps → brand table in Task 6.

---

### Task 1: Safe git integration (shared tree)

Local `master` HEAD = spec commit `29e3182`; `origin/master` = `87513d3` (adds `tech-keyboard/`). They diverged 1↔1. The working tree is **shared with other Claude sessions** and may contain foreign uncommitted work — never `git add -A`, never `git checkout .`, never switch branches out from under them.

- [ ] **Step 1: Snapshot foreign state**

Run:
```bash
cd /home/trimind/trimind-portfolios
git status --porcelain | sort
git rev-list --left-right --count origin/master...HEAD
```
Expected: a list of any foreign modified/untracked files (record them — you will NOT stage these), and `1\t1`.

- [ ] **Step 2: Linearize our spec commit onto origin/master (rebase, no working-tree churn for our targets)**

Our only local-unique commit is the spec doc (`29e3182`) — it touches only `docs/…/specs/…md`, so a rebase cannot conflict with foreign working-tree edits.
```bash
git stash list   # confirm nothing of ours is stashed
git rebase origin/master
```
Expected: "Successfully rebased and updated refs/heads/master." `tech-keyboard/index.html` now exists locally; `git log --oneline -2` shows the spec commit on top of `87513d3`.
If rebase reports conflicts (would only happen if a foreign commit also touched the spec file — unlikely), run `git rebase --abort` and STOP; ask the user how to proceed.

- [ ] **Step 3: Verify the tree still builds & foreign work is untouched**

Run:
```bash
git status --porcelain | sort        # foreign files unchanged from Step 1
ls tech-keyboard/index.html          # now present
```
Expected: same foreign files as Step 1 (we changed nothing of theirs); `tech-keyboard/index.html` listed.

- [ ] **Step 4: Commit checkpoint note**

No code changed yet — nothing to commit. Proceed.

---

### Task 2: Verification harness (the objective gate) — write it first

**Files:** Create `scripts/dev-daylight-check.mjs`.

> **REVISION (infra correction):** The repo already has a proven demo harness — `scripts/devstack-check.mjs` (committed in `cd932db`). Reuse its config, do NOT use Next dev / port 3000 / plain `chromium`:
> - `import { chromium } from "playwright-core"` and launch with `executablePath: "/home/trimind/.cache/ms-playwright/chromium-1169/chrome-linux/chrome"`, `headless:true`, `args:["--no-sandbox","--use-gl=swiftshader"]` (swiftshader is REQUIRED or the Three.js keyboard canvas renders blank).
> - Serve the static `public/` dir (the demo is static files; the iframe `src="/demo/developer/stack/"` is absolute). Spawn a static server inside the harness: `python3 -m http.server <port> --directory public` (pick a free port, e.g. 8799), wait for it, run checks, kill it on exit. Routes: `/demo/developer/index.html` (EN) and `/demo/developer/index-ar.html` (AR).
> - Keep `devstack-check.mjs`'s `canvas#stage` non-blank + `glLost` check for the keyboard, AND add the new assertions below.

This script is the test. It loads EN + AR at phone (390×844) and desktop (1280×900) and asserts: (a) computed `--bg` equals the new Mischka, (b) WCAG AA on each surface→text pair, (c) no horizontal overflow at 390px, (d) zero console errors, (e) the keyboard `canvas#stage` is present and its WebGL context is not lost, and writes screenshots to `scripts/_daylight-*.png`. The AA-pair math and `hex()`/`ratio()`/`lum()` helpers from the original code block below are still correct — keep them; only the launch/serve wiring changes per the revision note.

- [ ] **Step 1: Write the harness**

```js
// scripts/dev-daylight-check.mjs
// Run:  BASE_URL=http://localhost:3000 node scripts/dev-daylight-check.mjs
// Requires the Next dev server running (npm run dev) so /demo/developer + its iframe resolve.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const ROUTES = [
  { id: "en", url: `${BASE}/demo/developer` },
  { id: "ar", url: `${BASE}/demo/developer/index-ar.html` },
];
const VIEWPORTS = [
  { id: "phone", width: 390, height: 844 },
  { id: "desk", width: 1280, height: 900 },
];

// WCAG relative luminance + contrast ratio
function lum([r, g, b]) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const [R, G, B] = [f(r), f(g), f(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function ratio(a, b) { const L1 = lum(a), L2 = lum(b); const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1]; return (hi + 0.05) / (lo + 0.05); }
const hex = (h) => { h = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };

// Surface→text pairs that MUST pass AA (4.5 normal). Values mirror the spec.
const PAIRS = [
  ["page body text", "#4b5056", "#ccd1da"],
  ["page heading", "#222831", "#ccd1da"],
  ["link / eyebrow on light", "#3c6fae", "#ccd1da"],
  ["text on Casper card", "#222831", "#a6bad0"],
  ["on-dark text on Shuttle", "#eef1f5", "#5f6b7a"],
  ["on-dark text on Contact(Davy)", "#eef1f5", "#4b5056"],
  ["primary button text", "#ffffff", "#3c6fae"],
];

let failures = [];
for (const [name, fg, bg] of PAIRS) {
  const r = ratio(hex(fg), hex(bg));
  const ok = r >= 4.5;
  console.log(`${ok ? "PASS" : "FAIL"}  AA ${r.toFixed(2)}  ${name}  (${fg} on ${bg})`);
  if (!ok) failures.push(`AA ${name} = ${r.toFixed(2)} (< 4.5)`);
}

const browser = await chromium.launch();
for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(route.url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());
    if (bg.toLowerCase() !== "#ccd1da") failures.push(`${route.id}/${vp.id}: --bg is "${bg}", expected #ccd1da`);

    if (vp.id === "phone") {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 1) failures.push(`${route.id}/${vp.id}: horizontal overflow ${overflow}px`);
    }
    if (errors.length) failures.push(`${route.id}/${vp.id}: ${errors.length} console error(s): ${errors.slice(0,3).join(" | ")}`);

    await page.screenshot({ path: `scripts/_daylight-${route.id}-${vp.id}.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();

if (failures.length) { console.error("\nFAILURES:\n - " + failures.join("\n - ")); process.exit(1); }
console.log("\nALL CHECKS PASSED");
```

- [ ] **Step 2: Start the dev server (separate terminal / background)**

Run: `npm run dev` (serves `http://localhost:3000`). Confirm `http://localhost:3000/demo/developer` returns 200.

- [ ] **Step 3: Run the harness RED against the current dark theme**

Run: `node scripts/dev-daylight-check.mjs`
Expected: **FAIL** — at minimum `--bg is "#020617", expected #ccd1da` for every route/viewport. (The AA pair math passes already; the palette/visual assertions are what flip.) This confirms the harness detects the un-recolored state.

- [ ] **Step 4: Commit the harness**

```bash
git add scripts/dev-daylight-check.mjs
git commit -m "test(dev-demo): Playwright AA + palette harness for Soft Daylight recolor"
```

---

### Task 3: Recolor the page `:root` tokens (EN + AR)

**Files:** `public/demo/developer/index.html:30-42`, and the identical block in `public/demo/developer/index-ar.html`.

- [ ] **Step 1: Replace the `:root` color tokens in `index.html`**

Replace lines 30–42 (the color tokens; keep `--radius`/`--max`/fonts on 43–47) with:
```css
  --bg:#ccd1da;
  --bg-2:#bbc2ce;
  --card:#a6bad0;
  --card-hover:#9cb2cc;
  --fg:#222831;
  --muted:#4b5056;
  --muted-2:#5f6b7a;
  --border:rgba(75,80,86,0.16);
  --border-strong:rgba(75,80,86,0.30);
  --brand:#6d99ce;
  --brand-ink:#3c6fae;
  --accent:#5f6b7a;
  --surface-dark:#5f6b7a;
  --on-dark:#eef1f5;
  --contact-bg:#4b5056;
  --brand-glow:color-mix(in srgb, var(--brand) 28%, transparent);
  --accent-glow:color-mix(in srgb, var(--accent) 26%, transparent);
```

- [ ] **Step 2: Apply the identical replacement in `index-ar.html`**

Find the same `:root` block (it has `--bg:#020617`/`--brand:#7c5cff`) and replace its color tokens with the exact block from Step 1.

- [ ] **Step 3: Re-run the harness**

Run: `node scripts/dev-daylight-check.mjs`
Expected: the `--bg` assertion now PASSES for all routes/viewports. AA pairs PASS. There may still be console errors / overflow / visual issues from hard-coded values — those are Tasks 4–7. Screenshots now show a light page.

- [ ] **Step 4: Commit**

```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html
git commit -m "feat(dev-demo): recolor page :root tokens to Soft Daylight (EN+AR)"
```

---

### Task 4: Fix non-token page colors + light-theme depth (with `impeccable`)

**Invoke the `impeccable` skill for this task** (and keep it active through Task 7). The `:root` swap recolors token-driven rules; this task fixes values that bypass tokens and converts dark "glow" depth into real light-theme shadows.

**Files:** `public/demo/developer/index.html` (+ mirror every edit into `index-ar.html`).

- [ ] **Step 1: Fix the hard-coded white-on-brand + selection**

- `::selection{background:var(--brand);color:#fff}` → `::selection{background:var(--brand-ink);color:var(--on-dark)}`
- `.btn.primary{...color:#fff}` (≈ line 164) → use `background:var(--brand-ink);color:#fff` (AA-safe; raw `--brand #6d99ce` fails AA as a text background).
- `.btn.primary:hover{box-shadow:0 10px 34px var(--brand-glow)}` → soft light shadow `0 10px 28px rgba(60,111,174,.28)`.

- [ ] **Step 2: Convert dark drop-shadows to light shadows**

For page chrome (`.btn:hover`, cards, nav) replace any `box-shadow` whose alpha-black is heavy (`rgba(0,0,0,.3)`–`.85`) with a soft light elevation:
```css
box-shadow:0 8px 24px rgba(34,40,49,.10),0 2px 6px rgba(34,40,49,.06);
```
Apply to `.btn:hover` (line ≈161, drop the `rgba(0,0,0,.4)` term) and `.tl-card:hover`. Mirror in AR.

- [ ] **Step 3: Tame the dark background scaffolding for a light page**

- `body::before` (lines 61–66) already uses `--brand`/`--accent` mixes over `--bg`; lower the mix weights so it reads as a faint blue wash on Mischka: change the two radial mixes from `14%`/`12%` to `10%`/`8%`.
- The fixed star-field canvas `#stars` (white points) is invisible/wrong on light — set its container opacity low so it doesn't add grey noise: `#stars{...opacity:.18}` (or `display:none` if it muddies the page — decide via the screenshot). Mirror in AR.

- [ ] **Step 4: Audit the inline logo color-map + dead keyboard CSS**

- Lines ≈145–270 are inline keycap/keyboard CSS (`.key`, `--kc`, `.kc-0..5`, `#skills{--glow…--body…}`) left from before `#skills` became an iframe. Confirm they're unused (the live keyboard is the iframe `stack/index.html`): `grep -n 'class="key"\|kbd-panel\|kbd-chip' public/demo/developer/index.html`. If no matching markup exists, leave the CSS (harmless) — do not delete in this recolor.
- Lines ≈851–861 are a tech-logo hex map. `grep` for what consumes it; if it paints visible chips/marquee on the page, leave the brand hexes as-is (they ARE real brand colors and match the keycap intent). If it tints text on the light bg and fails AA, wrap those usages on a dark chip (`--surface-dark`) instead. Verify via harness screenshots.

- [ ] **Step 5: Re-run harness + visual review**

Run: `node scripts/dev-daylight-check.mjs` → expect PASS on AA/overflow/console; open `scripts/_daylight-*.png` and confirm no dark relics (black cards, glowing buttons, invisible text).

- [ ] **Step 6: Commit**

```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html
git commit -m "fix(dev-demo): light-theme depth, selection, button + bg scaffolding (impeccable)"
```

---

### Task 5: Section surfaces — cards & contact contextual text (with `taste`)

**Invoke the `taste` skill for this task.** Ensure each section reads correctly given mixed light/dark surfaces.

**Files:** `index.html` (+ AR mirror), section styles for `#experience`/`.tl-card`, `#projects`/`.proj`, `#contact`.

- [ ] **Step 1: Experience + Projects cards (Casper `--card`, light → dark text)**

`.tl-card`/`.proj` already use `--card` (now Casper) and token text. Confirm headings use `--fg` (`#222831`) and body uses `--muted` (`#4b5056`); `.tl-card .co` and `li::marker` use `--brand` — switch these accent-on-light bits to `--brand-ink` for AA: `.tl-card .co{color:var(--brand-ink)}`, `.tl-card ul li::marker{color:var(--brand-ink)}`. The project tag pill (`.proj .cap .tag`, was `background:var(--brand);color:#fff`) → `background:var(--brand-ink);color:#fff`.

- [ ] **Step 2: Contact section → Davy's dark surface, light text**

Give `#contact` the dark surface and invert its text:
```css
#contact{padding:90px 0 140px;background:var(--contact-bg);color:var(--on-dark)}
#contact .sec-head .eyebrow{color:#a6bad0}
#contact h2,#contact .name,#contact label{color:var(--on-dark)}
#contact .muted,#contact p{color:#a6bad0}
#contact input,#contact textarea{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:var(--on-dark)}
#contact input::placeholder,#contact textarea::placeholder{color:rgba(238,241,245,.55)}
```
(Adjust selectors to the actual contact markup — `grep -n 'id="contact"' -n` then read that block. Keep the CTA button as the `.btn.primary` from Task 4.)

- [ ] **Step 3: Section eyebrows/rules globally**

`.sec-head .eyebrow{color:var(--brand)}` and its `::before` rule both use `--brand` — on the light page change the text to `--brand-ink` (keep the 1px rule as `--brand` fill, which is fine as a graphic). Mirror in AR.

- [ ] **Step 4: Harness + review, then commit**

Run: `node scripts/dev-daylight-check.mjs` → PASS. Review the contact + cards screenshots.
```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html
git commit -m "feat(dev-demo): contextual text for Casper cards + Davy contact (taste)"
```

---

### Task 6: Recolor the WebGL keyboard (`stack/index.html`)

**Files:** `public/demo/developer/stack/index.html`.

- [ ] **Step 1: Trackball + body color**

- Trackball material color `0x3a5a82` (≈ line 283) → `0x6d99ce`.
- `caseMat` body color `0x141519` (line 201) → `0x4b5056`.
- (Leave `switchMat 0x111216` — the dark switch stems read fine under the keycaps.)

- [ ] **Step 2: Drop the "Maya" personalization**

The trackball builds a "Maya" badge (the `mCtx.fillText('Maya',…)` block + `mBadge` mesh, ≈ lines 285–306 in this file). Remove the badge for the universal demo: delete the badge canvas/mesh creation and the `trackball.add(mBadge)` line. The trackball stays a clean Blue-Gray sphere.

- [ ] **Step 3: Keycaps → real tool brand colors**

In the `SKILLS` array, replace each entry's `color:` (currently the 5 palette greys) with the tool's brand hex:
```
react        #61dafb     nextdotjs    #000000
typescript   #3178c6     javascript   #f7df1e
tailwindcss  #06b6d4     threedotjs   #000000
webgl        #990000     framer       #0055ff
nodedotjs    #5fa04e     python       #3776ab
graphql      #e10098     postgresql   #4169e1
redis        #ff4438     amazonwebservices #ff9900
docker       #2496ed     kubernetes   #326ce5
githubactions #2088ff    git          #f05032
figma        #f24e1e     (A11y, slug:null) #4b5056
```
Match by `slug`/`label` (order is the universal set from `stack/index.html`). Keep `DARK = 1.0` so caps render true brand shades.

- [ ] **Step 4: Make the keyboard stage read on the light section**

The page embeds this file in an iframe inside `#skills`. Ensure the stage background is not a dark slab on the light page: in this file's `body`/`#bg`, set the backdrop to transparent or a light wash that matches `#ccd1da` (e.g. `html,body{background:transparent}` and tone the `#bg` radial-gradients to light blue-greys) so the section blends. Verify in the harness skills screenshot.

- [ ] **Step 5: Verify keyboard**

Restart isn't needed (static). Reload `http://localhost:3000/demo/developer` and run `node scripts/dev-daylight-check.mjs`. In `scripts/_daylight-en-desk.png` confirm: Blue-Gray trackball, Davy's body, brand-colored caps (React cyan, JS yellow, etc.), pure-black Next/Three caps still readable via bevel highlights, no "Maya", no dark slab behind the keyboard.

- [ ] **Step 6: Commit**

```bash
git add public/demo/developer/stack/index.html
git commit -m "feat(dev-demo): recolor keyboard — Blue-Gray trackball, Davy body, real brand keycaps"
```

---

### Task 7: Neutralize the hero orb for the light page

**Files:** `index.html` (+ AR mirror), the `#hero` / `.hero-kbd` styles around the `<img class="hero-kbd" src="/assets/hero-orb.png">` (line ≈441).

- [ ] **Step 1: Remove dark-only hero treatment**

`grep -n 'hero-kbd\|#hero' public/demo/developer/index.html`, read the block, and remove/replace any dark drop-glow, dark radial backdrop, or `mix-blend` that assumed a near-black page. Give the orb a soft neutral ground shadow so it sits on Mischka: `.hero-kbd{filter:drop-shadow(0 24px 40px rgba(34,40,49,.18))}`. Mirror in AR.

- [ ] **Step 2: Verify + commit**

Run: `node scripts/dev-daylight-check.mjs` → PASS; hero reads cleanly on light in screenshots.
```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html
git commit -m "fix(dev-demo): neutralize hero orb framing for light theme"
```

---

### Task 8: Full verification + impeccable audit

- [ ] **Step 1: Green harness, all routes/viewports**

Run: `node scripts/dev-daylight-check.mjs`
Expected: `ALL CHECKS PASSED`. Four screenshots updated (`_daylight-en-phone/desk`, `_daylight-ar-phone/desk`).

- [ ] **Step 2: Impeccable visual audit**

With the `impeccable` skill, review all four screenshots against the spec success criteria: coherent calm light theme; every surface AA; cards (Casper) dark-text, contact (Davy) light-text, nav/buttons (Shuttle) light-text; brand-color keycaps + Blue-Gray trackball + Davy body; hero clean; no dark relics; AR mirror identical and RTL intact. Fix any issue found, re-run harness, amend the relevant commit.

- [ ] **Step 3: Confirm no foreign files staged across the series**

Run: `git status --porcelain` and `git log --oneline 87513d3..HEAD` — every commit touches only `public/demo/developer/**` or `scripts/dev-daylight-check.mjs` (+ the spec/plan docs). No foreign files.

---

### Task 9: Integrate & hand off

- [ ] **Step 1: Re-sync with origin (others may have pushed)**

```bash
git fetch origin
git rebase origin/master      # our commits only touch demo files + scripts/docs → conflict-free
node scripts/dev-daylight-check.mjs   # still green after rebase
```
If a conflict appears in a demo file (another session also edited it), resolve keeping our recolor, re-run the harness, continue.

- [ ] **Step 2: Hand off (do not push unless the user asked)**

Report: commits ready on `master`, harness green, screenshots at `scripts/_daylight-*.png`. Ask the user before `git push` (per repo convention).

---

## Notes carried forward to Spec B (not built here)

- The keyboard's real `trackball` mesh (now Blue-Gray `#6d99ce`) is the dock target for the hero particle-core orb (Council verdict). Spec B ports the scroll journey from the (still-pending) `scroll-portfolio.html`.
- Orb images already received: `/home/trimind/dalal-inbox/2026-06-08/photo_012559.jpg` (white bg), `photo_012716.jpg` (dark bg).
