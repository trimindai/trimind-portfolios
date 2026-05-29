// Regenerate public/demo/developer/index.html from src/templates/developer/template.hbs
// Self-contained: registers the same Handlebars helpers the live engine uses
// (mirrors src/lib/template-engine.ts) so the demo matches production output.
//   node scripts/gen-developer-demo.mjs
import Handlebars from "handlebars";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/* ── helpers (mirror of template-engine.ts) ─────────────────── */
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
const TECH_ICONS = {
  react: "fab fa-react", reactjs: "fab fa-react", reactnative: "fab fa-react",
  javascript: "fab fa-js", js: "fab fa-js",
  nodejs: "fab fa-node-js", node: "fab fa-node-js", express: "fab fa-node-js",
  python: "fab fa-python", django: "fab fa-python", flask: "fab fa-python",
  java: "fab fa-java", spring: "fab fa-java", springboot: "fab fa-java",
  html: "fab fa-html5", html5: "fab fa-html5",
  css: "fab fa-css3-alt", css3: "fab fa-css3-alt",
  sass: "fab fa-sass", scss: "fab fa-sass",
  php: "fab fa-php", laravel: "fab fa-laravel",
  vue: "fab fa-vuejs", vuejs: "fab fa-vuejs",
  angular: "fab fa-angular", angularjs: "fab fa-angular",
  aws: "fab fa-aws", amazonwebservices: "fab fa-aws",
  docker: "fab fa-docker", kubernetes: "fas fa-dharmachakra", k8s: "fas fa-dharmachakra",
  git: "fab fa-git-alt", github: "fab fa-github", gitlab: "fab fa-gitlab", bitbucket: "fab fa-bitbucket",
  linux: "fab fa-linux", ubuntu: "fab fa-ubuntu", windows: "fab fa-windows",
  apple: "fab fa-apple", ios: "fab fa-apple", macos: "fab fa-apple",
  android: "fab fa-android", swift: "fab fa-swift", rust: "fab fa-rust",
  wordpress: "fab fa-wordpress", bootstrap: "fab fa-bootstrap",
  npm: "fab fa-npm", yarn: "fab fa-yarn", figma: "fab fa-figma", sketch: "fab fa-sketch",
  slack: "fab fa-slack", jira: "fab fa-jira", trello: "fab fa-trello", confluence: "fab fa-confluence",
  unity: "fab fa-unity", stripe: "fab fa-stripe", cloudflare: "fab fa-cloudflare",
  digitalocean: "fab fa-digital-ocean", raspberrypi: "fab fa-raspberry-pi", jenkins: "fab fa-jenkins",
  sql: "fas fa-database", mysql: "fas fa-database", postgresql: "fas fa-database",
  postgres: "fas fa-database", mongodb: "fas fa-database", database: "fas fa-database",
  redis: "fas fa-database", sqlite: "fas fa-database", oracle: "fas fa-database",
  cloud: "fas fa-cloud", azure: "fas fa-cloud", gcp: "fas fa-cloud", googlecloud: "fas fa-cloud",
  security: "fas fa-shield-halved", cybersecurity: "fas fa-shield-halved", infosec: "fas fa-shield-halved",
  api: "fas fa-plug", rest: "fas fa-plug", graphql: "fas fa-diagram-project",
  mobile: "fas fa-mobile-screen", flutter: "fas fa-mobile-screen",
  ai: "fas fa-robot", ml: "fas fa-robot", machinelearning: "fas fa-robot",
  tensorflow: "fas fa-robot", pytorch: "fas fa-robot", deeplearning: "fas fa-robot",
  data: "fas fa-chart-line", analytics: "fas fa-chart-line", datascience: "fas fa-chart-line",
  terraform: "fas fa-server", ansible: "fas fa-server", devops: "fas fa-infinity",
  networking: "fas fa-network-wired", network: "fas fa-network-wired",
};
const normalizeTech = (name) => String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
Handlebars.registerHelper("techIcon", (name) => TECH_ICONS[normalizeTech(name)] || "");
const TECH_ABBR = {
  typescript: "TS", javascript: "JS", kubernetes: "K8s", graphql: "GQL",
  postgresql: "PG", postgres: "PG", nextjs: "Next", nodejs: "Node",
  tailwind: "TW", tailwindcss: "TW", mongodb: "Mongo", express: "Ex",
  expressjs: "Ex", terraform: "TF", cplusplus: "C++", csharp: "C#",
  dotnet: ".NET", objectivec: "Obj-C",
};
Handlebars.registerHelper("kbAbbr", function (name) {
  const raw = String(name || "").trim();
  if (!raw) return "";
  const norm = normalizeTech(raw);
  if (TECH_ABBR[norm]) return TECH_ABBR[norm];
  const words = raw.split(/[\s/.\-_]+/).filter(Boolean);
  if (words.length > 1) return words.slice(0, 3).map((w) => w[0].toUpperCase()).join("");
  const w = words[0] || raw;
  return w.length <= 5 ? w : w.slice(0, 4);
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
  const bg = colorOk(bgColor, "#020617");
  const accent = colorOk(accentColor, "#7C5CFF");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="10" fill="${bg}"/>` +
    `<text x="32" y="34" font-family="Archivo Black,Arial,sans-serif" font-size="28" ` +
    `font-weight="800" letter-spacing="-1" fill="${accent}" ` +
    `text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;
  return new Handlebars.SafeString(`<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg)}">`);
});

