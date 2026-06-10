import { describe, it, expect } from "vitest";
import { secureCompare } from "@/lib/secure-compare";

describe("secureCompare", () => {
  it("matches equal strings", () => {
    expect(secureCompare("abc123", "abc123")).toBe(true);
  });
  it("rejects different strings of same length", () => {
    expect(secureCompare("abc123", "abc124")).toBe(false);
  });
  it("rejects different lengths", () => {
    expect(secureCompare("abc", "abc123")).toBe(false);
  });
  it("rejects null/undefined/empty on either side", () => {
    expect(secureCompare(null, "x")).toBe(false);
    expect(secureCompare("x", undefined)).toBe(false);
    expect(secureCompare("", "")).toBe(false);
    expect(secureCompare(undefined, undefined)).toBe(false);
  });
  it("handles unicode", () => {
    expect(secureCompare("سرّ", "سرّ")).toBe(true);
    expect(secureCompare("سرّ", "سر")).toBe(false);
  });
});
