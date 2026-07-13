// Whitelist + path resolver shared by the CV Studio chat tools (setField,
// rewriteField). Keeping edits to KNOWN fields is what prevents the model from
// writing junk keys that would make the whole Convex `portfolios.update`
// re-validation throw (and silently lose the user's edit).

// Scalar (string) fields the chat may set/rewrite, per list section.
export const WRITABLE_SCALAR: Record<string, readonly string[]> = {
  experience: ["title", "company", "startDate", "endDate", "description"],
  education: ["degree", "institution", "year", "description"],
  certifications: ["name", "issuer", "year"],
  languages: ["name", "level"],
  projects: ["title", "description", "tagline"],
  skills: ["category"],
  endorsements: ["quote", "name", "title", "company"],
};

// string[] fields — setField accepts newline-separated text for these.
export const WRITABLE_ARRAY: Record<string, readonly string[]> = {
  experience: ["highlights"],
  skills: ["items"],
};

// basics scalar fields editable via 'basics.<field>' (or the summary aliases).
export const BASICS_SCALAR: readonly string[] = [
  "fullName",
  "title",
  "subtitle",
  "bio",
  "summary",
  "valueProposition",
  "location",
  "nationality",
  "email",
  "phone",
  "website",
  "linkedin",
  "github",
];

export type FieldTarget =
  | { kind: "summary" }
  | { kind: "basics"; field: string }
  | { kind: "item"; section: string; index: number; field: string; isArray: boolean }
  | { kind: "invalid"; reason: string };

// Parse a tool `path` into a validated, applyable target. Only whitelisted
// fields resolve — everything else is "invalid" so the caller can report it
// instead of corrupting the document.
export function resolveTarget(path: string): FieldTarget {
  if (path === "summary" || path === "bio" || path === "basics.summary") {
    return { kind: "summary" };
  }
  const b = path.match(/^basics\.(\w+)$/);
  if (b) {
    return BASICS_SCALAR.includes(b[1])
      ? { kind: "basics", field: b[1] }
      : { kind: "invalid", reason: `basics.${b[1]} is not editable` };
  }
  const m = path.match(/^(\w+)\.(\d+)\.(\w+)$/);
  if (!m) return { kind: "invalid", reason: `unsupported path '${path}'` };
  const [, section, idxStr, field] = m;
  const index = Number(idxStr);
  if (WRITABLE_SCALAR[section]?.includes(field)) {
    return { kind: "item", section, index, field, isArray: false };
  }
  if (WRITABLE_ARRAY[section]?.includes(field)) {
    return { kind: "item", section, index, field, isArray: true };
  }
  return { kind: "invalid", reason: `field '${field}' is not editable on ${section}` };
}

// Split newline-separated user text into a clean string[] (for highlights etc.).
export function toStringList(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.replace(/^[-•*\s]+/, "").trim())
    .filter(Boolean);
}

// ── self-check (run: npx tsx src/lib/cv-chat-fields.ts) ──────────────────────
function demo() {
  const eq = (a: unknown, b: unknown, msg: string) => {
    if (JSON.stringify(a) !== JSON.stringify(b))
      throw new Error(`${msg}: got ${JSON.stringify(a)}`);
  };
  // the two edits the user was blocked on:
  eq(resolveTarget("education.0.year"), { kind: "item", section: "education", index: 0, field: "year", isArray: false }, "education year");
  eq(resolveTarget("experience.0.description"), { kind: "item", section: "experience", index: 0, field: "description", isArray: false }, "exp description (even when currently empty)");
  eq(resolveTarget("experience.0.highlights").kind, "item", "highlights resolves");
  eq((resolveTarget("experience.0.highlights") as any).isArray, true, "highlights is array");
  eq(resolveTarget("summary"), { kind: "summary" }, "summary alias");
  eq(resolveTarget("basics.fullName"), { kind: "basics", field: "fullName" }, "basics scalar");
  // rejects junk that would break Convex validation:
  eq(resolveTarget("experience.0.__proto__").kind, "invalid", "junk field rejected");
  eq(resolveTarget("basics.password").kind, "invalid", "unknown basics field rejected");
  eq(resolveTarget("nope").kind, "invalid", "garbage path rejected");
  eq(toStringList("- استقبال الضيوف\n• إدارة وتنظيم\n\n"), ["استقبال الضيوف", "إدارة وتنظيم"], "list split strips bullets/blanks");
  console.log("cv-chat-fields self-check: OK");
}
// tsx/node entry only — never runs in the Next bundle.
if (typeof require !== "undefined" && require.main === module) demo();
