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
  nutrition: IngredientNutrition;
  /** Places to buy it, e.g. "Indian/Asian grocery stores". */
  whereToBuy: LocalizedText[];
}

export interface Step {
  /** 1-based order shown to the cook. */
  order: number;
  instruction: LocalizedText;
  /** Optional timer length in minutes; rendered as a "start timer" affordance in cook mode. */
  timerMinutes?: number;
  /**
   * Ingredients added or used in this step, as stable keys from
   * `ingredientKey()` in db.ts (not array index, for the same reordering-
   * safety reason as `ingredientNotes`). Rendered as a compact chip list in
   * cook mode so the cook can see quantities without leaving the step
   * screen. Order in this array is the display order.
   */
  ingredientRefs?: string[];
}

export interface Recipe {
  /** Stable slug, also used as the IndexedDB primary key. */
  id: string;
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
  /** Set once the recipe has been saved into the local database. */
  updatedAt: string;
  /** User-local state, stored only in IndexedDB (never in the bundled seed data). */
  favorite?: boolean;
  lastCookedAt?: string | null;
  /**
   * Personal notes on individual steps, keyed by `Step.order`. Local-only —
   * "something I learned last time," not recipe content. See
   * `ensureSeeded()` in db.ts for how these survive a content update.
   */
  stepNotes?: Record<number, string>;
  /**
   * Personal notes/preferred amounts per ingredient, keyed by a stable slug
   * of the ingredient's English text (see `ingredientKey()` in db.ts) —
   * not array index, so reordering the ingredient list doesn't reassign a
   * note to the wrong line. Local-only, same as `stepNotes`.
   */
  ingredientNotes?: Record<string, IngredientNote>;
}

export interface IngredientNote {
  /** Free-text note, e.g. "used less chili, still plenty spicy". */
  note?: string;
  /** Short personal override, e.g. "2 tsp" — shown inline in the ingredient list. */
  amount?: string;
}
