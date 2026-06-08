// Render Wadhah Almutairi's ATS CV (HTML) with an embedded QR pointing at her
// (planned) live developer portfolio. Writes /tmp/wadhah-cv.html.
//
// Self-contained on the template side: reads src/templates/_cv/cv.hbs as a
// string and registers the helpers it uses (isHidden, ifEq, safeColor, safeUrl)
// — this avoids importing template-engine.ts, whose top-level `.hbs` imports get
// precompiled (to functions, not strings) under tsx and break Handlebars.compile.
//
// The QR encodes the canonical live URL; it resolves the moment the portfolio is
// published at that slug — the same PDF stays valid, no regeneration needed.
//
// Run: npx tsx scripts/render-wadhah-cv.mts

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";
import QRCode from "qrcode";
import { toPortfolioData } from "../src/lib/portfolio-data";
import { WADHAH_PORTFOLIO, WADHAH_SLUG } from "../convex/seedData/wadhah";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/* ── helpers used by _cv/cv.hbs (mirror of template-engine.ts) ── */
Handlebars.registerHelper("isHidden", function (sectionId) {
  const hidden = (this.customization && this.customization.hiddenSections) || [];
  return hidden.includes(sectionId);
});
Handlebars.registerHelper("ifEq", function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper("safeColor", function (value, fallback) {
  const fb = typeof fallback === "string" ? fallback : "";
  if (value == null) return fb;
  const v = String(value).trim();
  const ok =
    /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v) ||
    /^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s/]+\)$/.test(v) ||
    /^[a-zA-Z]{3,20}$/.test(v);
  return ok ? v : fb;
});
Handlebars.registerHelper("safeUrl", function (value) {
  if (value == null) return "";
  let raw = "";
  for (const ch of String(value).trim()) {
    const code = ch.charCodeAt(0);
    if (code <= 0x20 || code === 0x7f) continue;
    raw += ch;
  }
  if (!raw) return "";
  const scheme = raw.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (scheme) {
    const s = scheme[1].toLowerCase();
    if (s !== "http" && s !== "https" && s !== "mailto" && s !== "tel") return "#";
  }
  return raw;
});

const liveUrl = `https://portfolio-trimind.com/p/${WADHAH_SLUG}`;
const displayUrl = `portfolio-trimind.com/p/${WADHAH_SLUG}`;

const portfolioDoc: any = { ...WADHAH_PORTFOLIO, status: "published", slug: WADHAH_SLUG };
const data: any = toPortfolioData(portfolioDoc, "en");
data.slug = WADHAH_SLUG;

// Phone appears on the PRINTED CV only — never on the live portfolio (the seed
// data / published doc stays phone-free, so the developer template omits it).
data.basics = { ...data.basics, phone: "+965 99252378" };

const qrDataUrl = await QRCode.toDataURL(liveUrl, {
  errorCorrectionLevel: "H",
  margin: 1,
  width: 320,
  color: { dark: "#1e3a8a", light: "#ffffff" },
});

const cvSource = readFileSync(resolve(ROOT, "src/templates/_cv/cv-wadhah.hbs"), "utf8");
const cvHtml = Handlebars.compile(cvSource)({ ...data, qrDataUrl, liveUrl: displayUrl });
writeFileSync("/tmp/wadhah-cv.html", cvHtml);

console.log(`rendered: cv ${cvHtml.length}b → /tmp/wadhah-cv.html (QR → ${liveUrl})`);
