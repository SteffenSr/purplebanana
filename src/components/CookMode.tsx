"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { markCookedAction, saveIngredientNoteAction, saveStepNoteAction } from "@/app/actions/recipes";
import { ingredientKey } from "@/lib/ingredient-key";
import { useWakeLock } from "@/lib/use-wake-lock";
import { formatClock, useRecipeTimers, type StepTimerView } from "@/lib/use-timers";
import { useLocale } from "@/lib/use-locale";
import { NoteSheet } from "./NoteSheet";
import type { Step } from "@/lib/types";
import type { RecipeWithState } from "@/lib/recipes-db";
import type { Locale } from "@/lib/locale";
import type { Dictionary } from "@/lib/translations";

export function CookMode({ id, recipe }: { id: string; recipe: RecipeWithState | undefined }) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [noteStep, setNoteStep] = useState<Step | null>(null);
  const [openIngredient, setOpenIngredient] = useState<{
    key: string;
    label: string;
    ingredientId?: string;
  } | null>(null);

  // Keep the screen from locking mid-instruction — the point of this whole screen.
  useWakeLock();

  const steps = useMemo(() => recipe?.steps ?? [], [recipe]);
  const currentStep: Step | undefined = activeIndex < steps.length ? steps[activeIndex] : undefined;

  const { timers, start: startTimer, dismiss: dismissTimer } = useRecipeTimers(id);
  const timersElsewhere = currentStep ? timers.filter((tm) => tm.order !== currentStep.order) : timers;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollToStep = (index: number) => {
    stepRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Track which step is snapped into view so the (tiny) progress readout
  // and the "other timer" strip know what's current — the step content
  // itself is rendered for every step at once, not swapped per index.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || steps.length === 0) return;
    const ratios = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.stepIndex);
          ratios.set(index, entry.intersectionRatio);
        }
        let bestIndex = 0;
        let bestRatio = -1;
        ratios.forEach((ratio, index) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = index;
          }
        });
        setActiveIndex(bestIndex);
      },
      { root: container, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [steps.length, id]);

  // Reset progress when navigating to a different recipe's cook mode,
  // adjusted during render (React's recommended pattern) rather than an effect.
  const [lastId, setLastId] = useState(id);
  if (lastId !== id) {
    setLastId(id);
    setActiveIndex(0);
    setFinished(false);
    setNoteStep(null);
    setOpenIngredient(null);
  }
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [id]);

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

  const shownStep = Math.min(activeIndex + 1, steps.length);
  const progressPct = Math.round((shownStep / steps.length) * 100);

  return (
    <div className="cook-mode">
      <div className="cook-mode__top">
        {/* Plain <a>: see docs/architecture.md's "Navigation" section. */}
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
        <span className="cook-mode__count">
          {shownStep} / {steps.length}
        </span>
      </div>

      {timersElsewhere.length > 0 && (
        <div className="cook-mode__timer-strip">
          {timersElsewhere.map((timer) => (
            <button
              key={timer.order}
              type="button"
              className={
                "cook-mode__other-timer" + (timer.expired ? " cook-mode__other-timer--expired" : "")
              }
              onClick={() => {
                const target = steps.findIndex((s) => s.order === timer.order);
                if (target !== -1) scrollToStep(target);
              }}
            >
              {timer.expired
                ? t.cookMode.otherStepDone(timer.order)
                : t.cookMode.otherStepClock(timer.order, formatClock(timer.secondsLeft))}
            </button>
          ))}
        </div>
      )}

      <div className="cook-mode__steps" ref={scrollRef}>
        {steps.map((step, index) => (
          <StepPanel
            key={step.order}
            step={step}
            recipe={recipe}
            locale={locale}
            t={t}
            isActive={index === activeIndex}
            setRef={(el) => {
              stepRefs.current[index] = el;
            }}
            dataIndex={index}
            timer={timers.find((tm) => tm.order === step.order)}
            onStartTimer={() =>
              startTimer(
                step.order,
                step.timerMinutes!,
                `${t.cookMode.step(step.order)}: ${step.instruction[locale]}`,
              )
            }
            onDismissTimer={() => dismissTimer(step.order)}
            onOpenNote={() => setNoteStep(step)}
            onOpenIngredient={(ing) =>
              setOpenIngredient({ key: ingredientKey(ing), label: ing.text[locale], ingredientId: ing.ingredientId })
            }
          />
        ))}

        <div
          ref={(el) => {
            stepRefs.current[steps.length] = el;
          }}
          data-step-index={steps.length}
          className="cook-mode__step cook-mode__step--finish"
        >
          <span className="cook-mode__step-label" aria-hidden>
            {recipe.emoji}
          </span>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={async () => {
              await markCookedAction(id);
              setFinished(true);
            }}
          >
            {t.cookMode.finish}
          </button>
        </div>
      </div>

      {noteStep && (
        <NoteSheet
          title={t.notes.stepTitle(noteStep.order)}
          initialNote={recipe.state.stepNotes[noteStep.order] ?? ""}
          onSave={({ note }) => {
            saveStepNoteAction(recipe.id, noteStep.order, note).then(() => router.refresh());
          }}
          onClose={() => setNoteStep(null)}
        />
      )}

      {openIngredient && (
        <NoteSheet
          title={t.notes.ingredientTitle(openIngredient.label)}
          ingredientId={openIngredient.ingredientId}
          showAmount
          initialNote={recipe.state.ingredientNotes[openIngredient.key]?.note ?? ""}
          initialAmount={recipe.state.ingredientNotes[openIngredient.key]?.amount ?? ""}
          onSave={({ note, amount }) => {
            saveIngredientNoteAction(recipe.id, openIngredient.key, { note, amount }).then(() => router.refresh());
          }}
          onClose={() => setOpenIngredient(null)}
        />
      )}
    </div>
  );
}

