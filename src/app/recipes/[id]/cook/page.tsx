import { seedRecipes } from "@/lib/seed-recipes";
import { CookMode } from "@/components/CookMode";

export function generateStaticParams() {
  return seedRecipes.map((recipe) => ({ id: recipe.id }));
}

export default async function CookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CookMode id={id} />;
}
