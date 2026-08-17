"use client";

import { useEffect } from "react";

/**
 * Keeps the screen awake while cook mode is open — a phone that dims
 * mid-recipe is the single most annoying thing about cooking from a screen.
 * Best-effort: silently no-ops on browsers without the Wake Lock API.
 */
export function useWakeLock() {
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;

    const acquire = async () => {
      try {
        sentinel = (await navigator.wakeLock?.request("screen")) ?? null;
      } catch {
        // Ignore: e.g. low battery, unsupported browser, backgrounded tab.
      }
    };

    acquire();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") acquire();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      sentinel?.release().catch(() => {});
    };
  }, []);
}
