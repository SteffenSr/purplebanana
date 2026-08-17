"use client";

import type { Recipe } from "@/lib/types";
import { toggleFavorite } from "@/lib/db";

export function RecipeCard({
  recipe,
  onFavoriteChange,
}: {
  recipe: Recipe;
  onFavoriteChange: () => void;
}) {
  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;

  return (
    <div className="recipe-card">
      <button
        type="button"
        className="recipe-card__fav"
        aria-label={recipe.favorite ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={!!recipe.favorite}
        onClick={async (e) => {
          e.preventDefault();
          await toggleFavorite(recipe.id);
          onFavoriteChange();
        }}
      >
        {recipe.favorite ? "⭐" : "☆"}
      </button>
      {/*
        Plain <a>, not next/link's <Link>: Link does a client-side "soft"
        navigation that fetches an RSC data payload over the network with no
        offline fallback, so it silently fails offline. A full document
        navigation goes through the service worker's own cache-fallback
        logic instead, which is what actually needs to work offline here.
      */}
      <a href={`/recipes/${recipe.id}/`} style={{ textDecoration: "none", color: "inherit" }}>
        <span className="recipe-card__emoji" aria-hidden>
          {recipe.emoji}
        </span>
        <div className="recipe-card__title">{recipe.title}</div>
        <p className="text-muted">{recipe.description}</p>
        <div className="recipe-card__meta">
          <span>⏱ {totalMinutes} min</span>
          <span>🍽 {recipe.servings} servings</span>
        </div>
      </a>
    </div>
  );
}
