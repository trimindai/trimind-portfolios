// Print /tmp/abd-cv.html to a final A4 PDF using headless Chromium.
// Run: node scripts/abd-pdf.mjs

import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const html = readFileSync("/tmp/abd-cv.html", "utf8");
const out =
  "/home/trimind/dalal-inbox/2026-06-05/Abdulrahman_Alkandari_CV_QR.pdf";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({
  path: out,
  format: "A4",
  printBackground: true,
  margin: { top: "0", bottom: "0", left: "0", right: "0" },
});
await browser.close();
console.log("PDF:", out);
