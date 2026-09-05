import assert from "node:assert/strict";
import { test } from "node:test";
import { NotFoundError } from "../errors";
import { InMemoryFoodProfileRepository } from "../repositories/memory-food-profile-repository";
import { InMemoryMealHistoryRepository } from "../repositories/memory-meal-history-repository";
import { InMemoryRecipeRepository } from "../repositories/memory-recipe-repository";
import { FoodProfileService } from "../services/food-profile-service";
import { MealHistoryService } from "../services/meal-history-service";
import { RecipeService } from "../services/recipe-service";

test("a recipe saved by one user is invisible to another user", async () => {
  const recipeService = new RecipeService(new InMemoryRecipeRepository());

  const saved = await recipeService.save("user-a", {
    title: "User A's secret pasta",
    ingredients: [{ name: "pasta" }],
    instructions: ["Boil it."],
  });

  await assert.rejects(() => recipeService.getById("user-b", saved.id), NotFoundError);

  const userBResults = await recipeService.search("user-b", { query: "secret" });
  assert.equal(userBResults.length, 0);

  const userAResults = await recipeService.search("user-a", { query: "secret" });
  assert.ok(userAResults.some((r) => r.id === saved.id));
});

test("both users still see Simmer's shared bundled recipes", async () => {
  const recipeService = new RecipeService(new InMemoryRecipeRepository());

  const recipeForA = await recipeService.getById("user-a", "red-lentil-dal");
  const recipeForB = await recipeService.getById("user-b", "red-lentil-dal");
  assert.equal(recipeForA.title, recipeForB.title);
});

test("get_food_profile never returns another user's household data", async () => {
  const service = new FoodProfileService(new InMemoryFoodProfileRepository());

  const knownUserProfile = await service.get("dev-user");
  assert.ok(knownUserProfile.householdMembers.length > 0);

  const unknownUserProfile = await service.get("user-with-no-data");
  assert.equal(unknownUserProfile.userId, "user-with-no-data");
  assert.deepEqual(unknownUserProfile.householdMembers, []);
  assert.deepEqual(unknownUserProfile.dislikes, []);
});

test("get_meal_history is scoped per user", async () => {
  const recipeRepository = new InMemoryRecipeRepository();
  const service = new MealHistoryService(new InMemoryMealHistoryRepository(), recipeRepository);

  const devUserHistory = await service.search("dev-user", {});
  assert.ok(devUserHistory.length > 0);

  const otherUserHistory = await service.search("user-with-no-history", {});
  assert.equal(otherUserHistory.length, 0);
});
