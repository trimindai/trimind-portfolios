// True-390px mobile audit for the 4 live portfolio templates (the QR destination).
//
//   node scripts/mobile-shot.mjs
//
// For each of corporate / engineer / creative / developer it:
//   1. compiles src/templates/<id>/template.hbs with the same DEMO_DATA the live
//      demo route uses (registering the same Handlebars helpers as
//      src/lib/template-engine.ts, so output == production),
//   2. loads the HTML in REAL Google Chrome (channel:'chrome') at a true mobile
//      viewport — width:390, isMobile:true, hasTouch:true (NOT bare
//      `chrome --headless --screenshot`, which floors at 500px),
//   3. measures horizontal overflow (scrollWidth - clientWidth) and the bounding
//      box of any element wider than the viewport, and screenshots the hero.
//
// overflowPx must be 0 on all 4. Exit 0 only when every template passes.

import Handlebars from "handlebars";
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT = resolve(__dirname, "mobile-audit");
mkdirSync(OUT, { recursive: true });

/* ── helpers (mirror of src/lib/template-engine.ts) ─────────────── */
Handlebars.registerHelper("isHidden", function (sectionId) {
  const hidden = (this.customization && this.customization.hiddenSections) || [];
  return hidden.includes(sectionId);
});
Handlebars.registerHelper("ifEq", function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper("or", function (...args) { args.pop(); return args.some(Boolean); });
Handlebars.registerHelper("gt", function (a, b) { return a > b; });
Handlebars.registerHelper("json", function (ctx) { return new Handlebars.SafeString(JSON.stringify(ctx || {})); });
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
Handlebars.registerHelper("videoEmbed", function () { return ""; });
Handlebars.registerHelper("cycle", function (...args) {
  args.pop();
  const index = Number(args.shift()) || 0;
  if (!args.length) return "";
  return args[((index % args.length) + args.length) % args.length];
});
Handlebars.registerHelper("flattenSkills", function (skills) {
  if (!Array.isArray(skills)) return [];
  const out = [];
  skills.forEach((cat, catIndex) => {
    const category = typeof cat?.category === "string" ? cat.category : "";
    const items = Array.isArray(cat?.items) ? cat.items : [];
    if (!items.length) { if (category) out.push({ name: category, category, catIndex }); return; }
    items.forEach((it) => {
      const name = typeof it === "string" ? it : String(it?.name ?? it ?? "");
      if (name.trim()) out.push({ name: name.trim(), category, catIndex });
    });
  });
  return out;
});
const norm = (n) => String(n || "").toLowerCase().replace(/[^a-z0-9]/g, "");
Handlebars.registerHelper("techIcon", function () { return ""; });
Handlebars.registerHelper("kbAbbr", function (name) {
  const raw = String(name || "").trim();
  if (!raw) return "";
  const words = raw.split(/[\s/.\-_]+/).filter(Boolean);
  if (words.length > 1) return words.slice(0, 3).map((w) => w[0].toUpperCase()).join("");
  const w = words[0] || raw;
  return w.length <= 5 ? w : w.slice(0, 4);
});
Handlebars.registerHelper("personJsonLd", function () { return new Handlebars.SafeString(""); });
Handlebars.registerHelper("creativeWorkJsonLd", function () { return new Handlebars.SafeString(""); });
Handlebars.registerHelper("faviconLink", function () { return new Handlebars.SafeString(""); });

/* ── DEMO_DATA (mirror of src/app/demo/[templateId]/route.ts) ───── */
const DEMO_DATA = {
  corporate: {
    templateId: "corporate", locale: "en", isRTL: false,
    portfolioUrl: "https://portfolio-trimind.com/p/sarah",
    basics: {
      fullName: "Sarah Al-Rashidi", title: "Senior Financial Analyst",
      subtitle: "CFA Charterholder | 12 Years in GCC Banking",
      bio: "Results-driven financial analyst with expertise in portfolio management, risk assessment, and strategic investment planning across Kuwait, UAE, and Saudi Arabia. Led analysis teams managing $2B+ in assets.",
      location: "Kuwait City, Kuwait", email: "sarah@example.com", phone: "+965 9XXX XXXX",
      linkedin: "https://linkedin.com/in/example", photoUrl: "",
    },
    metrics: [
      { value: "$2B+", label: "Assets Analyzed" }, { value: "12", label: "Years Experience" }, { value: "35%", label: "Portfolio Growth" },
    ],
    experience: [
      { title: "Senior Financial Analyst", company: "Kuwait National Bank", startDate: "2019", endDate: "Present", description: "Lead analyst for institutional investment portfolio.", highlights: ["Grew portfolio value by 35% over 3 years", "Built risk models adopted across 4 departments", "Trained team of 8 junior analysts"] },
      { title: "Financial Analyst", company: "Gulf Investment Corp", startDate: "2014", endDate: "2019", description: "Cross-border investment analysis for GCC markets.", highlights: ["Analyzed 200+ investment opportunities", "Published quarterly market outlook reports"] },
    ],
    skills: [
      { category: "Financial Analysis", items: ["DCF Modeling", "Risk Assessment", "Portfolio Management", "Derivatives Pricing"] },
      { category: "Tools", items: ["Bloomberg Terminal", "Excel VBA", "Python", "Tableau", "SAP"] },
    ],
    education: [
      { degree: "MBA, Finance", institution: "American University of Kuwait", year: "2014" },
      { degree: "BSc, Accounting", institution: "Kuwait University", year: "2012" },
    ],
    certifications: [
      { name: "CFA Charterholder", issuer: "CFA Institute", year: "2017" },
      { name: "FRM Certified", issuer: "GARP", year: "2015" },
    ],
    endorsements: [
      { quote: "Sarah's analytical rigor is exceptional. She consistently delivers insights that drive real investment decisions.", name: "Dr. Faisal Al-Mutairi", title: "Chief Investment Officer", company: "Kuwait National Bank" },
    ],
    customization: { primaryColor: "#1e3a5f", accentColor: "#c5a55a" },
  },
  engineer: {
    templateId: "engineer", locale: "en", isRTL: false,
    portfolioUrl: "https://portfolio-trimind.com/p/omar",
    basics: {
      fullName: "Omar Al-Sabah", title: "Mechanical Engineer",
      subtitle: "Oil & Gas | Process Design | 8 Years",
      bio: "Mechanical engineer specializing in downstream process design and plant optimization. Experienced in FEED studies, P&ID development, and commissioning for refineries across the GCC.",
      location: "Ahmadi, Kuwait", email: "omar@example.com", linkedin: "https://linkedin.com/in/example",
    },
    projects: [
      { title: "Clean Fuel Project — KNPC", description: "Led mechanical design for the hydrogen recovery unit in Kuwait's $12B clean fuel project.", technologies: ["AutoCAD Plant 3D", "CAESAR II", "HTRI"], metrics: [{ value: "99.5%", label: "Uptime" }, { value: "$12B", label: "Project Value" }], isFeatured: true },
      { title: "Gas Compression Station Upgrade", description: "Redesigned compressor train to increase throughput by 20% without additional footprint.", technologies: ["Aspen HYSYS", "SolidWorks", "Finite Element Analysis"], metrics: [{ value: "20%", label: "Throughput Increase" }] },
    ],
    skills: [
      { category: "Engineering", items: ["Process Design", "P&ID Development", "Stress Analysis", "FEED Studies"] },
      { category: "Software", items: ["AutoCAD Plant 3D", "CAESAR II", "HTRI", "Aspen HYSYS", "SolidWorks"] },
    ],
    education: [
      { degree: "MSc, Mechanical Engineering", institution: "University of Manchester", year: "2016" },
      { degree: "BSc, Mechanical Engineering", institution: "Kuwait University", year: "2014" },
    ],
    certifications: [{ name: "Professional Engineer (PE)", issuer: "Kuwait Society of Engineers", year: "2020" }],
    customization: { primaryColor: "#0f172a", accentColor: "#059669" },
  },
  creative: {
    templateId: "creative", locale: "en", isRTL: false,
    portfolioUrl: "https://portfolio-trimind.com/p/nora",
    basics: {
      fullName: "Nora Al-Kandari", title: "Visual Designer & Art Director",
      subtitle: "Branding | Digital Art | Exhibition Design",
      bio: "Multidisciplinary designer creating visual identities for luxury brands, cultural institutions, and tech startups across the Middle East.",
      location: "Kuwait City", email: "nora@example.com",
      instagram: "https://instagram.com/example", website: "https://example.com",
    },
    projects: [
      { title: "Kuwait Pavilion — Expo 2025", description: "Art directed the visual identity and spatial design for Kuwait's national pavilion.", technologies: ["Figma", "Cinema 4D", "After Effects"], isFeatured: true },
      { title: "Sadu House Rebrand", description: "Complete visual identity redesign for Kuwait's premier textile heritage museum.", technologies: ["Illustrator", "InDesign", "Photography"] },
      { title: "FinTech Startup Identity", description: "Brand system, app UI, and marketing collateral for a Kuwait-based digital banking startup.", technologies: ["Figma", "Protopie", "Lottie"] },
    ],
    skills: [
      { category: "Design", items: ["Brand Identity", "Art Direction", "Typography", "Motion Graphics"] },
      { category: "Tools", items: ["Figma", "Adobe Creative Suite", "Cinema 4D", "After Effects", "Blender"] },
    ],
    customization: { primaryColor: "#0a0a0a", accentColor: "#ec4899" },
  },
  developer: {
    templateId: "developer", locale: "en", isRTL: false,
    portfolioUrl: "https://portfolio-trimind.com/p/yusuf",
    basics: {
      fullName: "Yusuf Al-Hajri", title: "Full-Stack Developer",
      subtitle: "React | Node.js | Cloud Architecture",
      bio: "Building scalable web applications and cloud infrastructure for startups and enterprise clients in Kuwait. Open source contributor and tech community organizer.",
      location: "Hawalli, Kuwait", email: "yusuf@example.com",
      github: "https://github.com/example", linkedin: "https://linkedin.com/in/example",
    },
    projects: [
      { title: "E-Commerce Platform", description: "Built a multi-vendor marketplace handling 10K+ daily orders with real-time inventory management.", technologies: ["Next.js", "TypeScript", "PostgreSQL", "Redis", "AWS"], metrics: [{ value: "10K+", label: "Daily Orders" }, { value: "99.9%", label: "Uptime" }], isFeatured: true },
      { title: "Government Portal", description: "Citizen-facing portal with Arabic/English support, e-payment integration, and document management.", technologies: ["React", "Node.js", "MongoDB", "Docker", "Kubernetes"] },
    ],
    skills: [
      { category: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "React Native"] },
      { category: "Backend", items: ["Node.js", "Python", "PostgreSQL", "Redis", "GraphQL"] },
      { category: "DevOps", items: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"] },
    ],
    education: [{ degree: "BSc, Computer Science", institution: "Kuwait University", year: "2018" }],
    customization: { primaryColor: "#0f172a", accentColor: "#3b82f6" },
  },
};

const TEMPLATES = ["corporate", "engineer", "creative", "developer"];

function render(id) {
  const src = readFileSync(resolve(ROOT, `src/templates/${id}/template.hbs`), "utf8");
  const tpl = Handlebars.compile(src);
  return tpl(DEMO_DATA[id]);
}

const VIEWPORT = { width: 390, height: 844 };

async function audit() {
  const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const results = [];
  for (const id of TEMPLATES) {
    const html = render(id);
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
    // settle any entrance animation / late layout
    await page.waitForTimeout(1200);

    const metrics = await page.evaluate((vw) => {
      const doc = document.documentElement;
      const scrollWidth = Math.max(doc.scrollWidth, document.body.scrollWidth);
      const clientWidth = doc.clientWidth;
      const overflowPx = Math.max(0, scrollWidth - clientWidth);
      // Is this element (or an ancestor) clipped on the x-axis? If so an element
      // wider than the viewport is intentional (e.g. an animated marquee/ticker)
      // and does NOT create a real horizontal page scroll.
      const isXClipped = (el) => {
        let n = el;
        while (n && n !== document.documentElement) {
          const cs = getComputedStyle(n);
          if (cs.overflowX === "hidden" || cs.overflowX === "clip" ||
              cs.overflow === "hidden" || cs.overflow === "clip") return true;
          n = n.parentElement;
        }
        return getComputedStyle(document.documentElement).overflowX === "hidden";
      };
      // find offenders: elements whose right edge exceeds the viewport
      const offenders = [];
      let uncontained = 0; // offenders NOT inside an overflow-clip ancestor = real bugs
      const all = document.querySelectorAll("*");
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right > vw + 1 || r.left < -1) {
          const clipped = isXClipped(el);
          if (!clipped) uncontained++;
          offenders.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className && String(el.className).slice(0, 60)) || "",
            right: Math.round(r.right),
            left: Math.round(r.left),
            w: Math.round(r.width),
            clipped,
          });
        }
      }
      // de-dupe / keep widest 8
      offenders.sort((a, b) => (b.right - vw) - (a.right - vw));
      return { scrollWidth, clientWidth, overflowPx, uncontained, offenders: offenders.slice(0, 8) };
    }, VIEWPORT.width);

    await page.screenshot({ path: resolve(OUT, `${id}-390.png`) });
    results.push({ id, ...metrics });
    await page.close();
  }
  await browser.close();
  return results;
}

const results = await audit();
let fail = 0;
console.log("\n=== 390px live-portfolio audit ===");
for (const r of results) {
  // Pass = no real page scroll AND no off-viewport element that escapes an
  // overflow-clip ancestor (uncontained offenders are genuine layout bugs).
  const ok = r.overflowPx === 0 && r.uncontained === 0;
  if (!ok) fail++;
  console.log(`\n[${r.id}] overflowPx=${r.overflowPx}  uncontained=${r.uncontained}  (scrollWidth=${r.scrollWidth} clientWidth=${r.clientWidth})  ${ok ? "✓" : "✗ OVERFLOW"}`);
  if (r.offenders.length) {
    console.log("  off-viewport elements (right edge > 390):");
    for (const o of r.offenders) {
      console.log(`    ${o.clipped ? "[clipped]" : "[ESCAPES]"} <${o.tag} class="${o.cls}">  left=${o.left} right=${o.right} w=${o.w}`);
    }
  }
}
console.log("\n" + (fail === 0 ? "ALL 4 TEMPLATES: overflowPx 0 ✓" : `${fail} TEMPLATE(S) STILL OVERFLOW ✗`));
process.exit(fail === 0 ? 0 : 1);
