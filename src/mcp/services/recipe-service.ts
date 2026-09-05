import type { NewRecipeInput, RecipeNoteMode, RecipeSummary, SimmerRecipeView } from "../domain/types";
import { NotFoundError } from "../errors";
import type { RecipeRepository, RecipeSearchOptions } from "../repositories/types";

export interface SavedRecipeResult {
  id: string;
  title: string;
  createdAt: string;
}

export interface RecipeNoteResult {
  id: string;
  note: string;
}

/**
 * Application service between the recipe tools (search_recipes, get_recipe,
 * save_recipe, update_recipe_note) and the RecipeRepository. The repository
 * already returns search_recipes results as compact RecipeSummary objects
 * (never full ingredients/instructions) — this layer's job is turning a
 * missing recipe into the tool-facing NotFoundError, not reshaping data.
 */
export class RecipeService {
  constructor(private readonly repository: RecipeRepository) {}

  async search(userId: string, options: RecipeSearchOptions): Promise<RecipeSummary[]> {
    return this.repository.search(userId, options);
  }

  async getById(userId: string, id: string): Promise<SimmerRecipeView> {
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

  async updateNote(userId: string, id: string, note: string, mode: RecipeNoteMode): Promise<RecipeNoteResult> {
    const result = await this.repository.updateNote(userId, id, note, mode);
    if (!result) {
      throw new NotFoundError(`No recipe found with id "${id}". Use search_recipes to find a valid id.`);
    }
    return result;
  }
}
