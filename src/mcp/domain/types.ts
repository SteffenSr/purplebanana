import type { LocalizedText, Recipe } from "../../lib/types";

/**
 * Domain types for the Simmer MCP server. These are deliberately separate
 * from the app's IndexedDB-shaped `Recipe` (src/lib/types.ts): that type is
 * bilingual and browser-only (see src/lib/db.ts), while recipes created
 * through the MCP server (by an AI assistant, on the user's behalf) arrive
 * in whatever single language the conversation was in and have no local
 * device to be stored on. `fromAppRecipe` below is the one place that
 * bridges the two, for exposing the bundled seed recipes through the same
 * tools. See docs/mcp.md's "Architecture" section.
 */

export type RecipeLocale = "da" | "en";

export interface HouseholdMember {
  name: string;
  likes: string[];
  dislikes: string[];
}

/** Only food-related context — never a general user-profile API. */
export interface FoodProfile {
  userId: string;
  dietaryPreferences: string[];
  dislikes: string[];
  favoriteIngredients: string[];
  goals: string[];
  householdMembers: HouseholdMember[];
}

export interface SimmerIngredient {
  name: string;
  amount?: number;
  unit?: string;
}

export interface RecipeSource {
  type: "user" | "url" | "ai" | "other";
  value?: string;
}

/** A recipe as stored/returned by the MCP layer — the full detail shape. */
export interface SimmerRecipe {
  id: string;
  userId: string;
  title: string;
  description?: string;
  servings?: number;
  ingredients: SimmerIngredient[];
  instructions: string[];
  tags: string[];
  notes?: string;
  source?: RecipeSource;
  lastCookedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Compact projection returned by search_recipes — never full ingredients/instructions. */
export interface RecipeSummary {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  lastCookedAt?: string | null;
}

export interface NewRecipeInput {
  title: string;
  description?: string;
  servings?: number;
  ingredients: SimmerIngredient[];
  instructions: string[];
  tags?: string[];
  notes?: string;
  source?: RecipeSource;
}

export interface MealHistoryRecipeRef {
  id: string;
  title: string;
}

/**
 * A cooked-meal record. `guests`, `occasion`, and `feedback` are already
 * part of the shape (optional) so they can start being populated later
 * without a breaking API change — see docs/mcp.md.
 */
export interface MealHistoryEntry {
  id: string;
  userId: string;
  /** ISO date, e.g. "2026-08-17". */
  date: string;
  recipeIds: string[];
  notes?: string;
  guests?: string[];
  occasion?: string;
  feedback?: string;
}

export interface MealHistoryResult {
  date: string;
  recipes: MealHistoryRecipeRef[];
  notes?: string;
}

export interface MealHistoryQuery {
  from?: string;
  to?: string;
  query?: string;
}

function localize(text: LocalizedText, locale: RecipeLocale): string {
  return text[locale] || text.da || text.en;
}

/**
 * Projects a bundled app Recipe (bilingual, from seed-recipes.ts) into the
 * flat SimmerRecipe shape the MCP tools expose. Seed-recipe ingredient
 * lines combine amount+unit+name into one localized string (e.g. "200 g
 * røde linser"), so `amount`/`unit` stay undefined here rather than
 * guessed by parsing free text — only recipes saved through save_recipe
 * carry structured amount/unit.
 */
export function fromAppRecipe(recipe: Recipe, userId: string, locale: RecipeLocale = "da"): SimmerRecipe {
  const sortedSteps = [...recipe.steps].sort((a, b) => a.order - b.order);
  return {
    id: recipe.id,
    userId,
    title: localize(recipe.title, locale),
    description: localize(recipe.description, locale),
    servings: recipe.servings,
    ingredients: recipe.ingredients.map((ingredient) => ({ name: localize(ingredient.text, locale) })),
    instructions: sortedSteps.map((step) => localize(step.instruction, locale)),
    tags: recipe.tags,
    source: { type: "other", value: "simmer-app-recipe" },
    lastCookedAt: recipe.lastCookedAt ?? null,
    createdAt: recipe.updatedAt,
    updatedAt: recipe.updatedAt,
  };
}

export function toRecipeSummary(recipe: SimmerRecipe): RecipeSummary {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    tags: recipe.tags,
    lastCookedAt: recipe.lastCookedAt ?? null,
  };
}
