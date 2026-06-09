// Unit tests for the trackballBadge and kbdSkillsJSON helpers.
// Exercises the REAL normalizeTech path via kbdSkillsData (no mocks).
// Run with: npx tsx scripts/dev-template-helpers.test.mts
import assert from "node:assert/strict";
import Handlebars from "handlebars";
import { trackballBadgeValue, kbdSkillsData, safeScriptJson } from "../src/lib/template-engine";

let fails = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    console.log("  ok  -", name);
  } catch (e: any) {
    fails++;
    console.log("  FAIL-", name, "\n      ", e.message);
  }
}

// ── Task A: trackballBadgeValue ────────────────────────────────────────────

check("explicit label present → used", () => {
  assert.equal(trackballBadgeValue("Synth", "Maya Okafor"), "Synth");
});

check("falls back to first name when explicit is empty", () => {
  assert.equal(trackballBadgeValue("", "Maya Okafor"), "Maya");
});

check("falls back to 'you' when both empty", () => {
  assert.equal(trackballBadgeValue("", ""), "you");
});

check("truncates to 10 chars", () => {
  assert.equal(trackballBadgeValue("Supercalifragilistic", ""), "Supercalif");
});

// ── trackballBadgeJSON helper (script-context-safe JSON injection) ────────

check("trackballBadgeJSON('', \"O'Brien\") → JSON string \"O'Brien\" (quotes kept, apostrophe survives)", () => {
  const helper = (Handlebars as any).helpers["trackballBadgeJSON"];
  const output: string = helper("", "O'Brien").toString();
  assert.equal(output, "\"O'Brien\"");
  assert.equal(JSON.parse(output), "O'Brien");
});

check("trackballBadgeJSON with </script>-ish label → no literal '<' in output", () => {
  const helper = (Handlebars as any).helpers["trackballBadgeJSON"];
  const output: string = helper("</script><b", "").toString();
  assert.ok(!output.includes("<"), `Output still contains '<': ${output}`);
  // 10-char cap applies before escaping
  assert.equal(JSON.parse(output), "</script><".slice(0, 10));
});

check("trackballBadgeJSON matches safeScriptJson(trackballBadgeValue(...))", () => {
  const helper = (Handlebars as any).helpers["trackballBadgeJSON"];
  assert.equal(helper("Synth", "Maya Okafor").toString(), safeScriptJson(trackballBadgeValue("Synth", "Maya Okafor")));
});

// ── Task B: kbdSkillsData ──────────────────────────────────────────────────

const skills = [
  { category: "Frontend", items: ["React", "Next.js", "Three.js"] },
  { category: "Backend",  items: ["Node.js", "SomeUnknownTool"] },
];

check("React → slug 'react', color '#61dafb', tag 'Frontend'", () => {
  const items = kbdSkillsData(skills);
  const r = items.find((i) => i.label === "React");
  assert.ok(r, "React not found");
  assert.deepEqual(r, { slug: "react", label: "React", tag: "Frontend", color: "#61dafb" });
});

check("Next.js → slug 'nextdotjs'", () => {
  const items = kbdSkillsData(skills);
  const r = items.find((i) => i.label === "Next.js");
  assert.ok(r, "Next.js not found");
  assert.equal(r!.slug, "nextdotjs");
});

check("Three.js → slug 'threedotjs'", () => {
  const items = kbdSkillsData(skills);
  const r = items.find((i) => i.label === "Three.js");
  assert.ok(r, "Three.js not found");
  assert.equal(r!.slug, "threedotjs");
});

check("Node.js → slug 'nodedotjs', tag 'Backend'", () => {
  const items = kbdSkillsData(skills);
  const r = items.find((i) => i.label === "Node.js");
  assert.ok(r, "Node.js not found");
  assert.equal(r!.slug, "nodedotjs");
  assert.equal(r!.tag, "Backend");
});

check("SomeUnknownTool → slug null, kept in output", () => {
  const items = kbdSkillsData(skills);
  const r = items.find((i) => i.label === "SomeUnknownTool");
  assert.ok(r, "SomeUnknownTool not found");
  assert.equal(r!.slug, null);
});

check("kbdSkillsData(undefined) → []", () => {
  assert.deepEqual(kbdSkillsData(undefined), []);
});

// ── Minor 1: hostile-label XSS escaping ───────────────────────────────────

check("kbdSkillsJSON escapes </script> injection — no literal '<' in output", () => {
  const hostile = "</script><script>alert(1)</script>";
  const input = [{ category: "Test", items: [hostile] }];
  const helper = (Handlebars as any).helpers["kbdSkillsJSON"];
  const output: string = helper(input).toString();
  assert.ok(!output.includes("<"), `Output still contains '<': ${output}`);
});

check("kbdSkillsJSON hostile label round-trips via JSON.parse", () => {
  const hostile = "</script><script>alert(1)</script>";
  const input = [{ category: "Test", items: [hostile] }];
  const helper = (Handlebars as any).helpers["kbdSkillsJSON"];
  const output: string = helper(input).toString();
  const parsed: Array<{ label: string }> = JSON.parse(output);
  assert.equal(parsed[0]?.label, hostile);
});

// ── Minor 2: coverage gaps ────────────────────────────────────────────────

check("unknown tool gets default color #5b6478", () => {
  const items = kbdSkillsData([{ category: "Other", items: ["SomeUnknownTool"] }]);
  const r = items.find((i) => i.label === "SomeUnknownTool");
  assert.ok(r, "SomeUnknownTool not found");
  assert.equal(r!.color, "#5b6478");
});

check("object item with description → tag is description (wins over category)", () => {
  const items = kbdSkillsData([
    { category: "Frontend", items: [{ name: "React", description: "UI library" }] },
  ]);
  const r = items.find((i) => i.label === "React");
  assert.ok(r, "React not found");
  assert.equal(r!.tag, "UI library");
});

check("empty/whitespace-only labels are skipped", () => {
  const items = kbdSkillsData([{ category: "Frontend", items: ["", "   ", "React"] }]);
  assert.equal(items.length, 1);
  assert.equal(items[0].label, "React");
});

// ── Fix: empty-items category parity with flattenSkills ───────────────────

check("empty-items category with non-empty name yields one category keycap (slug null, tag '', default color)", () => {
  const items = kbdSkillsData([{ category: "DevOps", items: [] }]);
  assert.equal(items.length, 1, "expected exactly 1 keycap");
  assert.deepEqual(items[0], { slug: null, label: "DevOps", tag: "", color: "#5b6478" });
});

check("[{category:'',items:[]}] yields [] (blank category name treated as absent, parity with flattenSkills)", () => {
  const items = kbdSkillsData([{ category: "", items: [] }]);
  assert.deepEqual(items, []);
});

console.log(fails ? `\nHELPERS: ${fails} failing` : "\nHELPERS: all passing");
process.exit(fails ? 1 : 0);
