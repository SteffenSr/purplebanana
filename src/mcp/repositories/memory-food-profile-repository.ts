import type { FoodProfile } from "../domain/types";
import type { FoodProfileRepository } from "./types";

/**
 * Dev-only in-memory FoodProfileRepository, seeded with one example profile
 * for the default dev user (see auth.ts) so the tool is demoable out of the
 * box. Real implementation should read from wherever Simmer ends up storing
 * user/household preferences — see docs/mcp.md's "Production TODO" section.
 */
export class InMemoryFoodProfileRepository implements FoodProfileRepository {
  private readonly profiles = new Map<string, FoodProfile>([
    [
      "dev-user",
      {
        userId: "dev-user",
        dietaryPreferences: ["vegan"],
        dislikes: ["coriander (cilantro)"],
        favoriteIngredients: ["red lentils", "coconut milk", "fresh ginger"],
        goals: ["cook more Indian dal dishes", "get more fiber in weeknight meals"],
        householdMembers: [
          { name: "Alma", likes: ["pasta", "dal"], dislikes: ["mushrooms"] },
          { name: "Oskar", likes: ["dal", "curry"], dislikes: ["very spicy food"] },
        ],
      },
    ],
  ]);

  async get(userId: string): Promise<FoodProfile | undefined> {
    return this.profiles.get(userId);
  }
}
