"use client";

import { useCallback, useSyncExternalStore } from "react";
import { dismissTimer, getTimersSnapshot, startTimer, subscribeTimers, type TimerRecord } from "@/lib/timers";

export interface StepTimerView {
  recipeId: string;
  order: number;
  label: string;
  minutes: number;
  secondsLeft: number;
  running: boolean;
  expired: boolean;
}

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function toView(timer: TimerRecord): StepTimerView {
  const secondsLeft = Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
  return {
    recipeId: timer.recipeId,
    order: timer.order,
    label: timer.label,
    minutes: timer.minutes,
    secondsLeft,
    running: !timer.alerted,
    expired: timer.alerted,
  };
}

const emptySnapshot: TimerRecord[] = [];

/**
 * All in-flight timers for one recipe, live-updating every tick of the
 * shared timer engine (src/lib/timers.ts) regardless of which step is
 * currently on screen.
 */
export function useRecipeTimers(recipeId: string) {
  const all = useSyncExternalStore(subscribeTimers, getTimersSnapshot, () => emptySnapshot);
  const timers = all.filter((t) => t.recipeId === recipeId).map(toView);

  const start = useCallback(
    (order: number, minutes: number, label: string) => startTimer(recipeId, order, minutes, label),
    [recipeId],
  );
  const dismiss = useCallback((order: number) => dismissTimer(recipeId, order), [recipeId]);

  return { timers, start, dismiss };
}

/** Every timer, across all recipes, that has finished and not yet been dismissed. */
export function useExpiredTimers(): StepTimerView[] {
  const all = useSyncExternalStore(subscribeTimers, getTimersSnapshot, () => emptySnapshot);
  return all.filter((t) => t.alerted).map(toView);
}
