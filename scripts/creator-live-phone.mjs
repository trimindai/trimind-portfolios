// Renders the LIVE production demo on a real iPhone-sized browser and captures
// what a client sees/plays on their phone.  node scripts/creator-live-phone.mjs
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "creator-live-phone");
mkdirSync(OUT, { recursive: true });
const URL = "https://portfolio-trimind.com/demo/creator";

async function solve(page) {
  await page.waitForFunction(() => document.querySelectorAll("#board .card").length > 0, { timeout: 6000 });
  for (let g = 0; g < 60; g++) {
    const [total, matched] = await page.evaluate(() => [
      document.querySelectorAll("#board .card").length,
      document.querySelectorAll("#board .card.matched").length]);
    if (total && matched === total) return;
    const pair = await page.evaluate(() => {
      const by = {};
      document.querySelectorAll("#board .card").forEach((c, i) => {
        if (c.classList.contains("matched") || c.classList.contains("flipped")) return;
        (by[c.dataset.pid] ||= []).push(i);
      });
      const h = Object.values(by).find((x) => x.length >= 2); return h ? [h[0], h[1]] : null;
    });
    if (!pair) { await page.waitForTimeout(150); continue; }
    const cards = await page.$$("#board .card");
    await cards[pair[0]].tap(); await cards[pair[1]].tap();
    await page.waitForTimeout(520);
  }
}

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await page.screenshot({ path: resolve(OUT, "phone-1-title.png") });

await page.tap("#btn-play");
await page.waitForFunction(() => document.querySelector("#screen-play")?.classList.contains("active"), { timeout: 6000 });
// make ONE match so the combo chip + top reveal-flash are visible
const pair = await page.evaluate(() => {
  const by = {}; document.querySelectorAll("#board .card").forEach((c, i) => (by[c.dataset.pid] ||= []).push(i));
  const h = Object.values(by).find((x) => x.length >= 2); return [h[0], h[1]];
});
const cards = await page.$$("#board .card");
await cards[pair[0]].tap(); await cards[pair[1]].tap();
await page.waitForTimeout(650);
await page.screenshot({ path: resolve(OUT, "phone-2-match-reveal.png") });

// finish all levels -> contact -> win
for (let lvl = 1; lvl <= 3; lvl++) {
  await solve(page);
  if (lvl < 3) await page.waitForFunction((n) => document.querySelectorAll("#board .card:not(.matched)").length >= n, lvl === 1 ? 8 : 12, { timeout: 8000 }).catch(() => {});
  else await page.waitForFunction(() => document.querySelector("#screen-contact")?.classList.contains("active"), { timeout: 8000 }).catch(() => {});
}
await page.screenshot({ path: resolve(OUT, "phone-3-contact.png") });
for (const n of await page.$$("#connect-grid .node")) { await n.tap(); await page.waitForTimeout(160); }
await page.waitForFunction(() => document.querySelector("#screen-win")?.classList.contains("active"), { timeout: 8000 }).catch(() => {});
await page.waitForTimeout(1500);
await page.screenshot({ path: resolve(OUT, "phone-4-win.png") });

console.log("live phone shots ->", OUT);
await browser.close();
