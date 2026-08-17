export interface Ingredient {
  text: string;
}

export interface Step {
  /** 1-based order shown to the cook. */
  order: number;
  instruction: string;
  /** Optional timer length in minutes; rendered as a "start timer" affordance in cook mode. */
  timerMinutes?: number;
}

export interface Recipe {
  /** Stable slug, also used as the IndexedDB primary key. */
  id: string;
  title: string;
  description: string;
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
