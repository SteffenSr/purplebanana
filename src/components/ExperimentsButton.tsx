"use client";

import { useLocale } from "@/lib/use-locale";

/**
 * Developer feature: jumps to the experiments hub (src/app/experiments),
 * a set of landing pages for app experiences that aren't built yet
 * (onboarding, login, ...). Not hidden from end users yet — see AGENTS.md.
 */
export function ExperimentsButton() {
  const { t } = useLocale();

  return (
    // Plain <a>: see RecipeCard.tsx for why this app avoids next/link.
    <a
      href="/experiments"
      className="btn btn-icon"
      aria-label={t.experiments.openLabel}
      title={t.experiments.openLabel}
    >
      <span aria-hidden>🧪</span>
    </a>
  );
}
