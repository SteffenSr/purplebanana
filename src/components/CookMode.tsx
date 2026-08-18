"use client";

import { useMemo, useState } from "react";
import { useRecipe } from "@/lib/hooks";
import { markCooked } from "@/lib/db";
import { useWakeLock } from "@/lib/use-wake-lock";
import { formatClock, useRecipeTimers } from "@/lib/use-timers";

export function CookMode({ id }: { id: string }) {
  const { state } = useRecipe(id);
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  // Keep the screen from locking mid-instruction — the point of this whole screen.
  useWakeLock();

  const recipe = state.status === "ready" ? state.data : undefined;
  const steps = useMemo(() => recipe?.steps ?? [], [recipe]);
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const { timers, start: startTimer, dismiss: dismissTimer } = useRecipeTimers(id);
  const currentTimer = currentStep ? timers.find((t) => t.order === currentStep.order) : undefined;
  const otherTimers = currentStep ? timers.filter((t) => t.order !== currentStep.order) : timers;

  // Reset progress when navigating to a different recipe's cook mode,
  // adjusted during render (React's recommended pattern) rather than an effect.
  const [lastId, setLastId] = useState(id);
  if (lastId !== id) {
    setLastId(id);
    setStepIndex(0);
    setFinished(false);
  }

  if (state.status === "loading") {
    return (
      <div className="cook-mode">
        <div className="cook-mode__body">
          <p className="text-muted">Loading recipe…</p>
        </div>
      </div>
    );
  }

  if (!recipe || steps.length === 0) {
    return (
      <div className="cook-mode">
        <div className="cook-mode__body">
          <p className="empty-state">This recipe has no steps to cook.</p>
          <a href={`/recipes/${id}/`} className="btn btn-secondary">
            ← Back
          </a>
        </div>
      </div>
    );
  }

  if (!currentStep) {
    return null;
  }

  if (finished) {
    return (
      <div className="cook-mode">
        <div className="cook-mode__body">
          <div className="cook-mode__done">
            <span style={{ fontSize: "4rem" }} aria-hidden>
              {recipe.emoji}
            </span>
            <h1>Enjoy your {recipe.title}!</h1>
            <a href={`/recipes/${id}/`} className="btn btn-primary">
              Back to recipe
            </a>
          </div>
        </div>
      </div>
    );
  }

  const progressPct = Math.round(((stepIndex + 1) / steps.length) * 100);

  return (
    <div className="cook-mode">
      <div className="cook-mode__top">
        {/* Plain <a>: see RecipeCard.tsx for why this app avoids next/link. */}
        <a href={`/recipes/${id}/`} className="btn btn-icon" aria-label="Exit cook mode">
          ✕
        </a>
        <div
          className="cook-mode__progress"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="cook-mode__progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-muted">
          {stepIndex + 1} / {steps.length}
        </span>
      </div>

      <div className="cook-mode__body">
        <span className="cook-mode__step-label">Step {currentStep.order}</span>
        <p className="cook-mode__step-text">{currentStep.instruction}</p>

        {currentStep.timerMinutes && !currentTimer && (
          <button
            type="button"
            className="cook-mode__timer"
            onClick={() =>
              startTimer(
                currentStep.order,
                currentStep.timerMinutes!,
                `Step ${currentStep.order}: ${currentStep.instruction}`,
              )
            }
          >
            ⏲ Start {currentStep.timerMinutes} min timer
          </button>
        )}

        {currentTimer?.running && (
          <div className="cook-mode__timer-group">
            <span className="cook-mode__timer cook-mode__timer--running">{formatClock(currentTimer.secondsLeft)}</span>
            <button
              type="button"
              className="cook-mode__timer-cancel"
              onClick={() => dismissTimer(currentStep.order)}
            >
              Cancel timer
            </button>
          </div>
        )}

        {currentTimer?.expired && (
          <button
            type="button"
            className="cook-mode__timer cook-mode__timer--expired"
            onClick={() => dismissTimer(currentStep.order)}
          >
            ⏰ Done — tap to dismiss
          </button>
        )}

        {otherTimers.length > 0 && (
          <div className="cook-mode__other-timers">
            {otherTimers.map((t) => (
              <button
                key={t.order}
                type="button"
                className={
                  "cook-mode__other-timer" + (t.expired ? " cook-mode__other-timer--expired" : "")
                }
                onClick={() => {
                  const target = steps.findIndex((s) => s.order === t.order);
                  if (target !== -1) setStepIndex(target);
                }}
              >
                Step {t.order} · {t.expired ? "Done ⏰" : formatClock(t.secondsLeft)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="cook-mode__nav">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
        >
          ← Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            if (isLastStep) {
              await markCooked(id);
              setFinished(true);
            } else {
              setStepIndex((i) => Math.min(steps.length - 1, i + 1));
            }
          }}
        >
          {isLastStep ? "Finish 🎉" : "Next →"}
        </button>
      </div>
    </div>
  );
}
