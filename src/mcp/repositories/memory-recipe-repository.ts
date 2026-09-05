import { seedRecipes as appSeedRecipes } from "../../lib/seed-recipes";
import { fromAppRecipe, type NewRecipeInput, type SimmerRecipe } from "../domain/types";
import type { RecipeRepository, RecipeSearchOptions } from "./types";

const SHARED_RECIPES_OWNER = "simmer-app";

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "recipe"
  );
}

function matchesText(recipe: SimmerRecipe, query: string): boolean {
  const needle = query.toLowerCase();
  return (
    recipe.title.toLowerCase().includes(needle) ||
    (recipe.description?.toLowerCase().includes(needle) ?? false) ||
    recipe.tags.some((tag) => tag.toLowerCase().includes(needle)) ||
    recipe.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(needle))
  );
}

/**
 * Dev-only in-memory RecipeRepository.
 *
 * Two tiers of data, mirroring how the real app will eventually work:
 *  - The bundled `seed-recipes.ts` content (converted via `fromAppRecipe`)
 *    is shared, read-only, and visible to every user — it's shipped app
 *    content, not anyone's private data.
 *  - Recipes created via `create()` (i.e. through save_recipe) are private
 *    to the userId that created them.
 *
 * This is a stand-in: it has no relationship to a given browser's
 * IndexedDB, so a recipe saved here does not appear in that user's Simmer
 * app until a real sync/shared-backend exists — see docs/mcp.md.
 */
export class InMemoryRecipeRepository implements RecipeRepository {
  private readonly sharedRecipes: SimmerRecipe[];
  private readonly userRecipes = new Map<string, SimmerRecipe[]>();

  constructor(seedRecipes = appSeedRecipes) {
    this.sharedRecipes = seedRecipes.map((recipe) => fromAppRecipe(recipe, SHARED_RECIPES_OWNER, "da"));
  }

  private allFor(userId: string): SimmerRecipe[] {
    return [...this.sharedRecipes, ...(this.userRecipes.get(userId) ?? [])];
  }

  async search(userId: string, { query, tags, limit }: RecipeSearchOptions): Promise<SimmerRecipe[]> {
    let results = this.allFor(userId);

    if (query) {
      results = results.filter((recipe) => matchesText(recipe, query));
    }
    if (tags && tags.length > 0) {
      const wanted = tags.map((tag) => tag.toLowerCase());
      results = results.filter((recipe) => {
        const have = recipe.tags.map((tag) => tag.toLowerCase());
        return wanted.every((tag) => have.includes(tag));
      });
    }

    return results.slice(0, limit ?? 10);
  }

  async getById(userId: string, id: string): Promise<SimmerRecipe | undefined> {
    return this.allFor(userId).find((recipe) => recipe.id === id);
  }

  async create(userId: string, input: NewRecipeInput): Promise<SimmerRecipe> {
    const now = new Date().toISOString();
    const existingIds = new Set(this.allFor(userId).map((recipe) => recipe.id));
    const base = slugify(input.title);
    let id = base;
    let suffix = 2;
    while (existingIds.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }

    const recipe: SimmerRecipe = {
      id,
      userId,
      title: input.title,
      description: input.description,
      servings: input.servings,
      ingredients: input.ingredients,
      instructions: input.instructions,
      tags: input.tags ?? [],
      notes: input.notes,
      source: input.source,
      lastCookedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const existing = this.userRecipes.get(userId) ?? [];
    existing.push(recipe);
    this.userRecipes.set(userId, existing);
    return recipe;
  }
}
