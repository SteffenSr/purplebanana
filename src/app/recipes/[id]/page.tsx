import { seedRecipes } from "@/lib/seed-recipes";
import { RecipeDetail } from "@/components/RecipeDetail";

// Static export needs every dynamic route known at build time. The seed
// recipes are the fixed set of recipes the app ships with; IndexedDB is
// then the runtime source of truth for their content (see lib/db.ts).
export function generateStaticParams() {
  return seedRecipes.map((recipe) => ({ id: recipe.id }));
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RecipeDetail id={id} />;
}
