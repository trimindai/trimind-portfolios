import { describe, it, expect } from "vitest";
import { CvSchema, toCreateBasics, toUpdatePatch } from "@/lib/cv-schema";
import { toPortfolioData } from "@/lib/portfolio-data";

// Mirror StudioClient's `fallbackPortfolio` — the instant-preview source built
// from the /api/parse-cv response. This is the binding that must hold so the
// preview paints immediately, without waiting on the racy portfolios.get query
// (the "uploaded, says ok, nothing shows" blank-screen class of bug).
function fallbackPortfolioFrom(cv: ReturnType<typeof CvSchema.parse>) {
  return {
    ...toUpdatePatch(cv),
    basics: toCreateBasics(cv),
    templateId: cv.templateId,
    customization: {},
    status: "draft" as const,
  };
}

// A realistic model output — what /api/parse-cv returns in `data`. Includes the
// `null` fields Gemini emits for a real, incomplete CV and an empty experience
// row the mapper must drop.
const raw = {
  is_cv: true,
  confidence: 0.9,
  templateId: "engineer",
  basics: {
    fullName: "Sara Al-Ahmad",
    title: "Petroleum Engineer",
    summary: "Senior petroleum engineer with reservoir simulation expertise.",
    email: "sara@example.com",
    phone: null,
    languages: [
      { name: "Arabic", level: "Native" },
      { name: "English", level: null },
    ],
  },
  experience: [
    { title: "Reservoir Engineer", company: "KOC", startDate: "2019", endDate: null, highlights: ["Led field-wide study"] },
    { title: "", company: "" },
  ],
  skills: [{ category: "Technical", items: ["Petrel", "Eclipse"] }],
  projects: [],
  education: [{ degree: "BSc Petroleum Eng", institution: "Kuwait University", year: "2018" }],
  certifications: [],
  languages: [],
};

describe("instant preview binds from the /api/parse-cv response", () => {
  it("CvSchema accepts a real-world payload containing nulls (no 500)", () => {
    const cv = CvSchema.parse(raw);
    expect(cv.is_cv).toBe(true);
    expect(cv.basics.fullName).toBe("Sara Al-Ahmad");
  });

  it("fallbackPortfolio → toPortfolioData yields bound data (no blank screen)", () => {
    const cv = CvSchema.parse(raw);
    const data = toPortfolioData(fallbackPortfolioFrom(cv), "en");
    expect(data).not.toBeNull();
    expect(data.basics.fullName).toBe("Sara Al-Ahmad");
    expect(data.basics.title).toBe("Petroleum Engineer");
    expect(data.templateId).toBe("engineer");
    // empty experience row dropped, real one kept
    expect(data.experience).toHaveLength(1);
    expect((data.experience as any)[0].company).toBe("KOC");
    expect(data.skills).toHaveLength(1);
    expect(data.education).toHaveLength(1);
  });

  it("AR locale sets RTL on the bound preview", () => {
    const cv = CvSchema.parse({ ...raw, templateId: "general" });
    const data = toPortfolioData(fallbackPortfolioFrom(cv), "ar");
    expect(data.isRTL).toBe(true);
  });

  it("a sparse CV (name only) still binds — preview never blanks", () => {
    const cv = CvSchema.parse({ is_cv: true, basics: { fullName: "Jo", title: "", email: "" } });
    const data = toPortfolioData(fallbackPortfolioFrom(cv), "en");
    expect(data.basics.fullName).toBe("Jo");
    expect(data.templateId).toBe("general");
  });
});
