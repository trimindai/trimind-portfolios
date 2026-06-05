// Regenerate public/demo/creative/index.html from src/templates/creative/template.hbs
// Self-contained: registers the same Handlebars helpers the live engine uses
// (mirrors src/lib/template-engine.ts) so the demo matches production output.
//   node scripts/gen-creative-demo.mjs
import Handlebars from "handlebars";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/* ── helpers (subset used by the creative template) ─────────── */
Handlebars.registerHelper("isHidden", function (sectionId) {
  const hidden = (this.customization && this.customization.hiddenSections) || [];
  return hidden.includes(sectionId);
});
Handlebars.registerHelper("or", function (...args) { args.pop(); return args.some(Boolean); });
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
function httpUrlOrEmpty(value) { if (value == null) return ""; const v = String(value).trim(); return /^https?:\/\//i.test(v) ? v : ""; }
function pruneEmpty(node) {
  if (Array.isArray(node)) { const arr = node.map(pruneEmpty).filter((x) => x !== undefined); return arr.length ? arr : undefined; }
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, val] of Object.entries(node)) { const c = pruneEmpty(val); if (c !== undefined) out[k] = c; }
    return Object.keys(out).length ? out : undefined;
  }
  if (node === "" || node === null) return undefined;
  return node;
}
function ldScript(obj) {
  const cleaned = pruneEmpty(obj) || {};
  const json = JSON.stringify(cleaned).replace(/</g, "\\u003c");
  return new Handlebars.SafeString(`<script type="application/ld+json">${json}</script>`);
}
Handlebars.registerHelper("personJsonLd", function (basics, portfolioUrl) {
  const b = basics || {};
  const sameAs = [b.instagram, b.linkedin, b.github, b.website].map(httpUrlOrEmpty).filter(Boolean);
  return ldScript({
    "@context": "https://schema.org", "@type": "Person",
    name: b.fullName, jobTitle: b.title, description: b.subtitle || b.bio,
    url: httpUrlOrEmpty(portfolioUrl), image: httpUrlOrEmpty(b.photoUrl), email: b.email,
    address: b.location ? { "@type": "PostalAddress", addressLocality: b.location } : undefined,
    sameAs,
  });
});
Handlebars.registerHelper("faviconLink", function (fullName, accentColor, bgColor) {
  const colorOk = (v, fb) => {
    const s = String(v ?? "").trim();
    const ok =
      /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s) ||
      /^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s/]+\)$/.test(s) ||
      /^[a-zA-Z]{3,20}$/.test(s);
    return ok ? s : fb;
  };
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "";
  const c = parts.length > 1 ? parts[parts.length - 1][0] : "";
  const initials = (a + c).toUpperCase().replace(/[^A-Z0-9]/g, "") || "·";
  const bg = colorOk(bgColor, "#EFEEEA");
  const accent = colorOk(accentColor, "#B86F52");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="10" fill="${bg}"/>` +
    `<text x="32" y="34" font-family="Archivo Black,Arial,sans-serif" font-size="28" ` +
    `font-weight="800" letter-spacing="-1" fill="${accent}" ` +
    `text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;
  return new Handlebars.SafeString(`<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg)}">`);
});

