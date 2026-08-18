# Kitchen Recipes — agent guide

This file is the canonical instructions for any AI coding agent working in
this repo (Claude Code, Cursor, Copilot, etc.). `CLAUDE.md` just points here.

## What this is

A mobile-first, statically exported **vegan** recipe app meant to be
propped up on a counter while cooking, with a particular focus on Indian
dal dishes. Three things matter more than anything else:

1. **Every recipe is vegan** — no meat, fish, dairy, eggs, or honey. This
   isn't a style preference, it's a hard content constraint.
2. **It has to be readable from across a kitchen** — large type, high
   contrast, big touch targets, minimal text per screen.
3. **It has to work with no connection** — recipes live in the browser's
   IndexedDB, not on a server, so a dead wifi signal mid-recipe is a
   non-event.

If a change works against any of those three goals, it's wrong even if it
"works."

## Stack

- **Next.js (App Router), static export** (`next.config.ts` → `output: "export"`).
  There is no Node server at runtime — every route is prerendered HTML/JS
  served from a CDN or `out/`. Dynamic routes (`/recipes/[id]`) must list
  every param via `generateStaticParams`; there is no on-demand SSR fallback.
- **TypeScript**, strict mode.
- **Dexie** (`src/lib/db.ts`) as a thin wrapper over IndexedDB — the actual
  runtime data store. `src/lib/seed-recipes.ts` is the bundled starter
  content that gets copied into IndexedDB on first launch (`ensureSeeded`).
- **Plain CSS** (`src/app/globals.css`), design tokens as CSS custom
  properties. No CSS framework, no webfonts (system font stack only, so
  the app looks right on a cold offline load).
- **Hand-rolled service worker** (`public/sw.js`), network-first with
  cache fallback for same-origin GETs. No Workbox/next-pwa dependency.
  `scripts/generate-sw-precache.mjs` *is* `package.json`'s `"build"`
  script — not a step chained after `next build`, because that shipped
  broken twice: first because Vercel's inferred build command for a
  detected Next.js project is `next build` directly, not `npm run build`
  (fixed by `vercel.json` pinning `buildCommand`); then because Vercel
  snapshots `public/` into its serving manifest *during* `next build`
  itself, so patching the precache list into the already-built `out/sw.js`
  never reached what Vercel actually served, even though it worked for a
  plain static file server locally. The script now runs `next build`
  twice — once (thrown away) to learn the real hashed chunk filenames,
  then it writes the full precache list into `public/sw.js` itself before
  building again for real, then restores the committed template so the
  working tree stays clean. `next.config.ts` pins `generateBuildId` so
  both passes agree on `_next/static/<buildId>/` paths. See
  docs/architecture.md's "Offline loading" section for the full story
  before touching any of this.
- Internal navigation uses plain `<a>`, not `next/link`'s `<Link>` — see
  docs/architecture.md's "Navigation uses plain `<a>`" section for why.

## Where things live

```
src/app/                 routes (App Router)
  page.tsx                 recipe list (home)
  recipes/[id]/page.tsx     recipe detail — generateStaticParams from seed-recipes
  recipes/[id]/cook/page.tsx  full-screen step-by-step cook mode
src/components/           UI, mostly client components
src/lib/
  types.ts                 Recipe / Step / Ingredient shapes
  seed-recipes.ts           bundled starter recipes (edit this to add recipes)
  db.ts                     Dexie schema + CRUD (ensureSeeded, getAllRecipes, ...)
  hooks.ts                  useRecipes / useRecipe — client-side data access
  use-wake-lock.ts          keeps the screen on during cook mode
  use-countdown.ts          per-step timer
public/
  manifest.json, icon*.svg, sw.js   PWA + offline shell (sw.js is a template; see below)
  images/recipes/<id>.jpg  optional recipe photos, referenced by Recipe.imageUrl
scripts/
  generate-sw-precache.mjs  the actual "build" script — runs next build twice, see above
vercel.json                pins Vercel's build command to `npm run build` (see above)
docs/
  architecture.md            why the static-export + IndexedDB split works this way
  design-system.md           the type/color/spacing tokens and the reasoning behind them
.claude/agents/            specialized subagents for this repo's recurring work types
```

## Adding or editing recipes

Recipes are data, not UI. Add/edit entries in `src/lib/seed-recipes.ts`
following the `Recipe` type in `src/lib/types.ts`:

- **Vegan only** — no meat, fish, dairy (milk, cream, butter, ghee,
  cheese, yogurt), eggs, or honey. Reach for coconut/nut/soy alternatives,
  nutritional yeast in place of cheese, maple syrup or agave in place of
  honey. If a request would add a non-vegan ingredient, veganize it rather
  than adding it as written and say so, rather than silently declining.
- **Don't copy recipe text from other sites/blogs/cookbooks.** Ingredient
  lists and basic technique are facts and not copyrightable, but another
  author's specific wording, instructions, and personal narration are —
  treat any outside recipe purely as inspiration for *which dish* and its
  general flavor profile, then write the ingredients/steps fresh in this
  app's own voice and format.
- Keep each `Step.instruction` to one action, one sentence where possible —
  it gets rendered at a huge font size on its own screen in cook mode.
- Set `Step.timerMinutes` on any step with real dead time (simmering,
  roasting, resting) so cook mode can offer a start-timer button.
- Because routes are statically generated from this file, adding a recipe
  here requires a rebuild (`npm run build`) to get its own prerendered page.
- **Photos are optional** (`Recipe.imageUrl`) — most recipes won't have one
  and fall back to the emoji. When adding one: resize to a max dimension of
  ~1200px and re-encode as JPEG (quality ~75-80) before committing — a
  straight-off-a-phone photo is typically 3-15 MB, which is a lot to ship
  in a static export that also precaches every image for offline use (see
  `scripts/generate-sw-precache.mjs`); the `sharp` package used internally
  by Next.js happens to already be in `node_modules` and works fine for a
  one-off resize even though it isn't a declared project dependency. Save
  the result to `public/images/recipes/<id>.jpg` and point `imageUrl` at
  `/images/recipes/<id>.jpg`. Re-encoding through `sharp` (or similar)
  also strips EXIF metadata by default, which matters for a phone photo
  that may carry GPS coordinates — don't commit a photo with EXIF intact.

## Design rules (see docs/design-system.md for the full rationale)

- Don't drop below the existing base font size or the `--tap-min` touch
  target size defined in `globals.css`.
- Don't introduce a second color system — use the existing CSS custom
  properties so light/dark and contrast stay consistent.
- Cook mode (`src/components/CookMode.tsx`) is the highest-stakes screen:
  one step, one huge instruction, two big buttons. Resist adding secondary
  content there.

## Commands

```
npm install
npm run dev      # local dev server
npm run build    # static export to ./out
npm run lint
```

## Subagents

`.claude/agents/` defines subagents scoped to this repo's recurring tasks —
recipe content edits, UI/readability changes, offline-data/service-worker
changes, and a pre-ship build/export check. Prefer delegating to the
matching subagent over ad hoc changes so the constraints above (static
export params, IndexedDB as source of truth, readability tokens) stay
enforced consistently.
