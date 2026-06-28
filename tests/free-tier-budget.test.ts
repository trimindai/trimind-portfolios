import { describe, it, expect } from "vitest";
import { withinBudget, FREE_AI_CREDIT_BUDGET as B } from "../convex/freeTier";

describe("free-tier budget", () => {
  it("allows a charge that lands exactly on the budget", () => {
    expect(withinBudget(B - 10, 10, B)).toBe(true);
  });
  it("rejects a charge that would exceed the budget", () => {
    expect(withinBudget(B - 9, 10, B)).toBe(false);
  });
  it("rejects once spent equals budget", () => {
    expect(withinBudget(B, 1, B)).toBe(false);
  });
  it("allows the first charge of a fresh user", () => {
    expect(withinBudget(0, 10, B)).toBe(true);
  });
});