/* ── demo persona: Dalal Al-Kandari — "My Eye Brain" ─────────── */
// 46 intuitive ornamental works (title + category), in file order ornaments_1..46.
const WORKS = [
  ["Purple Bouquet", "Floral Ornamental"], ["Geometric Hearts", "Geometric Abstract"],
  ["Cloud Garden", "Floral Fantasy"], ["Golden Vessel", "Art Nouveau"],
  ["Autumn Bouquet", "Floral Ornamental"], ["City Maze", "Geometric Abstract"],
  ["Purple Mandala", "Mandala"], ["Cosmic Spiral", "Character Fantasy"],
  ["Red Construct", "Geometric Abstract"], ["Fruit Bowl", "Pop Floral"],
  ["Blue Dreamer", "Character Fantasy"], ["Star Flower", "Bold Floral"],
  ["Love Tree", "Tree of Life"], ["Framed Bloom", "Folk Art"],
  ["Lotus Reflection", "Serene Floral"], ["Silver Garden", "Architectural"],
  ["Crystal Beacon", "Geometric Ornamental"], ["Desert Sun", "Symbolic Landscape"],
  ["Sun Totem", "Totemic"], ["Pastel Cloud", "Soft Floral"],
  ["Heart Clown", "Character Fantasy"], ["Rainbow Arch", "Geometric Nature"],
  ["Ocean Stars", "Marine Ornamental"], ["Geometric Butterflies", "Nature Geometry"],
  ["Caterpillar Dream", "Fantasy Ornamental"], ["Horned Heart", "Creature Fantasy"],
  ["Golden Mandala", "Mandala"], ["Electric Flower", "Pop Floral"],
  ["Heart Burst", "Heart Motif"], ["Geometric Still Life", "Abstract Still Life"],
  ["Tropical Bouquet", "Tropical Floral"], ["Patterned Butterfly", "Butterfly Art"],
  ["Heart Flower Tree", "Heart Motif"], ["Tropical Abstract", "Tropical Abstract"],
  ["Celestial Flower", "Celestial Ornamental"], ["Diamond Burst", "Psychedelic Geometric"],
  ["Pink Abstract Garden", "Abstract Floral"], ["Geometric Explosion", "Abstract Geometric"],
  ["Blue Cross Mandala", "Mandala"], ["Purple Sunburst", "Radial Abstract"],
  ["Red Creature", "Creature Fantasy"], ["Geometric Totem", "Totemic Geometric"],
  ["Pattern Explosion", "Maximalist Pattern"], ["Geometric Windmill", "Architectural Abstract"],
  ["The House", "Narrative Abstract"], ["My Eye Brain Blooms", "Radial Mandala"],
];

const projects = WORKS.map(([title, type], i) => ({
  title,
  coverUrl: `/demo/creative/artworks/ornaments_${i + 1}_digital.webp`,
  meta: { type },
}));

const data = {
  locale: "en",
  isRTL: false,
  portfolioUrl: "https://portfolio-trimind.com/demo/creative",
  templateId: "creative",
  basics: {
    fullName: "Dalal Al-Kandari",
    title: "Self-Taught Ornamental Artist",
    subtitle: "Let's explore my eye brain",
    // No photo on purpose: demonstrates the now-optional hero portrait.
    location: "Kuwait City, Kuwait",
    bio: "I never studied ornamental art. My hand moves without planning, my eye sees, my brain feels, and what emerges is pure intuition. 46 works of bold lines, vivid color, and hearts that appear unbidden. This is not technique. This is my eye brain.",
    email: "dalal@myeyebrain.art",
    phone: "+965 1234 5678",
    instagram: "https://www.instagram.com/",
    linkedin: "https://www.linkedin.com/",
  },
  projects,
  skills: [
    { category: "The Practice", items: ["Intuitive Creation", "Color Sense", "Pattern Design", "Composition", "Emotional Range"] },
    { category: "Tools & Mediums", items: ["Markers", "Paper", "Intuition", "Heart", "Eye", "Brain", "Love"] },
  ],
  metrics: [
    { value: "46", label: "Original Works" },
    { value: "Art Brut", label: "Self-Taught" },
    { value: "Kuwait City", label: "Studio" },
    { value: "My Eye", label: "Brain" },
  ],
  customization: {},
};

const tplPath = resolve(ROOT, "src/templates/creative/template.hbs");
const outPath = resolve(ROOT, "public/demo/creative/index.html");
const src = readFileSync(tplPath, "utf8");
const tpl = Handlebars.compile(src);
const html = tpl(data);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, html, "utf8");
console.log(`OK: rendered ${html.length} bytes → public/demo/creative/index.html`);
console.log(`sections: ${["projects", "gallery", "skills", "contact"].filter((s) => html.includes(`id="${s}"`)).join(", ")}`);
console.log(`cubes: ${html.includes("cube-stack") ? "yes" : "no"} | cone: ${html.includes("cone-wrap") ? "yes" : "no"} | portrait optional: ${html.includes("hero-portrait") ? "yes" : "no(no-photo)"}`);
