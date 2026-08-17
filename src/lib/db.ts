import Dexie, { type EntityTable } from "dexie";
import type { Recipe } from "./types";
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
  }
}

export const db = new RecipeDatabase();

/** Copies the bundled seed recipes into IndexedDB the first time the app runs. */
export async function ensureSeeded(): Promise<void> {
  const count = await db.recipes.count();
  if (count === 0) {
    await db.recipes.bulkAdd(seedRecipes);
  }
}

export async function getAllRecipes(): Promise<Recipe[]> {
  return db.recipes.orderBy("title").toArray();
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
