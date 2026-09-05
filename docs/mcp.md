# Simmer MCP server

## Why Simmer has an MCP server

Simmer is meant to become the user's system of record for food: recipes,
food/household preferences, and a history of what's actually been cooked.
An MCP (Model Context Protocol) server exposes that data — deterministically,
not through another layer of AI guesswork — to external assistants like
Claude or ChatGPT, so a conversation there can pull in or write back to
Simmer as one step in a larger task ("find the recipes from the night Karen
visited," "save the recipe we just made"). The reasoning and cross-system
orchestration (combining Simmer with mail, calendar, etc.) is the calling
assistant's job; Simmer only needs to be expert in Simmer's own data.

## Architecture

```
MCP client (Claude, ChatGPT, MCP Inspector, ...)
       │  Streamable HTTP (remote) or stdio (local dev)
       ▼
app/api/mcp/route.ts        a Vercel Function, same deployment as the app
  auth.ts                    → resolves McpRequestContext { userId } from a personal access token
  server.ts                  → registers the 5 tools below
  tools/*.ts                 → thin: parse input, call a service, shape output
       │
       ▼
Simmer application services  src/mcp/services/*.ts
  FoodProfileService, RecipeService, MealHistoryService
  (validation via zod schemas.ts; all domain rules live here, not in tools/)
       │
       ▼
Repositories                 src/mcp/repositories/drizzle-*.ts
  DrizzleFoodProfileRepository, DrizzleRecipeRepository, DrizzleMealHistoryRepository
  — interfaces in repositories/types.ts, each a thin wrapper over the
    same src/lib/*-db.ts modules the app's own pages use
       │
       ▼
Postgres (src/db/schema.ts) — see docs/architecture.md
```

This MCP server does **not** duplicate the app's own data model. `Recipe`,
`Ingredient`, `Step`, `LocalizedText`, and `UserRecipeState`
(`src/lib/types.ts`) are the one canonical shape, stored in Postgres and
read/written by `src/lib/recipes-db.ts` — the exact module the app's own
Server Components and Server Actions call. `src/mcp/domain/types.ts` adds
only the MCP-specific *view* of that data: `toRecipeSummary`/
`toSimmerRecipeView` flatten a bilingual `Recipe` down to one language,
since a tool response goes to an LLM, not a bilingual UI. `FoodProfile`,
`HouseholdMember`, and `MealHistoryEntry` have no competing app-side model
to unify with — they're new, but still go through shared
`src/lib/food-profile-db.ts` / `meal-history-db.ts` modules the account
settings page also uses (see docs/architecture.md).

### Two tiers of recipe data

- Simmer's bundled starter recipes (`seed-recipes.ts`, loaded once via
  `npm run db:seed`) are **shared and read-only** — `ownerId: null` rows,
  visible to every user, same as in the app itself.
- Recipes created through `save_recipe` are **private to the `userId`
  that created them** (`ownerId` set to that user).

A recipe saved through the MCP server **does** appear in that user's own
Simmer app immediately — both read from the same Postgres tables, unlike
the very first iteration of this server (in-memory, no shared backend).

## Tools

All five are registered in `src/mcp/server.ts`; each has its own file under
`src/mcp/tools/`. Every tool description tells the calling model *when* to
use it, not just what it does — see each tool's `description` for the exact
wording an MCP client will see.

| Tool | Kind | Purpose |
|---|---|---|
| `get_food_profile` | read | Dietary preferences, dislikes, favorite ingredients, goals, household members with their own likes/dislikes. Food-related data only — never a general user profile. |
| `search_recipes` | read | Free-text/tag search over the user's own recipes (private + shared starter recipes). Returns compact summaries (`id`, `title`, `description`, `tags`, `lastCookedAt`) — never full ingredients or instructions. |
| `get_recipe` | read | One complete recipe by `id` — ingredients, instructions, notes, tags, source. Meant to follow a `search_recipes` call, not be guessed at. |
| `save_recipe` | **write** | Creates a new recipe in the user's collection. Input is validated with zod (`src/mcp/schemas.ts`) — at least one ingredient and one instruction step are required. Returns `{ id, title, createdAt }`. |
| `get_meal_history` | read | Recorded meals, optionally filtered by date range (`from`/`to`, ISO `YYYY-MM-DD`) and/or free text (matched against notes/guests/occasion). Each entry resolves its `recipeIds` into `{ id, title }` refs via the same recipe repository `get_recipe` uses. |

