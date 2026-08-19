import { ingredientProfiles } from "@/lib/ingredients";
import { IngredientDetail } from "@/components/IngredientDetail";

// Static export needs every dynamic route known at build time — see
// src/app/recipes/[id]/page.tsx for the same pattern.
export function generateStaticParams() {
  return ingredientProfiles.map((ingredient) => ({ id: ingredient.id }));
}

export default async function IngredientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IngredientDetail id={id} />;
}
