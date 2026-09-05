"use client";

import { useLocale } from "@/lib/use-locale";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ExperimentsButton } from "@/components/ExperimentsButton";

/**
 * Client component so the brand name can follow the current language —
 * the root layout itself stays a server component (it exports `Metadata`).
 */
export function AppHeader() {
  const { t } = useLocale();

  return (
    <header className="app-header">
      <div className="app-header__inner">
        {/* Plain <a>: see RecipeCard.tsx for why this app avoids next/link. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="app-header__brand">
          <span className="app-header__brand-mark" aria-hidden>
            🌱
          </span>
          {t.appName}
        </a>
        <div className="app-header__controls">
          <ExperimentsButton />
          <a href="/settings/" className="btn btn-icon" aria-label={t.settings.heading}>
            ⚙️
          </a>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
