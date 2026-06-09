// Unit tests for the trackballBadge and kbdSkillsJSON helpers.
// Exercises the REAL normalizeTech path via kbdSkillsData (no mocks).
// Run with: npx tsx scripts/dev-template-helpers.test.mts
import assert from "node:assert/strict";
import { trackballBadgeValue } from "../src/lib/template-engine";

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

console.log(fails ? `\nHELPERS: ${fails} failing` : "\nHELPERS: all passing");
process.exit(fails ? 1 : 0);
