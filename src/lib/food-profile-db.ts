import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { foodProfiles, householdMembers } from "@/db/schema";
import type { FoodProfile, HouseholdMember } from "@/mcp/domain/types";

/**
 * Server-only data-access layer over `food_profile`/`household_member` —
 * shared by the MCP server's get_food_profile tool
 * (src/mcp/repositories/drizzle-food-profile-repository.ts) and the
 * account settings page's Server Actions (src/app/actions/settings.ts),
 * same reasoning as src/lib/recipes-db.ts for recipes.
 */

export interface FoodPreferences {
  dietaryPreferences: string[];
  dislikes: string[];
  favoriteIngredients: string[];
  goals: string[];
}

const emptyPreferences: FoodPreferences = {
  dietaryPreferences: [],
  dislikes: [],
  favoriteIngredients: [],
  goals: [],
};

export async function getFoodPreferences(userId: string): Promise<FoodPreferences> {
  const [row] = await db.select().from(foodProfiles).where(eq(foodProfiles.userId, userId));
  if (!row) return emptyPreferences;
  return {
    dietaryPreferences: row.dietaryPreferences,
    dislikes: row.dislikes,
    favoriteIngredients: row.favoriteIngredients,
    goals: row.goals,
  };
}

export async function saveFoodPreferences(userId: string, preferences: FoodPreferences): Promise<void> {
  await db
    .insert(foodProfiles)
    .values({ userId, ...preferences })
    .onConflictDoUpdate({ target: foodProfiles.userId, set: preferences });
}

export interface HouseholdMemberRow extends HouseholdMember {
  id: string;
}

export async function listHouseholdMembers(userId: string): Promise<HouseholdMemberRow[]> {
  const rows = await db.select().from(householdMembers).where(eq(householdMembers.userId, userId));
  return rows.map((row) => ({ id: row.id, name: row.name, likes: row.likes, dislikes: row.dislikes }));
}

export async function addHouseholdMember(userId: string, member: HouseholdMember): Promise<void> {
  await db.insert(householdMembers).values({ userId, ...member });
}

export async function removeHouseholdMember(userId: string, memberId: string): Promise<void> {
  await db.delete(householdMembers).where(and(eq(householdMembers.userId, userId), eq(householdMembers.id, memberId)));
}

/** The full get_food_profile view — always returns a shape, never undefined, so a new user still gets a usable response. */
export async function getFoodProfile(userId: string): Promise<FoodProfile> {
  const [preferences, members] = await Promise.all([getFoodPreferences(userId), listHouseholdMembers(userId)]);
  return {
    userId,
    ...preferences,
    householdMembers: members.map(({ name, likes, dislikes }) => ({ name, likes, dislikes })),
  };
}
