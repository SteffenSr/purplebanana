"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as recipesDb from "@/lib/recipes-db";
import type { IngredientNote } from "@/lib/types";

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not signed in.");
  return userId;
}

export async function toggleFavoriteAction(recipeId: string): Promise<void> {
  const userId = await requireUserId();
  await recipesDb.toggleFavorite(userId, recipeId);
  revalidatePath("/");
  revalidatePath(`/recipes/${recipeId}`);
}

export async function markCookedAction(recipeId: string): Promise<void> {
  const userId = await requireUserId();
  await recipesDb.markCooked(userId, recipeId);
  revalidatePath(`/recipes/${recipeId}`);
}

export async function saveStepNoteAction(recipeId: string, stepOrder: number, note: string): Promise<void> {
  const userId = await requireUserId();
  await recipesDb.saveStepNote(userId, recipeId, stepOrder, note);
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath(`/recipes/${recipeId}/cook`);
}

export async function saveIngredientNoteAction(
  recipeId: string,
  key: string,
  data: IngredientNote
): Promise<void> {
  const userId = await requireUserId();
  await recipesDb.saveIngredientNote(userId, recipeId, key, data);
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath(`/recipes/${recipeId}/cook`);
}
