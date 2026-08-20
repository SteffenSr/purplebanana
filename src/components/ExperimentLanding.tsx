"use client";

import { useLocale } from "@/lib/use-locale";

/**
 * Shared shell for every experiment's landing page (src/app/experiments/*)
 * so they read as one consistent "not built yet" placeholder while each
 * feature gets fleshed out independently.
 */
export function ExperimentLanding({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  const { t } = useLocale();

  return (
    <div className="container experiment-landing">
      <div className="experiment-landing__emoji" aria-hidden>
        {emoji}
      </div>
      <h1>{title}</h1>
      <p className="text-muted">{description}</p>
      <p className="experiment-landing__note">{t.experiments.landing.comingSoon}</p>
      {/* Plain <a>: see RecipeCard.tsx for why this app avoids next/link. */}
      <a href="/experiments" className="btn btn-secondary">
        {t.experiments.landing.backToExperiments}
      </a>
    </div>
  );
}
