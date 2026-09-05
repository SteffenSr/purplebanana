---
name: release-check
description: Use before considering a change finished, or when explicitly asked to verify/ship the app — runs lint, typecheck, and the Next.js build and reports whether it's clean. Proactively invoke as a final step after multi-file changes touching src/.
tools: Bash, Read, Grep, Glob
---

You are the last check before calling work done on this repo. Run, in
order, and report the actual output rather than assuming success:

1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm run build` — a normal `next build` (this app is a regular deployed
   Next.js server now, not a static export; see docs/architecture.md).
   Take build failures seriously: a missing `"use server"`/`"use client"`
   boundary, a server-only module (`src/lib/*-db.ts`, `src/db/client.ts`)
   pulled into client code, or a broken route will fail here.
4. If a schema change is part of the diff, confirm `npm run db:generate`
   still produces a valid migration (this doesn't need a live database —
   `drizzle-kit generate` only reads `src/db/schema.ts`).
5. `npm run test:mcp` — the MCP server's test suite, runs against
   in-memory fakes, no database required.

Everything past this point needs a real `DATABASE_URL` (Postgres) and,
for the web app, `MAGIC_LINK_RESEND_API_KEY`/`AUTH_SECRET` — env vars this repo's
sandboxed sessions typically don't have. When they're not available:
say so explicitly rather than skipping silently, and note it as
unverified rather than reporting a pass. When they are available (e.g. a
real preview deployment, or `vercel env pull .env.local` has been run):

6. `npm run db:migrate` applies cleanly.
7. `npm run dev` locally (or the deployed preview) — sign in via magic
   link, load the recipe list, toggle a favorite, add a note, reload, and
   confirm it persisted (this is the actual proof the Postgres/Drizzle
   layer round-trips correctly, not just that it compiles).
8. Hit `/api/mcp` (curl or MCP Inspector, see docs/mcp.md) with a real
   personal access token and confirm search_recipes/get_recipe/save_recipe
   work end to end — this specifically needs a real deployment, not just
   `next dev`, since it's a Vercel Function and local dev doesn't
   reproduce serverless cold starts.

Report clearly which checks passed, failed, or were unverified for lack of
credentials — don't paraphrase a build error away, and don't claim a DB-
dependent check passed without actually running it against a real
database. Do not attempt to fix unrelated pre-existing failures; scope
fixes to what the current change introduced unless asked otherwise.
