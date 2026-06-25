// CV extraction schema + platform mappers — ported from cv-bot/cv_schema.py.
// Only the fields the platform actually stores are modelled. PII the product
// must never surface (civil ID, Bdoon status, salary, DOB) is intentionally
// ABSENT, and zod strips unknown keys, so it can't round-trip into a portfolio.

import { z } from "zod";

export const TEMPLATE_IDS = [
  "general",
  "engineer",
  "creative",
  "developer",
  "creator",
] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

const Language = z.object({
  name: z.string(),
  level: z.string().nullish(),
});

const Basics = z.object({
  fullName: z.string().default(""),
  title: z.string().default(""),
  summary: z.string().nullish(),
  location: z.string().nullish(),
  email: z.string().default(""),
  phone: z.string().nullish(),
  website: z.string().nullish(),
  linkedin: z.string().nullish(),
  github: z.string().nullish(),
  languages: z.array(Language).nullish(),
});

const Experience = z.object({
  title: z.string(),
  company: z.string(),
  startDate: z.string().default(""),
  endDate: z.string().nullish(),
  description: z.string().nullish(),
  highlights: z.array(z.string()).nullish(),
});

const SkillGroup = z.object({
  category: z.string(),
  items: z.array(z.string()).default([]),
});

const Project = z.object({
  title: z.string(),
  description: z.string().default(""),
  technologies: z.array(z.string()).nullish(),
  link: z.string().nullish(),
});

const Education = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string().default(""),
  description: z.string().nullish(),
});

const Certification = z.object({
  name: z.string(),
  issuer: z.string().default(""),
  year: z.string().nullish(),
});

export const CvSchema = z.object({
  is_cv: z.boolean().default(true),
  confidence: z.number().default(0),
  templateId: z.enum(TEMPLATE_IDS).default("general"),
  basics: Basics.default({ fullName: "", title: "", email: "" }),
  experience: z.array(Experience).default([]),
  skills: z.array(SkillGroup).default([]),
  projects: z.array(Project).default([]),
  education: z.array(Education).default([]),
  certifications: z.array(Certification).default([]),
  languages: z.array(Language).default([]),
});

export type Cv = z.infer<typeof CvSchema>;

/** System prompt — mirrors cv-bot/llm_extract.py SYSTEM (PII bans included). */
export const PARSE_SYSTEM =
  "You are a precise CV/resume parser. Extract the candidate's CV into the JSON " +
  "schema described below. Rules: (1) Use ONLY information present in the input — " +
  "never invent. (2) NEVER extract civil ID, national ID, Bdoon/residency status, " +
  "salary, or date of birth, even if present. (3) Pick the single best templateId: " +
  "'engineer' for engineering/oil/technical, 'developer' for software, 'creative' " +
  "for design/art/media, 'creator' for content/marketing/influencer, else 'general'. " +
  "(4) Preserve the CV's language (Arabic stays Arabic). (5) If the input is clearly " +
  "not a CV, set is_cv=false. Return ONLY a JSON object, no prose, no markdown fences. " +
  "Shape: {is_cv:boolean, confidence:number, templateId:string, " +
  "basics:{fullName,title,summary,location,email,phone,website,linkedin,github," +
  "languages:[{name,level}]}, experience:[{title,company,startDate,endDate," +
  "description,highlights:[string]}], skills:[{category,items:[string]}], " +
  "projects:[{title,description,technologies:[string],link}], " +
  "education:[{degree,institution,year,description}], " +
  "certifications:[{name,issuer,year}], languages:[{name,level}]}.";

/** Map the parsed CV → the `basics` object for portfolios.create. */
export function toCreateBasics(
  cv: Cv,
  fallbackEmail = ""
): { fullName: string; title: string; email: string } & Record<string, unknown> {
  const b = cv.basics;
  const out: Record<string, unknown> = {
    fullName: b.fullName || "",
    title: b.title || "",
    email: b.email || fallbackEmail || "",
  };
  if (b.summary) {
    out.summary = b.summary;
    out.bio = b.summary;
  }
  if (b.location) out.location = b.location;
  for (const k of ["phone", "website", "linkedin", "github"] as const) {
    if (b[k]) out[k] = b[k];
  }
  if (b.languages?.length) {
    out.languages = b.languages.map((l) => ({
      name: l.name,
      ...(l.level ? { level: l.level } : {}),
    }));
  }
  return out as { fullName: string; title: string; email: string };
}

/** Map the parsed CV → the patch body for portfolios.update (no basics/template). */
export function toUpdatePatch(cv: Cv): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if (cv.experience.length) {
    patch.experience = cv.experience.map((e) => ({
      title: e.title,
      company: e.company,
      startDate: e.startDate || "",
      ...(e.endDate ? { endDate: e.endDate } : {}),
      ...(e.description ? { description: e.description } : {}),
      ...(e.highlights?.length ? { highlights: e.highlights } : {}),
    }));
  }
  if (cv.skills.length) {
    patch.skills = cv.skills.map((sk) => ({
      category: sk.category,
      items: sk.items || [],
    }));
  }
  if (cv.projects.length) {
    patch.projects = cv.projects.map((p) => ({
      title: p.title,
      description: p.description || "",
      ...(p.technologies?.length ? { technologies: p.technologies } : {}),
      ...(p.link ? { link: p.link } : {}),
    }));
  }
  if (cv.education.length) {
    patch.education = cv.education.map((ed) => ({
      degree: ed.degree,
      institution: ed.institution,
      year: ed.year || "",
      ...(ed.description ? { description: ed.description } : {}),
    }));
  }
  if (cv.certifications.length) {
    patch.certifications = cv.certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer || "",
      ...(c.year ? { year: c.year } : {}),
    }));
  }
  if (cv.languages.length) {
    // platform `languages` requires a non-optional level
    patch.languages = cv.languages.map((l) => ({
      name: l.name,
      level: l.level || "Fluent",
    }));
  }
  return patch;
}
