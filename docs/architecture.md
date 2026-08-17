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
every asset actually fetched while online gets cached, and a dropped
connection falls back to the cached copy (or `/` for an uncached
navigation).

That alone isn't enough to guarantee a recipe opens offline on a first-ever
visit, for two reasons that both trace back to the same root cause — a
service worker never controls the page load that first registers it, so it
can't opportunistically cache that load's own requests:

- **Recipe pages you never visited while online** wouldn't be cached at
  all if caching only happened opportunistically.
- **The hydration JS/CSS chunks** a route needs are content-hashed
  filenames unknown until after the build runs, so they can't be
  hand-written into the service worker source.

`scripts/generate-sw-precache.mjs` closes both gaps. It runs as the
`postbuild` step (after `next build`, so `out/` already exists) and
rewrites the *built* `out/sw.js` (not the `public/sw.js` source template)
with a precache list covering every recipe/cook route (from
`seed-recipes.ts`) plus every hashed file under `out/_next/static`. The
service worker's `install` handler fetches and caches that whole list
before it ever activates, so as long as the service worker has installed
once — which happens on the very first visit, before it even controls that
page — every recipe opens offline from that point on, with no second
reload required. `CACHE_VERSION` is a hash of the precached file list, so
a build that changes any asset gets a fresh cache namespace and evicts the
old one (see the `activate` handler) for returning users.

If a recipe is ever added or removed, `postbuild` regenerates this list
automatically — nothing to remember to update by hand.

## Navigation uses plain `<a>`, not `next/link`

Every internal link in this app is a plain `<a href>`, not `next/link`'s
`<Link>`. That's deliberate: `<Link>` does a client-side "soft" navigation
that fetches a small RSC data payload for the target route over the
network on every click, with no offline fallback — if that fetch fails,
the navigation just silently aborts. It only worked offline when that
exact payload happened to already be cached, which wasn't reliable
(viewport-based prefetch timing, cache-key/token mismatches). A plain
`<a>` triggers a full document navigation instead, which goes through the
service worker's own cache-fallback logic above — the thing already
verified to work offline. For an app whose whole premise is "must not fail
mid-recipe with no signal," a full page load beats a snappier transition
that can silently do nothing.

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
