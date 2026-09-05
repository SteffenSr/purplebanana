import assert from "node:assert/strict";
import { test } from "node:test";
import { InMemoryMealHistoryRepository } from "../repositories/memory-meal-history-repository";
import { InMemoryRecipeRepository } from "../repositories/memory-recipe-repository";
import { MealHistoryService } from "../services/meal-history-service";

function makeService() {
  return new MealHistoryService(new InMemoryMealHistoryRepository(), new InMemoryRecipeRepository());
}

test("get_meal_history filters by date range and resolves recipe titles", async () => {
  const service = makeService();
  const results = await service.search("dev-user", { from: "2026-08-15", to: "2026-08-18" });

  assert.equal(results.length, 1);
  assert.equal(results[0]!.date, "2026-08-17");
  assert.ok(results[0]!.recipes.some((r) => r.id === "red-lentil-dal"));
  assert.ok(results[0]!.recipes.every((r) => typeof r.title === "string" && r.title.length > 0));
});

test("get_meal_history free-text query matches a guest's name", async () => {
  const service = makeService();
  const results = await service.search("dev-user", { query: "Karen" });

  assert.equal(results.length, 1);
  assert.equal(results[0]!.date, "2026-08-17");
});

test("get_meal_history with no filters returns all entries sorted by date", async () => {
  const service = makeService();
  const results = await service.search("dev-user", {});

  assert.equal(results.length, 2);
  assert.ok(results[0]!.date < results[1]!.date);
});

test("get_meal_history returns no results outside the given range", async () => {
  const service = makeService();
  const results = await service.search("dev-user", { from: "2026-09-01", to: "2026-09-30" });
  assert.equal(results.length, 0);
});
