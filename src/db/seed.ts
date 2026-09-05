import { db } from "./client";
import { recipes } from "./schema";
import { seedRecipes } from "../lib/seed-recipes";

/**
 * One-time seed of Simmer's bundled starter recipes into Postgres, as
 * `ownerId: null` rows shared by every user. Run with `npm run db:seed`
 * after `npm run db:migrate`. Successor to the old `ensureSeeded()` in the
 * IndexedDB-era src/lib/db.ts, which ran on every client launch — this now
 * runs once, against the real database, since recipe content lives
 * server-side. Safe to re-run: upserts by id, so a re-run after editing
 * seed-recipes.ts updates existing shared recipes rather than duplicating
 * them, and never touches a user's own saved recipes (different ids).
 */
async function main(): Promise<void> {
  const rows = seedRecipes.map((recipe) => ({
    ...recipe,
    ownerId: null,
    createdAt: new Date(recipe.updatedAt),
    updatedAt: new Date(recipe.updatedAt),
  }));

  for (const row of rows) {
    await db
      .insert(recipes)
      .values(row)
      .onConflictDoUpdate({
        target: recipes.id,
        set: {
          title: row.title,
          description: row.description,
          emoji: row.emoji,
          imageUrl: row.imageUrl,
          tags: row.tags,
          servings: row.servings,
          prepMinutes: row.prepMinutes,
          cookMinutes: row.cookMinutes,
          ingredients: row.ingredients,
          steps: row.steps,
          updatedAt: row.updatedAt,
        },
      });
  }

  console.log(`Seeded ${rows.length} shared starter recipe(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
