import "server-only";
import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db/client";
import { recipes, userRecipeState } from "@/db/schema";
import type { Ingredient, IngredientNote, Recipe, RecipeSource, Step, UserRecipeState } from "./types";

/**
 * Server-only data-access layer over the `recipe`/`user_recipe_state`
 * tables — the single place both the app's Server Components/Actions and
 * the MCP server's Drizzle repositories (src/mcp/repositories/) read and
 * write recipes, so the two never drift into duplicated query logic. See
 * `Recipe`/`UserRecipeState` in src/lib/types.ts for the field shapes this
 * maps to and from.
 */

export const emptyUserRecipeState: UserRecipeState = {
  favorite: false,
  lastCookedAt: null,
  recipeNote: null,
  recipeNoteUpdatedAt: null,
  stepNotes: {},
  ingredientNotes: {},
};

type RecipeRow = typeof recipes.$inferSelect;
type UserRecipeStateRow = typeof userRecipeState.$inferSelect;

function toRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    ownerId: row.ownerId,
    title: row.title,
    description: row.description,
    emoji: row.emoji,
    imageUrl: row.imageUrl ?? undefined,
    tags: row.tags,
    servings: row.servings,
    prepMinutes: row.prepMinutes,
    cookMinutes: row.cookMinutes,
    ingredients: row.ingredients as Ingredient[],
    steps: row.steps as Step[],
    notes: row.notes ?? undefined,
    source: row.source ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toUserRecipeState(row: UserRecipeStateRow | undefined): UserRecipeState {
  if (!row) return emptyUserRecipeState;
  return {
    favorite: row.favorite,
    lastCookedAt: row.lastCookedAt ? row.lastCookedAt.toISOString() : null,
    recipeNote: row.recipeNote ?? null,
    recipeNoteUpdatedAt: row.recipeNoteUpdatedAt ? row.recipeNoteUpdatedAt.toISOString() : null,
    stepNotes: row.stepNotes as Record<number, string>,
    ingredientNotes: row.ingredientNotes as Record<string, IngredientNote>,
  };
}

/** A recipe visible to `userId`: Simmer's shared starter recipes, plus that user's own. */
function visibleTo(userId: string) {
  return or(isNull(recipes.ownerId), eq(recipes.ownerId, userId));
}

export interface RecipeWithState extends Recipe {
  state: UserRecipeState;
}

export async function getVisibleRecipes(userId: string): Promise<RecipeWithState[]> {
  const [recipeRows, stateRows] = await Promise.all([
    db.select().from(recipes).where(visibleTo(userId)),
    db.select().from(userRecipeState).where(eq(userRecipeState.userId, userId)),
  ]);
  const stateByRecipeId = new Map(stateRows.map((row) => [row.recipeId, row]));
  return recipeRows.map((row) => ({ ...toRecipe(row), state: toUserRecipeState(stateByRecipeId.get(row.id)) }));
}

export async function getVisibleRecipe(userId: string, id: string): Promise<RecipeWithState | undefined> {
  const [row] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), visibleTo(userId)));
  if (!row) return undefined;

  const [stateRow] = await db
    .select()
    .from(userRecipeState)
    .where(and(eq(userRecipeState.userId, userId), eq(userRecipeState.recipeId, id)));

  return { ...toRecipe(row), state: toUserRecipeState(stateRow) };
}

async function upsertState(
  userId: string,
  recipeId: string,
  patch: Partial<
    Pick<
      typeof userRecipeState.$inferInsert,
      "favorite" | "lastCookedAt" | "recipeNote" | "recipeNoteUpdatedAt" | "stepNotes" | "ingredientNotes"
    >
  >
): Promise<void> {
  await db
    .insert(userRecipeState)
    .values({ userId, recipeId, ...patch })
    .onConflictDoUpdate({
      target: [userRecipeState.userId, userRecipeState.recipeId],
      set: patch,
    });
}

export async function toggleFavorite(userId: string, recipeId: string): Promise<void> {
  const [stateRow] = await db
    .select({ favorite: userRecipeState.favorite })
    .from(userRecipeState)
    .where(and(eq(userRecipeState.userId, userId), eq(userRecipeState.recipeId, recipeId)));
  await upsertState(userId, recipeId, { favorite: !(stateRow?.favorite ?? false) });
}

export async function markCooked(userId: string, recipeId: string): Promise<void> {
  await upsertState(userId, recipeId, { lastCookedAt: new Date() });
}

export async function saveStepNote(userId: string, recipeId: string, stepOrder: number, note: string): Promise<void> {
  const [stateRow] = await db
    .select({ stepNotes: userRecipeState.stepNotes })
    .from(userRecipeState)
    .where(and(eq(userRecipeState.userId, userId), eq(userRecipeState.recipeId, recipeId)));
  const stepNotes = { ...(stateRow?.stepNotes as Record<number, string> | undefined) };
  const trimmed = note.trim();
  if (trimmed) {
    stepNotes[stepOrder] = trimmed;
  } else {
    delete stepNotes[stepOrder];
  }
  await upsertState(userId, recipeId, { stepNotes });
}

export type RecipeNoteMode = "append" | "replace";

