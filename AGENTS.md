# Simmer — agent guide

This file is the canonical instructions for any AI coding agent working in
this repo (Claude Code, Cursor, Copilot, etc.). `CLAUDE.md` just points here.

## What this is

Simmer is a mobile-first **vegan** recipe app meant to be propped up on a
counter while cooking, with a particular focus on Indian dal dishes — and,
increasingly, the user's system of record for food: recipes, food/household
preferences, and meal history, exposed to external AI assistants via an
MCP server (`src/mcp/`, see docs/mcp.md). Three things matter more than
anything else:

1. **Every recipe is vegan** — no meat, fish, dairy, eggs, or honey. This
   isn't a style preference, it's a hard content constraint.
2. **It has to be readable from across a kitchen** — large type, high
   contrast, big touch targets, minimal text per screen.
3. **It's bilingual, Danish first** — every user-facing string (UI chrome
   and recipe content alike) exists in both Danish and English. Danish is
   the primary language and the fallback whenever detection can't tell;
   see "Localization" below before adding any new user-facing text.

If a change works against any of those three goals, it's wrong even if it
"works."

Earlier versions of this app were a fully static export with the browser's
IndexedDB as its only database and no server at all — see
docs/architecture.md's "Why Postgres + Auth.js" section for why that
changed (short version: the MCP server needs a real, shared, server-side
database, so the app got one too, and now both read/write the same data).

## Stack

- **Next.js (App Router)**, deployed as a normal server on Vercel — no
  more static export. Route Handlers, Server Actions, and dynamic routes
  all work normally.
- **TypeScript**, strict mode.
- **Postgres via Drizzle ORM** (`src/db/schema.ts`) — the single source of
  truth for both the app's own pages and the MCP server. Vercel Postgres
  (Neon under the Marketplace integration) in production; see
  docs/architecture.md's "Local setup" for connecting locally.
  `src/lib/*-db.ts` (`recipes-db.ts`, `food-profile-db.ts`,
  `meal-history-db.ts`, `personal-access-tokens-db.ts`) are the shared,
  server-only query layer everything else calls into — never write a
  second copy of a query these already have.
- **Auth.js** (`src/auth.ts`) — email magic-link sign-in via Resend.
  `src/middleware.ts` gates every page except `/login` behind a session.
- **Plain CSS** (`src/app/globals.css`), design tokens as CSS custom
  properties. No CSS framework, no webfonts (system font stack only).
- Internal navigation uses plain `<a>`, not `next/link`'s `<Link>` — a
  holdover from the static-export era (see docs/architecture.md's
  "Navigation uses plain `<a>`" section); still true today, not yet
  revisited.
- **MCP server** (`src/mcp/`), mounted as a Next.js Route Handler at
  `app/api/mcp/route.ts` — a Vercel Function in this same deployment, not
  a separate process. Exposes Simmer's food data (recipes, food/household
  preferences, meal history) to external MCP clients like Claude or
  ChatGPT over Streamable HTTP (stdio for local dev). See docs/mcp.md for
  the full architecture, tools, and how to run/test it.

## Where things live

```
src/app/                 routes (App Router)
  page.tsx                 recipe list (home) — Server Component
  recipes/[id]/page.tsx     recipe detail — Server Component, fetches via recipes-db.ts
  recipes/[id]/cook/page.tsx  full-screen step-by-step cook mode — Server Component
  login/, settings/         sign-in and account settings (tokens, food profile, household)
  actions/                  Server Actions (recipes.ts, settings.ts, auth.ts)
  api/auth/[...nextauth]/   Auth.js route handler
  api/mcp/route.ts          the MCP server's HTTP endpoint (see src/mcp/)
src/components/           UI, mostly client components — receive data as props
  RecipeList.tsx, RecipeCard.tsx, RecipeDetail.tsx, CookMode.tsx
  NoteSheet.tsx              bottom-sheet editor for a personal step/ingredient note
  SettingsView.tsx, LoginForm.tsx
src/db/
  schema.ts                 Drizzle schema — the canonical shape, shared with src/mcp/
  client.ts                 Drizzle client (Neon HTTP driver)
  seed.ts                   loads seed-recipes.ts into Postgres (npm run db:seed)
src/lib/
  types.ts                   Recipe / Step / Ingredient / UserRecipeState shapes
  seed-recipes.ts             bundled starter recipes (edit this to add recipes)
  recipes-db.ts               server-only recipe queries — app AND src/mcp/ both use this
  food-profile-db.ts, meal-history-db.ts, personal-access-tokens-db.ts   same pattern
  ingredient-key.ts           stable per-ingredient key for notes
  use-wake-lock.ts          keeps the screen on during cook mode
  timers.ts                 persistent multi-step timer engine (localStorage + alarm)
  use-timers.ts              React hooks over timers.ts (useRecipeTimers, useExpiredTimers)
  locale.ts                  language store: browser detection + manual override (localStorage)
  translations.ts            UI string dictionary, da and en
  use-locale.ts               useLocale() hook: { locale, t, setLocale }
public/
  manifest.json, icon*.svg   PWA metadata ("add to home screen"); no service worker
  images/recipes/<id>.jpg  optional recipe photos, referenced by Recipe.imageUrl
docs/
  architecture.md            why Postgres + Auth.js replaced static export + IndexedDB
  design-system.md           the type/color/spacing tokens and the reasoning behind them
  mcp.md                     the MCP server: architecture, tools, running/testing, auth
src/mcp/                   MCP server exposing Simmer data to external AI assistants
  auth.ts, server.ts, stdio.ts   context/auth, tool registration, transports
  domain/, repositories/, services/, tools/, __tests__/
drizzle/                  generated SQL migrations (npm run db:generate) — commit these
.claude/agents/            specialized subagents for this repo's recurring work types
```

