import { describe, it, expect } from "vitest";
import { buildUserContent, type Img } from "@/lib/cv-content";

const img = (mime: string): Img => ({ buf: Buffer.from("x"), mime });

describe("buildUserContent (multi-file CV parse)", () => {
  it("returns plain text when no images", () => {
    expect(buildUserContent("hello", undefined, 100)).toBe("hello");
  });

  it("clips text to maxChars", () => {
    expect(buildUserContent("abcdef", [], 3)).toBe("abc");
  });

  it("emits one image_url part per image plus the combined text", () => {
    const out = buildUserContent("notes", [img("image/png"), img("application/pdf")], 100) as any[];
    expect(Array.isArray(out)).toBe(true);
    expect(out[0].type).toBe("text");
    expect(out[0].text).toContain("notes");
    const images = out.filter((p) => p.type === "image_url");
    expect(images).toHaveLength(2);
    expect(images[0].image_url.url.startsWith("data:image/png;base64,")).toBe(true);
    expect(images[1].image_url.url.startsWith("data:application/pdf;base64,")).toBe(true);
  });

  it("uses the image-only prompt when there is no text", () => {
    const out = buildUserContent(null, [img("image/jpeg")], 100) as any[];
    expect(out[0].text).not.toContain("combined");
    expect(out.filter((p) => p.type === "image_url")).toHaveLength(1);
  });
});
