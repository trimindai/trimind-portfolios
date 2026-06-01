// Standalone render assertions for the ATS PDF CV template (src/templates/_cv/cv.hbs).
// Project convention (NOT unit-TDD): compile the real template with fixtures and
// assert the output is well-formed and complete.
//
//   node scripts/render-cv-check.mjs
//
// Registers the same Handlebars helpers the live engine uses
// (mirrors src/lib/template-engine.ts) so this matches production output.

import Handlebars from "handlebars";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/* ── helpers (mirror of template-engine.ts, only those cv.hbs uses) ── */
Handlebars.registerHelper("isHidden", function (sectionId) {
  const hidden = (this.customization && this.customization.hiddenSections) || [];
  return hidden.includes(sectionId);
});
Handlebars.registerHelper("ifEq", function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper("or", function (...args) {
  args.pop();
  return args.some(Boolean);
});
Handlebars.registerHelper("gt", function (a, b) {
  return a > b;
});
Handlebars.registerHelper("initials", function (name) {
  if (!name) return "";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
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

/* ── compile the real template ──────────────────────── */
const source = readFileSync(resolve(ROOT, "src/templates/_cv/cv.hbs"), "utf8");
const template = Handlebars.compile(source);

/* ── fixtures ───────────────────────────────────────── */
const fullFixture = {
  locale: "en",
  isRTL: false,
  qrDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  liveUrl: "https://portfolio-trimind.com/p/maya-okafor",
  basics: {
    fullName: "Maya Okafor",
    title: "Senior Software Engineer",
    email: "maya@example.com",
    phone: "+965 5000 0000",
    location: "Kuwait City, Kuwait",
    nationality: "Nigerian",
    linkedin: "https://linkedin.com/in/maya",
    github: "https://github.com/maya",
    website: "https://maya.dev",
    summary:
      "Senior engineer with 8 years building resilient platforms for GCC fintech. Ships measurable outcomes across web, cloud and data.",
  },
  // Single source of truth: top-level `languages` (read by both the CV and the
  // web templates; collected once in CvFieldsStep).
  languages: [
    { name: "English", level: "Native" },
    { name: "Arabic", level: "Professional" },
  ],
  experience: [
    {
      title: "Lead Engineer",
      company: "Gulf Pay",
      startDate: "2021",
      endDate: "Present",
      location: "Kuwait City",
      description: "Owned the payments platform.",
      highlights: ["Cut latency 40%", "Led a team of 6"],
    },
    {
      title: "Software Engineer",
      company: "Nimbus",
      startDate: "2018",
      endDate: "2021",
      highlights: ["Built the billing service"],
    },
  ],
  education: [
    {
      degree: "BSc Computer Science",
      institution: "University of Lagos",
      year: "2017",
      description: "First class honours.",
    },
  ],
  skills: [
    { category: "Languages", items: ["TypeScript", "Python", "Go"] },
    { category: "Cloud", items: ["AWS", "Docker", "Kubernetes"] },
  ],
  projects: [
    {
      title: "OpenLedger",
      description: "Double-entry ledger engine.",
      technologies: ["Rust", "Postgres"],
      link: "https://github.com/maya/openledger",
    },
  ],
  certifications: [
    { name: "AWS Solutions Architect", issuer: "Amazon", year: "2022" },
  ],
  references: [
    { name: "Sara Al-Ali", title: "CTO, Gulf Pay", contact: "sara@gulfpay.com" },
  ],
  customization: { accentColor: "#059669" },
  portfolioUrl: "https://portfolio-trimind.com/p/maya-okafor",
};

// Sparse: only the truly required header data; every optional section omitted.
const sparseFixture = {
  locale: "en",
  isRTL: false,
  qrDataUrl: fullFixture.qrDataUrl,
  liveUrl: fullFixture.liveUrl,
  basics: {
    fullName: "John Minimal",
    title: "Analyst",
    email: "john@example.com",
  },
  customization: {},
  portfolioUrl: "https://portfolio-trimind.com/p/john",
};

// Arabic RTL fixture (reuse full data, flip locale/dir).
const arFixture = { ...fullFixture, locale: "ar", isRTL: true };

/* ── assertions ─────────────────────────────────────── */
let failures = 0;
function assert(cond, msg) {
  if (!cond) {
    failures++;
    console.error("  ✗ " + msg);
  } else {
    console.log("  ✓ " + msg);
  }
}

const REQUIRED_SECTIONS = [
  "Professional Summary",
  "Work Experience",
  "Education",
  "Skills",
  "Projects",
  "Certifications &amp; Awards",
  "Languages",
  "References",
];

const OPTIONAL_SECTIONS = [
  "Professional Summary",
  "Work Experience",
  "Education",
  "Skills",
  "Projects",
  "Certifications",
  "Languages",
];

// Strip the <style> block so CSS selectors/braces don't pollute HTML checks.
const stripStyle = (html) => html.replace(/<style[\s\S]*?<\/style>/gi, "");
// Count only the section headings (<h2>…</h2>) so words appearing in CSS class
// names (.cv-skills, .cv-project, …) never count as a section being present.
const headings = (html) =>
  (stripStyle(html).match(/<h2>([\s\S]*?)<\/h2>/g) || []).join("\n");
// Balanced-tag check that ignores void/self-closing elements.
const VOID = new Set(["meta", "link", "img", "br", "hr", "input", "area", "base", "col", "embed", "source", "track", "wbr"]);
function tagBalance(html) {
  const body = stripStyle(html);
  let open = 0;
  let close = 0;
  const re = /<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*?)(\/?)>/g;
  let m;
  while ((m = re.exec(body))) {
    const isClose = body[m.index + 1] === "/";
    const name = m[1].toLowerCase();
    const selfClosed = m[3] === "/";
    if (name === "!doctype") continue;
    if (isClose) close++;
    else if (!VOID.has(name) && !selfClosed) open++;
  }
  return { open, close };
}

console.log("\n[full fixture — EN]");
const full = template(fullFixture);
assert(!full.includes("{{"), "no leftover '{{' in output");
const bal = tagBalance(full);
assert(bal.open === bal.close, `tags balanced (open=${bal.open} close=${bal.close})`);
const fullHeadings = headings(full);
for (const sec of REQUIRED_SECTIONS) {
  assert(fullHeadings.includes(sec), `section heading present: "${sec}"`);
}
assert(/<img[^>]+src="data:image\/png/.test(full), "QR <img> present with data-URL src");
assert(full.includes("Scan for live portfolio"), "QR labelled 'Scan for live portfolio'");
assert(full.includes(fullFixture.liveUrl), "live URL printed beneath QR");
assert(full.includes("#059669"), "discipline accent from customization.accentColor applied");
assert(full.includes("@page"), "@page rule present");
assert(full.includes("@media print"), "@media print rules present");
assert(full.includes("size: A4"), "A4 page size set");
assert(full.includes("Cut latency 40%"), "experience highlights rendered");
assert(full.includes("Available on request") === false, "references list rendered (not the fallback)");

console.log("\n[sparse fixture — only required]");
const sparse = template(sparseFixture);
assert(!sparse.includes("{{"), "no leftover '{{' in output");
const sparseHeadings = headings(sparse);
for (const sec of OPTIONAL_SECTIONS) {
  assert(!sparseHeadings.includes(sec), `empty section absent: "${sec}"`);
}
// References always renders, but with the fallback note when no refs.
assert(sparseHeadings.includes("References"), "References section present (always shown)");
assert(sparse.includes("Available on request"), "References falls back to 'Available on request'");
assert(/<img[^>]+src="data:image\/png/.test(sparse), "QR <img> still present");
assert(sparse.includes("John Minimal"), "header name rendered");

console.log("\n[arabic fixture — RTL]");
const ar = template(arFixture);
assert(!ar.includes("{{"), "no leftover '{{' in output");
assert(/<html[^>]+dir="rtl"/.test(ar), 'html dir="rtl" set for Arabic');
assert(ar.includes("الخبرة العملية"), "Arabic 'Work Experience' heading");
assert(ar.includes("الملخص المهني"), "Arabic 'Professional Summary' heading");
assert(ar.includes("المراجع"), "Arabic 'References' heading");
assert(ar.includes("امسح لعرض الملف المباشر"), "Arabic QR label");

console.log("\n" + (failures === 0
  ? "ALL ASSERTIONS PASSED ✓"
  : `${failures} ASSERTION(S) FAILED ✗`));
process.exit(failures === 0 ? 0 : 1);
