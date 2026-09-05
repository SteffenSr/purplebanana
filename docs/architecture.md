# Architecture

## Why Postgres + Auth.js

This app used to be a fully static export (`output: "export"`) with the
browser's own IndexedDB as its only database — see git history before this
section if you need that story. It changed for one concrete reason: the
MCP server (`src/mcp/`, see docs/mcp.md) needs to run as a real Vercel
Function in the *same* deployment as the recipe app, and a static export
can't have dynamic Route Handlers at all. Once that constraint was gone,
the deeper one it was hiding became the real design driver: Vercel
Functions are stateless between invocations, so *some* real database was
always going to be necessary to give the MCP server (and, this app decided,
the recipe app itself) actual persistence — see docs/mcp.md's own
"Context" section for the full reasoning.

The result: **Postgres (Vercel Postgres, which is Neon under Vercel's
Marketplace integration) is now the single source of truth**, shared by
the app's own pages and every MCP tool, and **Auth.js handles sign-in**
(email magic link via Resend) since a shared backend needs real accounts,
not anonymous per-device storage.

- `src/db/schema.ts` is the Drizzle schema — Auth.js's own tables
  (`user`/`account`/`session`/`verificationToken`), `recipe`,
  `user_recipe_state`, `food_profile`, `household_member`, `meal_history`,
  `meal_history_recipe`, and `personal_access_token` (MCP auth — see
  docs/mcp.md).
- `src/lib/recipes-db.ts`, `food-profile-db.ts`, `meal-history-db.ts`, and
  `personal-access-tokens-db.ts` are the actual query layer — every one
  starts with `import "server-only"` and takes `userId` explicitly on
  every function, so a request can never read another user's data. Both
  the app's Server Components/Actions and the MCP server's repositories
  (`src/mcp/repositories/drizzle-*.ts`) call into these same modules; see
  the `data-layer` subagent before changing any of them. Anything that
  loads one of these modules outside Next's own bundler (`npm run
  mcp:stdio`, notably) needs `NODE_OPTIONS=--conditions=react-server` set
  for `server-only` to resolve — Next aliases it automatically, plain
  Node/tsx doesn't. `mcp:stdio`'s script already sets this.
- Routes are ordinary dynamic Next.js routes again — no
  `generateStaticParams`, no build-time route enumeration. `/recipes/[id]`
  fetches its recipe from Postgres per request.

### Local setup

```
vercel link                 # once, to connect this checkout to the Vercel project
vercel env pull .env.local  # pulls DATABASE_URL, MAGIC_LINK_RESEND_API_KEY, AUTH_SECRET, etc.
npm run db:migrate          # applies drizzle/ migrations
npm run db:seed             # loads seed-recipes.ts as shared starter recipes
npm run dev
```

See `.env.example` for every environment variable this app reads, and
docs/mcp.md's "Environment variables" section for the MCP-specific ones.

## Layers

```
seed-recipes.ts  (build-time constant, shipped in the JS bundle)
       │  npm run db:seed — one-time load as ownerId: null rows
       ▼
   Postgres       (src/db/schema.ts — Drizzle, the real runtime database)
       │  src/lib/recipes-db.ts — getVisibleRecipes / toggleFavorite / ...
       ▼
  Server Components (src/app/page.tsx, recipes/[id]/page.tsx, .../cook/page.tsx)
       │  fetch data server-side, pass down as props
       ▼
  client components (RecipeList, RecipeCard, RecipeDetail, CookMode)
       │  mutations go through Server Actions (src/app/actions/recipes.ts),
       │  which call recipes-db.ts and revalidatePath()
       ▼
       Postgres again
