import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  renderGeneralTemplate,
  renderEngineerTemplate,
  renderCreativeTemplate,
  renderCreatorTemplate,
  renderDeveloperTemplate,
} from "@/lib/template-engine";
import { resolveTemplateId } from "@/lib/templates";
import { enforceUserRateLimit } from "@/lib/ratelimit";
import { parseJsonBody } from "@/lib/api-input";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = await enforceUserRateLimit(userId, "render-template", {
      limit: 20,
      windowMs: 60_000,
    });
    if (limited) return limited;

    // Render input is the full portfolio (many projects/blocks) → larger cap,
    // size-only (no schema: the template engine consumes the whole object).
    // 2 MB fits an inline base64 photo on top of a near-1 MiB Convex doc; the
    // old 512 KB cap rejected any portfolio with a real photo as 413.
    const parsed = await parseJsonBody(req, { maxBytes: 2 * 1024 * 1024 });
    if (!parsed.ok) return parsed.response;
    const data = parsed.data as any;

    const templateId = resolveTemplateId(data.templateId);
    const renderers: Record<string, (d: any) => string> = {
      general: renderGeneralTemplate,
      engineer: renderEngineerTemplate,
      creative: renderCreativeTemplate,
      creator: renderCreatorTemplate,
      developer: renderDeveloperTemplate,
    };
    const render = renderers[templateId] || renderGeneralTemplate;
    const html = render(data);
    return NextResponse.json({ html });
  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}
