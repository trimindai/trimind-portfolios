// Regenerate the creative demo from the templates:
//   public/demo/creative/index.html            (from template.hbs)
//   public/demo/creative/projects/<slug>/index.html  (from project-detail.hbs)
// Self-contained: mirrors the Handlebars helpers used by the live engine.
//   node scripts/gen-creative-demo.mjs
import Handlebars from "handlebars";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/* ── helpers (subset used by the creative templates) ─────────── */
Handlebars.registerHelper("isHidden", function (sectionId) {
  const hidden = (this.customization && this.customization.hiddenSections) || [];
  return hidden.includes(sectionId);
});
Handlebars.registerHelper("or", function (...args) { args.pop(); return args.some(Boolean); });
Handlebars.registerHelper("ifEq", function (a, b, options) { return a === b ? options.fn(this) : options.inverse(this); });
Handlebars.registerHelper("initials", function (name) {
  if (!name) return "";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  return ((parts[0][0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
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
Handlebars.registerHelper("videoEmbed", function () { return new Handlebars.SafeString(""); });
Handlebars.registerHelper("creativeWorkJsonLd", function () { return new Handlebars.SafeString(""); });
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

const TAGLINES = [
  "Intuition made visible.", "Drawn without a plan.", "The hand leads, the eye follows.",
  "Feeling, finding its shape.", "No sketch. No reference. Only the pen.",
  "A page that drew itself.", "Certainty without a single decision.", "My eye brain, on paper.",
];
const MEDIUMS = ["Marker on paper", "Ink and marker on paper", "Felt-tip pen on paper", "Mixed marker on card stock"];
const DIMS = ["29.7 × 42 cm (A3)", "21 × 29.7 cm (A4)", "30 × 40 cm", "42 × 59.4 cm (A2)"];
const YEARS = ["2024", "2025", "2026", "2023"];
const SERIES = ["My Eye Brain", "First Hand", "Ornament Studies", "Raw Intuition"];
const OPEN = [
  (t) => `${t} began with no sketch and no plan.`,
  (t) => `There was no reference for ${t} — only the pull of the pen.`,
  (t) => `${t} arrived the way all my work does: unbidden.`,
  (t) => `I did not decide ${t}; my hand did.`,
];
const MID = [
  (c) => `Bold lines gather into ${c} the moment I stop thinking,`,
  (c) => `What reads as ${c} is really feeling looking for a shape,`,
  (c) => `The ${c} forms itself while my eye watches and my brain feels,`,
  (c) => `Color crowds in until the ${c} can hold no more,`,
];
const CLOSE = [
  "and the hearts appear on their own.",
  "until the page tells me it is finished.",
  "this is not technique, it is my eye brain.",
  "each mark a small, certain decision I never made on purpose.",
];

const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const projects = WORKS.map(([title, type], i) => ({
  title,
  slug: slugify(title),
  coverUrl: `/demo/creative/artworks/ornaments_${i + 1}_digital.webp`,
  tagline: TAGLINES[i % TAGLINES.length],
  description: `${OPEN[i % OPEN.length](title)} ${MID[i % MID.length](type.toLowerCase())} ${CLOSE[i % CLOSE.length]}`,
  meta: { type, year: YEARS[i % YEARS.length], medium: MEDIUMS[i % MEDIUMS.length], dimensions: DIMS[i % DIMS.length], series: SERIES[i % SERIES.length] },
  technologies: [type, "Hand-drawn", "Intuitive"],
  links: [{ label: "View on Instagram", url: "https://www.instagram.com/" }],
}));

const basics = {
  fullName: "Dalal Al-Kandari",
  title: "Self-Taught Ornamental Artist",
  subtitle: "Let's explore my eye brain",
  location: "Kuwait City, Kuwait",
  bio: "I never studied ornamental art. My hand moves without planning, my eye sees, my brain feels, and what emerges is pure intuition. 46 works of bold lines, vivid color, and hearts that appear unbidden. This is not technique. This is my eye brain.",
  email: "dalal@myeyebrain.art",
  phone: "+965 1234 5678",
  instagram: "https://www.instagram.com/",
  linkedin: "https://www.linkedin.com/",
};
const portfolioUrl = "https://portfolio-trimind.com/demo/creative";
const customization = {};
const base = { locale: "en", isRTL: false, portfolioUrl, templateId: "creative", basics, customization };

/* ── render homepage ─────────────────────────────────────────── */
const indexTpl = Handlebars.compile(readFileSync(resolve(ROOT, "src/templates/creative/template.hbs"), "utf8"));
const indexHtml = indexTpl({ ...base, projects, skills: [
  { category: "The Practice", items: ["Intuitive Creation", "Color Sense", "Pattern Design", "Composition", "Emotional Range"] },
  { category: "Tools & Mediums", items: ["Markers", "Paper", "Intuition", "Heart", "Eye", "Brain", "Love"] },
], metrics: [
  { value: "46", label: "Original Works" }, { value: "Art Brut", label: "Self-Taught" },
  { value: "Kuwait City", label: "Studio" }, { value: "My Eye", label: "Brain" },
] });
const indexOut = resolve(ROOT, "public/demo/creative/index.html");
mkdirSync(dirname(indexOut), { recursive: true });
writeFileSync(indexOut, indexHtml, "utf8");

/* ── render a detail page per artwork ────────────────────────── */
const detailTpl = Handlebars.compile(readFileSync(resolve(ROOT, "src/templates/creative/project-detail.hbs"), "utf8"));
let pages = 0;
projects.forEach((project, i) => {
  const html = detailTpl({
    ...base, project,
    prevProject: i > 0 ? projects[i - 1] : null,
    nextProject: i < projects.length - 1 ? projects[i + 1] : null,
  });
  const out = resolve(ROOT, `public/demo/creative/projects/${project.slug}/index.html`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html, "utf8");
  pages++;
});

console.log(`OK: homepage ${indexHtml.length} bytes + ${pages} detail pages`);
console.log(`sample detail: /demo/creative/projects/${projects[0].slug}`);
console.log(`cone links to pages: ${indexHtml.includes("/projects/" + projects[0].slug) ? "yes" : "no"} | data-full(lightbox) on home: ${(indexHtml.match(/data-full/g) || []).length}`);
