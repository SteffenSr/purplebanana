import { InMemoryFoodProfileRepository } from "../repositories/memory-food-profile-repository";
import { InMemoryMealHistoryRepository } from "../repositories/memory-meal-history-repository";
import { InMemoryRecipeRepository } from "../repositories/memory-recipe-repository";
import { FoodProfileService } from "./food-profile-service";
import { MealHistoryService } from "./meal-history-service";
import { RecipeService } from "./recipe-service";

export interface ServiceContainer {
  foodProfileService: FoodProfileService;
  recipeService: RecipeService;
  mealHistoryService: MealHistoryService;
}

/**
 * Wires repositories to services once per process. Both transports
 * (http.ts, stdio.ts) build one of these at startup and hand it to every
 * MCP server instance they create, so the in-memory repositories' state
 * (recipes saved via save_recipe, in particular) persists across requests
 * for the lifetime of the process — swap the repository constructors here
 * for real ones later without touching services/ or tools/.
 */
export function createServiceContainer(): ServiceContainer {
  const recipeRepository = new InMemoryRecipeRepository();
  const mealHistoryRepository = new InMemoryMealHistoryRepository();
  const foodProfileRepository = new InMemoryFoodProfileRepository();

  return {
    foodProfileService: new FoodProfileService(foodProfileRepository),
    recipeService: new RecipeService(recipeRepository),
    mealHistoryService: new MealHistoryService(mealHistoryRepository, recipeRepository),
  };
}
