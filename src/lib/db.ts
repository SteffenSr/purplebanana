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

/**
 * Syncs the bundled seed recipes into IndexedDB on every launch — not just
 * the first one. A recipe present in seed-recipes.ts but missing locally
 * gets added; one whose bundled `updatedAt` is newer than the stored copy
 * gets its content refreshed (title/ingredients/steps/etc.) while keeping
 * the device's own `favorite`/`lastCookedAt` state; one that's no longer
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
      });
    }
  }

  const toDelete = existing.filter((r) => !seedIds.has(r.id)).map((r) => r.id);

  if (toPut.length > 0) await db.recipes.bulkPut(toPut);
  if (toDelete.length > 0) await db.recipes.bulkDelete(toDelete);
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
