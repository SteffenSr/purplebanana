import type { Ingredient } from "./types";

/**
 * Stable per-ingredient key for `UserRecipeState.ingredientNotes`, derived
 * from the ingredient's English text rather than its array index — so a
 * note stays attached to the right ingredient even if the list gets
 * reordered, and only goes stale if the ingredient's own wording changes
 * (at which point losing the note is reasonable, since it's arguably a
 * different line now).
 */
export function ingredientKey(ingredient: Ingredient): string {
  return ingredient.text.en
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
