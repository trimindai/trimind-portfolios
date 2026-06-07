// Drives the ARABIC (RTL) Creator "Portfolio Quest" demo end-to-end in real
// Chrome and screenshots every key state, at desktop (1280) and true mobile (390px).
//
//   node scripts/creator-game-check-ar.mjs
//
// It: loads public/demo/creator/index-ar.html via a local HTTP server (so
// root-relative asset paths resolve), captures console errors/pageerrors,
// clicks Play, auto-solves each memory level by matching cards via their
// data-pid, advances through all 3 levels + the contact round, reaches the win
// screen, then exercises the Skip→static view. Additionally asserts the page is
// RTL (document.dir === "rtl") and that Arabic text is rendered in the UI.
// Fails (surfaced via log) on any console error / pageerror, if the win screen
// never appears, if the mobile viewport has real horizontal overflow, if dir is
// not rtl, or if no Arabic text is present.

import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT = resolve(__dirname, "creator-shots-ar");
mkdirSync(OUT, { recursive: true });

const PUBLIC = resolve(ROOT, "public");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml",
  ".webp": "image/webp", ".json": "application/json", ".ico": "image/x-icon" };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/favicon.ico") { res.writeHead(204); return res.end(); }
  if (p.endsWith("/")) p += "index.html";
  const file = resolve(PUBLIC, "." + p);
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("not found"); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const URL = `http://127.0.0.1:${server.address().port}/demo/creator/index-ar.html`;

async function solveLevel(page) {
  await page.waitForFunction(() => document.querySelectorAll("#board .card").length > 0, { timeout: 5000 });
  for (let guard = 0; guard < 60; guard++) {
    const total = await page.$$eval("#board .card", (c) => c.length);
    const matched = await page.$$eval("#board .card.matched", (c) => c.length);
    if (matched === total && total > 0) return true;
    const pairs = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("#board .card")];
      const byPid = {};
      cards.forEach((c, i) => {
        if (c.classList.contains("matched") || c.classList.contains("flipped")) return;
        (byPid[c.dataset.pid] ||= []).push(i);
      });
      const hit = Object.values(byPid).find((idx) => idx.length >= 2);
      return hit ? [hit[0], hit[1]] : null;
    });
    if (!pairs) { await page.waitForTimeout(150); continue; }
    const cards = await page.$$("#board .card");
    await cards[pairs[0]].click();
    await cards[pairs[1]].click();
    await page.waitForTimeout(reduceWait);
  }
  return false;
}

const reduceWait = 520;
const errors = [];

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--no-sandbox"] });

/* ── desktop full playthrough ── */
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on("console", (m) => { if (m.type() === "error") errors.push("console.error: " + m.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.screenshot({ path: resolve(OUT, "01-title-desktop.png") });

/* ── RTL + Arabic assertions ── */
const dir = await page.evaluate(() => document.dir || document.documentElement.dir);
if (dir !== "rtl") errors.push(`document.dir is "${dir}", expected "rtl"`);
const lang = await page.evaluate(() => document.documentElement.lang);
if (lang !== "ar") errors.push(`html lang is "${lang}", expected "ar"`);
const arabicInUI = await page.evaluate(() => /[؀-ۿ]/.test(document.body.innerText));
if (!arabicInUI) errors.push("no Arabic text found in rendered UI");

await page.click("#btn-play");
await page.waitForTimeout(400);

const screenActive = (id) => page.waitForFunction((i) => document.querySelector(i)?.classList.contains("active"), id, { timeout: 8000 });
let reachedContact = false;
for (let lvl = 1; lvl <= 3; lvl++) {
  const solved = await solveLevel(page);
  if (!solved) { errors.push(`level ${lvl} not solved`); break; }
  if (lvl === 1) await page.screenshot({ path: resolve(OUT, "02-board-level1.png") });
  if (lvl < 3) {
    await page.waitForFunction((n) => document.querySelectorAll("#board .card:not(.matched)").length >= n,
      (lvl === 1 ? 8 : 12), { timeout: 8000 }).catch(() => {});
  } else {
    reachedContact = await screenActive("#screen-contact").then(() => true).catch(() => false);
  }
}
if (reachedContact) {
  await page.screenshot({ path: resolve(OUT, "03-contact-round.png") });
  const nodes = await page.$$("#connect-grid .node");
  for (const n of nodes) { await n.click(); await page.waitForTimeout(150); }
}
const won = await screenActive("#screen-win").then(() => true).catch(() => false);
await page.waitForTimeout(1400);
await page.screenshot({ path: resolve(OUT, "04-win-desktop.png") });
if (!won) errors.push("win screen never became active");

// static view
await page.click("#win-static");
await page.waitForTimeout(700);
const staticShown = await page.$eval("#static-view", (s) => s.classList.contains("show")).catch(() => false);
await page.screenshot({ path: resolve(OUT, "05-static-desktop.png"), fullPage: true });
if (!staticShown) errors.push("static view did not open");
await ctx.close();

/* ── mobile 390px: title + a solved-ish board + overflow check ── */
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const mp = await mctx.newPage();
mp.on("pageerror", (e) => errors.push("mobile pageerror: " + e.message));
await mp.goto(URL, { waitUntil: "networkidle" });
await mp.waitForTimeout(500);
await mp.screenshot({ path: resolve(OUT, "06-title-390.png") });
await mp.tap("#btn-play");
await mp.waitForTimeout(400);
await solveLevel(mp);
await mp.waitForTimeout(600);
const overflow = await mp.evaluate(() => {
  const doc = document.documentElement;
  return Math.max(0, Math.max(doc.scrollWidth, document.body.scrollWidth) - doc.clientWidth);
});
await mp.screenshot({ path: resolve(OUT, "07-board-390.png") });
await mctx.close();
await browser.close();
server.close();

console.log("\n=== Creator game check (Arabic / RTL) ===");
console.log("document.dir:", dir);
console.log("html lang:", lang);
console.log("Arabic text in UI:", arabicInUI);
console.log("reached contact round:", reachedContact);
console.log("reached win screen:", won);
console.log("static view opened:", staticShown);
console.log("mobile overflowPx:", overflow);
console.log("screenshots →", OUT);
if (errors.length) { console.log("\nFAILURES:"); errors.forEach((e) => console.log("  ✗ " + e)); }
const fail = errors.length > 0 || !won || overflow > 0 || dir !== "rtl" || !arabicInUI;
console.log("\n" + (fail ? "✗ CHECK FAILED" : "✓ ALL CHECKS PASSED"));
process.exitCode = fail ? 1 : 0;
