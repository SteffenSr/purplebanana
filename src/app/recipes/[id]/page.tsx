import { auth } from "@/auth";
import { getVisibleRecipe } from "@/lib/recipes-db";
import { RecipeDetail } from "@/components/RecipeDetail";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const recipe = await getVisibleRecipe(session!.user.id, id);
  return <RecipeDetail recipe={recipe} />;
}