interface StepPanelProps {
  step: Step;
  recipe: RecipeWithState;
  locale: Locale;
  t: Dictionary;
  isActive: boolean;
  setRef: (el: HTMLDivElement | null) => void;
  dataIndex: number;
  timer: StepTimerView | undefined;
  onStartTimer: () => void;
  onDismissTimer: () => void;
  onOpenNote: () => void;
  onOpenIngredient: (ingredient: RecipeWithState["ingredients"][number]) => void;
}

function StepPanel({
  step,
  recipe,
  locale,
  t,
  isActive,
  setRef,
  dataIndex,
  timer,
  onStartTimer,
  onDismissTimer,
  onOpenNote,
  onOpenIngredient,
}: StepPanelProps) {
  const stepNote = recipe.state.stepNotes[step.order];
  const stepIngredients = (step.ingredientRefs ?? [])
    .map((key) => recipe.ingredients.find((ing) => ingredientKey(ing) === key))
    .filter((ing): ing is NonNullable<typeof ing> => !!ing);

  return (
    <div
      ref={setRef}
      data-step-index={dataIndex}
      className={"cook-mode__step" + (isActive ? " is-active" : "")}
    >
      <div className="cook-mode__step-head">
        <span className="cook-mode__step-label">{t.cookMode.step(step.order)}</span>
        <div className="cook-mode__step-head-actions">
          {step.timerMinutes && (
            <button
              type="button"
              className={
                "cook-mode__timer-btn" +
                (timer?.running ? " cook-mode__timer-btn--running" : "") +
                (timer?.expired ? " cook-mode__timer-btn--expired" : "")
              }
              onClick={timer ? onDismissTimer : onStartTimer}
              aria-label={
                timer?.expired
                  ? t.cookMode.timerDone
                  : timer?.running
                    ? t.cookMode.cancelTimer
                    : t.cookMode.startTimer(step.timerMinutes)
              }
            >
              {timer ? formatClock(timer.secondsLeft) : step.timerMinutes}
            </button>
          )}
          <button
            type="button"
            className={"cook-mode__note-btn" + (stepNote ? " cook-mode__note-btn--filled" : "")}
            onClick={onOpenNote}
            aria-label={t.notes.stepTitle(step.order)}
          >
            {stepNote ? "📝" : "🗒️"}
          </button>
        </div>
      </div>

      <p className="cook-mode__step-text">{step.instruction[locale]}</p>

      {stepIngredients.length > 0 && (
        <ul className="cook-mode__ingredients">
          {stepIngredients.map((ing) => {
            const key = ingredientKey(ing);
            const label = ing.text[locale];
            const amount = recipe.state.ingredientNotes[key]?.amount;
            return (
              <li key={key}>
                <button
                  type="button"
                  className="cook-mode__ingredient-chip"
                  onClick={() => onOpenIngredient(ing)}
                >
                  {label}
                  {amount && <span className="cook-mode__ingredient-chip-amount">{amount}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
