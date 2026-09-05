import { auth } from "@/auth";
import { getVisibleRecipes } from "@/lib/recipes-db";
import { RecipeList } from "@/components/RecipeList";

export default async function HomePage() {
  const session = await auth();
  const recipes = await getVisibleRecipes(session!.user.id);
  return <RecipeList recipes={recipes} />;
}
