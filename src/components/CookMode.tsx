"use client";

import { useMemo, useState } from "react";
import { useRecipe } from "@/lib/hooks";
import { markCooked, saveStepNote } from "@/lib/db";
import { useWakeLock } from "@/lib/use-wake-lock";
import { formatClock, useRecipeTimers } from "@/lib/use-timers";
import { useLocale } from "@/lib/use-locale";
import { NoteSheet } from "./NoteSheet";

export function CookMode({ id }: { id: string }) {
  const { state, refresh } = useRecipe(id);
  const { locale, t } = useLocale();
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  // Keep the screen from locking mid-instruction — the point of this whole screen.
  useWakeLock();

  const recipe = state.status === "ready" ? state.data : undefined;
  const steps = useMemo(() => recipe?.steps ?? [], [recipe]);
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const currentStepNote = currentStep ? recipe?.stepNotes?.[currentStep.order] : undefined;

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
    setNoteOpen(false);
  }

  if (state.status === "loading") {
    return (
      <div className="cook-mode">
        <div className="cook-mode__body">
          <p className="text-muted">{t.cookMode.loading}</p>
        </div>
      </div>
    );
  }

  if (!recipe || steps.length === 0) {
    return (
      <div className="cook-mode">
        <div className="cook-mode__body">
          <p className="empty-state">{t.cookMode.noSteps}</p>
          <a href={`/recipes/${id}/`} className="btn btn-secondary">
            {t.cookMode.back}
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
            <h1>{t.cookMode.enjoy(recipe.title[locale])}</h1>
            <a href={`/recipes/${id}/`} className="btn btn-primary">
              {t.cookMode.backToRecipe}
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
        <a href={`/recipes/${id}/`} className="btn btn-icon" aria-label={t.cookMode.exitCookMode}>
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
        <span className="cook-mode__step-label">{t.cookMode.step(currentStep.order)}</span>
        <p className="cook-mode__step-text">{currentStep.instruction[locale]}</p>

        {currentStep.timerMinutes && !currentTimer && (
          <button
            type="button"
            className="cook-mode__timer"
            onClick={() =>
              startTimer(
                currentStep.order,
                currentStep.timerMinutes!,
                `${t.cookMode.step(currentStep.order)}: ${currentStep.instruction[locale]}`,
              )
            }
          >
            {t.cookMode.startTimer(currentStep.timerMinutes)}
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
              {t.cookMode.cancelTimer}
            </button>
          </div>
        )}

        {currentTimer?.expired && (
          <button
            type="button"
            className="cook-mode__timer cook-mode__timer--expired"
            onClick={() => dismissTimer(currentStep.order)}
          >
            {t.cookMode.timerDone}
          </button>
        )}

        {otherTimers.length > 0 && (
          <div className="cook-mode__other-timers">
            {otherTimers.map((timer) => (
              <button
                key={timer.order}
                type="button"
                className={
                  "cook-mode__other-timer" + (timer.expired ? " cook-mode__other-timer--expired" : "")
                }
                onClick={() => {
                  const target = steps.findIndex((s) => s.order === timer.order);
                  if (target !== -1) setStepIndex(target);
                }}
              >
                {timer.expired
                  ? t.cookMode.otherStepDone(timer.order)
                  : t.cookMode.otherStepClock(timer.order, formatClock(timer.secondsLeft))}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className={"cook-mode__note" + (currentStepNote ? " cook-mode__note--filled" : "")}
          onClick={() => setNoteOpen(true)}
        >
          {currentStepNote ? `📝 ${currentStepNote}` : t.notes.addNote}
        </button>
      </div>

      {noteOpen && (
        <NoteSheet
          title={t.notes.stepTitle(currentStep.order)}
          initialNote={currentStepNote ?? ""}
          onSave={({ note }) => {
            saveStepNote(recipe.id, currentStep.order, note).then(refresh);
          }}
          onClose={() => setNoteOpen(false)}
        />
      )}

      <div className="cook-mode__nav">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
        >
          {t.cookMode.back}
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
          {isLastStep ? t.cookMode.finish : t.cookMode.next}
        </button>
      </div>
    </div>
  );
}
