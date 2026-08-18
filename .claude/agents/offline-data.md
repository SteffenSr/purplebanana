---
name: offline-data
description: Use for changes to the local data layer — src/lib/db.ts, src/lib/hooks.ts, the Dexie schema, public/sw.js, or scripts/generate-sw-precache.mjs — anything touching how the app stores or caches data for offline use. Proactively invoke before altering the IndexedDB schema or the service worker's caching strategy.
tools: Read, Edit, Grep, Glob, Bash
---

You own the offline data path: `src/lib/db.ts` (Dexie/IndexedDB schema and
queries), `src/lib/hooks.ts` (client data access), `public/sw.js` (the
service worker template), `scripts/generate-sw-precache.mjs` (which *is*
the `"build"` npm script — see below), `next.config.ts`'s `generateBuildId`
setting, and `vercel.json`. This app has no backend — IndexedDB in the
browser is the real database, and the service worker is what lets the
static export load at all with no connection. Treat all of it carefully;
this path has shipped broken to production twice already for non-obvious
reasons, both captured below and in docs/architecture.md's "Offline
loading" section — read that before changing the build/precache flow.

Rules:

- **Schema changes** (`db.ts`'s `this.version(N).stores({...})`) must bump
  the Dexie version number, never edit an existing version's schema in
  place — that breaks upgrades for anyone with existing local data. Add a
  new `.version()` block with an `.upgrade()` if data needs migrating.
- `ensureSeeded()` reconciles IndexedDB against `seed-recipes.ts` on
  *every* launch, not just when the store is empty — it used to be
  empty-store-only, which meant a returning user's device stayed stuck on
  its first-ever recipe set forever, immune to any redeploy or cache
  clear. Don't revert to that. It preserves each stored recipe's
  `favorite`/`lastCookedAt` across a content update by only refreshing
  fields when the bundled `updatedAt` is newer — see its doc comment in
  `db.ts` for the exact merge rules before touching it.
- Keep IndexedDB access behind `src/lib/hooks.ts` / `db.ts` — don't reach
  into `db.recipes` directly from components; that keeps SSR-safety (guard
  any browser-only API) and error handling in one place.
- `public/sw.js` is a *template*, committed with `CACHE_VERSION = "dev"`
  and a bare-bones `PRECACHE_URLS`. Hand-editing those two values has no
  lasting effect — don't bother. If you need to change *what* gets
  precached, edit `scripts/generate-sw-precache.mjs`.
- **`scripts/generate-sw-precache.mjs` is `package.json`'s `"build"`
  script**, not a step chained after `next build`. It runs `next build`
  *twice*: once (thrown away) to learn the real hashed chunk filenames,
  then it writes the full precache list (every recipe/cook route from
  `seed-recipes.ts`, every recipe photo under `public/images/recipes/`,
  plus every hashed file under `_next/static`, with `CACHE_VERSION` a hash
  of that list) into `public/sw.js` itself, builds
  again for real, then restores `public/sw.js` to the committed template
  so a local build doesn't leave the working tree dirty. This exists
  because a single-pass "build, then patch `out/sw.js`" version shipped
  broken on Vercel: per Next's own docs, "the public directory ... [is] a
  collection of routes created at build time" — Vercel snapshots
  `public/` into its serving manifest *during* `next build`, so editing
  the built output afterwards never reaches what Vercel serves, even
  though that approach works fine for a plain static file server and
  looks completely correct in local testing.
- `next.config.ts` pins `generateBuildId` to a fixed string. Next
  otherwise randomizes that ID on every `next build` call, and the two
  passes above need to agree on the resulting `_next/static/<buildId>/`
  path for the precomputed manifest-file list to still be valid after the
  second build. Don't remove this without understanding why it's there.
- `vercel.json` pins `buildCommand` to `npm run build`. Vercel's inferred
  default for a detected Next.js project is `next build` directly, which
  silently skips whatever npm-script-level logic exists — this was the
  *first* way this shipped broken, before the `out/sw.js`-patching issue
  above was even found. Don't remove `vercel.json`.
- Internal navigation uses plain `<a>`, never `next/link`'s `<Link>` — its
  client-side soft navigation has no offline fallback. Don't reintroduce
  `Link` for in-app links; see docs/architecture.md's "Navigation uses
  plain `<a>`" section for why.
- After changes here, verify against the **actual deploy target**, not
  just a local static server — the two production bugs above both passed
  local testing cleanly. At minimum: run `npm run build` and confirm its
  output ends with a "Precached N URLs..." line; confirm `git status
  public/sw.js` is clean afterward (a dirty diff there means the
  restore-the-template step didn't run, usually because the build
  errored); serve `out/` (`npx serve out`, no `-s`/single-page flag — that
  flag rewrites every route to `index.html` and masks real routing bugs);
  load the app **once** online, then go offline and confirm a recipe you
  never individually visited still opens and cook mode still renders
  (loading twice before going offline is not a valid test — the whole
  point of precaching is that it works after one visit). If a real
  deployment is available, verify against the deployed `sw.js` too
  (`curl <site>/sw.js | grep CACHE_VERSION` should show a hash, not
  `"dev"`) — this exact class of bug only reproduced there, not locally.
