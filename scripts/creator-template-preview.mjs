// Renders the REAL src/templates/creator/template.hbs with sample data + the
// same Handlebars helpers the engine registers, to /tmp/creator-tpl-preview.html.
//   node scripts/creator-template-preview.mjs
import Handlebars from "handlebars";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(resolve(ROOT, "src/templates/creator/template.hbs"), "utf8");

// helpers mirroring src/lib/template-engine.ts semantics (the ones this template uses)
Handlebars.registerHelper("isHidden", function (id) {
  return !!(this.customization && Array.isArray(this.customization.hiddenSections) && this.customization.hiddenSections.includes(id));
});
Handlebars.registerHelper("safeUrl", (v) =>
  typeof v === "string" && /^(https?:\/\/|mailto:|tel:|\/)/i.test(v.trim()) ? v.trim() : "#");
Handlebars.registerHelper("safeColor", (v, fb) =>
  typeof v === "string" && /^(#[0-9a-f]{3,8}|rgb|hsl|oklch|oklab|lab|lch|[a-z]+)/i.test(v.trim()) ? v.trim() : fb);
Handlebars.registerHelper("initials", (name) =>
  String(name || "").trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "?");
Handlebars.registerHelper("cycle", function (index, ...rest) {
  rest.pop(); // options
  return rest[(index % rest.length + rest.length) % rest.length];
});

const IMG = "https://portfolio-trimind.com/demo/creator/img";
const data = {
  locale: "en", isRTL: false, portfolioUrl: "https://portfolio-trimind.com/p/remi-vance",
  basics: {
    fullName: "Remi Vance", title: "Content Creator & Brand Storyteller",
    subtitle: "I turn brands into stories people want to watch.",
    valueProposition: "Cinematic short-form, vlogs and campaigns across YouTube, Instagram and TikTok — built to turn attention into a loyal audience.",
    location: "Kuwait City", email: "hello@remivance.example",
    instagram: "https://instagram.com/", youtube: "https://youtube.com/@remivance",
    tiktok: "https://tiktok.com/@remivance", website: "https://remivance.example",
    linkedin: "https://linkedin.com/in/", phone: "+965 5000 0000",
  },
  brands: [
    { name: "Vélo" }, { name: "Lumen" }, { name: "Aura Studios" }, { name: "Northwind" },
    { name: "Kasa" }, { name: "Pulse" }, { name: "Halcyon" }, { name: "Driftwood" },
  ],
  metrics: [
    { value: "2.4M", label: "Followers" }, { value: "180M", label: "Total views" },
    { value: "7.2%", label: "Engagement" }, { value: "42+", label: "Brand collabs" },
  ],
  projects: [
    { title: "Midnight Market", description: "A cinematic night-market campaign.", coverUrl: `${IMG}/midnight-market.jpg`, meta: { type: "Brand Film", year: "2025" }, metrics: [{ value: "12M", label: "views · Vélo" }], link: "https://example.com" },
    { title: "Studio Diaries", description: "Weekly behind-the-scenes vlog.", coverUrl: `${IMG}/studio-diaries.jpg`, meta: { type: "Vlog Series" }, metrics: [{ value: "480K", label: "subscribers" }] },
    { title: "Neon Nights", description: "Stylised short-form series.", coverUrl: `${IMG}/neon-nights.jpg`, meta: { type: "Short-form" }, metrics: [{ value: "38M", label: "plays" }] },
    { title: "Aurora Launch", description: "No-image fallback test.", meta: { type: "Campaign", year: "2022" }, metrics: [{ value: "5M", label: "reach" }] },
  ],
  certifications: [
    { name: "Creator of the Year", issuer: "Gulf Digital Awards", year: "2025" },
    { name: "Best Branded Series", issuer: "MENA Web Awards", year: "2024" },
    { name: "30 Under 30", issuer: "Creator Economy", year: "2024" },
    { name: "Gold Play Button", issuer: "YouTube", year: "2023" },
  ],
  skills: [
    { category: "Production", items: ["Video editing", "Color grading", "Cinematography", "Sound design"] },
    { category: "Strategy", items: ["Audience growth", "Scriptwriting", "Brand partnerships"] },
  ],
  experience: [
    { title: "Founder & Creator", company: "Vance Studio", startDate: "2020", endDate: "", description: "Independent content studio producing brand films and short-form at scale.", highlights: ["180M+ lifetime views", "42 brand partnerships shipped on schedule"] },
  ],
  education: [{ degree: "BA Film & Media Production", institution: "Gulf University", year: "2019", description: "Graduated with distinction." }],
  endorsements: [
    { quote: "Working with Remi completely transformed our launch — engagement doubled in two months.", name: "Sophie Hart", title: "CMO", company: "Vélo" },
    { quote: "The best content partner we've worked with, full stop.", name: "Omar Khan", title: "Brand Lead", company: "Lumen" },
  ],
  languages: [{ name: "Arabic", level: "Native" }, { name: "English", level: "Fluent" }],
  customization: {},
};

const html = Handlebars.compile(src)(data);
const out = "/tmp/creator-tpl-preview.html";
writeFileSync(out, html);
console.log("rendered", html.length, "chars ->", out);
