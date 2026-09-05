"use client";

import { useMemo } from "react";
import { useLocale } from "@/lib/use-locale";
import { RecipeCard } from "@/components/RecipeCard";
import type { RecipeWithState } from "@/lib/recipes-db";

export function RecipeList({ recipes }: { recipes: RecipeWithState[] }) {
  const { locale, t } = useLocale();

  const sorted = useMemo(
    () => [...recipes].sort((a, b) => a.title[locale].localeCompare(b.title[locale], locale)),
    [recipes, locale]
  );

  return (
    <div className="container">
      <h1>{t.home.heading}</h1>
      <p className="text-muted">{t.home.subheading}</p>

      {sorted.length === 0 && <p className="empty-state">{t.home.empty}</p>}

      {sorted.length > 0 && (
        <div className="recipe-grid">
          {sorted.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
