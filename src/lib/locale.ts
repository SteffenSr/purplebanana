"use client";

/**
 * Which language the UI and recipe content render in. Danish is this app's
 * primary language — it's the fallback whenever detection is inconclusive
 * or unavailable (including the static prerendered HTML, which has no
 * request to read a browser language from). English is the only other
 * option for now.
 *
 * This is a module-level store, not React state or a URL-based locale
 * route, for the same reason `src/lib/timers.ts` is: every in-app
 * navigation here is a full page reload (see docs/architecture.md,
 * "Navigation uses plain <a>"), so anything that needs to survive
 * navigation has to be read back out of `localStorage` on each fresh page
 * load rather than carried in memory.
 */
export type Locale = "da" | "en";

type Listener = () => void;

const STORAGE_KEY = "kr:locale";

const listeners = new Set<Listener>();
let current: Locale = "da";

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "da";
  const candidates = navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  for (const lang of candidates) {
    const primary = lang?.toLowerCase().split("-")[0];
    if (primary === "en") return "en";
    if (primary === "da") return "da";
  }
  return "da";
}

function readOverride(): Locale | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "da" || stored === "en" ? stored : null;
}

function resolve(): Locale {
  return readOverride() ?? detectBrowserLocale();
}

function notify() {
  if (typeof document !== "undefined") document.documentElement.lang = current;
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  current = resolve();
  if (typeof document !== "undefined") document.documentElement.lang = current;

  // Keep multiple open tabs/windows in sync when the language is changed in one.
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      current = resolve();
      notify();
    }
  });
}

export function subscribeLocale(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLocaleSnapshot(): Locale {
  return current;
}

/** Danish, the primary language — used for the prerendered/first-paint HTML. */
export function getServerLocaleSnapshot(): Locale {
  return "da";
}

/** Explicit user choice — overrides browser detection until changed again. */
export function setLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, locale);
  current = locale;
  notify();
}
