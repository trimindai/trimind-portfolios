// Clerk-gated Studio chat. The model drives a FIXED tool set — it can ONLY call
// these eight functions, each of which maps to a validated patch applied through
// the user-scoped portfolios.update mutation. This is what keeps it practical:
// not "AI does anything", but a small, safe set of edits to the user's own draft.
//
// Tools: setColors, setFont, toggleSection, reorderSections, rewriteField,
//        addItem, removeItem, switchTemplate.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { enforceUserRateLimit } from "@/lib/ratelimit";
import { enforceFreeTier, AI_COST } from "@/lib/freeTier";
import { parseJsonBody } from "@/lib/api-input";
import { convexClientForUser } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { openrouterChat, type ORMessage } from "@/lib/openrouter";
import { TEMPLATE_IDS } from "@/lib/cv-schema";

export const maxDuration = 120;

const HEX = /^#[0-9a-fA-F]{6}$/;
const ARRAY_SECTIONS = [
  "experience",
  "projects",
  "skills",
  "education",
  "certifications",
  "languages",
  "endorsements",
] as const;

const Body = z.object({
  portfolioId: z.string().min(1).max(64),
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .max(20)
    .optional(),
});

// ── tool definitions (OpenRouter/OpenAI function format) ─────────────────────
const TOOLS = [
  {
    type: "function",
    function: {
      name: "setColors",
      description: "Set the portfolio's primary, accent, and/or background colours.",
      parameters: {
        type: "object",
        properties: {
          primary: { type: "string", description: "hex e.g. #0F172A" },
          accent: { type: "string", description: "hex e.g. #059669" },
          bg: { type: "string", description: "hex e.g. #FFFFFF" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "setFont",
      description: "Set the heading and/or body font family by name.",
      parameters: {
        type: "object",
        properties: {
          heading: { type: "string" },
          body: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "toggleSection",
      description: "Show or hide a portfolio section by its id.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          visible: { type: "boolean" },
        },
        required: ["id", "visible"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reorderSections",
      description: "Reorder sections (best effort; the template controls layout).",
      parameters: {
        type: "object",
        properties: {
          order: { type: "array", items: { type: "string" } },
        },
        required: ["order"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "rewriteField",
      description:
        "Rewrite/improve the copy of one field. path is 'summary', or '<section>.<index>.description' e.g. 'experience.0.description'.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string" },
          instruction: { type: "string" },
        },
        required: ["path", "instruction"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "addItem",
      description:
        "Add one item to a list section. section ∈ experience|projects|skills|education|certifications|languages|endorsements. item is an object matching that section's shape.",
      parameters: {
        type: "object",
        properties: {
          section: { type: "string" },
          item: { type: "object" },
        },
        required: ["section", "item"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "removeItem",
      description: "Remove the item at 0-based index from a list section.",
      parameters: {
        type: "object",
        properties: {
          section: { type: "string" },
          index: { type: "number" },
        },
        required: ["section", "index"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "switchTemplate",
      description: `Switch the template. templateId ∈ ${TEMPLATE_IDS.join("|")}.`,
      parameters: {
        type: "object",
        properties: { templateId: { type: "string" } },
        required: ["templateId"],
      },
    },
  },
];

function summarize(p: any): string {
  const c = p.customization || {};
  const counts = ARRAY_SECTIONS.map(
    (k) => `${k}:${Array.isArray(p[k]) ? p[k].length : 0}`
  ).join(", ");
  return [
    `template=${p.templateId}`,
    `colors={primary:${c.primaryColor || "default"}, accent:${
      c.accentColor || "default"
    }, bg:${c.bgColor || "default"}}`,
    `fonts={heading:${c.fontFamily || "default"}, body:${c.bodyFont || "default"}}`,
    `hiddenSections=[${(c.hiddenSections || []).join(", ")}]`,
    `itemCounts={${counts}}`,
  ].join("\n");
}

// Rewrite one field's copy with a focused generation call.
async function rewrite(
  current: string,
  field: string,
  instruction: string
): Promise<string> {
  const { message } = await openrouterChat({
    temperature: 0.4,
    maxTokens: 500,
    messages: [
      {
        role: "system",
        content:
          "You improve CV/portfolio copy. Rewrite the given field. Keep it truthful — " +
          "never invent facts, employers, dates or numbers. Preserve the original language " +
          "(Arabic stays Arabic). Return ONLY the improved text, no quotes, no preamble.",
      },
      {
        role: "user",
        content: `Field: ${field}\nInstruction: ${instruction}\nCurrent text:\n${
          current || "(empty)"
        }`,
      },
    ],
  });
  const out = typeof message.content === "string" ? message.content.trim() : "";
  return out || current;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const burst = await enforceUserRateLimit(userId, "cv-chat", {
      limit: 20,
      windowMs: 60_000,
    });
    if (burst) return burst;
    const daily = await enforceUserRateLimit(userId, "cv-chat-daily", {
      limit: 120,
      windowMs: 24 * 60 * 60 * 1000,
      message: "Daily chat limit reached. Try again tomorrow.",
    });
    if (daily) return daily;
    const trial = await enforceFreeTier(userId, AI_COST.chat);
    if (trial) return trial;

    const parsed = await parseJsonBody(req, { schema: Body, maxBytes: 64 * 1024 });
    if (!parsed.ok) return parsed.response;
    const { portfolioId, message, history } = parsed.data;

    const client = await convexClientForUser();
    // Ownership: get() enforces owner-or-admin and throws otherwise.
    let portfolio: any;
    try {
      portfolio = await client.query(api.portfolios.get, {
        id: portfolioId as Id<"portfolios">,
      });
    } catch {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!portfolio) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const system =
      "You are the CV Studio assistant for portfolio-trimind.com. You help the user " +
      "refine THEIR portfolio by calling the provided tools — never claim to change " +
      "anything you didn't call a tool for. After acting, reply in ONE or two short " +
      "sentences, in the user's language (Arabic or English). If the request is unclear " +
      "or outside the tools, ask a brief clarifying question instead of guessing.\n\n" +
      "Section ids you may show/hide: credentials, value-proposition, career, impact, " +
      "competencies, education, professional-profile, endorsements, content-showcase, " +
      "social-stats, experience, skills, certifications, languages.\n\n" +
      "Current portfolio state:\n" +
      summarize(portfolio);

    const messages: ORMessage[] = [
      { role: "system", content: system },
      ...((history || []).map((h) => ({ role: h.role, content: h.content })) as ORMessage[]),
      { role: "user", content: message },
    ];

    // Round 1: let the model choose tools.
    const r1 = await openrouterChat({ messages, tools: TOOLS });
    const toolCalls = r1.message.tool_calls || [];

    if (toolCalls.length === 0) {
      const reply =
        (typeof r1.message.content === "string" && r1.message.content.trim()) ||
        "How would you like to refine your portfolio?";
      return NextResponse.json({ reply, portfolio });
    }

    // Apply the tool calls onto a working copy, then one update().
    const cust: Record<string, unknown> = { ...(portfolio.customization || {}) };
    const patch: Record<string, unknown> = {};
    let custTouched = false;
    const applied: string[] = [];
    const toolResults: ORMessage[] = [];

    const arr = (section: string): any[] | null =>
      (ARRAY_SECTIONS as readonly string[]).includes(section)
        ? Array.isArray(patch[section])
          ? (patch[section] as any[])
          : Array.isArray(portfolio[section])
            ? [...portfolio[section]]
            : []
        : null;

    for (const call of toolCalls) {
      const name = call.function?.name;
      let args: any = {};
      try {
        args = JSON.parse(call.function?.arguments || "{}");
      } catch {}
      let result = "ok";
      try {
        switch (name) {
          case "setColors": {
            if (HEX.test(args.primary || "")) {
              cust.primaryColor = args.primary;
              custTouched = true;
            }
            if (HEX.test(args.accent || "")) {
              cust.accentColor = args.accent;
              custTouched = true;
            }
            if (HEX.test(args.bg || "")) {
              cust.bgColor = args.bg;
              custTouched = true;
            }
            if (!custTouched) result = "no valid hex colours provided";
            else applied.push("colours");
            break;
          }
          case "setFont": {
            if (typeof args.heading === "string" && args.heading.trim()) {
              cust.fontFamily = args.heading.trim();
              custTouched = true;
            }
            if (typeof args.body === "string" && args.body.trim()) {
              cust.bodyFont = args.body.trim();
              custTouched = true;
            }
            applied.push("fonts");
            break;
          }
          case "toggleSection": {
            const id = String(args.id || "");
            const hidden = new Set<string>(
              (cust.hiddenSections as string[]) || []
            );
            if (args.visible) hidden.delete(id);
            else hidden.add(id);
            cust.hiddenSections = [...hidden];
            custTouched = true;
            applied.push(`section ${id} ${args.visible ? "shown" : "hidden"}`);
            break;
          }
          case "reorderSections": {
            // ponytail: no per-section order field exists in the data model;
            // the template controls layout. Honest no-op so the model doesn't
            // claim a change that wouldn't render. Upgrade path: add a
            // customization.sectionOrder + teach the template engine to honour it.
            result =
              "Section order follows the chosen template and can't be reordered individually yet.";
            break;
          }
          case "rewriteField": {
            const path = String(args.path || "");
            const instruction = String(args.instruction || "");
            if (path === "summary" || path === "bio" || path === "basics.summary") {
              const basics = (patch.basics as any) || { ...portfolio.basics };
              const next = await rewrite(
                basics.summary || basics.bio || "",
                "professional summary",
                instruction
              );
              basics.summary = next;
              basics.bio = next;
              patch.basics = basics;
              applied.push("summary");
            } else {
              const m = path.match(/^(\w+)\.(\d+)\.(\w+)$/);
              if (m && (ARRAY_SECTIONS as readonly string[]).includes(m[1])) {
                const [, section, idxStr, field] = m;
                const list = arr(section)!;
                const i = Number(idxStr);
                if (list[i] && typeof list[i][field] !== "undefined") {
                  list[i] = {
                    ...list[i],
                    [field]: await rewrite(
                      String(list[i][field] || ""),
                      `${section} ${field}`,
                      instruction
                    ),
                  };
                  patch[section] = list;
                  applied.push(path);
                } else {
                  result = `no field at ${path}`;
                }
              } else {
                result = `unsupported path '${path}'`;
              }
            }
            break;
          }
          case "addItem": {
            const list = arr(String(args.section));
            if (!list) result = "unknown section";
            else if (args.item && typeof args.item === "object") {
              list.push(args.item);
              patch[args.section] = list;
              applied.push(`added to ${args.section}`);
            } else result = "missing item";
            break;
          }
          case "removeItem": {
            const list = arr(String(args.section));
            const i = Number(args.index);
            if (!list) result = "unknown section";
            else if (i >= 0 && i < list.length) {
              list.splice(i, 1);
              patch[args.section] = list;
              applied.push(`removed ${args.section}[${i}]`);
            } else result = "index out of range";
            break;
          }
          case "switchTemplate": {
            if ((TEMPLATE_IDS as readonly string[]).includes(args.templateId)) {
              patch.templateId = args.templateId;
              applied.push(`template → ${args.templateId}`);
            } else result = "unknown templateId";
            break;
          }
          default:
            result = "unknown tool";
        }
      } catch (e) {
        result = `failed: ${String(e).slice(0, 120)}`;
      }
      toolResults.push({
        role: "tool",
        tool_call_id: call.id,
        content: result,
      });
    }

    if (custTouched) patch.customization = cust;

    // Persist (one mutation). Convex re-validates every field's shape.
    let updateError: string | null = null;
    if (Object.keys(patch).length > 0) {
      try {
        await client.mutation(api.portfolios.update, {
          id: portfolioId as Id<"portfolios">,
          ...(patch as any),
        });
      } catch (e) {
        updateError = String(e);
        console.error("[cv-chat] update failed:", e);
      }
    }

    // Round 2: a short natural-language confirmation in the user's language.
    let reply = "";
    try {
      const r2 = await openrouterChat({
        tool_choice: "none",
        tools: TOOLS,
        messages: [
          ...messages,
          { role: "assistant", content: r1.message.content ?? "", tool_calls: toolCalls },
          ...toolResults,
          updateError
            ? {
                role: "system",
                content:
                  "The update failed to save. Apologise briefly and ask the user to rephrase.",
              }
            : {
                role: "system",
                content:
                  "Confirm what changed in one or two short sentences, in the user's language.",
              },
        ],
      });
      reply = typeof r2.message.content === "string" ? r2.message.content.trim() : "";
    } catch {
      /* fall through to deterministic reply */
    }
    if (!reply) {
      reply = updateError
        ? "Sorry, I couldn't apply that — please rephrase."
        : applied.length
          ? `Done: ${applied.join("; ")}.`
          : "I couldn't apply that change.";
    }

    // Re-fetch so the client gets the fresh doc (it also live-updates via Convex).
    let fresh = portfolio;
    try {
      fresh = await client.query(api.portfolios.get, {
        id: portfolioId as Id<"portfolios">,
      });
    } catch {}

    return NextResponse.json({ reply, portfolio: fresh });
  } catch (error) {
    console.error("[cv-chat] error:", error);
    return NextResponse.json(
      { error: "Chat failed. Please try again." },
      { status: 500 }
    );
  }
}
