import type { FoodProfile } from "../domain/types";
import type { FoodProfileRepository } from "../repositories/types";

/**
 * Thin application-service layer between the get_food_profile tool and the
 * repository — the "Simmer application services" tier described in
 * docs/mcp.md's architecture diagram. Holds no domain logic of its own
 * beyond "never leak a nonexistent profile as an error, return an empty
 * one" so a new user with no preferences recorded yet still gets a valid,
 * usable response instead of a tool error.
 */
export class FoodProfileService {
  constructor(private readonly repository: FoodProfileRepository) {}

  async get(userId: string): Promise<FoodProfile> {
    const profile = await this.repository.get(userId);
    if (profile) return profile;
    return {
      userId,
      dietaryPreferences: [],
      dislikes: [],
      favoriteIngredients: [],
      goals: [],
      householdMembers: [],
    };
  }
}
