// ============================================================================
// portfolio-fix-verify.mjs — Part 5: acceptance verification for "fix all issues"
// ============================================================================
//
// One comprehensive Playwright-based script that codifies the QA acceptance
// checks for the milestone. It is split into two CATEGORIES:
//
//   A) STATIC checks — RUN NOW.
//      These run against a tiny local HTTP server over public/ that honors the
//      vercel.json rewrites (so /ar/demo/engineer -> /demo/engineer/index-ar.html,
//      /demo/engineer/projects -> .../projects/index.html, etc). No Next app, no
//      deploy, no sustained CPU: the server binds an ephemeral port, serves the
//      demo HTML, and is torn down in a finally block. These verify the static
//      demo routes (EN + AR), RTL correctness, Arabic content, the engineer
//      projects listing, and the creator-game smoke load.
//
//   B) APP checks — CODIFIED but NOT RUN by default.
//      These need a running/deployed Next app (auth, captcha, guest builder,
//      templates, real CV+QR). They are written as guarded functions that only
//      execute when both RUN_APP_CHECKS=1 and BASE_URL=<url> are set. In the
//      default static run they print "SKIPPED (needs running app: …)".
//
// ── How to run ──────────────────────────────────────────────────────────────
//   Static only (default, safe, CI-friendly):
//       node scripts/portfolio-fix-verify.mjs
//
//   Including app checks, post-deploy (against a running/deployed app):
//       RUN_APP_CHECKS=1 BASE_URL=https://portfolio-trimind.com \
//         node scripts/portfolio-fix-verify.mjs
//   (or BASE_URL=http://localhost:3000 against a locally running `next start`)
//
// Exit code is non-zero if ANY *runnable* check fails. Skipped app checks never
// affect the exit code. Real regressions (e.g. an AR demo not rtl, a projects
// page missing cards) surface as FAIL lines.
// ============================================================================

import { chromium } from "playwright-core";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PUBLIC = resolve(ROOT, "public");
const VERCEL_JSON = resolve(ROOT, "vercel.json");

const RUN_APP_CHECKS = process.env.RUN_APP_CHECKS === "1";
const BASE_URL = process.env.BASE_URL || "";

// ── result accounting ────────────────────────────────────────────────────────
const results = []; // { section, name, status: PASS|FAIL|SKIP, detail }
let currentSection = "";
function section(name) {
  currentSection = name;
  console.log(`\n━━ ${name} ━━`);
}
function record(status, name, detail = "") {
  results.push({ section: currentSection, name, status, detail });
  const icon = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "–";
  const tail = detail ? `  (${detail})` : "";
  console.log(`  ${icon} ${status.padEnd(4)} ${name}${tail}`);
}
const pass = (n, d) => record("PASS", n, d);
const fail = (n, d) => record("FAIL", n, d);
const skip = (n, d) => record("SKIP", n, d);

// ── vercel.json rewrite-aware static server ──────────────────────────────────
// Parses vercel.json rewrites, matches exact source first, then supports a
// single :slug param segment, then falls through to the raw static file.
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".svg": "image/svg+xml", ".webp": "image/webp", ".json": "application/json",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
  ".ttf": "font/ttf", ".gif": "image/gif",
};

async function loadRewrites() {
  try {
    const raw = JSON.parse(await readFile(VERCEL_JSON, "utf8"));
    return Array.isArray(raw.rewrites) ? raw.rewrites : [];
  } catch {
    return [];
  }
}

// Apply rewrites to a path. Supports exact matches and a generic :param
// (e.g. /demo/creative/projects/:slug -> /demo/creative/projects/:slug/index.html).
function applyRewrites(pathname, rewrites) {
  for (const r of rewrites) {
    if (!r.source || !r.destination) continue;
    if (!r.source.includes(":")) {
      if (r.source === pathname) return r.destination;
      continue;
    }
    // param match: turn :name segments into capture groups
    const names = [];
    const pattern = r.source.replace(/:[A-Za-z0-9_]+/g, (m) => {
      names.push(m.slice(1));
      return "([^/]+)";
    });
    const m = pathname.match(new RegExp(`^${pattern}$`));
    if (m) {
      let dest = r.destination;
      names.forEach((n, i) => { dest = dest.replace(`:${n}`, m[i + 1]); });
      return dest;
    }
  }
  return null;
}

