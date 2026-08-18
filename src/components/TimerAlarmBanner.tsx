"use client";

import { dismissTimer } from "@/lib/timers";
import { useExpiredTimers } from "@/lib/use-timers";
import { useLocale } from "@/lib/use-locale";

/**
 * Site-wide "a recipe timer just finished" banner. Mounted once in the root
 * layout so the alarm is visible no matter which page or cook-mode step is
 * on screen when a timer reaches zero — not just the step that started it.
 */
export function TimerAlarmBanner() {
  const expired = useExpiredTimers();
  const { t } = useLocale();
  const timer = expired[0];
  if (!timer) return null;

  return (
    <div className="timer-alarm" role="alert">
      <span className="timer-alarm__icon" aria-hidden>
        ⏰
      </span>
      <span className="timer-alarm__text">
        {t.timerAlarm.done(timer.label)}
        {expired.length > 1 ? t.timerAlarm.more(expired.length - 1) : ""}
      </span>
      <button
        type="button"
        className="btn btn-primary timer-alarm__dismiss"
        onClick={() => dismissTimer(timer.recipeId, timer.order)}
      >
        {t.timerAlarm.dismiss}
      </button>
    </div>
  );
}
