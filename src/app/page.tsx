"use client";

import { useMemo } from "react";
import { useRecipes } from "@/lib/hooks";
import { useLocale } from "@/lib/use-locale";
import { RecipeCard } from "@/components/RecipeCard";

export default function HomePage() {
  const { state, refresh } = useRecipes();
  const { locale, t } = useLocale();

  const sorted = useMemo(
    () =>
      state.status === "ready"
        ? [...state.data].sort((a, b) => a.title[locale].localeCompare(b.title[locale], locale))
        : [],
    [state, locale],
  );

  return (
    <div className="container">
      <h1>{t.home.heading}</h1>
      <p className="text-muted">{t.home.subheading}</p>

      {state.status === "loading" && <p className="text-muted">{t.home.loading}</p>}

      {state.status === "error" && <p className="text-muted">{t.home.error(state.error)}</p>}

      {state.status === "ready" && sorted.length === 0 && (
        <p className="empty-state">{t.home.empty}</p>
      )}

      {state.status === "ready" && sorted.length > 0 && (
        <div className="recipe-grid">
          {sorted.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onFavoriteChange={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}