async function startStaticServer(rewrites) {
  const server = createServer(async (req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/favicon.ico") { res.writeHead(204); return res.end(); }

    const rewritten = applyRewrites(p, rewrites);
    if (rewritten) p = rewritten;
    if (p.endsWith("/")) p += "index.html";

    const file = resolve(PUBLIC, "." + p);
    if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end("forbidden"); }
    try {
      const body = await readFile(file);
      res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404); res.end("not found");
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;
  return { server, base: `http://127.0.0.1:${port}` };
}

// ── per-page console/error collector + overflow helper ───────────────────────
function attachErrorCollector(page) {
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push("console.error: " + m.text()); });
  page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
  return errs;
}

async function horizontalOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return Math.max(0, Math.max(doc.scrollWidth, document.body.scrollWidth) - doc.clientWidth);
  });
}

// ============================================================================
// CATEGORY A — STATIC CHECKS (run now)
// ============================================================================

const EN_DEMOS = [
  { name: "general (→corporate)", path: "/demo/general" },
  { name: "engineer", path: "/demo/engineer" },
  { name: "creative", path: "/demo/creative" },
  { name: "developer", path: "/demo/developer" },
  { name: "creator", path: "/demo/creator" },
];
const AR_DEMOS = [
  { name: "general (→corporate)", path: "/ar/demo/general" },
  { name: "engineer", path: "/ar/demo/engineer" },
  { name: "creative", path: "/ar/demo/creative" },
  { name: "developer", path: "/ar/demo/developer" },
  { name: "creator", path: "/ar/demo/creator" },
];

// HTTP 200 probe via fetch (cheap; before spinning a browser context).
async function probe(base, path) {
  const res = await fetch(base + path);
  return { status: res.status, ok: res.status === 200 };
}

