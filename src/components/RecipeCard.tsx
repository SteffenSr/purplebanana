"use client";

import Link from "next/link";
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
      <Link href={`/recipes/${recipe.id}/`} style={{ textDecoration: "none", color: "inherit" }}>
        <span className="recipe-card__emoji" aria-hidden>
          {recipe.emoji}
        </span>
        <div className="recipe-card__title">{recipe.title}</div>
        <p className="text-muted">{recipe.description}</p>
        <div className="recipe-card__meta">
          <span>⏱ {totalMinutes} min</span>
          <span>🍽 {recipe.servings} servings</span>
        </div>
      </Link>
    </div>
  );
}
