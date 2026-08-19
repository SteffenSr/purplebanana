/**
 * Developer feature: a list of in-progress app experiences that don't have
 * a real entry point yet (onboarding, login, ...). The experiments hub
 * (src/app/experiments/page.tsx) reads this to render one card per
 * experiment; each links to a static landing page under
 * src/app/experiments/<id>/page.tsx. Not hidden from end users yet — see
 * AGENTS.md.
 */
export interface ExperimentDef {
  id: ExperimentId;
  href: string;
  emoji: string;
}

export type ExperimentId = "onboarding" | "login" | "profile" | "habit-assistant" | "chatbot";

export const experiments: ExperimentDef[] = [
  { id: "onboarding", href: "/experiments/onboarding", emoji: "👋" },
  { id: "login", href: "/experiments/login", emoji: "🔐" },
  { id: "profile", href: "/experiments/profile", emoji: "👤" },
  { id: "habit-assistant", href: "/experiments/habit-assistant", emoji: "📈" },
  { id: "chatbot", href: "/experiments/chatbot", emoji: "💬" },
];