async function runStaticChecks(browser, base) {
  // viewport contexts: a 390px mobile context for overflow, reused per page.
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
  });

  // ── 1. EN demos ──────────────────────────────────────────────────────────
  section("A1. EN demo routes (200 / render / 0 console errors / no 390px overflow)");
  for (const d of EN_DEMOS) {
    const p = await probe(base, d.path);
    if (!p.ok) { fail(`EN ${d.name} HTTP 200`, `got ${p.status}`); continue; }
    pass(`EN ${d.name} HTTP 200`);

    const page = await mobileCtx.newPage();
    const errs = attachErrorCollector(page);
    try {
      await page.goto(base + d.path, { waitUntil: "networkidle", timeout: 30000 });
      const hasBody = await page.evaluate(() => (document.body?.innerText || "").trim().length > 0);
      hasBody ? pass(`EN ${d.name} renders content`) : fail(`EN ${d.name} renders content`, "empty body");
      const overflow = await horizontalOverflow(page);
      overflow === 0 ? pass(`EN ${d.name} no 390px overflow`) : fail(`EN ${d.name} no 390px overflow`, `${overflow}px`);
      errs.length === 0 ? pass(`EN ${d.name} 0 console errors`) : fail(`EN ${d.name} 0 console errors`, errs.join(" | "));
    } catch (e) {
      fail(`EN ${d.name} load`, e.message);
    } finally {
      await page.close();
    }
  }

  // ── 2. AR demos ──────────────────────────────────────────────────────────
  section("A2. AR demo routes (200 / rtl / lang=ar / Arabic content / no overflow / 0 errors)");
  for (const d of AR_DEMOS) {
    const p = await probe(base, d.path);
    if (!p.ok) { fail(`AR ${d.name} HTTP 200`, `got ${p.status}`); continue; }
    pass(`AR ${d.name} HTTP 200`);

    const page = await mobileCtx.newPage();
    const errs = attachErrorCollector(page);
    try {
      await page.goto(base + d.path, { waitUntil: "networkidle", timeout: 30000 });

      const dir = await page.evaluate(() => document.dir || document.documentElement.dir);
      dir === "rtl" ? pass(`AR ${d.name} document.dir==="rtl"`) : fail(`AR ${d.name} document.dir==="rtl"`, `got "${dir}"`);

      const lang = await page.evaluate(() => document.documentElement.lang || "");
      lang.startsWith("ar") ? pass(`AR ${d.name} lang starts "ar"`) : fail(`AR ${d.name} lang starts "ar"`, `got "${lang}"`);

      const arCount = await page.evaluate(() => ((document.body.innerText.match(/[؀-ۿ]/g)) || []).length);
      arCount > 50 ? pass(`AR ${d.name} Arabic text (>50)`, `${arCount} chars`) : fail(`AR ${d.name} Arabic text (>50)`, `${arCount} chars`);

      const overflow = await horizontalOverflow(page);
      overflow === 0 ? pass(`AR ${d.name} no 390px overflow`) : fail(`AR ${d.name} no 390px overflow`, `${overflow}px`);

      errs.length === 0 ? pass(`AR ${d.name} 0 console errors`) : fail(`AR ${d.name} 0 console errors`, errs.join(" | "));

      // 3.13/3.14 (static-verifiable portion): AR <title> contains Arabic chars.
      const title = await page.title();
      /[؀-ۿ]/.test(title)
        ? pass(`AR ${d.name} <title> localized (Arabic)`, JSON.stringify(title))
        : fail(`AR ${d.name} <title> localized (Arabic)`, JSON.stringify(title));
    } catch (e) {
      fail(`AR ${d.name} load`, e.message);
    } finally {
      await page.close();
    }
  }

  // ── 3. Engineer projects (EN + AR): >=3 cards, each link 200, AR is rtl ────
  section("A3. Engineer projects listing (>=3 cards, each card link 200, AR rtl)");
  for (const variant of [
    { name: "EN", path: "/demo/engineer/projects", expectRtl: false },
    { name: "AR", path: "/ar/demo/engineer/projects", expectRtl: true },
  ]) {
    const p = await probe(base, variant.path);
    if (!p.ok) { fail(`${variant.name} projects HTTP 200`, `got ${p.status}`); continue; }
    pass(`${variant.name} projects HTTP 200`);

    const page = await mobileCtx.newPage();
    const errs = attachErrorCollector(page);
    try {
      await page.goto(base + variant.path, { waitUntil: "networkidle", timeout: 30000 });

      if (variant.expectRtl) {
        const dir = await page.evaluate(() => document.dir || document.documentElement.dir);
        dir === "rtl" ? pass(`${variant.name} projects rtl`) : fail(`${variant.name} projects rtl`, `got "${dir}"`);
      }

      // collect card links: prefer the .project-card anchors used by the demo.
      const hrefs = await page.evaluate(() => {
        const sel = document.querySelectorAll("a.project-card[href], .project-card a[href]");
        const list = sel.length
          ? [...sel]
          : [...document.querySelectorAll("a[href*='/projects/']")].filter(
              (a) => /\.html$/.test(a.getAttribute("href") || "") && !/index/.test(a.getAttribute("href") || "")
            );
        return [...new Set(list.map((a) => a.getAttribute("href")))];
      });
      hrefs.length >= 3
        ? pass(`${variant.name} >=3 project cards`, `${hrefs.length} cards`)
        : fail(`${variant.name} >=3 project cards`, `${hrefs.length} cards`);

      // resolve each card link to 200
      for (const href of hrefs) {
        const url = new URL(href, base + variant.path).toString();
        const target = url.startsWith(base) ? url.slice(base.length) : url;
        try {
          const r = await fetch(base + target);
          r.status === 200
            ? pass(`${variant.name} card link 200`, target)
            : fail(`${variant.name} card link 200`, `${target} → ${r.status}`);
        } catch (e) {
          fail(`${variant.name} card link 200`, `${target} → ${e.message}`);
        }
      }

      errs.length === 0 ? pass(`${variant.name} projects 0 console errors`) : fail(`${variant.name} projects 0 console errors`, errs.join(" | "));
    } catch (e) {
      fail(`${variant.name} projects load`, e.message);
    } finally {
      await page.close();
    }
  }

  // ── 4. Creator game smoke (EN + AR): loads w/o console errors; AR is rtl ───
  section("A4. Creator game smoke load (no console errors; full playthrough lives in creator-game-check*.mjs)");
  for (const variant of [
    { name: "EN", path: "/demo/creator", expectRtl: false },
    { name: "AR", path: "/ar/demo/creator", expectRtl: true },
  ]) {
    const page = await mobileCtx.newPage();
    const errs = attachErrorCollector(page);
    try {
      await page.goto(base + variant.path, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(400);
      const hasPlay = await page.evaluate(() => !!document.querySelector("#btn-play"));
      hasPlay ? pass(`${variant.name} creator game UI present`) : fail(`${variant.name} creator game UI present`, "no #btn-play");
      if (variant.expectRtl) {
        const dir = await page.evaluate(() => document.dir || document.documentElement.dir);
        dir === "rtl" ? pass(`${variant.name} creator rtl`) : fail(`${variant.name} creator rtl`, `got "${dir}"`);
      }
      errs.length === 0 ? pass(`${variant.name} creator 0 console errors`) : fail(`${variant.name} creator 0 console errors`, errs.join(" | "));
    } catch (e) {
      fail(`${variant.name} creator load`, e.message);
    } finally {
      await page.close();
    }
  }

  await mobileCtx.close();
}

