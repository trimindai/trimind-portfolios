import { describe, it, expect } from "vitest";
import { portfolioReady } from "@/lib/studio-view";

const doc = { _id: "p1" };

describe("portfolioReady (CV Studio render gate)", () => {
  it("no portfolio id yet → not ready (upload screen)", () => {
    expect(portfolioReady(null, undefined)).toBe(false);
  });

  // The regression: id set, query still loading/skipped. Must NOT be 'ready',
  // otherwise the studio renders with no preview data → blank screen.
  it("id set but doc still loading (undefined) → not ready (show spinner)", () => {
    expect(portfolioReady("p1", undefined)).toBe(false);
  });

  it("id set but doc null (not found / not owner) → not ready", () => {
    expect(portfolioReady("p1", null)).toBe(false);
  });

  it("id set and doc loaded → ready (show two-pane studio)", () => {
    expect(portfolioReady("p1", doc)).toBe(true);
  });
});
