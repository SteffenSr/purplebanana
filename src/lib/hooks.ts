"use client";

import { useCallback, useEffect, useState } from "react";
import { ensureSeeded, getAllRecipes, getRecipe } from "./db";
import type { Recipe } from "./types";

type AsyncState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; error: string };

export function useRecipes() {
  const [state, setState] = useState<AsyncState<Recipe[]>>({ status: "loading" });

  const refresh = useCallback(async () => {
    try {
      await ensureSeeded();
      const recipes = await getAllRecipes();
      setState({ status: "ready", data: recipes });
    } catch (err) {
      setState({ status: "error", error: (err as Error).message });
    }
  }, []);

  useEffect(() => {
    // Async IndexedDB read on mount/id-change — setState happens after the
    // await, not synchronously within the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return { state, refresh };
}

export function useRecipe(id: string) {
  const [state, setState] = useState<AsyncState<Recipe | undefined>>({ status: "loading" });

  const refresh = useCallback(async () => {
    try {
      await ensureSeeded();
      const recipe = await getRecipe(id);
      setState({ status: "ready", data: recipe });
    } catch (err) {
      setState({ status: "error", error: (err as Error).message });
    }
  }, [id]);

  useEffect(() => {
    // Async IndexedDB read on mount/id-change — setState happens after the
    // await, not synchronously within the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return { state, refresh };
}