// ============================================================================
// CATEGORY B — APP CHECKS (codified; only run with RUN_APP_CHECKS=1 + BASE_URL)
// ============================================================================
// Each check is a self-contained async function taking (browser, base). The
// assertion logic is written so the suite is immediately runnable post-deploy.
// When app checks are disabled, every check is recorded as SKIP with guidance.

const APP_CHECKS = [
  {
    name: "auth: signup(new) reaches email-verify, no captcha_missing_token",
    run: async (browser, base) => {
      const page = await (await browser.newContext()).newPage();
      const errs = attachErrorCollector(page);
      const email = `qa+${Date.now()}@trimindai.com`;
      await page.goto(`${base}/en/sign-up`, { waitUntil: "networkidle" });
      await page.fill('input[type="email"], input[name="emailAddress"]', email);
      await page.fill('input[type="password"], input[name="password"]', "Start@2025xyz");
      await page.click('button[type="submit"], button:has-text("Continue")');
      await page.waitForTimeout(2500);
      const body = (await page.evaluate(() => document.body.innerText)).toLowerCase();
      const onVerify = /verif|code|check your email|enter the code/.test(body);
      const captchaBug = errs.some((e) => /captcha_missing_token/i.test(e)) || /captcha_missing_token/i.test(body);
      if (captchaBug) return fail(this?.name || "signup(new)", "captcha_missing_token present");
      onVerify ? pass("signup(new) → email-verify step") : fail("signup(new) → email-verify step", "no verify UI");
    },
  },
  {
    name: "auth: signup(duplicate) shows a clear error",
    run: async (browser, base) => {
      const page = await (await browser.newContext()).newPage();
      await page.goto(`${base}/en/sign-up`, { waitUntil: "networkidle" });
      await page.fill('input[type="email"], input[name="emailAddress"]', "kimi.qa@trimindai.com");
      await page.fill('input[type="password"], input[name="password"]', "Start@2025xyz");
      await page.click('button[type="submit"], button:has-text("Continue")');
      await page.waitForTimeout(2500);
      const body = (await page.evaluate(() => document.body.innerText)).toLowerCase();
      /already|exists|taken|in use/.test(body)
        ? pass("signup(dup) clear error")
        : fail("signup(dup) clear error", "no duplicate-account message");
    },
  },
  {
    name: 'auth: signin(bad) shows "Invalid email or password"',
    run: async (browser, base) => {
      const page = await (await browser.newContext()).newPage();
      await page.goto(`${base}/en/sign-in`, { waitUntil: "networkidle" });
      await page.fill('input[type="email"], input[name="identifier"]', "kimi.qa@trimindai.com");
      await page.fill('input[type="password"], input[name="password"]', "definitely-wrong-pw");
      await page.click('button[type="submit"], button:has-text("Continue")');
      await page.waitForTimeout(2500);
      const body = await page.evaluate(() => document.body.innerText);
      /invalid email or password/i.test(body)
        ? pass("signin(bad) invalid-credentials message")
        : fail("signin(bad) invalid-credentials message", "expected 'Invalid email or password'");
    },
  },
  {
    name: "auth: /forgot-password returns 200",
    run: async (_browser, base) => {
      for (const path of ["/en/forgot-password", "/forgot-password"]) {
        const r = await fetch(base + path);
        if (r.status === 200) return pass("/forgot-password 200", path);
      }
      fail("/forgot-password 200", "no 200 variant");
    },
  },
  {
    name: "captcha: no CJK glyphs on /en & /ar sign-up",
    run: async (browser, base) => {
      for (const locale of ["en", "ar"]) {
        const page = await (await browser.newContext()).newPage();
        await page.goto(`${base}/${locale}/sign-up`, { waitUntil: "networkidle" });
        await page.waitForTimeout(1500);
        const hasCJK = await page.evaluate(() => /[一-鿿぀-ヿ가-힯]/.test(document.body.innerText));
        hasCJK ? fail(`captcha no CJK (${locale})`, "CJK glyphs found") : pass(`captcha no CJK (${locale})`);
        await page.close();
      }
    },
  },
  {
    name: "templates: /ar/templates → 5 cards w/ Arabic name+desc+targets",
    run: async (browser, base) => {
      const page = await (await browser.newContext()).newPage();
      await page.goto(`${base}/ar/templates`, { waitUntil: "networkidle" });
      const cards = await page.evaluate(() => {
        const els = [...document.querySelectorAll("[data-template], .template-card, article")];
        return els.map((e) => e.innerText).filter((t) => /[؀-ۿ]/.test(t));
      });
      cards.length >= 5
        ? pass("/ar/templates 5 Arabic cards", `${cards.length}`)
        : fail("/ar/templates 5 Arabic cards", `${cards.length}`);
    },
  },
  {
    name: "guest builder: /en/try/general usable, edits survive reload, Publish→sign-up has fromGuest=1",
    run: async (browser, base) => {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await page.goto(`${base}/en/try/general`, { waitUntil: "networkidle" });
      // edit a field, reload, confirm persistence
      const field = page.locator('[contenteditable="true"], input[type="text"]').first();
      const marker = `QA-${Date.now()}`;
      await field.fill(marker).catch(async () => { await field.click(); await page.keyboard.type(marker); });
      await page.waitForTimeout(800);
      await page.reload({ waitUntil: "networkidle" });
      const persisted = (await page.evaluate(() => document.body.innerText)).includes(marker);
      persisted ? pass("guest edit survives reload") : fail("guest edit survives reload", "marker lost");
      // Publish → expect redirect_url containing fromGuest=1
      await page.click('button:has-text("Publish"), a:has-text("Publish")').catch(() => {});
      await page.waitForTimeout(2000);
      const url = page.url();
      /fromGuest=1/.test(decodeURIComponent(url))
        ? pass("Publish→sign-up redirect_url has fromGuest=1")
        : fail("Publish→sign-up redirect_url has fromGuest=1", url);
      await ctx.close();
    },
  },
  {
    name: "CV+QR: builder 'Download PDF' prints ATS CV; QR decodes to live URL",
    run: async (browser, base) => {
      // Requires an authed builder session + a QR-decode lib. Codified outline:
      const page = await (await browser.newContext()).newPage();
      await page.goto(`${base}/en/dashboard`, { waitUntil: "networkidle" }).catch(() => {});
      const printed = await page.evaluate(() => {
        return new Promise((res) => {
          let called = false;
          const orig = window.print;
          window.print = () => { called = true; if (orig) try { orig(); } catch {} };
          const btn = [...document.querySelectorAll("button,a")].find((b) => /download pdf/i.test(b.innerText));
          if (!btn) return res({ found: false, called: false });
          btn.click();
          setTimeout(() => res({ found: true, called }), 1500);
        });
      });
      printed.found && printed.called
        ? pass("Download PDF triggers print")
        : fail("Download PDF triggers print", JSON.stringify(printed));
      // QR decode step (needs jsqr/zxing): locate the QR <img>/<canvas>, decode,
      // assert the decoded payload equals the published live portfolio URL.
      skip("QR decodes to live URL", "needs QR-decode lib + published URL (extend here)");
    },
  },
  {
    name: "a11y: password show/hide toggle works on sign-in & sign-up",
    run: async (browser, base) => {
      for (const path of ["/en/sign-in", "/en/sign-up"]) {
        const page = await (await browser.newContext()).newPage();
        await page.goto(base + path, { waitUntil: "networkidle" });
        const pw = page.locator('input[type="password"]').first();
        await pw.fill("secret123");
        const toggle = page.locator('button[aria-label*="password" i], [data-testid*="password-toggle"], button:near(input[type="password"])').first();
        await toggle.click().catch(() => {});
        await page.waitForTimeout(300);
        const becameText = await page.locator('input[value="secret123"][type="text"]').count();
        becameText > 0
          ? pass(`password toggle (${path})`)
          : fail(`password toggle (${path})`, "did not reveal");
        await page.close();
      }
    },
  },
];

