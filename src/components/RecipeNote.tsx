"use client";

import { useLocale } from "@/lib/use-locale";
import type { RecipeWithState } from "@/lib/recipes-db";

export function RecipeNote({ recipe }: { recipe: RecipeWithState | undefined }) {
  const { locale, t } = useLocale();

  if (!recipe) {
    return (
      <div className="container">
        <p className="empty-state">{t.recipeDetail.notFound}</p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- see docs/architecture.md's "Navigation" section */}
        <a href="/" className="btn btn-secondary">
          {t.recipeDetail.backToRecipes}
        </a>
      </div>
    );
  }

  const updatedAt = recipe.state.recipeNoteUpdatedAt
    ? new Date(recipe.state.recipeNoteUpdatedAt).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div className="container">
      <a href={`/recipes/${recipe.id}/`} className="btn btn-secondary btn-icon" aria-label={t.recipeNote.back}>
        ←
      </a>

      <h1>{t.recipeNote.heading}</h1>
      <p className="text-muted">{recipe.title[locale]}</p>

      {recipe.state.recipeNote ? (
        <>
          <p className="recipe-note__text">{recipe.state.recipeNote}</p>
          {updatedAt && <p className="text-muted">{t.recipeNote.updatedAt(updatedAt)}</p>}
        </>
      ) : (
        <p className="empty-state">{t.recipeNote.empty}</p>
      )}
    </div>
  );
}