/**
 * Sets or extends the user's personal, whole-recipe note — the storage
 * side of the MCP server's update_recipe_note tool
 * (src/mcp/tools/update-recipe-note.ts). "append" (the default) adds
 * `note` to whatever's already stored, on its own line, so a caller can
 * never silently lose an existing note by mistake; "replace" is only for
 * a caller that has already merged the new text with the existing note
 * itself and is submitting the final, complete note. Returns the note as
 * actually stored, so an "append" caller can see the combined result.
 */
export async function updateRecipeNote(
  userId: string,
  recipeId: string,
  note: string,
  mode: RecipeNoteMode = "append"
): Promise<string> {
  const trimmed = note.trim();

  if (mode === "replace") {
    await upsertState(userId, recipeId, { recipeNote: trimmed || null, recipeNoteUpdatedAt: new Date() });
    return trimmed;
  }

  const [stateRow] = await db
    .select({ recipeNote: userRecipeState.recipeNote })
    .from(userRecipeState)
    .where(and(eq(userRecipeState.userId, userId), eq(userRecipeState.recipeId, recipeId)));
  const existing = stateRow?.recipeNote?.trim();
  const combined = existing ? `${existing}\n${trimmed}` : trimmed;
  await upsertState(userId, recipeId, { recipeNote: combined, recipeNoteUpdatedAt: new Date() });
  return combined;
}

export interface NewRecipe {
  title: string;
  description?: string;
  servings?: number;
  ingredients: Array<{ name: string; amount?: number; unit?: string }>;
  instructions: string[];
  tags?: string[];
  notes?: string;
  source?: RecipeSource;
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "recipe"
  );
}

/**
 * Creates a recipe owned by `ownerId` — the storage side of the MCP
 * server's save_recipe tool (src/mcp/tools/save-recipe.ts). Input arrives
 * single-language (from whatever language the assistant/user were
 * conversing in), so it's stored under both `da` and `en` verbatim rather
 * than invented as a translation — a deliberate difference from
 * seed-recipes.ts's hand-authored, properly bilingual content (see
 * AGENTS.md's "Adding or editing recipes" section, which that rule is for).
 */
export async function createRecipe(ownerId: string, input: NewRecipe): Promise<Recipe> {
  const bilingual = (value: string) => ({ da: value, en: value });
  const existingIds = new Set((await getVisibleRecipes(ownerId)).map((r) => r.id));
  const base = slugify(input.title);
  let id = base;
  let suffix = 2;
  while (existingIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }

  const ingredients: Ingredient[] = input.ingredients.map((ingredient) => ({
    text: bilingual(ingredient.name),
    amount: ingredient.amount,
    unit: ingredient.unit,
  }));
  const steps: Step[] = input.instructions.map((instruction, index) => ({
    order: index + 1,
    instruction: bilingual(instruction),
  }));

  const [row] = await db
    .insert(recipes)
    .values({
      id,
      ownerId,
      title: bilingual(input.title),
      description: bilingual(input.description ?? ""),
      emoji: "🍽️",
      tags: input.tags ?? [],
      servings: input.servings ?? 4,
      ingredients,
      steps,
      notes: input.notes,
      source: input.source,
    })
    .returning();

  return toRecipe(row!);
}

export interface RecipeSearchOptions {
  query?: string;
  tags?: string[];
  limit?: number;
}

/**
 * Free-text/tag search over recipes visible to `userId` — the storage side
 * of the MCP server's search_recipes tool. Filters in application code
 * rather than a SQL WHERE clause since recipe text lives inside bilingual
 * jsonb fields; fine at this data size (a personal recipe collection, not
 * a multi-tenant catalog) — worth revisiting with real Postgres full-text
 * search if that ever changes.
 */
export async function searchRecipes(userId: string, options: RecipeSearchOptions): Promise<RecipeWithState[]> {
  let results = await getVisibleRecipes(userId);

  if (options.query) {
    const needle = options.query.toLowerCase();
    results = results.filter((recipe) => {
      const haystack = [
        recipe.title.da,
        recipe.title.en,
        recipe.description.da,
        recipe.description.en,
        ...recipe.tags,
        ...recipe.ingredients.flatMap((ing) => [ing.text.da, ing.text.en]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }

  if (options.tags && options.tags.length > 0) {
    const wanted = options.tags.map((tag) => tag.toLowerCase());
    results = results.filter((recipe) => {
      const have = recipe.tags.map((tag) => tag.toLowerCase());
      return wanted.every((tag) => have.includes(tag));
    });
  }

  return results.slice(0, options.limit ?? 10);
}

export async function saveIngredientNote(
  userId: string,
  recipeId: string,
  key: string,
  data: IngredientNote
): Promise<void> {
  const [stateRow] = await db
    .select({ ingredientNotes: userRecipeState.ingredientNotes })
    .from(userRecipeState)
    .where(and(eq(userRecipeState.userId, userId), eq(userRecipeState.recipeId, recipeId)));
  const ingredientNotes = { ...(stateRow?.ingredientNotes as Record<string, IngredientNote> | undefined) };
  const note = data.note?.trim();
  const amount = data.amount?.trim();
  if (note || amount) {
    ingredientNotes[key] = { note: note || undefined, amount: amount || undefined };
  } else {
    delete ingredientNotes[key];
  }
  await upsertState(userId, recipeId, { ingredientNotes });
}
