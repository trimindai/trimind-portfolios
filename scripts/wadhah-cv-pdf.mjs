// Print /tmp/wadhah-cv.html to a final A4 PDF using headless Chromium.
// Run: node scripts/wadhah-cv-pdf.mjs

import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const html = readFileSync("/tmp/wadhah-cv.html", "utf8");
const out = "/home/trimind/dalal-inbox/2026-06-08/Wadhah_Almutairi_CV_QR.pdf";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({
  path: out,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true, // honor the template's @page { margin } for consistent margins
});
await browser.close();
console.log("PDF:", out);
