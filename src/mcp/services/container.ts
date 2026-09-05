import { DrizzleFoodProfileRepository } from "../repositories/drizzle-food-profile-repository";
import { DrizzleMealHistoryRepository } from "../repositories/drizzle-meal-history-repository";
import { DrizzleRecipeRepository } from "../repositories/drizzle-recipe-repository";
import { FoodProfileService } from "./food-profile-service";
import { MealHistoryService } from "./meal-history-service";
import { RecipeService } from "./recipe-service";

export interface ServiceContainer {
  foodProfileService: FoodProfileService;
  recipeService: RecipeService;
  mealHistoryService: MealHistoryService;
}

/**
 * Wires production (Postgres-backed) repositories to services. Both the
 * app/api/mcp route handler and src/mcp/stdio.ts build one of these at
 * startup and hand it to every MCP server instance they create. Tests use
 * the in-memory repositories directly (src/mcp/__tests__/) rather than
 * this container, so they never need a database connection — see
 * src/mcp/repositories/memory-*.ts.
 */
export function createServiceContainer(): ServiceContainer {
  const recipeRepository = new DrizzleRecipeRepository();
  const mealHistoryRepository = new DrizzleMealHistoryRepository();
  const foodProfileRepository = new DrizzleFoodProfileRepository();

  return {
    foodProfileService: new FoodProfileService(foodProfileRepository),
    recipeService: new RecipeService(recipeRepository),
    mealHistoryService: new MealHistoryService(mealHistoryRepository, recipeRepository),
  };
}
