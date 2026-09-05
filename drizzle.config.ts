import { defineConfig } from "drizzle-kit";

// Migrations run DDL, so prefer Neon's direct (unpooled) connection string
// over the pooled one the app uses at runtime (src/db/client.ts) — Neon
// recommends this for schema changes to avoid pooler edge cases. Vercel's
// Postgres integration exposes the same thing under two different names
// depending on which naming convention it used.
const connectionString =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    "No Postgres connection string found (checked DATABASE_URL_UNPOOLED, POSTGRES_URL_NON_POOLING, " +
      "DATABASE_URL, POSTGRES_URL) — run `vercel env pull .env.local` first."
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: connectionString },
});
