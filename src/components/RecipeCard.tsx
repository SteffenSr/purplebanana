"use client";

import { useRouter } from "next/navigation";
import { toggleFavoriteAction } from "@/app/actions/recipes";
import { useLocale } from "@/lib/use-locale";
import type { RecipeWithState } from "@/lib/recipes-db";

export function RecipeCard({ recipe }: { recipe: RecipeWithState }) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;

  return (
    <div className="recipe-card">
      <button
        type="button"
        className="recipe-card__fav"
        aria-label={recipe.state.favorite ? t.recipeCard.removeFavorite : t.recipeCard.addFavorite}
        aria-pressed={recipe.state.favorite}
        onClick={async (e) => {
          e.preventDefault();
          await toggleFavoriteAction(recipe.id);
          router.refresh();
        }}
      >
        {recipe.state.favorite ? "⭐" : "☆"}
      </button>
      {/* Plain <a>: see docs/architecture.md's "Navigation" section. */}
      <a href={`/recipes/${recipe.id}/`} style={{ textDecoration: "none", color: "inherit" }}>
        {recipe.imageUrl ? (
          // Plain <img>, not next/image: photos are already resized/re-encoded
          // before being committed — see AGENTS.md's "Adding or editing
          // recipes" section.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="recipe-card__image"
            src={recipe.imageUrl}
            alt=""
            loading="lazy"
            width={400}
            height={300}
          />
        ) : (
          <span className="recipe-card__emoji" aria-hidden>
            {recipe.emoji}
          </span>
        )}
        <div className="recipe-card__title">{recipe.title[locale]}</div>
        <p className="text-muted">{recipe.description[locale]}</p>
        <div className="recipe-card__meta">
          <span>{t.recipeCard.minutes(totalMinutes)}</span>
          <span>{t.recipeCard.servings(recipe.servings)}</span>
        </div>
      </a>
    </div>
  );
}
