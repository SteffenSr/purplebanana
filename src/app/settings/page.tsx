import { auth } from "@/auth";
import { getFoodPreferences, listHouseholdMembers } from "@/lib/food-profile-db";
import { listPersonalAccessTokens } from "@/lib/personal-access-tokens-db";
import { SettingsView } from "@/components/SettingsView";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [tokens, preferences, members] = await Promise.all([
    listPersonalAccessTokens(userId),
    getFoodPreferences(userId),
    listHouseholdMembers(userId),
  ]);

  return (
    <SettingsView
      email={session!.user.email ?? ""}
      tokens={tokens}
      preferences={preferences}
      members={members}
    />
  );
}
