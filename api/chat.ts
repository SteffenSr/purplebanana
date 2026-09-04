import type { AgentInputItem } from "@openai/agents";

/**
 * Chat endpoint for the "Nomi" recipe assistant experiment
 * (src/components/ChatBot.tsx, src/app/experiments/chatbot).
 *
 * This lives in a top-level /api directory rather than a Next.js route
 * handler because next.config.ts sets output: "export" — the app itself
 * has no server at runtime (see docs/architecture.md). Vercel treats any
 * file under /api as its own standalone Vercel Function regardless of
 * that, so it deploys alongside the static export on the same domain
 * (same-origin fetch from the client, no CORS setup needed) without
 * requiring the app to give up static export. See docs/architecture.md's
 * "Recipe chatbot (Nomi) backend" section for the full rationale.
 *
 * Uses the Web-standard Request/Response handler shape (`export default {
 * fetch(request) {...} }`), the shape Vercel's own current docs show for a
 * root-level /api file — not the older Node `(req, res)` signature.
 *
 * package.json's root-level "type": "module" is load-bearing, not
 * cosmetic — it's why this file compiles and loads at all. Vercel reads
 * this project's root tsconfig.json to compile files under /api, and that
 * tsconfig sets "module": "esnext" for the Next.js app's own bundler.
 * Applied to this file too, that leaves a literal `export default ...` in
 * the compiled api/chat.js; without "type": "module", Node treats a plain
 * .js as CommonJS and its require() chokes on that syntax with
 * SyntaxError: Unexpected token 'export' — surfacing on Vercel as
 * FUNCTION_INVOCATION_FAILED on every invocation, before any of this
 * file's own code runs. (Renaming the source file to .mts was tried
 * first, since Node always treats .mjs/.mts-derived output as ESM by
 * extension regardless of package.json/tsconfig — but Vercel's /api
 * function detection for this project doesn't recognize .mts as a
 * function source file at all, so the route 404'd outright instead of
 * building. "type": "module" was the fix that actually worked.) See
 * docs/architecture.md's "Recipe chatbot (Nomi) backend" section for the
 * full story, including why the handler shape above was a red herring.
 *
 * Until OPENAI_API_KEY is configured (Vercel project env var), this
 * returns canned mock replies so the chat UI is fully exercisable without
 * a real model behind it. Once the key is set, requests run through the
 * OpenAI Agents SDK instead — see runAgent() below.
 */

type Role = "user" | "assistant";

interface ChatMessage {
  role: Role;
  content: string;
}

type Locale = "da" | "en";

const NOMI_INSTRUCTIONS = `You are Nomi, the friendly in-app assistant for Kitchen Recipes, a vegan
recipe app. Answer in the same language the user writes in (Danish or
English) — Danish is the app's primary language. Keep replies short and
practical, suitable for someone standing in a kitchen. Every suggestion
you give must be vegan (no meat, fish, dairy, eggs, or honey) — offer a
plant-based swap instead of a non-vegan ingredient.`;

const chatFunction = {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, { Allow: "POST" });
    }

    let body: { message?: unknown; history?: unknown; locale?: unknown };
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";
    const locale: Locale = body.locale === "en" ? "en" : "da";

    if (!message) {
      return json({ error: "message is required" }, 400);
    }

    const history: ChatMessage[] = Array.isArray(body.history)
      ? body.history.filter(isChatMessage).slice(-20)
      : [];

    try {
      const reply = process.env.OPENAI_API_KEY
        ? await runAgent(message, history)
        : mockReply(message, locale);
      return json({ reply }, 200);
    } catch (err) {
      console.error("nomi chat endpoint failed", err);
      return json({ error: "Nomi could not respond right now." }, 500);
    }
  },
};

export default chatFunction;

function json(data: unknown, status: number, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

function isChatMessage(value: unknown): value is ChatMessage {
  return (
    !!value &&
    typeof value === "object" &&
    ((value as ChatMessage).role === "user" || (value as ChatMessage).role === "assistant") &&
    typeof (value as ChatMessage).content === "string"
  );
}

async function runAgent(message: string, history: ChatMessage[]): Promise<string> {
  const { Agent, run } = await import("@openai/agents");

  const nomi = new Agent({
    name: "Nomi",
    instructions: NOMI_INSTRUCTIONS,
  });

  const input = [...history.map(toAgentInputItem), { role: "user" as const, content: message }];

  const result = await run(nomi, input);
  return result.finalOutput?.trim() || "…";
}

function toAgentInputItem(m: ChatMessage): AgentInputItem {
  if (m.role === "user") {
    return { role: "user", content: m.content };
  }
  return { role: "assistant", status: "completed", content: [{ type: "output_text", text: m.content }] };
}

/**
 * Canned answers used until OPENAI_API_KEY is set. Picked deterministically
 * from the message text (not randomly) so the same question gets the same
 * mock answer, which makes the mock behavior easier to reason about while
 * testing the chat UI.
 */
const MOCK_REPLIES: Record<Locale, string[]> = {
  da: [
    "Det lyder lækkert! Prøv at riste krydderierne kort i lidt olie, før resten af ingredienserne kommer i gryden — det får meget mere smag frem.",
    "Godt spørgsmål. Linser eller kikærter sammen med fuldkornsris giver alle de essentielle aminosyrer, så det er et solidt proteinvalg i en vegansk ret.",
    "Til en cremet konsistens uden mejeriprodukter kan du bruge kokosmælk eller en håndfuld blødlagte cashewnødder blendet med lidt vand.",
    "Jeg er stadig en tidlig testudgave af Nomi og har ikke forbindelse til en rigtig model endnu — men generelt vil jeg starte med at smage til med salt og syre (citron eller eddike) til sidst, det løfter de fleste retter.",
  ],
  en: [
    "That sounds delicious! Try toasting your spices briefly in a little oil before the rest of the ingredients go into the pot — it brings out a lot more flavor.",
    "Good question. Lentils or chickpeas paired with whole grains like rice cover all the essential amino acids, so that's a solid protein choice for a vegan dish.",
    "For a creamy texture without dairy, try coconut milk or a handful of soaked cashews blended with a little water.",
    "I'm still an early test version of Nomi and not connected to a real model yet — but as a general rule, finish by adjusting salt and acid (lemon or vinegar), it lifts most dishes.",
  ],
};

function mockReply(message: string, locale: Locale): string {
  const pool = MOCK_REPLIES[locale];
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    hash = (hash * 31 + message.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length] ?? pool[0] ?? "";
}
