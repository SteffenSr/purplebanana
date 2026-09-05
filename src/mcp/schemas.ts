import { z } from "zod";

/**
 * Zod input shapes for each MCP tool. Passed as a tool's `inputSchema` (the
 * MCP SDK validates incoming tool-call arguments against this before the
 * handler ever runs — this is the "runtime validation" for save_recipe),
 * and reused directly by tests. Kept small and flat, per docs/mcp.md's
 * "MCP design" notes: an LLM works better with a few well-described fields
 * than a deep, generic schema.
 */

export const searchRecipesInputShape = {
  query: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .describe("Free-text search across title, description, tags, and ingredient names."),
  tags: z
    .array(z.string().trim().min(1).max(50))
    .max(10)
    .optional()
    .describe('Only return recipes having ALL of these tags, e.g. ["dal", "dinner"].'),
  limit: z.number().int().min(1).max(25).optional().describe("Maximum number of results to return (default 10)."),
};

export const getRecipeInputShape = {
  id: z.string().trim().min(1).describe("Stable recipe id, as returned by search_recipes."),
};

const ingredientSchema = z.object({
  name: z.string().trim().min(1).max(200),
  amount: z.number().positive().max(100000).optional(),
  unit: z.string().trim().min(1).max(20).optional(),
});

const sourceSchema = z.object({
  type: z.enum(["user", "url", "ai", "other"]).describe("Where this recipe came from."),
  value: z.string().trim().max(2000).optional().describe('e.g. a URL for type "url".'),
});

export const saveRecipeInputShape = {
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  servings: z.number().int().positive().max(100).optional(),
  ingredients: z
    .array(ingredientSchema)
    .min(1, "At least one ingredient is required.")
    .max(100),
  instructions: z
    .array(z.string().trim().min(1).max(2000))
    .min(1, "At least one instruction step is required.")
    .max(100),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  notes: z.string().trim().max(2000).optional(),
  source: sourceSchema.optional(),
};

export const updateRecipeNoteInputShape = {
  id: z.string().trim().min(1).describe("Recipe id, from search_recipes or get_recipe."),
  note: z.string().trim().min(1).max(2000).describe("The note text to record."),
  mode: z
    .enum(["append", "replace"])
    .optional()
    .describe(
      'Default "append": adds this text to the end of the existing personal note, on its own line — nothing already stored is ever discarded. Pass "replace" ONLY when you have already read the existing note (via get_recipe) and merged it with the new information yourself; in that case `note` must be the complete, final note text, since it fully replaces what was stored.'
    ),
};

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date in YYYY-MM-DD form.");

export const getMealHistoryInputShape = {
  from: isoDate.optional().describe("Inclusive lower bound, ISO date (YYYY-MM-DD)."),
  to: isoDate.optional().describe("Inclusive upper bound, ISO date (YYYY-MM-DD)."),
  query: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .describe("Free-text match against notes, guests, or occasion, e.g. a guest's name."),
};
