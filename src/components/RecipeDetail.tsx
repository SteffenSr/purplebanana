"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveIngredientNoteAction,
  saveStepNoteAction,
  toggleFavoriteAction,
} from "@/app/actions/recipes";
import { ingredientKey } from "@/lib/ingredient-key";
import { useLocale } from "@/lib/use-locale";
import { NoteSheet } from "./NoteSheet";
import type { RecipeWithState } from "@/lib/recipes-db";

type OpenSheet =
  | { kind: "step"; order: number }
  | { kind: "ingredient"; key: string; label: string; ingredientId?: string };

export function RecipeDetail({ recipe }: { recipe: RecipeWithState | undefined }) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [openSheet, setOpenSheet] = useState<OpenSheet | null>(null);

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

  const lastCooked = recipe.state.lastCookedAt
    ? new Date(recipe.state.lastCookedAt).toLocaleDateString(locale)
    : null;

  return (
    <div className="container">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- see docs/architecture.md's "Navigation" section */}
      <a href="/" className="btn btn-secondary btn-icon" aria-label={t.recipeDetail.backToRecipes}>
        ←
      </a>

      {recipe.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- see RecipeCard.tsx
        <img className="recipe-hero-image" src={recipe.imageUrl} alt={recipe.title[locale]} />
      )}

      <div className="recipe-hero">
        {!recipe.imageUrl && (
          <span className="recipe-hero__emoji" aria-hidden>
            {recipe.emoji}
          </span>
        )}
        <div className="recipe-hero__info">
          <h1>{recipe.title[locale]}</h1>
          <p className="text-muted">{recipe.description[locale]}</p>
        </div>
        <div className="recipe-hero__actions">
          {recipe.state.recipeNote && (
            <a href={`/recipes/${recipe.id}/note/`} className="btn btn-icon" aria-label={t.recipeDetail.viewNote}>
              📝
            </a>
          )}
          <button
            type="button"
            className="btn btn-icon"
            aria-label={recipe.state.favorite ? t.recipeCard.removeFavorite : t.recipeCard.addFavorite}
            aria-pressed={recipe.state.favorite}
            onClick={async () => {
              await toggleFavoriteAction(recipe.id);
              router.refresh();
            }}
          >
            {recipe.state.favorite ? "⭐" : "☆"}
          </button>
        </div>
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
          const ingredientNote = recipe.state.ingredientNotes[key];
          const label = ingredient.text[locale];
          return (
            <li key={key}>
              <button
                type="button"
                className="ingredient-list__button"
                onClick={() =>
                  setOpenSheet({ kind: "ingredient", key, label, ingredientId: ingredient.ingredientId })
                }
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
              {recipe.state.stepNotes[step.order] && (
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
          initialNote={recipe.state.stepNotes[openSheet.order] ?? ""}
          onSave={({ note }) => {
            saveStepNoteAction(recipe.id, openSheet.order, note).then(() => router.refresh());
          }}
          onClose={() => setOpenSheet(null)}
        />
      )}

      {openSheet?.kind === "ingredient" && (
        <NoteSheet
          title={t.notes.ingredientTitle(openSheet.label)}
          ingredientId={openSheet.ingredientId}
          showAmount
          initialNote={recipe.state.ingredientNotes[openSheet.key]?.note ?? ""}
          initialAmount={recipe.state.ingredientNotes[openSheet.key]?.amount ?? ""}
          onSave={({ note, amount }) => {
            saveIngredientNoteAction(recipe.id, openSheet.key, { note, amount }).then(() => router.refresh());
          }}
          onClose={() => setOpenSheet(null)}
        />
      )}
    </div>
  );
}
