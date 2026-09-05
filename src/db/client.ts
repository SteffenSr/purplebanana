import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Single Drizzle client, shared by the app's Server Components/Actions and
 * the MCP server's Drizzle-backed repositories (src/mcp/repositories/).
 * Uses Neon's own HTTP driver directly — NOT `@vercel/postgres`, which
 * Vercel has deprecated in favor of using Neon's SDKs straight (Vercel
 * Postgres is Neon under the Marketplace integration; see
 * https://neon.com/docs/guides/vercel-postgres-transition-guide). The
 * Vercel Postgres integration still provides the connection string, just
 * under `POSTGRES_URL`/`DATABASE_URL` rather than its own package.
 *
 * Built eagerly, at import time — not lazily — because `@auth/drizzle-adapter`
 * (src/auth.ts) inspects this object synchronously to detect which
 * Postgres driver it's talking to; a lazy proxy defeats that detection.
 * That means `DATABASE_URL` must be set at *build* time too, not just at
 * runtime, since `next build` imports every route module (including
 * app/api/auth/[...nextauth]/route.ts) to collect its metadata even for
 * fully dynamic routes. On Vercel this is already true by default —
 * integration-provided env vars (Postgres, Resend) are available during
 * the build, not just at request time.
 */
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL (or POSTGRES_URL) is not set. Run `vercel env pull .env.local` after installing " +
      "the Postgres integration in the Vercel dashboard — see docs/architecture.md."
  );
}

export const db = drizzle(neon(connectionString), { schema });
