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

`scripts/generate-sw-precache.mjs` closes both gaps — and it *is*
`package.json`'s `"build"` script (`"build": "node
scripts/generate-sw-precache.mjs"`), not a step chained after `next
build`. That's the result of two rounds of this shipping broken in
production despite working perfectly locally; both are worth knowing
before touching this script.

**Round 1 — it ran as an npm `postbuild` hook.** Vercel's inferred build
command for a detected Next.js project is `next build` directly, not
`npm run build`, and npm's `pre`/`postbuild` hooks only fire for the
latter — so Vercel silently skipped it. Fixed by adding `vercel.json`'s
`"buildCommand": "npm run build"`, pinning the deploy host to a command
that actually runs our script regardless of its own framework-detection
defaults.

**Round 2 — even with the right command running, it rewrote the wrong
file.** The script used to run once, after `next build`, and patch the
precache list directly into the *built* `out/sw.js`. That works for a
plain static file server (serving `out/` with e.g. `npx serve`), which is
how it was tested — but not on Vercel. Per Next.js's own docs, "the
public directory isn't a real directory, it's a collection of routes
created at build time": Vercel snapshots `public/` into its serving
manifest *during* `next build` itself, so a post-hoc edit to `out/sw.js`
never reaches what Vercel actually serves, even though the build
"succeeds" and the source-level content looks right.

The fix requires the correct content to exist in `public/sw.js` *before*
a build snapshots it — but the precache list needs every hashed JS/CSS
chunk filename, and those don't exist until *after* a build compiles
them. So the script runs `next build` twice:

1. Build once (thrown away) to learn the real chunk filenames.
2. Compute the precache list from that output and write it into
   `public/sw.js` — the committed source file.
3. Build again, so *this* build's snapshot of `public/sw.js` (and thus
   `out/sw.js`) carries the real list.
4. Restore `public/sw.js` to its original committed template content, so
   a local `npm run build` doesn't leave the working tree dirty —
   `out/sw.js` (gitignored) keeps the generated version from step 3.

`next.config.ts` pins `generateBuildId` to a fixed string for this to
work: Next.js also writes a few manifest files under a
`_next/static/<buildId>/` directory where the ID is randomized fresh on
every `next build` invocation by default, which would otherwise make the
two passes disagree on that directory's name even though the
content-hashed chunk *filenames* are already stable across them (public/
assets aren't bundled into JS/CSS, so changing `public/sw.js` between
passes doesn't affect those hashes).

`CACHE_VERSION` is a hash of the final precached file list, so a build
that changes any asset gets a fresh cache namespace and evicts the old one
(see the `activate` handler) for returning users. If a recipe is ever
added or removed, the whole two-pass build regenerates the list
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
