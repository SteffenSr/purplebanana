import { searchMealHistory } from "../../lib/meal-history-db";
import type { MealHistoryEntry, MealHistoryQuery } from "../domain/types";
import type { MealHistoryRepository } from "./types";

/** Production MealHistoryRepository — thin wrapper over src/lib/meal-history-db.ts. */
export class DrizzleMealHistoryRepository implements MealHistoryRepository {
  async search(userId: string, query: MealHistoryQuery): Promise<MealHistoryEntry[]> {
    return searchMealHistory(userId, query);
  }
}
