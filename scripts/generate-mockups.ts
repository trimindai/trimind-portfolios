/**
 * Generate real template screenshots from /demo/<template> pages.
 * Uses Playwright to capture the actual rendered templates.
 *
 * Usage:
 *   npx tsx scripts/generate-mockups.ts
 *   BASE_URL=https://portfolio-trimind.com npx tsx scripts/generate-mockups.ts
 */
import { chromium } from "playwright";
import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUTPUT_DIR = path.resolve(__dirname, "../public/landing");
const TEMPLATES = ["corporate", "engineer", "creative"];

async function main() {
  console.log(`Capturing screenshots from ${BASE_URL}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });

  for (const template of TEMPLATES) {
    const page = await context.newPage();
    const url = `${BASE_URL}/demo/${template}`;
    console.log(`  → ${template}: ${url}`);

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1000);

    const outPath = path.join(OUTPUT_DIR, `mockup-${template}-v2.jpg`);
    await page.screenshot({
      path: outPath,
      type: "jpeg",
      quality: 92,
      clip: { x: 0, y: 0, width: 1280, height: 900 },
    });
    console.log(`  ✓ ${outPath}`);
    await page.close();
  }

  await browser.close();
  console.log("Done — all mockups saved to public/landing/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
