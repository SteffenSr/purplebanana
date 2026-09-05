import type { MealHistoryEntry, MealHistoryQuery } from "../domain/types";
import type { MealHistoryRepository } from "./types";

function matchesFreeText(entry: MealHistoryEntry, query: string): boolean {
  const needle = query.toLowerCase();
  return (
    (entry.notes?.toLowerCase().includes(needle) ?? false) ||
    (entry.occasion?.toLowerCase().includes(needle) ?? false) ||
    (entry.guests?.some((guest) => guest.toLowerCase().includes(needle)) ?? false)
  );
}

/**
 * Dev-only in-memory MealHistoryRepository, seeded with a couple of example
 * meals for the default dev user (see auth.ts) so get_meal_history is
 * demoable out of the box — e.g. the "what did I cook when Karen visited"
 * example in docs/mcp.md. Real implementation should read from wherever
 * Simmer ends up recording cooked meals (today the app only tracks
 * `Recipe.lastCookedAt` per device, in IndexedDB — there is no
 * date-addressable history yet, see docs/mcp.md's "Production TODO").
 */
export class InMemoryMealHistoryRepository implements MealHistoryRepository {
  private readonly entriesByUser = new Map<string, MealHistoryEntry[]>([
    [
      "dev-user",
      [
        {
          id: "meal-2026-08-17",
          userId: "dev-user",
          date: "2026-08-17",
          recipeIds: ["red-lentil-dal", "coconut-spinach-dal"],
          notes: "Karen var på besøg til aftensmad.",
          guests: ["Karen"],
          occasion: "dinner with a friend",
        },
        {
          id: "meal-2026-08-20",
          userId: "dev-user",
          date: "2026-08-20",
          recipeIds: ["creamy-tomato-pasta"],
          notes: "Hurtig hverdagsaften.",
        },
      ],
    ],
  ]);

  async search(userId: string, { from, to, query }: MealHistoryQuery): Promise<MealHistoryEntry[]> {
    let results = this.entriesByUser.get(userId) ?? [];

    if (from) results = results.filter((entry) => entry.date >= from);
    if (to) results = results.filter((entry) => entry.date <= to);
    if (query) results = results.filter((entry) => matchesFreeText(entry, query));

    return [...results].sort((a, b) => a.date.localeCompare(b.date));
  }
}
