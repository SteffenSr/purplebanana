import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { saveRecipeInputShape } from "../schemas";

const saveRecipeSchema = z.object(saveRecipeInputShape);

test("save_recipe input validation accepts a well-formed recipe", () => {
  const result = saveRecipeSchema.safeParse({
    title: "Weeknight chickpea curry",
    ingredients: [{ name: "chickpeas", amount: 400, unit: "g" }],
    instructions: ["Simmer everything for 20 minutes."],
  });
  assert.equal(result.success, true);
});

test("save_recipe input validation rejects a missing title", () => {
  const result = saveRecipeSchema.safeParse({
    ingredients: [{ name: "chickpeas" }],
    instructions: ["Simmer."],
  });
  assert.equal(result.success, false);
});

test("save_recipe input validation rejects an empty ingredients list", () => {
  const result = saveRecipeSchema.safeParse({
    title: "Empty recipe",
    ingredients: [],
    instructions: ["Do something."],
  });
  assert.equal(result.success, false);
});

test("save_recipe input validation rejects an empty instructions list", () => {
  const result = saveRecipeSchema.safeParse({
    title: "No steps",
    ingredients: [{ name: "salt" }],
    instructions: [],
  });
  assert.equal(result.success, false);
});

test("save_recipe input validation rejects a non-positive ingredient amount", () => {
  const result = saveRecipeSchema.safeParse({
    title: "Bad amount",
    ingredients: [{ name: "salt", amount: -1 }],
    instructions: ["Season."],
  });
  assert.equal(result.success, false);
});

test("save_recipe input validation rejects an unknown source type", () => {
  const result = saveRecipeSchema.safeParse({
    title: "Bad source",
    ingredients: [{ name: "salt" }],
    instructions: ["Season."],
    source: { type: "instagram" },
  });
  assert.equal(result.success, false);
});
