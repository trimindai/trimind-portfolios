import { NextRequest, NextResponse } from "next/server";
import { renderCorporateTemplate } from "@/lib/template-engine";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const html = renderCorporateTemplate(data);
    return NextResponse.json({ html });
  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}
