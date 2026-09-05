import { getFoodProfile } from "../../lib/food-profile-db";
import type { FoodProfile } from "../domain/types";
import type { FoodProfileRepository } from "./types";

/** Production FoodProfileRepository — thin wrapper over src/lib/food-profile-db.ts. */
export class DrizzleFoodProfileRepository implements FoodProfileRepository {
  async get(userId: string): Promise<FoodProfile | undefined> {
    return getFoodProfile(userId);
  }
}