Reads and writes are marked differently on purpose: every tool declares MCP
[`annotations`](https://modelcontextprotocol.io/) (`readOnlyHint`,
`destructiveHint`, etc.), and `save_recipe`'s description opens with
**"WRITE OPERATION"** in capitals so a client or a human skimming a tool
list can't miss it. This is also the seam for an explicit
user-confirmation step before write tools run — not implemented in this
iteration, but the read/write split it needs is already in place (an
MCP-aware client can gate on `readOnlyHint: false`, or a future
`server.ts` change could require a `confirm: true` argument on write
tools).

`get_meal_history`'s `MealHistoryEntry` type (`src/mcp/domain/types.ts`)
already carries optional `guests`, `occasion`, and `feedback` fields, so
that metadata can start being populated later without a breaking API
change. There is no "log a meal" UI in the app yet, so `meal_history` rows
only exist if inserted directly — see "What's intentionally not real yet."

### Errors

Tool handlers catch the domain errors in `src/mcp/errors.ts` (`NotFoundError`,
`ValidationError`) and turn them into an MCP tool result with
`isError: true` and a plain-English message — readable by the MCP client
displaying it and by the model deciding what to do next (e.g. "call
`search_recipes` again"), not a raw stack trace. `save_recipe`'s input
schema does the equivalent for malformed input: the MCP SDK validates
arguments against `inputSchema` before the handler runs, so `zod`'s own
validation errors are what a client sees for a bad `save_recipe` call.

## Running it locally

```bash
npm install
vercel env pull .env.local   # once — see docs/architecture.md's "Local setup"
npm run db:migrate
npm run db:seed

npm run dev
# → the MCP server is live at http://localhost:3000/api/mcp, alongside the app

# stdio — for a local MCP Inspector or a desktop client, no HTTP server needed
npm run mcp:stdio
```

## Testing it with an MCP client

You'll need a personal access token first — sign in to the app, go to
**Settings**, and generate one under "MCP access tokens" (see
"Authentication" below).

**MCP Inspector** (the official test client) is the fastest way to poke at
every tool by hand:

```bash
npx @modelcontextprotocol/inspector
```

Point it at `http://localhost:3000/api/mcp` with transport "Streamable
HTTP" and an `Authorization: Bearer <your token>` header, or run
`npx @modelcontextprotocol/inspector npx tsx src/mcp/stdio.ts` to test
over stdio instead (no token needed locally — see "Authentication"). From
the Inspector's "Tools" tab you can call each of the five tools directly
and see raw request/response JSON.

**curl**, for a quick manual check of the HTTP transport:

```bash
curl -s http://localhost:3000/api/mcp \
  -H "Authorization: Bearer <your token>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"test","version":"0.0.1"}}}'
```

then, using the same session, a `tools/call` request with
`"method":"tools/call","params":{"name":"search_recipes","arguments":{"query":"dal"}}`.

**Automated tests** (`node --test`, run via `tsx`, no separate test
framework dependency, no database required — they run entirely against
the in-memory fakes in `src/mcp/repositories/memory-*.ts`):

```bash
npm run test:mcp
```

Covers: `search_recipes` (free-text + tag filtering, summary shape), `get_recipe`
(found + not-found), `save_recipe` (creation + retrievability), `save_recipe`
input validation (missing/invalid fields), userId isolation (one user's saved
recipe and profile/meal-history data is invisible to another), and
`get_meal_history` (date-range and free-text queries).

## Environment variables

See `.env.example` for the full list (shared with the rest of the app —
`DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`). MCP-specific:

| Variable | Used by | Purpose |
|---|---|---|
| `SIMMER_MCP_DEV_USER_ID` | `auth.ts`, `stdio.ts` | userId used when no `Authorization` header is sent. Only takes effect outside production (`NODE_ENV !== "production"`) — see "Authentication". Defaults to `"dev-user"`. |

## Authentication

Claude/ChatGPT authenticate with a **personal access token** — a
long-lived bearer token a signed-in user generates from **Settings** in
the app (`src/app/settings/`, via `src/lib/personal-access-tokens-db.ts`).
This is deliberately not full OAuth 2.1 — see "What's intentionally not
real yet" below — but it is real: tokens are per-user, hashed at rest
(sha256, never the raw value), revocable, and every repository/service
call takes the resolved `userId` explicitly rather than reading it from
ambient state, so a request authenticated as one user can never see
another's — see the isolation tests in `src/mcp/__tests__/isolation.test.ts`.

```ts
export interface McpRequestContext {
  userId: string;
}
```

`resolveUserIdFromHeaders()` (`src/mcp/auth.ts`) reads an
`Authorization: Bearer <token>` header, hashes it, and looks it up against
the `personal_access_token` table. With no `Authorization` header at all,
it falls back to `SIMMER_MCP_DEV_USER_ID` (default `dev-user`) — but
**only** when `NODE_ENV !== "production"`, so that convenience can never
silently become an open door on a real deployment. `resolveUserIdForStdio()`
does the equivalent for stdio, which has no HTTP headers and is local-dev
only regardless. Neither function ever logs the raw token or header value —
only the resolved `userId`, or that resolution failed.

**Upgrading to full OAuth 2.1** later (so Claude.ai/ChatGPT's connector UI
can show a hosted "Sign in to Simmer" screen instead of pasting a token)
only touches `resolveUserIdFromHeaders()` and adds new routes
(authorization + token endpoints, dynamic client registration, a consent
screen) — nothing in `services/`, `repositories/`, or `tools/` needs to
change, because none of them ever see a token, only the already-resolved
`McpRequestContext`.

## Transport

The transport is **Streamable HTTP**, mounted as a Next.js Route Handler
at `app/api/mcp/route.ts` — a Vercel Function in the same deployment as
the rest of the app, using the MCP SDK's
`WebStandardStreamableHTTPServerTransport` (fetch `Request`/`Response`
based, not the Node-`http` version) since that's what a Route Handler
speaks. It runs in **stateless mode** (`sessionIdGenerator: undefined`):
every request builds a fresh `McpServer` and transport, connects them, and
lets them go once the response is sent. There's no server-side session to
expire, scale, or leak across Vercel's stateless function instances — the
tradeoff is that MCP features assuming a long-lived session (e.g.
server-initiated notifications between calls) aren't available, which is
fine for five request/response tools like these.

**stdio** (`src/mcp/stdio.ts`) is also implemented, for local development
— so it's easy to point an MCP Inspector or a desktop client at the
server without also running the Next.js dev server — but it is not the
primary or only transport.

## What's intentionally not real yet

Deliberately out of scope (see the original brief): mail/calendar
integration, Siri/App Intents, the "Nomi" agent, a vector database/RAG
layer, a recommendation engine, and MCP prompts/a resource system the
tools don't actually need. Beyond those, before this is fully
production-ready:

- **Full OAuth 2.1**, as described above — personal access tokens are a
  deliberate, smaller step for now.
- **A "log a meal" UI.** `get_meal_history` and the underlying
  `meal_history`/`meal_history_recipe` tables exist, but nothing in the
  app writes to them yet (`markCooked` only stamps
  `user_recipe_state.lastCookedAt`, not a date-addressable meal record).
  Until that UI exists, meal-history rows only exist if inserted directly.
- **Rate limiting / abuse protection** and **structured audit logging**
  for the write path (`save_recipe`), separate from the "never log
  credentials" rule already followed in `auth.ts`.
- **Explicit write-confirmation flow.** The read/write distinction
  (`annotations.readOnlyHint`, `save_recipe`'s description) is in place,
  but nothing yet pauses a `save_recipe` call for the user to confirm —
  see the "Reads and writes are marked differently" note above.
- **CORS for browser-based remote clients.** The current generation of
  Claude/ChatGPT remote-MCP connectors call server-to-server; a
  browser-hosted MCP client would need CORS headers added to the route
  handler.

## Example prompts

Once you've signed in, generated a personal access token in Settings, and
connected an MCP client with it, these work end to end:

1. **"Find three of my saved recipes that the kids usually like."**
   → `get_food_profile` (add household members and their likes/dislikes
   in Settings first, if you haven't) → `search_recipes` (e.g. by tags
   those members like) → the assistant picks and names three.
2. **"I had Karen over around August 17th. Which dishes did I make around
   then?"**
   → `get_meal_history({ from: "2026-08-10", to: "2026-08-24" })` or
   `get_meal_history({ query: "Karen" })` — returns whatever meal-history
   rows exist in that range (see "What's intentionally not real yet": you
   may need to insert a row directly until a "log a meal" UI exists).
3. **"Save the recipe we just made together in Simmer."**
   → `save_recipe({ title, ingredients, instructions, source: { type: "ai" }, ... })`
   using whatever the assistant and user had just worked out in the
   conversation — then check the app's own recipe list, where it now
   shows up too.

The brief's own definition-of-done sequence also works as written:
`search_recipes({ query: "linser" })` (Danish for lentils — matches
`red-lentil-dal` and `coconut-spinach-dal` by ingredient text, once
`npm run db:seed` has loaded the starter recipes) → "show me number 2" →
`get_recipe({ id: "coconut-spinach-dal" })` → "here's a new recipe, save
it" → `save_recipe(...)`.
