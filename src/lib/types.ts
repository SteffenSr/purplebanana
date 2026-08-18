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
}

export interface Step {
  /** 1-based order shown to the cook. */
  order: number;
  instruction: LocalizedText;
  /** Optional timer length in minutes; rendered as a "start timer" affordance in cook mode. */
  timerMinutes?: number;
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
