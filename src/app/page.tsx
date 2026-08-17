"use client";

import { useRecipes } from "@/lib/hooks";
import { RecipeCard } from "@/components/RecipeCard";

export default function HomePage() {
  const { state, refresh } = useRecipes();

  return (
    <div className="container">
      <h1>What are we cooking?</h1>
      <p className="text-muted">
        Every recipe below is saved on this device, so the app keeps working even without
        a signal.
      </p>

      {state.status === "loading" && <p className="text-muted">Loading your recipe box…</p>}

      {state.status === "error" && (
        <p className="text-muted">Couldn&apos;t load recipes: {state.error}</p>
      )}

      {state.status === "ready" && state.data.length === 0 && (
        <p className="empty-state">No recipes yet.</p>
      )}

      {state.status === "ready" && state.data.length > 0 && (
        <div className="recipe-grid">
          {state.data.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onFavoriteChange={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}
