import type {
  FoodProfile,
  MealHistoryEntry,
  MealHistoryQuery,
  NewRecipeInput,
  RecipeNoteMode,
  RecipeSummary,
  SimmerRecipeView,
} from "../domain/types";

/**
 * Repository interfaces the MCP services depend on. Each dev implementation
 * in this directory is in-memory and lives only for the process's lifetime —
 * swap in a real database-backed implementation later without touching
 * services/ or tools/, which only ever see these interfaces. Every method
 * takes `userId` so a caller can never reach another user's data.
 */

export interface FoodProfileRepository {
  get(userId: string): Promise<FoodProfile | undefined>;
}

export interface RecipeSearchOptions {
  query?: string;
  tags?: string[];
  limit?: number;
}

export interface RecipeRepository {
  search(userId: string, options: RecipeSearchOptions): Promise<RecipeSummary[]>;
  getById(userId: string, id: string): Promise<SimmerRecipeView | undefined>;
  create(userId: string, input: NewRecipeInput): Promise<SimmerRecipeView>;
  /** Returns undefined if the recipe doesn't exist or isn't visible to `userId`. */
  updateNote(userId: string, id: string, note: string, mode: RecipeNoteMode): Promise<{ id: string; note: string } | undefined>;
}

export interface MealHistoryRepository {
  search(userId: string, query: MealHistoryQuery): Promise<MealHistoryEntry[]>;
}
