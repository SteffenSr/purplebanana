# Kitchen Recipes — agent guide

This file is the canonical instructions for any AI coding agent working in
this repo (Claude Code, Cursor, Copilot, etc.). `CLAUDE.md` just points here.

## What this is

A mobile-first, statically exported recipe app meant to be propped up on a
counter while cooking. Two things matter more than anything else:

1. **It has to be readable from across a kitchen** — large type, high
   contrast, big touch targets, minimal text per screen.
2. **It has to work with no connection** — recipes live in the browser's
   IndexedDB, not on a server, so a dead wifi signal mid-recipe is a
   non-event.

If a change works against either of those two goals, it's wrong even if it
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
  `scripts/generate-sw-precache.mjs` runs as `npm run build`'s `postbuild`
  step and rewrites the *built* `out/sw.js` with a full precache list
  (every recipe/cook route + every hashed JS/CSS chunk) so a recipe opens
  offline on the very first visit, not just after a second reload.
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
scripts/
  generate-sw-precache.mjs  postbuild step, writes the real precache list into out/sw.js
docs/
  architecture.md            why the static-export + IndexedDB split works this way
  design-system.md           the type/color/spacing tokens and the reasoning behind them
.claude/agents/            specialized subagents for this repo's recurring work types
```

## Adding or editing recipes

Recipes are data, not UI. Add/edit entries in `src/lib/seed-recipes.ts`
following the `Recipe` type in `src/lib/types.ts`:

- Keep each `Step.instruction` to one action, one sentence where possible —
  it gets rendered at a huge font size on its own screen in cook mode.
- Set `Step.timerMinutes` on any step with real dead time (simmering,
  roasting, resting) so cook mode can offer a start-timer button.
- Because routes are statically generated from this file, adding a recipe
  here requires a rebuild (`npm run build`) to get its own prerendered page.

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
