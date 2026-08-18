"use client";

/**
 * Persistent, multi-step recipe timer engine.
 *
 * This is a module-level store (not React state) so a timer keeps counting
 * down — by wall-clock `endAt`, never a decrementing counter — no matter
 * which step is on screen, and survives the full-document navigations this
 * app uses everywhere (see docs/architecture.md, "Navigation uses plain
 * <a>"). Every page re-imports this module on load, reads any in-flight
 * timers back out of localStorage, and resumes ticking from `endAt`, so a
 * timer started in cook mode still fires its alarm after a page reload or a
 * trip to another route. The one thing it can't survive is the tab/app
 * being fully closed or suspended long enough for the browser to stop
 * running its JS — there's no server here to push a notification from.
 */

export interface TimerRecord {
  recipeId: string;
  order: number;
  label: string;
  minutes: number;
  endAt: number;
  /** Set once the expiry alarm (sound/vibration/notification) has fired. */
  alerted: boolean;
}

type Listener = () => void;

const STORAGE_KEY = "kr:timers";
const TICK_MS = 500;

let timers: Record<string, TimerRecord> = {};
let snapshot: TimerRecord[] = [];
const listeners = new Set<Listener>();
let intervalId: ReturnType<typeof setInterval> | null = null;
let audioCtx: AudioContext | null = null;

function keyOf(recipeId: string, order: number) {
  return `${recipeId}:${order}`;
}

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    timers = raw ? JSON.parse(raw) : {};
  } catch {
    timers = {};
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  } catch {
    // Ignore: e.g. private browsing storage quota.
  }
}

function notify() {
  snapshot = Object.values(timers);
  for (const listener of listeners) listener();
}

function playAlarmSound() {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  try {
    audioCtx ??= new Ctx();
    const ctx = audioCtx;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    for (const startOffset of [0, 0.5, 1]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      const t0 = ctx.currentTime + startOffset;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.4);
    }
  } catch {
    // Ignore: audio unsupported or blocked until a user gesture.
  }
}

function fireAlarm(timer: TimerRecord) {
  playAlarmSound();
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([400, 200, 400, 200, 400]);
  }
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    try {
      new Notification("Timer done", { body: timer.label, tag: keyOf(timer.recipeId, timer.order) });
    } catch {
      // Ignore: some browsers restrict Notification() outside a service worker.
    }
  }
}

function tick() {
  const now = Date.now();
  let changed = false;
  for (const timer of Object.values(timers)) {
    if (!timer.alerted && timer.endAt <= now) {
      timer.alerted = true;
      changed = true;
      fireAlarm(timer);
    }
  }
  if (changed) persist();
  notify();
  ensureTicking();
}

function ensureTicking() {
  if (typeof window === "undefined") return;
  const hasCountingDown = Object.values(timers).some((t) => !t.alerted);
  if (hasCountingDown && intervalId === null) {
    intervalId = setInterval(tick, TICK_MS);
  } else if (!hasCountingDown && intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

if (typeof window !== "undefined") {
  load();
  snapshot = Object.values(timers);
  ensureTicking();

  // Catch up immediately on return, instead of waiting for the next tick —
  // matters most after the tab was backgrounded/suspended past a timer's end.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") tick();
  });

  // Keep multiple open tabs/windows of the app in sync with each other.
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      load();
      notify();
      ensureTicking();
    }
  });
}

export function subscribeTimers(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTimersSnapshot() {
  return snapshot;
}

export function startTimer(recipeId: string, order: number, minutes: number, label: string) {
  if (typeof Notification !== "undefined" && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
  timers[keyOf(recipeId, order)] = {
    recipeId,
    order,
    label,
    minutes,
    endAt: Date.now() + minutes * 60_000,
    alerted: false,
  };
  persist();
  notify();
  ensureTicking();
}

export function dismissTimer(recipeId: string, order: number) {
  delete timers[keyOf(recipeId, order)];
  persist();
  notify();
  ensureTicking();
}
