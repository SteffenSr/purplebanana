import "server-only";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { mealHistory, mealHistoryRecipes } from "@/db/schema";
import type { MealHistoryEntry, MealHistoryQuery } from "@/mcp/domain/types";

/**
 * Server-only data-access layer over `meal_history`/`meal_history_recipe`
 * — currently only read by the MCP server's get_meal_history tool
 * (src/mcp/repositories/drizzle-meal-history-repository.ts). There is no
 * "log a meal" UI yet (see docs/mcp.md's "Production TODO"), so nothing
 * writes to these tables today; that's a deliberately separate, smaller
 * follow-up rather than part of this rearchitecture.
 */
export async function searchMealHistory(userId: string, query: MealHistoryQuery): Promise<MealHistoryEntry[]> {
  const conditions = [eq(mealHistory.userId, userId)];
  if (query.from) conditions.push(gte(mealHistory.date, query.from));
  if (query.to) conditions.push(lte(mealHistory.date, query.to));

  const rows = await db
    .select()
    .from(mealHistory)
    .where(and(...conditions));

  const filtered = query.query
    ? rows.filter((row) => {
        const needle = query.query!.toLowerCase();
        return (
          (row.notes?.toLowerCase().includes(needle) ?? false) ||
          (row.occasion?.toLowerCase().includes(needle) ?? false) ||
          (row.guests?.some((guest) => guest.toLowerCase().includes(needle)) ?? false)
        );
      })
    : rows;

  const entries: MealHistoryEntry[] = [];
  for (const row of filtered) {
    const recipeRows = await db
      .select({ recipeId: mealHistoryRecipes.recipeId })
      .from(mealHistoryRecipes)
      .where(eq(mealHistoryRecipes.mealHistoryId, row.id));
    entries.push({
      id: row.id,
      userId: row.userId,
      date: row.date,
      recipeIds: recipeRows.map((r) => r.recipeId),
      notes: row.notes ?? undefined,
      guests: row.guests ?? undefined,
      occasion: row.occasion ?? undefined,
      feedback: row.feedback ?? undefined,
    });
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date));
}
