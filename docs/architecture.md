# Architecture

## Why static export + IndexedDB

The app has no server component: `next.config.ts` sets `output: "export"`,
so `next build` produces plain HTML/CSS/JS in `out/` that can be hosted on
any static file host (GitHub Pages, Netlify, S3, etc.) with no Node runtime.

That constrains the app in one important way: **there is no server to hold
state or run dynamic routes on demand.** So:

- Every dynamic route (`/recipes/[id]`, `/recipes/[id]/cook`) is fully
  prerendered at build time via `generateStaticParams`, sourced from
  `src/lib/seed-recipes.ts`. Adding a recipe to that file and rebuilding is
  what gives it its own page.
- The actual data the UI reads and writes at runtime lives in the
  **browser's IndexedDB** (via Dexie, `src/lib/db.ts`), not in the static
  HTML. `ensureSeeded()` copies `seed-recipes.ts` into IndexedDB once, on
  first load, and every read after that goes through IndexedDB. This is
  what makes per-device state (favorites, last-cooked date) possible
  without a backend, and it's the actual mechanism behind "works offline":
  once seeded, the app never needs to fetch recipe content again.

## Layers

```
seed-recipes.ts  (build-time constant, ships in the JS bundle)
       │  ensureSeeded() — copy-once, only if the store is empty
       ▼
   IndexedDB      (src/lib/db.ts — Dexie, the real runtime database)
       │  getAllRecipes / getRecipe / toggleFavorite / markCooked
       ▼
  hooks.ts        (useRecipes / useRecipe — client components call these)
       │
       ▼
  components      (RecipeCard, RecipeDetail, CookMode)
```

Components never touch `db.recipes` directly — always through
`src/lib/hooks.ts` or the exported functions in `src/lib/db.ts`. That keeps
the "only run in the browser" guard and error handling in one place instead
of scattered through the UI.

## Offline loading

`public/sw.js` is a hand-rolled service worker (no Workbox/next-pwa
dependency) registered from `src/components/ServiceWorkerRegister.tsx`. It
uses a network-first, cache-fallback strategy for same-origin GET requests:
every page and asset visited while online gets cached, and a dropped
connection falls back to the cached copy (or `/` for unmatched
navigations). Combined with IndexedDB already holding the recipe data, a
device that has opened the app once can open it again with zero network
access.

One inherent caveat (not a bug, standard service worker behavior): a
service worker never controls the page load that first registers it, so
the very first visit's own JS/CSS chunks are fetched normally and only
start getting cached once the worker activates and calls `clients.claim()`.
In practice this means full offline support kicks in from the **second**
page load onward, not the very first — a second load (even the same
session, e.g. a hard refresh) is what completes the app-shell cache.

## Cook mode

`src/components/CookMode.tsx` is the screen the whole app exists to
deliver: one step at a time, at very large type, with a two-button
back/next flow so it works with wet or floury hands. It also:

- requests a **Wake Lock** (`src/lib/use-wake-lock.ts`) so the screen
  doesn't dim mid-instruction — best-effort, no-ops on unsupported browsers;
- offers an optional per-step **countdown timer**
  (`src/lib/use-countdown.ts`) for steps with real dead time
  (`Step.timerMinutes`);
- calls `markCooked()` on finishing, which is the one place the app writes
  a timestamp back to IndexedDB from the cooking flow itself.