async function runAppChecks(browser, base) {
  section("B. APP checks (require running/deployed Next app)");
  for (const check of APP_CHECKS) {
    try {
      await check.run(browser, base);
    } catch (e) {
      fail(check.name, e.message);
    }
  }
}

function skipAppChecks() {
  section("B. APP checks (CODIFIED — not run in static mode)");
  for (const check of APP_CHECKS) {
    skip(check.name, "needs running app: set RUN_APP_CHECKS=1 BASE_URL=…");
  }
}

// ============================================================================
// MAIN
// ============================================================================
(async () => {
  if (!existsSync(PUBLIC)) {
    console.error(`public/ not found at ${PUBLIC}`);
    process.exit(2);
  }

  console.log("Portfolio Pro — acceptance verification");
  console.log("Category A (static) runs now; Category B (app) " +
    (RUN_APP_CHECKS ? `runs against ${BASE_URL}` : "is codified-but-skipped"));

  const rewrites = await loadRewrites();
  console.log(`Loaded ${rewrites.length} vercel.json rewrites.`);

  let server, base, browser;
  try {
    ({ server, base } = await startStaticServer(rewrites));
    browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--no-sandbox"] });

    // ── Category A ──
    await runStaticChecks(browser, base);

    // ── Category B ──
    if (RUN_APP_CHECKS) {
      if (!BASE_URL) {
        section("B. APP checks");
        fail("app checks config", "RUN_APP_CHECKS=1 but BASE_URL is empty");
      } else {
        await runAppChecks(browser, BASE_URL.replace(/\/$/, ""));
      }
    } else {
      skipAppChecks();
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (server) await new Promise((r) => server.close(r));
  }

  // ── summary ──
  const counts = results.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {});
  const failed = results.filter((r) => r.status === "FAIL");
  console.log("\n══════════════════════════════════════════");
  console.log(`SUMMARY: ${counts.PASS || 0} passed, ${counts.FAIL || 0} failed, ${counts.SKIP || 0} skipped`);
  if (failed.length) {
    console.log("\nFAILURES:");
    failed.forEach((f) => console.log(`  ✗ [${f.section}] ${f.name}${f.detail ? "  — " + f.detail : ""}`));
  }
  console.log(failed.length ? "\n✗ ACCEPTANCE: FAIL" : "\n✓ ACCEPTANCE: PASS (runnable checks)");
  process.exit(failed.length ? 1 : 0);
})();
