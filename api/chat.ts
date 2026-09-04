import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { AgentInputItem } from "@openai/agents";

/**
 * Chat endpoint for the "Nomi" recipe assistant experiment
 * (src/components/ChatBot.tsx, src/app/experiments/chatbot).
 *
 * This lives in a top-level /api directory rather than a Next.js route
 * handler because next.config.ts sets output: "export" — the app itself
 * has no server at runtime (see docs/architecture.md). Vercel treats any
 * file under /api as its own standalone serverless function regardless of
 * that, so it deploys alongside the static export on the same domain
 * (same-origin fetch from the client, no CORS setup needed) without
 * requiring the app to give up static export. See docs/architecture.md's
 * "Recipe chatbot (Nomi) backend" section for the full rationale.
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as { message?: unknown; history?: unknown; locale?: unknown };
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const locale: Locale = body.locale === "en" ? "en" : "da";

  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const history: ChatMessage[] = Array.isArray(body.history)
    ? body.history.filter(isChatMessage).slice(-20)
    : [];

  try {
    const reply = process.env.OPENAI_API_KEY
      ? await runAgent(message, history)
      : mockReply(message, locale);
    res.status(200).json({ reply });
  } catch (err) {
    console.error("nomi chat endpoint failed", err);
    res.status(500).json({ error: "Nomi could not respond right now." });
  }
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
