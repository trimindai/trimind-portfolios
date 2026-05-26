// Side-by-side: screenshot the ORIGINAL nareshkhatri.site (hero + skills) and
// our scene under the LATEST Spline viewer, to see what "the same" should be
// and whether a runtime-version bump fixes the keyboard appearance.
import { chromium } from "playwright-core";
const EXEC = "/home/trimind/.cache/ms-playwright/chromium-1169/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: EXEC, headless: true, args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });

async function shot(url, file, scrollSel, waitMs) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
  try {
    await page.goto(url, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(waitMs);
    if (scrollSel) { await page.evaluate((s) => { const el = document.querySelector(s); if (el) el.scrollIntoView({ block: "center" }); }, scrollSel); await page.waitForTimeout(3500); }
    const hasCanvas = await page.evaluate(() => { const sv = document.querySelector("spline-viewer, canvas"); return !!(document.querySelector("canvas") || (sv && sv.shadowRoot && sv.shadowRoot.querySelector("canvas"))); });
    await page.screenshot({ path: file });
    console.log(`shot ${file}  canvas=${hasCanvas}  errs=${errs.slice(0,2).join("|")||"none"}`);
  } catch (e) { console.log(`FAIL ${file}: ${String(e).slice(0,140)}`); }
  await page.close();
}

// Original site
await shot("https://www.nareshkhatri.site/", "scripts/orig-hero.png", null, 14000);
await shot("https://www.nareshkhatri.site/", "scripts/orig-skills.png", "#skills", 14000);
// Our scene under the LATEST viewer (1.12.95)
await shot("http://localhost:8799/demo/developer/_kbtest.html", "scripts/kbtest-latest.png", null, 13000);

await browser.close();
