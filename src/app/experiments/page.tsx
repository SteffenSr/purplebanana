"use client";

import { useLocale } from "@/lib/use-locale";
import { experiments } from "@/lib/experiments";

/**
 * Developer feature: a hub of app experiences that aren't built yet, each
 * linking to its own landing page (src/app/experiments/<id>). Reachable
 * from the 🧪 button in the top bar — see AppHeader.tsx / AGENTS.md.
 */
export default function ExperimentsPage() {
  const { t } = useLocale();

  return (
    <div className="container">
      <h1>{t.experiments.hub.heading}</h1>
      <p className="text-muted">{t.experiments.hub.subheading}</p>

      <div className="experiment-grid">
        {experiments.map((experiment) => {
          const item = t.experiments.items[experiment.id];
          return (
            // Plain <a>: see RecipeCard.tsx for why this app avoids next/link.
            <a key={experiment.id} href={experiment.href} className="experiment-card">
              <span className="experiment-card__emoji" aria-hidden>
                {experiment.emoji}
              </span>
              <span className="experiment-card__title">{item.title}</span>
              <span className="experiment-card__description">{item.description}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
