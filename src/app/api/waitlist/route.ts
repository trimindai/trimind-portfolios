import { NextRequest, NextResponse } from "next/server";
import { convexClient, serverSecret } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { enforceUserRateLimit } from "@/lib/ratelimit";

// Pragmatic format check — the real guarantee is that we only ever use these
// addresses for a launch announcement, so a bounced address costs nothing.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Public template-waitlist signup (landing page "coming soon" card).
 * Anonymous endpoint, so it is rate-limited per IP instead of per user.
 */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limited = await enforceUserRateLimit(ip, "waitlist", {
      limit: 5,
      windowMs: 60_000,
    });
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const locale = body?.locale === "ar" ? "ar" : "en";
    const source =
      typeof body?.source === "string" ? body.source.slice(0, 64) : undefined;

    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await convexClient.mutation(api.waitlist.join, {
      email,
      locale,
      source,
      serverSecret: serverSecret(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("waitlist error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
