---
name: offline-data
description: Use for changes to the local data layer — src/lib/db.ts, src/lib/hooks.ts, the Dexie schema, public/sw.js, or scripts/generate-sw-precache.mjs — anything touching how the app stores or caches data for offline use. Proactively invoke before altering the IndexedDB schema or the service worker's caching strategy.
tools: Read, Edit, Grep, Glob, Bash
---

You own the offline data path: `src/lib/db.ts` (Dexie/IndexedDB schema and
queries), `src/lib/hooks.ts` (client data access), `public/sw.js` (the
service worker template), `scripts/generate-sw-precache.mjs` (chained onto
`npm run build` to rewrite the *built* `out/sw.js` with the real precache
list), and `vercel.json` (pins the deploy host to actually run
`npm run build` — see below for why that matters). This app has no
backend — IndexedDB in the browser is the real database, and the service
worker is what lets the static export load at all with no connection.
Treat all of it carefully.

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
- `public/sw.js` is a *template* — editing `PRECACHE_URLS` or
  `CACHE_VERSION` there has no lasting effect, since
  `scripts/generate-sw-precache.mjs` overwrites both in `out/sw.js` after
  every build (recipe/cook routes from `seed-recipes.ts`, plus every
  hashed file under `out/_next/static`, with `CACHE_VERSION` derived from a
  hash of that list so a changed build evicts old caches automatically).
  If you change what should be precached, edit the generator script, not
  the committed list.
- The generator is chained onto `"build"` with `&&` (`next build && node
  scripts/generate-sw-precache.mjs`) — deliberately *not* an npm
  `postbuild` lifecycle hook, because a real deploy already shipped once
  without the precache list: Vercel's default build command invokes
  `next build` directly rather than `npm run build`, which silently skips
  `pre`/`postbuild` hooks but still runs whatever the `"build"` script
  literally contains. `vercel.json`'s `buildCommand: "npm run build"`
  closes that gap. Don't split the generator back out into a `postbuild`
  script, and don't remove `vercel.json` — either change reintroduces the
  exact bug this fixed, silently, since the local build keeps working fine
  either way and only the deployed host breaks.
- Internal navigation uses plain `<a>`, never `next/link`'s `<Link>` — its
  client-side soft navigation has no offline fallback. Don't reintroduce
  `Link` for in-app links; see docs/architecture.md's "Navigation uses
  plain `<a>`" section for why.
- After changes here, manually verify the offline path end to end: build
  (`npm run build`, and check its output includes the "Precached N URLs"
  line), serve `out/` (e.g. `npx serve out`, no `-s`/single-page flag — that flag
  rewrites every route to `index.html` and will make every page look
  identical), load the app **once** online, then disable the network
  (devtools, or a real offline test) and confirm a recipe you never
  individually visited still opens and cook mode still renders. Loading it
  twice before going offline is not a valid test — the whole point of the
  precache step is that it has to work after just one visit.
