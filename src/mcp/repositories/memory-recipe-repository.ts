import { seedRecipes as appSeedRecipes } from "../../lib/seed-recipes";
import type { Recipe, SeedRecipe, UserRecipeState } from "../../lib/types";
import {
  toRecipeSummary,
  toSimmerRecipeView,
  type NewRecipeInput,
  type RecipeNoteMode,
  type RecipeSummary,
  type SimmerRecipeView,
} from "../domain/types";
import type { RecipeRepository, RecipeSearchOptions } from "./types";

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

function fromSeedRecipe(seed: SeedRecipe): Recipe {
  return { ...seed, ownerId: null, createdAt: seed.updatedAt };
}

const emptyState: UserRecipeState = {
  favorite: false,
  lastCookedAt: null,
  recipeNote: null,
  stepNotes: {},
  ingredientNotes: {},
};

/**
 * Test-only in-memory RecipeRepository — a fake, not the "dev
 * implementation" (that role now belongs to the real Postgres-backed
 * DrizzleRecipeRepository, see ./drizzle-recipe-repository.ts and
 * docs/mcp.md). Kept around purely so src/mcp/__tests__/ can exercise
 * search/get/create/isolation logic without a database connection.
 *
 * Two tiers of data, mirroring the real repository: seed-recipes.ts
 * content is shared (`ownerId: null`) and visible to every user; recipes
 * created via `create()` are private to the userId that created them.
 */
export class InMemoryRecipeRepository implements RecipeRepository {
  private readonly sharedRecipes: Recipe[];
  private readonly userRecipes = new Map<string, Recipe[]>();
  private readonly states = new Map<string, UserRecipeState>();

  constructor(seedRecipes: SeedRecipe[] = appSeedRecipes) {
    this.sharedRecipes = seedRecipes.map(fromSeedRecipe);
  }

  private allFor(userId: string): Recipe[] {
    return [...this.sharedRecipes, ...(this.userRecipes.get(userId) ?? [])];
  }

  private stateFor(userId: string, recipeId: string): UserRecipeState {
    return this.states.get(`${userId}:${recipeId}`) ?? emptyState;
  }

  async search(userId: string, { query, tags, limit }: RecipeSearchOptions): Promise<RecipeSummary[]> {
    let results = this.allFor(userId);

    if (query) {
      const needle = query.toLowerCase();
      results = results.filter((recipe) => {
        const haystack = [
          recipe.title.da,
          recipe.title.en,
          recipe.description.da,
          recipe.description.en,
          ...recipe.tags,
          ...recipe.ingredients.flatMap((ingredient) => [ingredient.text.da, ingredient.text.en]),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      });
    }

    if (tags && tags.length > 0) {
      const wanted = tags.map((tag) => tag.toLowerCase());
      results = results.filter((recipe) => {
        const have = recipe.tags.map((tag) => tag.toLowerCase());
        return wanted.every((tag) => have.includes(tag));
      });
    }

    return results.slice(0, limit ?? 10).map((recipe) => toRecipeSummary(recipe, this.stateFor(userId, recipe.id)));
  }

  async getById(userId: string, id: string): Promise<SimmerRecipeView | undefined> {
    const recipe = this.allFor(userId).find((r) => r.id === id);
    return recipe ? toSimmerRecipeView(recipe, this.stateFor(userId, id)) : undefined;
  }

  async updateNote(
    userId: string,
    id: string,
    note: string,
    mode: RecipeNoteMode
  ): Promise<{ id: string; note: string } | undefined> {
    if (!this.allFor(userId).some((recipe) => recipe.id === id)) return undefined;

    const key = `${userId}:${id}`;
    const current = this.stateFor(userId, id);
    const trimmed = note.trim();
    const finalNote = mode === "replace" ? trimmed : current.recipeNote ? `${current.recipeNote}\n${trimmed}` : trimmed;
    this.states.set(key, { ...current, recipeNote: finalNote });
    return { id, note: finalNote };
  }

  async create(userId: string, input: NewRecipeInput): Promise<SimmerRecipeView> {
    const bilingual = (value: string) => ({ da: value, en: value });
    const existingIds = new Set(this.allFor(userId).map((recipe) => recipe.id));
    const base = slugify(input.title);
    let id = base;
    let suffix = 2;
    while (existingIds.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }

    const now = new Date().toISOString();
    const recipe: Recipe = {
      id,
      ownerId: userId,
      title: bilingual(input.title),
      description: bilingual(input.description ?? ""),
      emoji: "🍽️",
      tags: input.tags ?? [],
      servings: input.servings ?? 4,
      prepMinutes: 0,
      cookMinutes: 0,
      ingredients: input.ingredients.map((ingredient) => ({
        text: bilingual(ingredient.name),
        amount: ingredient.amount,
        unit: ingredient.unit,
      })),
      steps: input.instructions.map((instruction, index) => ({ order: index + 1, instruction: bilingual(instruction) })),
      notes: input.notes,
      source: input.source,
      createdAt: now,
      updatedAt: now,
    };

    const existing = this.userRecipes.get(userId) ?? [];
    existing.push(recipe);
    this.userRecipes.set(userId, existing);
    return toSimmerRecipeView(recipe, emptyState);
  }
}
