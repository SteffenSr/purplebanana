import type { MealHistoryQuery, MealHistoryResult } from "../domain/types";
import type { MealHistoryRepository, RecipeRepository } from "../repositories/types";

/**
 * Application service for get_meal_history. Resolves each meal's
 * recipeIds into the compact {id, title} refs the tool returns, via the
 * same RecipeRepository search_recipes/get_recipe use — this is the "cross
 * app use case" join described in docs/mcp.md: a meal history entry only
 * stores ids, and this is the one place that turns those into something an
 * LLM can act on without a second round trip.
 */
export class MealHistoryService {
  constructor(
    private readonly mealHistoryRepository: MealHistoryRepository,
    private readonly recipeRepository: RecipeRepository
  ) {}

  async search(userId: string, query: MealHistoryQuery): Promise<MealHistoryResult[]> {
    const entries = await this.mealHistoryRepository.search(userId, query);

    const results: MealHistoryResult[] = [];
    for (const entry of entries) {
      const recipes = [];
      for (const recipeId of entry.recipeIds) {
        const recipe = await this.recipeRepository.getById(userId, recipeId);
        if (recipe) recipes.push({ id: recipe.id, title: recipe.title });
      }
      results.push({ date: entry.date, recipes, notes: entry.notes });
    }
    return results;
  }
}
