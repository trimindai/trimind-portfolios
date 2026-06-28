import { describe, it, expect } from "vitest";
import { pickUsableFiles } from "@/lib/file-pick";

// Fake File — only .name/.size matter to pickUsableFiles.
const f = (name: string, size: number) => ({ name, size }) as File;

describe("pickUsableFiles (CV Studio upload — iOS FileList + iCloud guard)", () => {
  it("cancelled picker (null) → picked 0, no files (stay silent)", () => {
    expect(pickUsableFiles(null)).toEqual({ picked: 0, usable: [] });
  });

  it("empty selection → picked 0 (stay silent, no error)", () => {
    expect(pickUsableFiles([])).toEqual({ picked: 0, usable: [] });
  });

  it("normal files attach in order", () => {
    const out = pickUsableFiles([f("cv.pdf", 1234), f("more.docx", 5678)]);
    expect(out.picked).toBe(2);
    expect(out.usable.map((x) => x.name)).toEqual(["cv.pdf", "more.docx"]);
  });

  it("iCloud 0-byte file → picked>0 but usable empty (triggers the hint, not silence)", () => {
    const out = pickUsableFiles([f("icloud.pdf", 0)]);
    expect(out.picked).toBe(1);
    expect(out.usable).toEqual([]);
  });

  it("drops only the empty ones, keeps the real file", () => {
    const out = pickUsableFiles([f("empty.pdf", 0), f("real.pdf", 9)]);
    expect(out.usable.map((x) => x.name)).toEqual(["real.pdf"]);
  });

  // The iOS regression: the live FileList is emptied (input.value = "") right
  // after onChange. pickUsableFiles must snapshot synchronously so a later read
  // can't lose the file.
  it("snapshots synchronously — clearing the source afterwards keeps the picks", () => {
    const live: File[] = [f("cv.pdf", 100)];
    const out = pickUsableFiles(live);
    live.length = 0; // simulate input.value = "" clearing the live FileList
    expect(out.usable).toHaveLength(1);
    expect(out.usable[0].name).toBe("cv.pdf");
  });
});
