import { toRecipeSummary, type NewRecipeInput, type RecipeSummary, type SimmerRecipe } from "../domain/types";
import { NotFoundError } from "../errors";
import type { RecipeRepository, RecipeSearchOptions } from "../repositories/types";

export interface SavedRecipeResult {
  id: string;
  title: string;
  createdAt: string;
}

/**
 * Application service between the recipe tools (search_recipes, get_recipe,
 * save_recipe) and the RecipeRepository. This is the one place that knows
 * search_recipes must never return full ingredients/instructions — the
 * repository returns full SimmerRecipe objects, and it's this service's job
 * to project them down to RecipeSummary before they reach a tool response.
 */
export class RecipeService {
  constructor(private readonly repository: RecipeRepository) {}

  async search(userId: string, options: RecipeSearchOptions): Promise<RecipeSummary[]> {
    const recipes = await this.repository.search(userId, options);
    return recipes.map(toRecipeSummary);
  }

  async getById(userId: string, id: string): Promise<SimmerRecipe> {
    const recipe = await this.repository.getById(userId, id);
    if (!recipe) {
      throw new NotFoundError(`No recipe found with id "${id}". Use search_recipes to find a valid id.`);
    }
    return recipe;
  }

  async save(userId: string, input: NewRecipeInput): Promise<SavedRecipeResult> {
    const recipe = await this.repository.create(userId, input);
    return { id: recipe.id, title: recipe.title, createdAt: recipe.createdAt };
  }
}
