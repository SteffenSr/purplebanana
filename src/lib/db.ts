import Dexie, { type EntityTable } from "dexie";
import type { Ingredient, IngredientNote, Recipe } from "./types";
import { seedRecipes } from "./seed-recipes";

/**
 * Local-first storage. The static export ships with no backend, so this
 * IndexedDB database (via Dexie) is the single source of truth at runtime —
 * it works fully offline once the app shell has loaded once.
 */
class RecipeDatabase extends Dexie {
  recipes!: EntityTable<Recipe, "id">;

  constructor() {
    super("purplebanana-recipes");
    this.version(1).stores({
      recipes: "id, title, *tags, updatedAt",
    });
    // v2: title became a { da, en } object (see LocalizedText in types.ts),
    // so it can no longer be a Dexie index — display order is now sorted by
    // localized title in the UI layer instead (src/app/page.tsx), where the
    // current language is known.
    this.version(2).stores({
      recipes: "id, *tags, updatedAt",
    });
  }
}

export const db = new RecipeDatabase();

/**
 * Syncs the bundled seed recipes into IndexedDB on every launch — not just
 * the first one. A recipe present in seed-recipes.ts but missing locally
 * gets added; one whose bundled `updatedAt` is newer than the stored copy
 * gets its content refreshed (title/ingredients/steps/etc.) while keeping
 * the device's own `favorite`/`lastCookedAt`/`stepNotes`/`ingredientNotes`
 * state; one that's no longer
 * in seed-recipes.ts at all gets removed, since every recipe here is
 * shipped app content, not something the user authored themselves.
 * Without this, a returning user's device would stay stuck on whatever
 * recipes happened to exist the very first time they opened the app,
 * forever — no refresh, cache clear, or redeploy would ever change that.
 */
export async function ensureSeeded(): Promise<void> {
  const existing = await db.recipes.toArray();
  const existingById = new Map(existing.map((r) => [r.id, r]));
  const seedIds = new Set(seedRecipes.map((r) => r.id));

  const toPut: Recipe[] = [];
  for (const seedRecipe of seedRecipes) {
    const current = existingById.get(seedRecipe.id);
    if (!current) {
      toPut.push(seedRecipe);
    } else if (new Date(seedRecipe.updatedAt) > new Date(current.updatedAt)) {
      toPut.push({
        ...seedRecipe,
        favorite: current.favorite,
        lastCookedAt: current.lastCookedAt,
        stepNotes: current.stepNotes,
        ingredientNotes: current.ingredientNotes,
      });
    }
  }

  const toDelete = existing.filter((r) => !seedIds.has(r.id)).map((r) => r.id);

  if (toPut.length > 0) await db.recipes.bulkPut(toPut);
  if (toDelete.length > 0) await db.recipes.bulkDelete(toDelete);
}

export async function getAllRecipes(): Promise<Recipe[]> {
  return db.recipes.toArray();
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  return db.recipes.get(id);
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  await db.recipes.put({ ...recipe, updatedAt: new Date().toISOString() });
}

export async function deleteRecipe(id: string): Promise<void> {
  await db.recipes.delete(id);
}

export async function toggleFavorite(id: string): Promise<void> {
  const recipe = await db.recipes.get(id);
  if (!recipe) return;
  await db.recipes.update(id, { favorite: !recipe.favorite });
}

export async function markCooked(id: string): Promise<void> {
  await db.recipes.update(id, { lastCookedAt: new Date().toISOString() });
}

/**
 * Stable per-ingredient key for `ingredientNotes`, derived from the
 * ingredient's English text rather than its array index — so a note stays
 * attached to the right ingredient even if the list gets reordered, and
 * only goes stale if the ingredient's own wording changes (at which point
 * losing the note is reasonable, since it's arguably a different line now).
 */
export function ingredientKey(ingredient: Ingredient): string {
  return ingredient.text.en
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveStepNote(recipeId: string, stepOrder: number, note: string): Promise<void> {
  const recipe = await db.recipes.get(recipeId);
  if (!recipe) return;
  const stepNotes = { ...recipe.stepNotes };
  const trimmed = note.trim();
  if (trimmed) {
    stepNotes[stepOrder] = trimmed;
  } else {
    delete stepNotes[stepOrder];
  }
  await db.recipes.update(recipeId, { stepNotes });
}

export async function saveIngredientNote(
  recipeId: string,
  key: string,
  data: IngredientNote
): Promise<void> {
  const recipe = await db.recipes.get(recipeId);
  if (!recipe) return;
  const ingredientNotes = { ...recipe.ingredientNotes };
  const note = data.note?.trim();
  const amount = data.amount?.trim();
  if (note || amount) {
    ingredientNotes[key] = { note: note || undefined, amount: amount || undefined };
  } else {
    delete ingredientNotes[key];
  }
  await db.recipes.update(recipeId, { ingredientNotes });
}
