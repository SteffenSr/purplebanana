import { boolean, integer, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import type {
  FoodProfile,
  HouseholdMember,
  MealHistoryEntry,
} from "../mcp/domain/types";
import type { Ingredient, IngredientNote, LocalizedText, RecipeSource, Step } from "../lib/types";

/**
 * Single Postgres schema backing both the recipe app and the MCP server
 * (src/mcp/) — see docs/architecture.md and docs/mcp.md. Auth.js tables
 * (`users`/`accounts`/`sessions`/`verificationTokens`) follow the exact
 * shape `@auth/drizzle-adapter`'s Postgres adapter expects; don't rename
 * their columns without also updating src/auth.ts.
 */

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

/**
 * Personal access tokens — how Claude/ChatGPT authenticate to the MCP
 * server (see src/mcp/auth.ts). Only `tokenHash` (sha256 of the raw token)
 * is ever stored; the raw token is shown once, at generation time, in the
 * account settings page.
 */
export const personalAccessTokens = pgTable("personal_access_token", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("tokenHash").notNull().unique(),
  label: text("label").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  lastUsedAt: timestamp("lastUsedAt", { mode: "date" }),
});

/**
 * Recipe content — shared source of truth for both the app's own pages and
 * the MCP server's search_recipes/get_recipe/save_recipe tools. `ownerId`
 * null marks a Simmer starter recipe (seeded from seed-recipes.ts, shared
 * and read-only for every user); non-null marks a recipe a specific user
 * saved. See `Recipe` in src/lib/types.ts for the full field documentation
 * — this table mirrors that type directly.
 */
export const recipes = pgTable("recipe", {
  id: text("id").primaryKey(),
  ownerId: text("ownerId").references(() => users.id, { onDelete: "cascade" }),
  title: jsonb("title").$type<LocalizedText>().notNull(),
  description: jsonb("description").$type<LocalizedText>().notNull(),
  emoji: text("emoji").notNull(),
  imageUrl: text("imageUrl"),
  tags: text("tags").array().notNull().default([]),
  servings: integer("servings").notNull(),
  prepMinutes: integer("prepMinutes").notNull().default(0),
  cookMinutes: integer("cookMinutes").notNull().default(0),
  ingredients: jsonb("ingredients").$type<Ingredient[]>().notNull(),
  steps: jsonb("steps").$type<Step[]>().notNull(),
  notes: text("notes"),
  source: jsonb("source").$type<RecipeSource>(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

/**
 * Per-(user, recipe) state — favorite, last-cooked timestamp, personal
 * notes. Split out from `recipes` itself precisely so two different users
 * favoriting the same shared starter recipe don't collide; see
 * `UserRecipeState` in src/lib/types.ts.
 */
export const userRecipeState = pgTable(
  "user_recipe_state",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipeId: text("recipeId")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    favorite: boolean("favorite").notNull().default(false),
    lastCookedAt: timestamp("lastCookedAt", { mode: "date" }),
    stepNotes: jsonb("stepNotes").$type<Record<number, string>>().notNull().default({}),
    ingredientNotes: jsonb("ingredientNotes").$type<Record<string, IngredientNote>>().notNull().default({}),
  },
  (t) => [primaryKey({ columns: [t.userId, t.recipeId] })]
);

/** One row per user — see `FoodProfile` in src/mcp/domain/types.ts. */
export const foodProfiles = pgTable("food_profile", {
  userId: text("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  dietaryPreferences: text("dietaryPreferences").array().notNull().default([]),
  dislikes: text("dislikes").array().notNull().default([]),
  favoriteIngredients: text("favoriteIngredients").array().notNull().default([]),
  goals: text("goals").array().notNull().default([]),
});

/** See `HouseholdMember` in src/mcp/domain/types.ts. */
export const householdMembers = pgTable("household_member", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  likes: text("likes").array().notNull().default([]),
  dislikes: text("dislikes").array().notNull().default([]),
});

/** See `MealHistoryEntry` in src/mcp/domain/types.ts. */
export const mealHistory = pgTable("meal_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** ISO date, e.g. "2026-08-17" — stored as text, not a date column, to match MealHistoryEntry.date exactly. */
  date: text("date").notNull(),
  notes: text("notes"),
  guests: text("guests").array(),
  occasion: text("occasion"),
  feedback: text("feedback"),
});

/** Many-to-many join: which recipes were cooked for a given meal-history entry. */
export const mealHistoryRecipes = pgTable(
  "meal_history_recipe",
  {
    mealHistoryId: text("mealHistoryId")
      .notNull()
      .references(() => mealHistory.id, { onDelete: "cascade" }),
    recipeId: text("recipeId")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.mealHistoryId, t.recipeId] })]
);

// Re-exported so callers of this schema module can reference the domain
// shapes it stores without a second import from src/mcp/domain/types.
export type { FoodProfile, HouseholdMember, MealHistoryEntry };