```

`src/mcp/` reads and writes the exact same `recipes-db.ts` (and the other
`*-db.ts` modules) — see docs/mcp.md's architecture diagram.

## Localization (Danish / English)

The app is bilingual, Danish first. One constraint already established
above shapes how: (per "Navigation uses plain `<a>`" below) every in-app
link is a full page reload, not a client-side route change.

**Why this isn't locale-prefixed routing (`/da/...`, `/en/...`).** That's
the "proper" Next.js i18n answer, but it doesn't fit the UX this was built
for: "I want to flip to a Danish recipe on a whim, without losing my
place" reads far more naturally as an instant in-place toggle than as a
navigation that doubles every recipe/cook route and rewrites the current
URL to the other locale prefix on every switch.

**The mechanism** (`src/lib/locale.ts`, `use-locale.ts`,
`translations.ts`) mirrors `src/lib/timers.ts` almost exactly, for the
same reason: it's a module-level store, not React state, backed by
`localStorage`, because a full page reload happens on every navigation and
anything living only in memory wouldn't survive it.

- **Detection** reads `navigator.languages`/`navigator.language` client-side
  (there's no request to read an `Accept-Language` header from — this is
  static HTML). The first candidate starting with `da` or `en` wins;
  anything else (or no `navigator` at all, e.g. during the build's static
  render) falls back to Danish, the app's primary language.
- **Manual override** (`setLocale()`) always wins over detection once set,
  persisted to `localStorage` under `kr:locale`. The `LanguageSwitcher` in
  the header is a plain, always-visible DA/EN toggle rather than a
  "fix wrong detection" affordance that only appears conditionally —
  switching languages by choice (not just by correcting a guess) is a
  first-class use case here.
- **Avoiding a hydration flash**: the store exposes
  `getServerLocaleSnapshot()` (always `"da"`, matching the prerendered
  HTML and `<html lang="da">`) alongside the real client `getSnapshot()`,
  and `useLocale()` reads both through `useSyncExternalStore`. React's
  hydration handling for that hook resolves server → real client value in
  the same commit, before paint, rather than a visible post-mount flash
  from a `useEffect`.
- **Recipe content** (`src/lib/seed-recipes.ts`, and any recipe saved
  later) stores every user-facing field as `LocalizedText` (`{ da, en }`,
  see `types.ts`) rather than duplicating whole recipe objects per
  language — one `Recipe` has both languages in it, stored as `jsonb` in
  Postgres, and components pick `field[locale]` at render time. The
  recipe list is sorted by `title[locale]` in the UI layer
  (`src/components/RecipeList.tsx`), not in the database query, since the
  current language is only known client-side.

## Navigation uses plain `<a>`, not `next/link`

Every internal link in this app is still a plain `<a href>`, not
`next/link`'s `<Link>` — a holdover from when this app was a static
export with an offline-cache-fallback service worker that `<Link>`'s
client-side "soft" navigation couldn't use (see git history for that
story). That reason no longer applies now that the app is server-backed
and offline support is gone; a plain `<a>` today just means every internal
navigation is a full page reload instead of a fast client-side transition.
Switching to `<Link>` is reasonable follow-up work, not done as part of
the Postgres/MCP rearchitecture — don't reintroduce it piecemeal without
converting the app's internal links consistently.

## Cook mode

`src/components/CookMode.tsx` is the screen the whole app exists to
deliver: one step at a time, at very large type, with a two-button
back/next flow so it works with wet or floury hands. It also:

- requests a **Wake Lock** (`src/lib/use-wake-lock.ts`) so the screen
  doesn't dim mid-instruction — best-effort, no-ops on unsupported browsers;
- offers an optional per-step **countdown timer** for steps with real dead
  time (`Step.timerMinutes`);
- calls the `markCookedAction` Server Action on finishing, which writes a
  timestamp to `user_recipe_state` in Postgres.

## Persistent step timers

A recipe step's timer has to survive the cook *leaving* that step: start a
9-minute boil on step 2, flip to step 4 to prep something else, and the
timer needs to still be counting down — correctly — when you flip back, and
it has to sound an alarm the moment it hits zero no matter which step (or
page) is on screen at that instant. A `useState` countdown tied to the
current step can't do that; it resets the moment the step changes.

`src/lib/timers.ts` is a module-level store, not React state, keyed by
`recipeId:stepOrder`. Two decisions fall directly out of "every internal
navigation is a full page reload" (see above) — this part is unrelated to
where recipe data lives, and stayed exactly the same through the move to
Postgres:

- **Timers track a wall-clock `endAt`, not a decrementing counter.** A
  `setInterval` that ticks a counter down loses time the instant its tab is
  backgrounded (browsers throttle/suspend timers) or the JS realm is torn
  down entirely — which happens on *every* navigation in this app, because
  internal links are plain `<a>` full-page loads, not client-side
  transitions (see above). Storing `endAt = Date.now() + minutes * 60_000`
  instead means "how much time is left" is always `endAt - Date.now()`,
  correct regardless of how long the tick loop was paused or how many
  reloads happened in between.
- **State is persisted to `localStorage`, not the database.** Timers are
  ephemeral, per-device session state, not something that needs to follow
  the user to another device — but they do need to survive the hard
  reload that happens when a cook exits and re-enters cook mode, or when
  the browser reclaims a backgrounded tab. `localStorage` is synchronous
  and available before hydration, so a freshly loaded page can recompute
  every timer's remaining time on its
  very first render.

The engine self-starts on import (any page that pulls in `timers.ts`
resumes ticking from whatever's in `localStorage`) and fires the alarm
(a Web Audio beep, `navigator.vibrate`, and a `Notification` if permission
was granted) exactly once per timer, from the store itself — not from a
React effect — so it fires once regardless of how many components have a
timer hook mounted. `src/components/TimerAlarmBanner.tsx` is mounted once
in the root layout specifically so the "timer's done" banner (and the
sound/vibration/notification that come with it) shows up **wherever the
cook currently is** — a different step in cook mode, the recipe detail
page, even the recipe list — not just the step that started the timer.
`document.visibilitychange` triggers an immediate catch-up tick so
returning to a backgrounded tab fires a just-missed alarm right away
instead of waiting for the next tick.

This has one honest limit, inherent to a client-only timer with no push
notification service behind it: it only works while the tab/app's JS is
actually running. If the browser fully closes or kills the tab, nothing
can wake it to fire an alarm — a real backend doesn't change that on its
own; it would take an actual push-notification subscription, which
nothing here implements. `endAt` being wall-clock-based means the timer is
never *wrong* when the page comes back, just possibly *late* if the tab
was gone for a while.

## Recipe chatbot (Nomi) backend

`src/app/experiments/chatbot` is a full-screen chat UI
(`src/components/ChatBot.tsx`) for "Nomi", a recipe/nutrition assistant.
Answering a chat message needs a server (an LLM call shouldn't run
client-side even where it technically could, since that would mean
shipping an API key to the browser), and predates this app having any
Next.js server code of its own.

That's why the endpoint (`api/chat.ts`) lives in a top-level `/api`
directory instead of a Next.js route handler under `src/app/api` — at the
time it was written, `next.config.ts` still set `output: "export"`, so a
route handler wasn't an option at all (static export forbids dynamic
Route Handlers). `/api/*.ts` at the repo root is a separate Vercel
convention ("Vercel Functions"): Vercel deploys any file there as its own
Node serverless function regardless of the framework preset, alongside
whatever the framework build produces — which is how this one endpoint
ran on real server infrastructure while the rest of the app was still a
static export. Now that the app itself is a normal deployed Next.js
server (see "Why Postgres + Auth.js" above), a *new* endpoint like this
would more naturally be a route handler under `src/app/api/` — that's
exactly what `src/app/api/mcp/route.ts` is, see docs/mcp.md. `api/chat.ts`
staying where it is isn't a problem (both conventions deploy fine
side by side on Vercel), just a historical artifact worth knowing about
before assuming every server endpoint in this repo follows one pattern.
It still doesn't run locally under `next dev` (only on Vercel, or under
`vercel dev`).

`api/chat.ts` uses the [OpenAI Agents SDK](https://www.npmjs.com/package/@openai/agents)
to run a single `Agent` named Nomi on `gpt-5-nano`. It only does that when an
`OPENAI_API_KEY` environment variable is set on the Vercel project (see
`.env.example`); without one, it returns a small set of canned mock
replies (picked deterministically from the message text, in the request's
locale) so the chat UI is fully testable before a key exists. The client
sends the running message history and current locale on every request —
there's no server-side session, matching the "no state on the server"
posture the rest of the app already takes for granted.

**The root `package.json` needs `"type": "module"`.** This one cost three
rounds to actually pin down, because two reasonable-looking theories
turned out to be wrong:

- *Round 1 — looked like a handler-shape problem.* `api/chat.ts` originally
  exported the older Node-style default function (`export default function
  handler(req: VercelRequest, res: VercelResponse) {...}`, typed via
  `@vercel/node`) — the same shape Next.js's own `pages/api` used
  historically. It deployed without error and Vercel's routing matched
  `/api/chat` correctly (confirmed via the `x-matched-path` response
  header), but *every* invocation — even a bare `GET` — failed with an
  opaque `FUNCTION_INVOCATION_FAILED` and no application-level error (our
  own `try/catch` never ran). That pattern — routes fine, crashes on
  invocation with nothing from our own code — looked exactly like Vercel's
  runtime bootstrap calling the export the wrong way, so the fix seemed to
  be rewriting to the Web-standard `export default { async fetch(request:
  Request): Promise<Response> {...} }` shape (the shape Vercel's own
  current docs show for a root-level `/api` file). That rewrite is a
  genuine improvement — it's the documented convention and it dropped the
  `@vercel/node` dependency — but redeploying it **failed identically**,
  which ruled the handler-shape theory out.
- *Round 2 — the actual cause, from the real function logs*: `Warning:
  Failed to load the ES module: /var/task/api/chat.js ... SyntaxError:
  Unexpected token 'export'`. Vercel's Node.js runtime does read this
  project's root `tsconfig.json` to compile a TypeScript file under
  `/api` (its own docs say so), and that tsconfig sets `"module":
  "esnext"` — required for the Next.js app itself to build with
  Turbopack's bundler resolution. Applied to `api/chat.ts` too, that
  setting tells the compiler to leave `import`/`export` syntax untouched
  rather than lowering it to CommonJS, so the emitted `api/chat.js` still
  contained a literal `export default ...` statement — and Node's module
  loader treats a plain `.js` file as CommonJS by default, so it tried to
  `require()` that ESM syntax and threw a `SyntaxError` before either
  handler shape above ever ran. That explains why the handler-shape
  rewrite didn't help: it was never the export *shape* Node choked on, it
  was the raw `export` keyword itself.
- *Round 3 — the `.mts` attempt.* Node always treats a `.mjs`/`.mts`-derived
  output as an ES module by extension, regardless of `package.json`'s
  `"type"` field or any tsconfig `"module"` setting, so renaming the
  source file to `api/chat.mts` looked like a fix scoped to just this one
  file, leaving the shared root `tsconfig.json` (which the Next.js build
  genuinely needs as `"module": "esnext"`) untouched. It compiled, but
  Vercel's `/api` function detection for this project doesn't recognize a
  `.mts` source file as a function at all — the route **404'd** outright
  (`x-matched-path: /404`) instead of building, which is a worse failure
  mode than the crash it was meant to fix.

  The fix that actually worked: revert to `api/chat.ts`, and add `"type":
  "module"` to the root `package.json` — exactly what Node's own warning
  in Round 2 suggested from the start. It's a project-wide setting, but a
  low-risk one here: nothing else at the repo root is a plain `.js`/`.cjs`
  file relying on being loaded as CommonJS (`eslint.config.mjs` is already
  explicitly `.mjs`, unaffected either way; `next.config.ts` and
  `tsconfig.json` aren't loaded via Node's own CommonJS resolution at
  all).

**`next.config.ts`'s trailing-slash setting applies to this function too,**
not just Next's own pages — Vercel bakes one canonical form into the whole
deployment's routing, standalone functions included. This app no longer
sets `trailingSlash: true` (removed once it broke external MCP clients
hitting `/api/mcp` — see docs/mcp.md's "Transport" section — since a `308`
redirect there isn't reliably followed on a `POST`), which flips the
canonical form to the bare path: a request to `/api/chat/` now gets a
`308` to `/api/chat`, the reverse of before. `fetch()` follows a `308`
transparently (it preserves the method and body, unlike `301`/`302`), so
neither direction is actually broken, but `ChatBot.tsx` calls `/api/chat`
(no trailing slash) directly to match the current canonical form and
skip the redirect round trip.

**Preview deployments can sit behind Vercel Deployment Protection
(SSO)**, which intercepts every request — page and function alike —
*before* it reaches the app. A protected page load 302s to Vercel's own
login page (which a real browser follows transparently once you're
authenticated for the project), but a `fetch()` call made from inside
already-loaded page JS just gets back a `401 {"error":{"message":"Protected
deployment"}}` JSON body — which is valid JSON, so it parses fine and
silently looks like an empty/failed chat reply rather than an obvious
auth error. This has nothing to do with the app's own code; it's a
per-project Vercel setting (Project Settings → Deployment Protection).
[Protection Bypass for
Automation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)
provides a `VERCEL_AUTOMATION_BYPASS_SECRET` for exactly this case — send
it as an `x-vercel-protection-bypass` header (or query param), plus
`x-vercel-set-bypass-cookie: true` once to persist a cookie for a whole
browser session. It's for testers/CI only and must never be embedded in
the app's own shipped client code, since that would hand every visitor a
permanent bypass.
