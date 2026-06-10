import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { convexClient, serverSecret } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { enforceUserRateLimit, clientIp } from "@/lib/ratelimit";
import { parseJsonBody } from "@/lib/api-input";

// Pragmatic format check — the real guarantee is that we only ever use these
// addresses for a launch announcement, so a bounced address costs nothing.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const WaitlistSchema = z.object({
  email: z.string().trim().min(3).max(254).regex(EMAIL_RE, "Invalid email"),
  locale: z.enum(["en", "ar"]).default("en"),
  source: z.string().max(64).optional(),
});

/**
 * Public template-waitlist signup (landing page "coming soon" card).
 * Anonymous endpoint, so it is rate-limited per IP instead of per user —
 * keyed on the trusted IP (x-real-ip), not the spoofable leftmost
 * x-forwarded-for entry.
 */
export async function POST(req: NextRequest) {
  try {
    const limited = await enforceUserRateLimit(clientIp(req), "waitlist", {
      limit: 5,
      windowMs: 60_000,
    });
    if (limited) return limited;

    const parsed = await parseJsonBody(req, {
      schema: WaitlistSchema,
      maxBytes: 2 * 1024,
    });
    if (!parsed.ok) return parsed.response;
    const { email, locale, source } = parsed.data;

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
