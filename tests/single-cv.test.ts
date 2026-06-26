import { describe, it, expect } from "vitest";
import { pickPrimaryPortfolio } from "@/lib/single-cv";

describe("pickPrimaryPortfolio (one CV per user)", () => {
  it("returns null for empty/undefined", () => {
    expect(pickPrimaryPortfolio([])).toBeNull();
    expect(pickPrimaryPortfolio(undefined)).toBeNull();
  });

  it("picks the most recently edited when all are drafts", () => {
    const out = pickPrimaryPortfolio([
      { _id: "a", status: "draft", lastEditedAt: 100 },
      { _id: "b", status: "draft", lastEditedAt: 300 },
      { _id: "c", status: "draft", lastEditedAt: 200 },
    ]);
    expect(out?._id).toBe("b");
  });

  it("NEVER strands a paying user: a paid/published CV wins over a newer draft", () => {
    const out = pickPrimaryPortfolio([
      { _id: "paid", status: "published", lastEditedAt: 100 },
      { _id: "newdraft", status: "draft", lastEditedAt: 999 },
    ]);
    expect(out?._id).toBe("paid");
  });

  it("among paid/published, picks the most recent paid one", () => {
    const out = pickPrimaryPortfolio([
      { _id: "old", status: "paid", lastEditedAt: 100 },
      { _id: "new", status: "published", lastEditedAt: 500 },
    ]);
    expect(out?._id).toBe("new");
  });

  it("falls back to _creationTime when lastEditedAt is absent", () => {
    const out = pickPrimaryPortfolio([
      { _id: "a", status: "draft", _creationTime: 10 },
      { _id: "b", status: "draft", _creationTime: 20 },
    ]);
    expect(out?._id).toBe("b");
  });
});
