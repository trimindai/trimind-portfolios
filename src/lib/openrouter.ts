// Thin OpenRouter chat client for the CV Studio routes (parse-cv, cv-chat).
// Metered key only (OPENROUTER_API_KEY) — never the Max OAuth / claude -p path,
// which isn't multi-tenant safe. Model: google/gemini-2.5-flash.
//
// Ported from /home/trimind/cv-bot/llm_extract.py (the `_call` helper).

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
export const CV_MODEL = "google/gemini-2.5-flash";

export interface ORMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: unknown;
  tool_calls?: unknown;
  tool_call_id?: string;
  name?: string;
}

export interface ORResult {
  message: {
    content?: string | null;
    tool_calls?: Array<{
      id: string;
      type: "function";
      function: { name: string; arguments: string };
    }>;
  };
  usage: { prompt_tokens: number; completion_tokens: number };
}

export async function openrouterChat(opts: {
  messages: ORMessage[];
  model?: string;
  tools?: unknown[];
  tool_choice?: unknown;
  response_format?: unknown;
  temperature?: number;
  maxTokens?: number;
}): Promise<ORResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY not set");

  const payload: Record<string, unknown> = {
    model: opts.model || CV_MODEL,
    messages: opts.messages,
    temperature: opts.temperature ?? 0,
  };
  if (opts.tools) {
    payload.tools = opts.tools;
    payload.tool_choice = opts.tool_choice ?? "auto";
  }
  if (opts.response_format) payload.response_format = opts.response_format;
  if (opts.maxTokens) payload.max_tokens = opts.maxTokens;

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://portfolio-trimind.com",
      "X-Title": "cv-studio",
    },
    body: JSON.stringify(payload),
    // ponytail: Gemini flash parses a CV in a few seconds; 90s upper bound
    // matches the Python client and Vercel's 300s function ceiling.
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${detail.slice(0, 300)}`);
  }
  const body = await res.json();
  return {
    message: body.choices?.[0]?.message ?? {},
    usage: body.usage ?? { prompt_tokens: 0, completion_tokens: 0 },
  };
}

/** Pull the first ```json block (or the whole string) and JSON.parse it. */
export function parseJsonLoose(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = (fenced ? fenced[1] : raw).trim();
  return JSON.parse(text);
}
