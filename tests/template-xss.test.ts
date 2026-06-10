import { describe, it, expect } from "vitest";
import {
  renderGeneralTemplate,
  renderEngineerTemplate,
  renderCreativeTemplate,
  renderCreatorTemplate,
  renderDeveloperTemplate,
} from "@/lib/template-engine";

const PAYLOAD = `<img src=x onerror=alert(1)>`;
const QUOTE_BREAKOUT = `https://x.example/" ><img src=y onerror=alert(2)>`;

function maliciousData(templateId: string): any {
  return {
    templateId,
    slug: "xss-test",
    portfolioUrl: "https://portfolio-trimind.com/p/xss-test",
    basics: {
      fullName: `Eve ${PAYLOAD}`,
      title: PAYLOAD,
      bio: `line1\nline2 ${PAYLOAD}`,
      valueProposition: PAYLOAD,
      linkedin: "javascript:alert(1)",
      github: "https://github.com/x",
      website: "javascript:alert(2)",
      resumeUrl: "vbscript:msgbox(1)",
      photoUrl: QUOTE_BREAKOUT,
      email: "a@b.c",
      phone: "+96512345678",
      location: PAYLOAD,
    },
    projects: [
      {
        title: PAYLOAD,
        description: PAYLOAD,
        coverUrl: QUOTE_BREAKOUT,
        url: "javascript:alert(3)",
        slug: "p1",
        tech: [PAYLOAD],
      },
    ],
    skills: [{ category: PAYLOAD, skills: [PAYLOAD] }],
    experience: [
      {
        jobTitle: PAYLOAD,
        company: PAYLOAD,
        description: PAYLOAD,
        startYear: "2020",
        endYear: "2024",
      },
    ],
    education: [],
    achievements: [],
    customization: {},
  };
}

const renderers: Record<string, (d: any) => string> = {
  general: renderGeneralTemplate,
  engineer: renderEngineerTemplate,
  creative: renderCreativeTemplate,
  creator: renderCreatorTemplate,
  developer: renderDeveloperTemplate,
};

describe("published templates neutralize hostile user content", () => {
  for (const [name, render] of Object.entries(renderers)) {
    describe(`${name} template`, () => {
      const html = render(maliciousData(name));

      it("renders non-empty HTML", () => {
        expect(html.length).toBeGreaterThan(1000);
      });

      it("never emits the raw script-bearing payload", () => {
        // Raw (unescaped) payload must never appear. Escaped forms
        // (&lt;… in HTML, <… inside safeScriptJson JSON) are inert.
        expect(html).not.toContain("<img src=x onerror");
        expect(html).not.toContain("<img src=y onerror");
        expect(html).not.toMatch(/<img src=[xy] /);
      });

      it("never emits javascript:/vbscript: URLs in href or src", () => {
        expect(html).not.toMatch(/(href|src)="(javascript|vbscript):/i);
      });

      it("never lets a quoted URL break out of its attribute", () => {
        // The breakout payload's tail must not appear unescaped.
        expect(html).not.toContain(`" ><img src=y`);
      });
    });
  }

  it("general template keeps multi-line bio formatting via <br>, escaped", () => {
    const html = renderGeneralTemplate(maliciousData("general"));
    expect(html).toContain("line1<br>line2");
    expect(html).toContain("&lt;img src&#x3D;x");
  });
});