## Localization (Danish / English)

Every user-facing string — UI chrome and recipe content alike — exists in
both languages via a `LocalizedText` (`{ da: string; en: string }`, see
`src/lib/types.ts`). Danish is primary: it's the fallback whenever browser
detection is inconclusive. See docs/architecture.md's "Localization"
section for the full mechanism (detection, manual override, why it's
client-side state and not locale-prefixed routes).

- **UI strings** live in `src/lib/translations.ts`. Add a new key to
  *both* the `da` and `en` dictionaries — the `Dictionary` type will catch
  a missing one at compile time. Read them via `useLocale()`'s `t`.
- **Recipe content** (`title`, `description`, `Ingredient.text`,
  `Step.instruction`) is `LocalizedText`, not a plain string — see
  "Adding or editing recipes" below. The one exception: a recipe saved
  through the MCP server's `save_recipe` tool arrives in a single
  language and is stored verbatim under both `da` and `en` — that's a
  deliberate, documented difference (see `src/lib/recipes-db.ts`'s
  `createRecipe`), not something to "fix" by inventing a translation.
- Never hardcode an English (or Danish) string directly in a component;
  route it through `translations.ts` even if it currently only appears in
  one place.

## Adding or editing recipes

Recipes are data, not UI. Add/edit entries in `src/lib/seed-recipes.ts`
following the `SeedRecipe`/`Recipe` types in `src/lib/types.ts`:

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
- **Every text field is `{ da: string; en: string }`**, not a plain
  string — `title`, `description`, each `Ingredient.text`, each
  `Step.instruction`. Write both; Danish is the primary language, so get
  it right first, then give the English an equally natural (not
  word-for-word) translation. Never leave one language a placeholder or a
  copy-paste of the other.
- Keep each `Step.instruction` to one action, one sentence where possible,
  in both languages — it gets rendered at a huge font size on its own
  screen in cook mode.
- Set `Step.timerMinutes` on any step with real dead time (simmering,
  roasting, resting) so cook mode can offer a start-timer button.
- Danish recipes conventionally measure by weight (g) or volume in
  deciliters (dl), not cups — convert rather than leaving `cup`
  untranslated in the `da` text.
- Editing this file only reaches the database once someone runs
  `npm run db:seed` (see `src/db/seed.ts`) — mention that if you're not
  the one running it.
- **Photos are optional** (`Recipe.imageUrl`) — most recipes won't have one
  and fall back to the emoji. When adding one: resize to a max dimension of
  ~1200px and re-encode as JPEG (quality ~75-80) before committing — a
  straight-off-a-phone photo is typically 3-15 MB; the `sharp` package
  used internally by Next.js happens to already be in `node_modules` and
  works fine for a one-off resize even though it isn't a declared project
  dependency. Save the result to `public/images/recipes/<id>.jpg` and
  point `imageUrl` at `/images/recipes/<id>.jpg`. Re-encoding through
  `sharp` (or similar) also strips EXIF metadata by default, which
  matters for a phone photo that may carry GPS coordinates — don't commit
  a photo with EXIF intact.

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
vercel env pull .env.local   # once, after Postgres/Resend are set up on Vercel
npm run db:migrate           # apply schema migrations
npm run db:seed              # load seed-recipes.ts as shared starter recipes
npm run dev                  # local dev server (app + MCP server both live here)
npm run build                # next build
npm run lint
npm run db:generate          # after changing src/db/schema.ts
npm run mcp:stdio            # MCP server over stdio (local dev / MCP Inspector)
npm run test:mcp             # automated tests for the MCP server
```

## Subagents

`.claude/agents/` defines subagents scoped to this repo's recurring tasks —
recipe content edits, UI/readability changes, the shared Postgres data
layer, and a pre-ship build check. Prefer delegating to the matching
subagent over ad hoc changes so the constraints above (userId-scoped
queries, readability tokens, bilingual content) stay enforced consistently.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
