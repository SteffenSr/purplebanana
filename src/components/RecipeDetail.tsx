"use client";

import Link from "next/link";
import { useRecipe } from "@/lib/hooks";
import { toggleFavorite } from "@/lib/db";

export function RecipeDetail({ id }: { id: string }) {
  const { state, refresh } = useRecipe(id);

  if (state.status === "loading") {
    return (
      <div className="container">
        <p className="text-muted">Loading recipe…</p>
      </div>
    );
  }

  if (state.status === "error" || !state.data) {
    return (
      <div className="container">
        <p className="empty-state">Recipe not found on this device.</p>
        <Link href="/" className="btn btn-secondary">
          ← Back to recipes
        </Link>
      </div>
    );
  }

  const recipe = state.data;
  const lastCooked = recipe.lastCookedAt
    ? new Date(recipe.lastCookedAt).toLocaleDateString()
    : null;

  return (
    <div className="container">
      <Link href="/" className="btn btn-secondary btn-icon" aria-label="Back to recipes">
        ←
      </Link>

      <div className="recipe-hero">
        <span className="recipe-hero__emoji" aria-hidden>
          {recipe.emoji}
        </span>
        <div>
          <h1>{recipe.title}</h1>
          <p className="text-muted">{recipe.description}</p>
        </div>
        <button
          type="button"
          className="btn btn-icon"
          aria-label={recipe.favorite ? "Remove from favorites" : "Add to favorites"}
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
        <span className="badge">⏱ Prep {recipe.prepMinutes} min</span>
        <span className="badge">🔥 Cook {recipe.cookMinutes} min</span>
        <span className="badge">🍽 Serves {recipe.servings}</span>
        {lastCooked && <span className="badge">Last cooked {lastCooked}</span>}
      </div>

      <Link href={`/recipes/${recipe.id}/cook/`} className="btn btn-primary btn-block">
        ▶ Start Cooking
      </Link>

      <h2 className="section-title">Ingredients</h2>
      <ul className="ingredient-list">
        {recipe.ingredients.map((ingredient, i) => (
          <li key={i}>{ingredient.text}</li>
        ))}
      </ul>

      <h2 className="section-title">Steps</h2>
      <ol className="step-preview-list" style={{ listStyle: "none" }}>
        {recipe.steps.map((step) => (
          <li key={step.order}>
            <span className="step-preview-list__number">{step.order}</span>
            <span>{step.instruction}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
