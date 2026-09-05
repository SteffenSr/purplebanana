import type { Recipe, RecipeSource, UserRecipeState } from "../../lib/types";

/**
 * Domain types for the Simmer MCP server. Recipe storage itself is NOT
 * duplicated here — `Recipe`/`UserRecipeState` (src/lib/types.ts) are the
 * one canonical shape, shared with the app's own pages via
 * src/lib/recipes-db.ts. What lives here is the MCP-specific *view* of
 * that data (flattened to one language, since a tool response goes to an
 * LLM, not a bilingual UI — see `toRecipeSummary`/`toSimmerRecipeView`
 * below) plus the domains with no existing app model to unify with:
 * food profile, household members, meal history.
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

/** Compact projection returned by search_recipes — never full ingredients/instructions. */
export interface RecipeSummary {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  lastCookedAt: string | null;
}

/** Full single-locale view returned by get_recipe and by save_recipe's storage layer. */
export interface SimmerRecipeView {
  id: string;
  title: string;
  description?: string;
  servings?: number;
  ingredients: Array<{ name: string; amount?: number; unit?: string }>;
  instructions: string[];
  /** Author-level note on the recipe's own content — shared with anyone who can see this recipe. */
  notes?: string;
  /** This user's own private note (e.g. a substitution that works for them) — see update_recipe_note. Never shared with other users, even on a shared starter recipe. */
  personalNote?: string;
  tags: string[];
  source?: RecipeSource;
  createdAt: string;
  updatedAt: string;
}

/** update_recipe_note's mode parameter — see src/lib/recipes-db.ts's updateRecipeNote for the exact semantics. */
export type RecipeNoteMode = "append" | "replace";

/** save_recipe's input shape — see src/mcp/schemas.ts for the zod validation of this. */
export interface NewRecipeInput {
  title: string;
  description?: string;
  servings?: number;
  ingredients: Array<{ name: string; amount?: number; unit?: string }>;
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

function localize(text: { da: string; en: string }, locale: RecipeLocale): string {
  return text[locale] || text.da || text.en;
}

export function toRecipeSummary(recipe: Recipe, state: UserRecipeState, locale: RecipeLocale = "da"): RecipeSummary {
  return {
    id: recipe.id,
    title: localize(recipe.title, locale),
    description: localize(recipe.description, locale),
    tags: recipe.tags,
    lastCookedAt: state.lastCookedAt,
  };
}

export function toSimmerRecipeView(recipe: Recipe, state: UserRecipeState, locale: RecipeLocale = "da"): SimmerRecipeView {
  const sortedSteps = [...recipe.steps].sort((a, b) => a.order - b.order);
  return {
    id: recipe.id,
    title: localize(recipe.title, locale),
    description: localize(recipe.description, locale),
    servings: recipe.servings,
    ingredients: recipe.ingredients.map((ingredient) => ({
      name: localize(ingredient.text, locale),
      amount: ingredient.amount,
      unit: ingredient.unit,
    })),
    instructions: sortedSteps.map((step) => localize(step.instruction, locale)),
    notes: recipe.notes,
    personalNote: state.recipeNote ?? undefined,
    tags: recipe.tags,
    source: recipe.source,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  };
}
