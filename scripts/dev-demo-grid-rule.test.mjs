// Unit test for the pure layout helpers embedded in keyboard.js.
// We extract the marker-bracketed source so the test exercises the REAL code
// (single source of truth — the functions live only in keyboard.js).
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(resolve(HERE, "../public/demo/developer/keyboard.js"), "utf8");

function extract(tag) {
  const m = SRC.match(new RegExp("/\\*__" + tag + "_START__\\*/([\\s\\S]*?)/\\*__" + tag + "_END__\\*/"));
  if (!m) throw new Error(`marker __${tag}__ not found in keyboard.js`);
  return m[1];
}

const kbdGrid = new Function(extract("KBD_GRID") + "\nreturn kbdGrid;")();

let fails = 0;
function check(name, fn) { try { fn(); console.log("  ok  -", name); } catch (e) { fails++; console.log("  FAIL-", name, "\n      ", e.message); } }

// The rule table from the spec.
const cases = [
  [8,  { rows: 4, cols: 4 }],
  [16, { rows: 4, cols: 4 }],
  [17, { rows: 4, cols: 5 }],
  [20, { rows: 4, cols: 5 }],  // Maya
  [21, { rows: 4, cols: 6 }],
  [24, { rows: 4, cols: 6 }],
  [25, { rows: 4, cols: 7 }],
  [28, { rows: 4, cols: 7 }],
  [29, { rows: 5, cols: 7 }],
  [34, { rows: 5, cols: 7 }],  // Wadhah
  [35, { rows: 5, cols: 7 }],
  [36, { rows: 6, cols: 7 }],
  [42, { rows: 6, cols: 7 }],
  [43, { rows: 7, cols: 7 }],
];
for (const [n, want] of cases) {
  check(`kbdGrid(${n}) = ${want.rows}x${want.cols}`, () => assert.deepEqual(kbdGrid(n), want));
}
// Capacity must always hold enough slots for the stack.
check("capacity >= n for 1..60", () => {
  for (let n = 1; n <= 60; n++) { const g = kbdGrid(n); assert.ok(g.rows * g.cols >= n, `n=${n} -> ${g.rows}x${g.cols}`); }
});
// Columns never exceed 7; minimum 4 columns and 4 rows.
check("bounds: 4<=cols<=7, rows>=4", () => {
  for (let n = 1; n <= 60; n++) { const g = kbdGrid(n); assert.ok(g.cols >= 4 && g.cols <= 7 && g.rows >= 4, `n=${n}`); }
});

const kbdFitScale = new Function(extract("KBD_FIT") + "\nreturn kbdFitScale;")();

// Representative world-space viewport sizes at the board plane (from the camera
// formula vpH = 2*tan(fov/2)*|camZ|, vpW = vpH*aspect):
//   phone   : fov 58, camZ 10.0, aspect 390/844  -> vpH ~= 11.09, vpW ~= 5.12
//   desktop : fov 40, camZ 11.6, aspect 1440/900 -> vpH ~=  8.44, vpW ~= 13.5
const PH = { vpW: 5.12, vpH: 11.09 }, DK = { vpW: 13.5, vpH: 8.44 };
const boardW = (cols) => cols * 1.0, boardD = (rows) => rows * 1.0; // CG = RG = 1.0

check("fit: Maya phone (4x5) not shrunk below showcase 0.92", () =>
  assert.ok(kbdFitScale(boardW(5), boardD(4), PH.vpW, PH.vpH) >= 0.92,
    "fit=" + kbdFitScale(boardW(5), boardD(4), PH.vpW, PH.vpH)));
check("fit: Maya desktop (4x5) not shrunk below 1.0", () =>
  assert.ok(kbdFitScale(boardW(5), boardD(4), DK.vpW, DK.vpH) >= 1.0));
check("fit: 7-col phone shrinks below 0.92", () =>
  assert.ok(kbdFitScale(boardW(7), boardD(5), PH.vpW, PH.vpH) < 0.92));
check("fit: monotonic decrease as columns grow (phone)", () => {
  const a = kbdFitScale(boardW(5), boardD(4), PH.vpW, PH.vpH);
  const b = kbdFitScale(boardW(6), boardD(4), PH.vpW, PH.vpH);
  const c = kbdFitScale(boardW(7), boardD(5), PH.vpW, PH.vpH);
  assert.ok(a > b && b > c, `${a} ${b} ${c}`);
});

console.log(fails ? `\nGRID: ${fails} failing` : "\nGRID: all passing");
process.exit(fails ? 1 : 0);
