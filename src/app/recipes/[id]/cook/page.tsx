import { auth } from "@/auth";
import { getVisibleRecipe } from "@/lib/recipes-db";
import { CookMode } from "@/components/CookMode";

export default async function CookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const recipe = await getVisibleRecipe(session!.user.id, id);
  return <CookMode id={id} recipe={recipe} />;
}
