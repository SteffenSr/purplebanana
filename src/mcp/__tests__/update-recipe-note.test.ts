import assert from "node:assert/strict";
import { test } from "node:test";
import { NotFoundError } from "../errors";
import { InMemoryRecipeRepository } from "../repositories/memory-recipe-repository";
import { RecipeService } from "../services/recipe-service";

function makeService() {
  return new RecipeService(new InMemoryRecipeRepository());
}

test("update_recipe_note defaults to appending, never dropping the existing note", async () => {
  const service = makeService();

  const first = await service.updateNote("user-a", "red-lentil-dal", "Brug færre chili næste gang", "append");
  assert.equal(first.note, "Brug færre chili næste gang");

  const second = await service.updateNote("user-a", "red-lentil-dal", "Dobbelt ingefær er godt", "append");
  assert.equal(second.note, "Brug færre chili næste gang\nDobbelt ingefær er godt");

  const recipe = await service.getById("user-a", "red-lentil-dal");
  assert.equal(recipe.personalNote, "Brug færre chili næste gang\nDobbelt ingefær er godt");
});

test("update_recipe_note replace overwrites with the caller's already-merged text", async () => {
  const service = makeService();

  await service.updateNote("user-a", "red-lentil-dal", "First note", "append");
  await service.updateNote("user-a", "red-lentil-dal", "Second note", "append");
  const replaced = await service.updateNote("user-a", "red-lentil-dal", "Merged final note", "replace");

  assert.equal(replaced.note, "Merged final note");
  const recipe = await service.getById("user-a", "red-lentil-dal");
  assert.equal(recipe.personalNote, "Merged final note");
});

test("update_recipe_note defaults mode to append when omitted", async () => {
  const service = makeService();
  await service.updateNote("user-a", "red-lentil-dal", "Note one", "append");
  await service.updateNote("user-a", "red-lentil-dal", "Note two", "append");
  const recipe = await service.getById("user-a", "red-lentil-dal");
  assert.equal(recipe.personalNote, "Note one\nNote two");
});

test("update_recipe_note throws NotFoundError for an unknown recipe id", async () => {
  const service = makeService();
  await assert.rejects(() => service.updateNote("user-a", "does-not-exist", "note", "append"), NotFoundError);
});

test("update_recipe_note is isolated per user, even on a shared starter recipe", async () => {
  const service = makeService();

  await service.updateNote("user-a", "red-lentil-dal", "User A's private note", "append");

  const recipeForB = await service.getById("user-b", "red-lentil-dal");
  assert.equal(recipeForB.personalNote, undefined);

  const recipeForA = await service.getById("user-a", "red-lentil-dal");
  assert.equal(recipeForA.personalNote, "User A's private note");
});
