import assert from "node:assert/strict";
import { test } from "node:test";
import { NotFoundError } from "../errors";
import { InMemoryRecipeRepository } from "../repositories/memory-recipe-repository";
import { RecipeService } from "../services/recipe-service";

function makeService() {
  return new RecipeService(new InMemoryRecipeRepository());
}

test("search_recipes finds a seeded recipe by Danish free-text query", async () => {
  const service = makeService();
  const results = await service.search("user-a", { query: "linser" });
  assert.ok(results.some((r) => r.id === "red-lentil-dal"));
});

test("search_recipes filters by tag and respects limit", async () => {
  const service = makeService();
  const results = await service.search("user-a", { tags: ["dal"], limit: 1 });
  assert.equal(results.length, 1);
  assert.ok(results[0]!.tags.includes("dal"));
});

test("search_recipes never returns full ingredients or instructions", async () => {
  const service = makeService();
  const results = await service.search("user-a", { query: "dal" });
  for (const result of results) {
    assert.ok(!("ingredients" in result));
    assert.ok(!("instructions" in result));
  }
});

test("get_recipe returns the full recipe for a known id", async () => {
  const service = makeService();
  const recipe = await service.getById("user-a", "red-lentil-dal");
  assert.equal(recipe.id, "red-lentil-dal");
  assert.ok(recipe.ingredients.length > 0);
  assert.ok(recipe.instructions.length > 0);
});

test("get_recipe throws NotFoundError for an unknown id", async () => {
  const service = makeService();
  await assert.rejects(() => service.getById("user-a", "does-not-exist"), NotFoundError);
});

test("save_recipe creates a recipe retrievable via get_recipe", async () => {
  const service = makeService();
  const saved = await service.save("user-a", {
    title: "Test dal",
    ingredients: [{ name: "red lentils", amount: 200, unit: "g" }],
    instructions: ["Simmer with spices for 20 minutes."],
  });

  assert.ok(saved.id);
  assert.equal(saved.title, "Test dal");
  assert.ok(saved.createdAt);

  const fetched = await service.getById("user-a", saved.id);
  assert.equal(fetched.title, "Test dal");
  assert.equal(fetched.ingredients[0]?.name, "red lentils");

  const found = await service.search("user-a", { query: "Test dal" });
  assert.ok(found.some((r) => r.id === saved.id));
});
