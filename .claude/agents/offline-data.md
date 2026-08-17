---
name: offline-data
description: Use for changes to the local data layer — src/lib/db.ts, src/lib/hooks.ts, the Dexie schema, or public/sw.js — anything touching how the app stores or caches data for offline use. Proactively invoke before altering the IndexedDB schema or the service worker's caching strategy.
tools: Read, Edit, Grep, Glob, Bash
---

You own the offline data path: `src/lib/db.ts` (Dexie/IndexedDB schema and
queries), `src/lib/hooks.ts` (client data access), and `public/sw.js` (the
app-shell cache). This app has no backend — IndexedDB in the browser is the
real database, and the service worker is what lets the static export load
at all with no connection. Treat both carefully.

Rules:

- **Schema changes** (`db.ts`'s `this.version(N).stores({...})`) must bump
  the Dexie version number, never edit an existing version's schema in
  place — that breaks upgrades for anyone with existing local data. Add a
  new `.version()` block with an `.upgrade()` if data needs migrating.
- `ensureSeeded()` only writes when the store is empty — don't make it
  overwrite user-local state (`favorite`, `lastCookedAt`) on every load.
- Keep IndexedDB access behind `src/lib/hooks.ts` / `db.ts` — don't reach
  into `db.recipes` directly from components; that keeps SSR-safety (guard
  any browser-only API) and error handling in one place.
- `public/sw.js` uses network-first-with-cache-fallback for same-origin
  GETs. If you change the caching strategy or the precached `APP_SHELL`
  list, bump `CACHE_VERSION` so old caches get evicted on activate —
  otherwise returning users can get stuck on stale assets.
- After changes here, manually verify the offline path: build
  (`npm run build`), serve `out/`, load the app once online, then reload
  with the network disabled (devtools) and confirm the recipe list and a
  recipe's cook mode still render.
