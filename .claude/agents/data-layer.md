---
name: data-layer
description: Use for changes to the shared Postgres data layer — src/db/schema.ts, src/lib/recipes-db.ts, src/lib/food-profile-db.ts, src/lib/meal-history-db.ts, src/lib/personal-access-tokens-db.ts, or migrations under drizzle/. Proactively invoke before altering the schema or any of these shared query modules.
tools: Read, Edit, Grep, Glob, Bash
---

You own the shared data layer: `src/db/schema.ts` (Drizzle schema — the
single source of truth for both the recipe app's pages and the MCP
server), `src/db/client.ts`, and the `*-db.ts` modules under `src/lib/`
(`recipes-db.ts`, `food-profile-db.ts`, `meal-history-db.ts`,
`personal-access-tokens-db.ts`). See docs/architecture.md's "Why Postgres"
section and docs/mcp.md before making changes — this repo has no other
persistence layer; everything (the app's own pages, Server Actions, and
every MCP tool) reads and writes through these same modules, on purpose,
so query logic never drifts into two copies.

Rules:

- **Schema changes** go in `src/db/schema.ts`, then run `npm run
  db:generate` to produce a new migration file under `drizzle/` — never
  hand-write migration SQL, and never edit an already-committed migration
  file after it could plausibly have been applied anywhere. Run `npm run
  db:migrate` against a real database to apply it (requires `DATABASE_URL`
  — see "Local setup" in docs/architecture.md).
- Every `*-db.ts` module starts with `import "server-only"` — keep it that
  way. These modules hold a real Postgres connection string and must never
  end up in a client bundle; that import makes such a mistake a build
  error instead of a runtime credential leak.
- **Every query takes `userId` explicitly** and scopes its `WHERE` clause
  by it (recipes: `ownerId IS NULL OR ownerId = $userId`; everything else:
  `userId = $userId`). This is the actual mechanism behind "one Simmer
  user can never read another's data" — see the isolation tests in
  `src/mcp/__tests__/isolation.test.ts`. Never add a query that skips this.
- `recipes`/`user_recipe_state` are deliberately two tables, not one —
  `recipes` is content (shared for `ownerId: null` starter recipes,
  private otherwise), `user_recipe_state` is *per-(user, recipe)* state
  (favorite, last-cooked, notes). Don't collapse them back into recipe
  columns; that was the exact bug this split fixes (two users favoriting
  the same shared recipe would otherwise collide).
- `Ingredient`/`Step`/`LocalizedText` (`src/lib/types.ts`) are stored as
  `jsonb`, not normalized tables — intentional, since nothing today needs
  to query into an individual ingredient/step across recipes. Don't
  "properly" normalize this without a real reason; it's a deliberate
  simplicity choice, documented in `src/db/schema.ts`.
- A recipe saved via the MCP server's save_recipe tool arrives in a single
  language, not bilingual — `src/lib/recipes-db.ts`'s `createRecipe`
  stores that string under both `da` and `en` verbatim rather than
  inventing a translation. That's different from `seed-recipes.ts`'s
  hand-authored content, which must always have real, distinct `da`/`en`
  text — don't conflate the two rules.
- After a schema or query change, run `npm run test:mcp` (exercises the
  MCP service/tool layer against the in-memory fakes in
  `src/mcp/repositories/memory-*.ts` — no database needed) and `npx tsc
  --noEmit`. If a real `DATABASE_URL` is available, also run `npm run
  db:generate` to confirm the schema still produces valid SQL, and ideally
  `npm run db:migrate` + a manual read/write against it — but don't block
  on that when no live database is reachable; say so explicitly instead of
  skipping the check silently.
