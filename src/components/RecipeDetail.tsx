"use client";

import { useState } from "react";
import { useRecipe } from "@/lib/hooks";
import { toggleFavorite, ingredientKey, saveStepNote, saveIngredientNote } from "@/lib/db";
import { useLocale } from "@/lib/use-locale";
import { NoteSheet } from "./NoteSheet";

type OpenSheet =
  | { kind: "step"; order: number }
  | { kind: "ingredient"; key: string; label: string };

export function RecipeDetail({ id }: { id: string }) {
  const { state, refresh } = useRecipe(id);
  const { locale, t } = useLocale();
  const [openSheet, setOpenSheet] = useState<OpenSheet | null>(null);

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

      {recipe.imageUrl && (
        // Plain <img>: see RecipeCard.tsx for why this app skips next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img className="recipe-hero-image" src={recipe.imageUrl} alt={recipe.title[locale]} />
      )}

      <div className="recipe-hero">
        {!recipe.imageUrl && (
          <span className="recipe-hero__emoji" aria-hidden>
            {recipe.emoji}
          </span>
        )}
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
        {recipe.ingredients.map((ingredient) => {
          const key = ingredientKey(ingredient);
          const ingredientNote = recipe.ingredientNotes?.[key];
          const label = ingredient.text[locale];
          return (
            <li key={key}>
              {ingredient.ingredientId && (
                <a
                  href={`/ingredients/${ingredient.ingredientId}/`}
                  className="btn btn-icon ingredient-list__info-btn"
                  aria-label={t.ingredientDetail.viewDetails(label)}
                >
                  ℹ️
                </a>
              )}
              <button
                type="button"
                className="ingredient-list__button"
                onClick={() => setOpenSheet({ kind: "ingredient", key, label })}
              >
                <span>{label}</span>
                {ingredientNote?.amount && (
                  <span className="ingredient-list__amount">{ingredientNote.amount}</span>
                )}
                {ingredientNote?.note && (
                  <span className="ingredient-list__note-dot" aria-hidden>
                    📝
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <h2 className="section-title">{t.recipeDetail.steps}</h2>
      <ol className="step-preview-list" style={{ listStyle: "none" }}>
        {recipe.steps.map((step) => (
          <li key={step.order}>
            <span className="step-preview-list__number">{step.order}</span>
            <button
              type="button"
              className="step-preview-list__button"
              onClick={() => setOpenSheet({ kind: "step", order: step.order })}
            >
              <span>{step.instruction[locale]}</span>
              {recipe.stepNotes?.[step.order] && (
                <span className="step-preview-list__note-dot" aria-hidden>
                  📝
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>

      {openSheet?.kind === "step" && (
        <NoteSheet
          title={t.notes.stepTitle(openSheet.order)}
          initialNote={recipe.stepNotes?.[openSheet.order] ?? ""}
          onSave={({ note }) => {
            saveStepNote(recipe.id, openSheet.order, note).then(refresh);
          }}
          onClose={() => setOpenSheet(null)}
        />
      )}

      {openSheet?.kind === "ingredient" && (
        <NoteSheet
          title={t.notes.ingredientTitle(openSheet.label)}
          showAmount
          initialNote={recipe.ingredientNotes?.[openSheet.key]?.note ?? ""}
          initialAmount={recipe.ingredientNotes?.[openSheet.key]?.amount ?? ""}
          onSave={({ note, amount }) => {
            saveIngredientNote(recipe.id, openSheet.key, { note, amount }).then(refresh);
          }}
          onClose={() => setOpenSheet(null)}
        />
      )}
    </div>
  );
}
