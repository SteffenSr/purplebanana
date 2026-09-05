import * as recipesDb from "../../lib/recipes-db";
import { toRecipeSummary, toSimmerRecipeView } from "../domain/types";
import type { NewRecipeInput, RecipeSummary, SimmerRecipeView } from "../domain/types";
import type { RecipeRepository, RecipeSearchOptions } from "./types";

/**
 * Production RecipeRepository — thin wrapper over src/lib/recipes-db.ts,
 * the same data-access layer the app's own recipe pages use. All it adds
 * is the search_recipes/get_recipe/save_recipe view shaping (see
 * toRecipeSummary/toSimmerRecipeView in ../domain/types.ts).
 */
export class DrizzleRecipeRepository implements RecipeRepository {
  async search(userId: string, options: RecipeSearchOptions): Promise<RecipeSummary[]> {
    const results = await recipesDb.searchRecipes(userId, options);
    return results.map((recipe) => toRecipeSummary(recipe, recipe.state));
  }

  async getById(userId: string, id: string): Promise<SimmerRecipeView | undefined> {
    const recipe = await recipesDb.getVisibleRecipe(userId, id);
    return recipe ? toSimmerRecipeView(recipe) : undefined;
  }

  async create(userId: string, input: NewRecipeInput): Promise<SimmerRecipeView> {
    const recipe = await recipesDb.createRecipe(userId, input);
    return toSimmerRecipeView(recipe);
  }
}
