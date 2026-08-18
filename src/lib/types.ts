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
}
