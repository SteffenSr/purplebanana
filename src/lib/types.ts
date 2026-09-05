/**
 * Any user-facing recipe text, in every language the app supports. Danish
 * is the app's primary language, English the second — see
 * docs/architecture.md's "Localization" section for why content is stored
 * this way instead of via locale-prefixed routes.
 */
export interface LocalizedText {
  da: string;
  en: string;
}

export interface Ingredient {
  text: LocalizedText;
  /**
   * Links this ingredient line to its details page, keyed into
   * `ingredientProfiles` in `src/lib/ingredients.ts`. Optional — only set
   * for ingredients that have a profile (spices, dal staples, etc.), not
   * every line (onion, salt, water aren't worth a details page).
   */
  ingredientId?: string;
  /**
   * Structured amount/unit, kept separate from `text` rather than parsed
   * out of it. Bundled recipes in seed-recipes.ts fold amount+unit+name into
   * one localized string instead (e.g. "200 g røde linser") and leave these
   * undefined; recipes saved through the MCP server's save_recipe tool
   * (src/mcp/tools/save-recipe.ts) set them directly, since that tool's
   * input already arrives structured this way.
   */
  amount?: number;
  unit?: string;
}

/** Structured macros shown on an ingredient's details page, per `per`. */
export interface IngredientNutrition {
  /** What the numbers below are measured against, e.g. "Per 100 g". */
  per: LocalizedText;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  /** Optional caveat, e.g. that a spice is eaten in pinches, not 100 g. */
  note?: LocalizedText;
}

/**
 * A single ingredient's details page — names, flavor/texture notes,
 * nutrition, and where to buy it. Bundled, static content (like
 * `seed-recipes.ts`), not stored in IndexedDB: nothing here is user-editable.
 */
export interface IngredientProfile {
  /** Stable slug, also the `/ingredients/<id>` route param. */
  id: string;
  name: LocalizedText;
  /** Other names, spellings, or labels this ingredient goes by (incl. E-numbers where relevant). */
  otherNames: LocalizedText[];
  emoji: string;
  /**
   * Optional photos/illustrations, e.g. "/images/ingredients/<id>-1.jpg".
   * Falls back to `emoji` when unset — same convention as `Recipe.imageUrl`.
   */
  images?: string[];
  /** What it tastes/feels like, and what role it typically plays in a recipe. */
  flavorAndRole: LocalizedText;
  /** Omitted when no manufacturer nutrition declaration is available (e.g. some branded products). */
  nutrition?: IngredientNutrition;
  /** Places to buy it, e.g. "Indian/Asian grocery stores", or specific store names for a branded product. */
  whereToBuy: LocalizedText[];
  /**
   * Slug of this ingredient's category on greenlist.dk (a Danish vegan
   * product database), e.g. "tofu" for `https://greenlist.dk/tags/tofu`.
   * Omitted where no tag on that site maps cleanly to this ingredient —
   * see the sourcing note atop `ingredients.ts`.
   */
  greenlistTag?: string;
}

export interface Step {
  /** 1-based order shown to the cook. */
  order: number;
  instruction: LocalizedText;
  /** Optional timer length in minutes; rendered as a "start timer" affordance in cook mode. */
  timerMinutes?: number;
  /**
   * Ingredients added or used in this step, as stable keys from
   * `ingredientKey()` in src/lib/ingredient-key.ts (not array index, for
   * the same reordering-safety reason as `ingredientNotes`). Rendered as a
   * compact chip list in cook mode so the cook can see quantities without
   * leaving the step screen. Order in this array is the display order.
   */
  ingredientRefs?: string[];
}

export interface RecipeSource {
  type: "user" | "url" | "ai" | "other";
  value?: string;
}

/**
 * A recipe's content — the single row shape shared by the app's own pages
 * and the MCP server (see src/db/schema.ts's `recipes` table and
 * src/mcp/domain/types.ts). `ownerId: null` marks Simmer's own bundled
 * starter recipes (from seed-recipes.ts, seeded once via `src/db/seed.ts`)
 * — shared and read-only, visible to every signed-in user; a non-null
 * `ownerId` marks a recipe a specific user saved (by hand, or via the MCP
 * server's save_recipe tool).
 *
 * Per-*user* state (favorite, last cooked, personal notes) is deliberately
 * NOT here — see `UserRecipeState` below. It used to be columns on this
 * type back when IndexedDB made every recipe (including the shared ones)
 * a per-device copy; now that recipes are shared server-side rows, two
 * different users favoriting the same starter recipe must not collide.
 */
export interface Recipe {
  /** Stable slug, also the Postgres primary key. */
  id: string;
  /** null for Simmer's own shared/starter recipes; a user id otherwise. */
  ownerId: string | null;
  title: LocalizedText;
  description: LocalizedText;
  emoji: string;
  /** Optional photo, e.g. "/images/recipes/<id>.jpg". Falls back to `emoji` when unset. */
  imageUrl?: string;
  tags: string[];
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  ingredients: Ingredient[];
  steps: Step[];
  /** Free-text note about the recipe as a whole (not a specific step/ingredient) — mainly used by recipes saved via the MCP server's save_recipe tool. */
  notes?: string;
  /** Where this recipe came from — unset for hand-authored seed content. */
  source?: RecipeSource;
  createdAt: string;
  updatedAt: string;
}

/**
 * Everything about a recipe that's personal to one user rather than part of
 * the recipe's own content — one row per (userId, recipeId) in the
 * `user_recipe_state` table. Never present for a recipe a user hasn't
 * interacted with yet; callers should treat a missing row the same as all
 * these fields being empty/unset (see `emptyUserRecipeState` in db usage).
 */
export interface UserRecipeState {
  favorite: boolean;
  lastCookedAt: string | null;
  /**
   * A personal, whole-recipe note — e.g. a substitution or timing tweak
   * that works for this user specifically — distinct from `Recipe.notes`
   * (an author-level note on the recipe's own content, shared with anyone
   * who can see that recipe). Settable via the MCP server's
   * update_recipe_note tool; see src/mcp/tools/update-recipe-note.ts.
   */
  recipeNote: string | null;
  /** Personal notes on individual steps, keyed by `Step.order`. */
  stepNotes: Record<number, string>;
  /**
   * Personal notes/preferred amounts per ingredient, keyed by a stable slug
   * of the ingredient's English text (see `ingredientKey()` in
   * src/lib/ingredient-key.ts) — not array index, so reordering the
   * ingredient list doesn't reassign a note to the wrong line.
   */
  ingredientNotes: Record<string, IngredientNote>;
}

/**
 * The shape seed-recipes.ts's bundled content is authored in — a `Recipe`
 * minus the storage-layer bookkeeping (`ownerId`, `createdAt`) that only
 * makes sense once a recipe is an actual database row. `src/db/seed.ts`
 * fills those in (`ownerId: null`, `createdAt` = the recipe's `updatedAt`)
 * when inserting this bundled content.
 */
export type SeedRecipe = Omit<Recipe, "ownerId" | "createdAt">;

export interface IngredientNote {
  /** Free-text note, e.g. "used less chili, still plenty spicy". */
  note?: string;
  /** Short personal override, e.g. "2 tsp" — shown inline in the ingredient list. */
  amount?: string;
}
