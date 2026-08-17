"use client";

import { useEffect, useRef, useState } from "react";

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * A simple start/pause countdown for a step's optional timer.
 * `resetKey` (e.g. the step's order) forces a fresh countdown even when two
 * consecutive steps happen to share the same duration.
 */
export function useCountdown(minutes: number | undefined, resetKey: unknown) {
  const [secondsLeft, setSecondsLeft] = useState((minutes ?? 0) * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Adjust state during render when the step changes, per React's guidance
  // for resetting state on a changing key — avoids an extra effect-driven render.
  const [lastKey, setLastKey] = useState(resetKey);
  if (lastKey !== resetKey) {
    setLastKey(resetKey);
    setSecondsLeft((minutes ?? 0) * 60);
    setRunning(false);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const toggle = () => {
    setRunning((r) => {
      const next = !r;
      if (next) {
        intervalRef.current = setInterval(() => {
          setSecondsLeft((s) => {
            if (s <= 1) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setRunning(false);
              return 0;
            }
            return s - 1;
          });
        }, 1000);
      } else if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return next;
    });
  };

  return {
    running,
    display: formatClock(secondsLeft),
    toggle,
  };
}
