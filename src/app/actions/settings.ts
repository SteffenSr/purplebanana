"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as tokensDb from "@/lib/personal-access-tokens-db";
import * as foodProfileDb from "@/lib/food-profile-db";
import type { PersonalAccessTokenRow } from "@/lib/personal-access-tokens-db";
import type { FoodPreferences, HouseholdMemberRow } from "@/lib/food-profile-db";

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not signed in.");
  return userId;
}

export async function listTokensAction(): Promise<PersonalAccessTokenRow[]> {
  const userId = await requireUserId();
  return tokensDb.listPersonalAccessTokens(userId);
}

/** Returns the raw token — the settings page shows it exactly once. */
export async function generateTokenAction(label: string): Promise<string> {
  const userId = await requireUserId();
  const token = await tokensDb.createPersonalAccessToken(userId, label.trim() || "Untitled token");
  revalidatePath("/settings");
  return token;
}

export async function revokeTokenAction(tokenId: string): Promise<void> {
  const userId = await requireUserId();
  await tokensDb.revokePersonalAccessToken(userId, tokenId);
  revalidatePath("/settings");
}

function parseList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function saveFoodPreferencesAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const preferences: FoodPreferences = {
    dietaryPreferences: parseList(formData.get("dietaryPreferences")),
    dislikes: parseList(formData.get("dislikes")),
    favoriteIngredients: parseList(formData.get("favoriteIngredients")),
    goals: parseList(formData.get("goals")),
  };
  await foodProfileDb.saveFoodPreferences(userId, preferences);
  revalidatePath("/settings");
}

export async function listHouseholdMembersAction(): Promise<HouseholdMemberRow[]> {
  const userId = await requireUserId();
  return foodProfileDb.listHouseholdMembers(userId);
}

export async function addHouseholdMemberAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await foodProfileDb.addHouseholdMember(userId, {
    name,
    likes: parseList(formData.get("likes")),
    dislikes: parseList(formData.get("dislikes")),
  });
  revalidatePath("/settings");
}

export async function removeHouseholdMemberAction(memberId: string): Promise<void> {
  const userId = await requireUserId();
  await foodProfileDb.removeHouseholdMember(userId, memberId);
  revalidatePath("/settings");
}
