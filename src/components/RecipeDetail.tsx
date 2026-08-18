"use client";

import { useRecipe } from "@/lib/hooks";
import { toggleFavorite } from "@/lib/db";
import { useLocale } from "@/lib/use-locale";

export function RecipeDetail({ id }: { id: string }) {
  const { state, refresh } = useRecipe(id);
  const { locale, t } = useLocale();

  if (state.status === "loading") {
    return (
      <div className="container">
        <p className="text-muted">{t.recipeDetail.loading}</p>
      </div>
    );
  }

  if (state.status === "error" || !state.data) {
    return (
      <div className="container">
        <p className="empty-state">{t.recipeDetail.notFound}</p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full navigation needed offline, see RecipeCard.tsx */}
        <a href="/" className="btn btn-secondary">
          {t.recipeDetail.backToRecipes}
        </a>
      </div>
    );
  }

  const recipe = state.data;
  const lastCooked = recipe.lastCookedAt
    ? new Date(recipe.lastCookedAt).toLocaleDateString(locale)
    : null;

  return (
    <div className="container">
      {/* Plain <a>: full-page navigation, so it works via the service
          worker's cache even when next/link's soft navigation can't. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="btn btn-secondary btn-icon" aria-label={t.recipeDetail.backToRecipes}>
        ←
      </a>

      <div className="recipe-hero">
        <span className="recipe-hero__emoji" aria-hidden>
          {recipe.emoji}
        </span>
        <div>
          <h1>{recipe.title[locale]}</h1>
          <p className="text-muted">{recipe.description[locale]}</p>
        </div>
        <button
          type="button"
          className="btn btn-icon"
          aria-label={recipe.favorite ? t.recipeCard.removeFavorite : t.recipeCard.addFavorite}
          aria-pressed={!!recipe.favorite}
          onClick={async () => {
            await toggleFavorite(recipe.id);
            refresh();
          }}
        >
          {recipe.favorite ? "⭐" : "☆"}
        </button>
      </div>

      <div className="badge-row">
        <span className="badge">{t.recipeDetail.prep(recipe.prepMinutes)}</span>
        <span className="badge">{t.recipeDetail.cook(recipe.cookMinutes)}</span>
        <span className="badge">{t.recipeDetail.serves(recipe.servings)}</span>
        {lastCooked && <span className="badge">{t.recipeDetail.lastCooked(lastCooked)}</span>}
      </div>

      <a href={`/recipes/${recipe.id}/cook/`} className="btn btn-primary btn-block">
        {t.recipeDetail.startCooking}
      </a>

      <h2 className="section-title">{t.recipeDetail.ingredients}</h2>
      <ul className="ingredient-list">
        {recipe.ingredients.map((ingredient, i) => (
          <li key={i}>{ingredient.text[locale]}</li>
        ))}
      </ul>

      <h2 className="section-title">{t.recipeDetail.steps}</h2>
      <ol className="step-preview-list" style={{ listStyle: "none" }}>
        {recipe.steps.map((step) => (
          <li key={step.order}>
            <span className="step-preview-list__number">{step.order}</span>
            <span>{step.instruction[locale]}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
