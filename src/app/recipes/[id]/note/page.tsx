import { auth } from "@/auth";
import { getVisibleRecipe } from "@/lib/recipes-db";
import { RecipeNote } from "@/components/RecipeNote";

export default async function RecipeNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const recipe = await getVisibleRecipe(session!.user.id, id);
  return <RecipeNote recipe={recipe} />;
}