/* ── demo persona: Wadhah Almutairi (from his CV) ───────────── */
const data = {
  locale: "en",
  isRTL: false,
  portfolioUrl: "https://portfolio-trimind.com/demo/developer",
  templateId: "developer",
  basics: {
    fullName: "Wadhah Almutairi",
    title: "Cybersecurity Engineer",
    subtitle: "Computer Engineer",
    valueProposition:
      "I secure enterprise environments end to end — penetration testing, Active Directory hardening, SIEM engineering, and security automation. CEH certified, and just as comfortable scripting the fix as I am writing the report.",
    location: "Kuwait City, Kuwait",
    email: "w.baazm@gmail.com",
    phone: "99252378",
  },
  metrics: [
    { value: "CEH", label: "Certified Ethical Hacker" },
    { value: "KUNA", label: "Security & IT Engineer" },
    { value: "AUM", label: "B.Sc. Computer Engineering" },
  ],
  skills: [
    {
      category: "Cybersecurity",
      items: [
        "Penetration Testing",
        "Vulnerability Assessment",
        "Active Directory",
        "GPO Hardening",
        "Incident Response",
        "IIS",
        "DNS",
      ],
    },
    {
      category: "Security Platforms",
      items: ["Trend Micro Vision One", "Elastic Stack", "SIEM", "Winlogbeat"],
    },
    { category: "DevOps", items: ["Docker"] },
    { category: "Programming", items: ["Python", "PowerShell", "Java", "C"] },
    { category: "AI & Data", items: ["Machine Learning", "NLP", "Pandas"] },
    { category: "Web", items: ["HTML", "CSS"] },
  ],
  experience: [
    {
      title: "Cybersecurity & IT Engineer",
      company: "Kuwait News Agency (KUNA)",
      startDate: "2024",
      endDate: "",
      description:
        "Drive security operations across a national news agency — from offensive assessments to hardening, logging, and automation.",
      highlights: [
        "Ran security assessments uncovering SQL injection, information disclosure, and application-layer vulnerabilities.",
        "Authored CEH-level penetration test reports with prioritized, actionable remediation.",
        "Hardened Active Directory — GPO hardening, delegated permissions, and domain controller protections.",
        "Engineered centralized logging pipelines with the Elastic Stack and Winlogbeat.",
        "Used Docker for isolated security testing and repeatable deployments.",
        "Deployed Wake-on-LAN across VLANs for remote maintenance and patching.",
      ],
    },
  ],
  projects: [
    {
      title: "Trend Micro Vision One (XDR)",
      tagline: "XDR / Security Ops",
      description:
        "Led onboarding and security integration of Trend Micro Vision One XDR — unifying endpoint, network, and server telemetry into a single detection-and-response surface for the organisation.",
      technologies: ["Trend Micro Vision One", "XDR", "Incident Response"],
    },
    {
      title: "Elastic Stack Logging Automation",
      tagline: "SIEM / Automation",
      description:
        "Built an automated logging pipeline that ingests and normalises security events with Python into structured databases, surfaced through the Elastic Stack for fast investigation.",
      technologies: ["Elastic Stack", "Winlogbeat", "Python", "SIEM"],
    },
    {
      title: "Wake-on-LAN Enterprise Deployment",
      tagline: "Infrastructure",
      description:
        "Designed and rolled out Wake-on-LAN across multiple VLANs, enabling remote power-on for maintenance and patching of machines spread across the network.",
      technologies: ["Networking", "PowerShell", "Windows"],
    },
    {
      title: "Vulnerability Reporting Automation",
      tagline: "Security Tooling",
      description:
        "Automated the security reporting workflow — generating CEH-style vulnerability reports with consistent severity scoring and remediation guidance to speed up the assessment cycle.",
      technologies: ["Python", "Penetration Testing", "Security"],
    },
    {
      title: "Multilingual AI Chatbot",
      tagline: "University Senior Project",
      description:
        "Built a multilingual AI chatbot using NLP and machine learning on custom datasets, deployed to assist students. Final-year capstone at the American University of the Middle East.",
      technologies: ["Machine Learning", "NLP", "Python"],
    },
  ],
  education: [
    {
      degree: "B.Sc. Computer Engineering",
      institution: "American University of the Middle East (AUM)",
      year: "2024",
    },
  ],
  certifications: [
    { name: "Certified Ethical Hacker (CEH)", issuer: "EC-Council", year: "" },
    { name: "Data Science Course", issuer: "CODED Academy", year: "" },
    { name: "Web Development Bootcamp", issuer: "CODED Academy", year: "" },
  ],
  customization: {},
};

const tplPath = resolve(ROOT, "src/templates/developer/template.hbs");
const outPath = resolve(ROOT, "public/demo/developer/index.html");
const src = readFileSync(tplPath, "utf8");
const tpl = Handlebars.compile(src);
const html = tpl(data);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, html, "utf8");
console.log(`OK: rendered ${html.length} bytes → public/demo/developer/index.html`);
console.log(`sections present: ${["#hero", "#skills", "#experience", "#projects", "#contact"].filter((s) => html.includes(`id="${s.slice(1)}"`)).join(", ")}`);
console.log(`spline-viewer ref: ${html.includes("spline-viewer") ? "yes" : "no"} | keyboard url: ${html.includes("skills-keyboard.spline") ? "yes" : "no"}`);
