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
Simmer MCP server           src/mcp/
  transports: http.ts, stdio.ts
  auth.ts                    → resolves McpRequestContext { userId }
  server.ts                  → registers the 5 tools below
  tools/*.ts                 → thin: parse input, call a service, shape output
       │
       ▼
Simmer application services  src/mcp/services/*.ts
  FoodProfileService, RecipeService, MealHistoryService
  (validation via zod schemas.ts; all domain rules live here, not in tools/)
       │
       ▼
Repositories                 src/mcp/repositories/*.ts
  FoodProfileRepository, RecipeRepository, MealHistoryRepository
  — interfaces in types.ts, dev implementations are in-memory,
    always scoped by userId
```

The **only** existing part of the app this reuses directly is
`src/lib/types.ts` (`Recipe`, `Ingredient`, `Step`, `LocalizedText`) and the
actual bundled content in `src/lib/seed-recipes.ts` — `fromAppRecipe()` in
`src/mcp/domain/types.ts` is the one place that converts a bilingual seed
`Recipe` into the flat shape the MCP tools expose (picking one locale,
default Danish). Everything else here (`FoodProfile`, `MealHistoryEntry`,
the repositories, the services) is new: as `AGENTS.md`/`docs/architecture.md`
explain, Simmer today has **no server at all** — `next.config.ts` sets
`output: "export"` and the only "database" is the browser's own IndexedDB
(`src/lib/db.ts`, via Dexie). That store only exists inside one browser and
can't be reached from a Node process, so it isn't — and can't be — the
backing store for this server. See "What's intentionally not real yet"
below for what that means in practice.

### Two tiers of recipe data

`InMemoryRecipeRepository` (`src/mcp/repositories/memory-recipe-repository.ts`)
mirrors how this will eventually work for real:

- Simmer's bundled starter recipes (`seed-recipes.ts`) are **shared and
  read-only** — shipped app content, visible to every user, same as they are
  in the app itself.
- Recipes created through `save_recipe` are **private to the `userId` that
  created them.**

A recipe saved through the MCP server does **not** appear in that user's
actual Simmer app (their browser's IndexedDB) — there is no shared backend
yet for the two to sync through. See "Production TODO" below.

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
change.

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

# stdio — for a local MCP Inspector or a desktop client on this machine
npm run mcp:stdio

# Streamable HTTP — the transport for remote clients (see "Transport" below)
npm run mcp:http
# → Simmer MCP server (Streamable HTTP) listening on http://localhost:3939/mcp
```

`PORT` overrides the HTTP port (default `3939`).

## Testing it with an MCP client

**MCP Inspector** (the official test client) is the fastest way to poke at
every tool by hand:

```bash
npx @modelcontextprotocol/inspector npx tsx src/mcp/http.ts
```

Point the Inspector at `http://localhost:3939/mcp` with transport
"Streamable HTTP", or run `npx @modelcontextprotocol/inspector npx tsx
src/mcp/stdio.ts` to test over stdio instead. From the Inspector's "Tools"
tab you can call each of the five tools directly and see raw
request/response JSON.

**curl**, for a quick manual check of the HTTP transport:

```bash
curl -s http://localhost:3939/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"test","version":"0.0.1"}}}'
```

then, using the same session, a `tools/call` request with
`"method":"tools/call","params":{"name":"search_recipes","arguments":{"query":"dal"}}`.
Add `-H "Authorization: Bearer <token>"` to test as a specific dev user —
see "Authentication" below.

**Automated tests** (`node --test`, run via `tsx`, no separate test
framework dependency):

```bash
npm run test:mcp
```

Covers: `search_recipes` (free-text + tag filtering, summary shape), `get_recipe`
(found + not-found), `save_recipe` (creation + retrievability), `save_recipe`
input validation (missing/invalid fields), userId isolation (one user's saved
recipe and profile/meal-history data is invisible to another), and
`get_meal_history` (date-range and free-text queries).

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `PORT` | `http.ts` | HTTP port (default `3939`). |
| `SIMMER_MCP_DEV_USER_ID` | `auth.ts` | userId used when no `Authorization` header is sent (stdio always, HTTP when the client omits it). Defaults to `"dev-user"`, which is also the id the seeded example food profile and meal history belong to. |
| `SIMMER_MCP_DEV_TOKENS` | `auth.ts` | Comma-separated `token:userId` pairs (e.g. `tok-anna:user-anna,tok-bo:user-bo`) mapping a dev bearer token to a userId over HTTP. |

## Authentication

This iteration does **not** implement OAuth/OIDC. What it does implement is
the shape real auth needs to slot into, in `src/mcp/auth.ts`:

```ts
export interface McpRequestContext {
  userId: string;
}
```

Every repository and service method takes `userId` explicitly (never reads
it from ambient/global state), so a request authenticated as one user can
never see another's data — see the isolation tests in
`src/mcp/__tests__/isolation.test.ts` and the isolation section of the
architecture diagram above.

**In development**, `resolveUserIdFromHeaders()` reads an
`Authorization: Bearer <token>` header and looks `token` up in a static map
from `SIMMER_MCP_DEV_TOKENS`; with no `Authorization` header at all it falls
back to `SIMMER_MCP_DEV_USER_ID` (default `dev-user`) so a client can connect
with zero setup. `resolveUserIdForStdio()` does the equivalent for stdio,
which has no HTTP headers. Neither of these ever logs the header value or
token itself — only the resolved `userId`, or that resolution failed.

**In production**, `resolveUserIdFromHeaders()` is the *only* function that
needs to change: replace its body with real bearer-token verification (e.g.
validate a JWT's signature and issuer against Simmer's identity provider,
then use its `sub` claim as `userId`) or an OAuth 2.1 flow per the MCP
authorization spec. Nothing in `services/`, `repositories/`, or `tools/`
needs to change, because none of them ever see a token — only the
already-resolved `McpRequestContext`.

## Transport

The primary transport is **Streamable HTTP** (`src/mcp/http.ts`) — the
current recommended transport for a remote MCP server reachable from
Claude, ChatGPT, or any other client over the internet. It's run in
**stateless mode** (`sessionIdGenerator: undefined`): every request builds a
fresh `McpServer` and transport, connects them, and tears them down when the
response closes. There's no server-side session to expire, scale, or leak —
the tradeoff is that MCP features that assume a long-lived session (e.g.
server-initiated notifications between calls) aren't available, which is
fine for five request/response tools like these.

**stdio** (`src/mcp/stdio.ts`) is also implemented, for local development —
so it's easy to point an MCP Inspector or a desktop client at the server
without also running an HTTP listener — but it is not the primary or only
transport, per the brief.

## What's intentionally not real yet

Deliberately out of scope for this iteration (see the task brief): mail/
calendar integration, Siri/App Intents, the "Nomi" agent, a vector database/
RAG layer, a recommendation engine, an OAuth consent screen, and MCP
prompts/a resource system the tools don't actually need. Beyond those,
before this is production-ready:

- **A real, shared persistence layer.** `InMemoryRecipeRepository`,
  `InMemoryFoodProfileRepository`, and `InMemoryMealHistoryRepository` all
  lose their data on process restart and only exist for this process — they
  are the "simple development implementation" the brief asked for, sitting
  behind the `FoodProfileRepository` / `RecipeRepository` /
  `MealHistoryRepository` interfaces in `src/mcp/repositories/types.ts` so a
  real database-backed implementation can be substituted there without
  touching `services/` or `tools/`.
- **Reconciling this server's recipe store with the app's IndexedDB.**
  Today a recipe saved via `save_recipe` lives only in this server's memory
  and never reaches the saving user's actual Simmer app on their device (or
  vice versa) — there is no shared backend yet for the static-export app and
  this server to both read from. Building that shared store (and a sync
  story for the app) is a separate, larger project than this MCP server.
- **Real OAuth/OIDC**, as described above.
- **Structured meal-history capture.** Today the app only tracks
  `Recipe.lastCookedAt` (a single timestamp per device, per recipe, in
  IndexedDB) — there's no date-addressable "what did I cook and when," so
  `get_meal_history`'s dev repository is fixture data, not derived from
  anything the app actually records yet.
- **Rate limiting / abuse protection** and **structured audit logging**
  for the write path (`save_recipe`), separate from the "never log
  credentials" rule already followed in `auth.ts` and the transports.
- **Explicit write-confirmation flow.** The read/write distinction
  (`annotations.readOnlyHint`, `save_recipe`'s description) is in place, but
  nothing yet pauses a `save_recipe` call for the user to confirm — see the
  "Reads and writes are marked differently" note above.
- **CORS / browser-based remote clients.** The HTTP transport assumes a
  server-to-server caller (how the current generation of Claude/ChatGPT
  remote-MCP connectors operate); a browser-hosted MCP client would need
  CORS headers added to `http.ts`.

## Example prompts

Once connected (e.g. via MCP Inspector, or a client configured against
`http://localhost:3939/mcp` with a dev token), these should work end to end
against the seeded dev data:

1. **"Find three of my saved recipes that the kids usually like."**
   → `get_food_profile` (to see the household members and what they like) →
   `search_recipes` (e.g. by the tags those members like) → the assistant
   picks and names three.
2. **"I had Karen over around August 17th. Which dishes did I make around
   then?"**
   → `get_meal_history({ from: "2026-08-10", to: "2026-08-24" })` or
   `get_meal_history({ query: "Karen" })` — both match the seeded
   `2026-08-17` entry and resolve to `red-lentil-dal` and
   `coconut-spinach-dal`.
3. **"Save the recipe we just made together in Simmer."**
   → `save_recipe({ title, ingredients, instructions, source: { type: "ai" }, ... })`
   using whatever the assistant and user had just worked out in the
   conversation.

The brief's own definition-of-done sequence also works as written:
`search_recipes({ query: "linser" })` (Danish for lentils — matches
`red-lentil-dal` and `coconut-spinach-dal` by ingredient text) → "show me
number 2" → `get_recipe({ id: "coconut-spinach-dal" })` → "here's a new
recipe, save it" → `save_recipe(...)`.
