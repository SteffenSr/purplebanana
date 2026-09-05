import { headers } from "next/headers";
import { auth } from "@/auth";
import { getFoodPreferences, listHouseholdMembers } from "@/lib/food-profile-db";
import { listPersonalAccessTokens } from "@/lib/personal-access-tokens-db";
import { SettingsView } from "@/components/SettingsView";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [tokens, preferences, members, requestHeaders] = await Promise.all([
    listPersonalAccessTokens(userId),
    getFoodPreferences(userId),
    listHouseholdMembers(userId),
    headers(),
  ]);

  // Built from the request's own host rather than an env var, so it's
  // always correct for whichever deployment (production or a preview
  // branch URL) the settings page happens to be served from.
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const mcpUrl = `${protocol}://${host}/api/mcp`;

  return (
    <SettingsView
      email={session!.user.email ?? ""}
      tokens={tokens}
      preferences={preferences}
      members={members}
      mcpUrl={mcpUrl}
    />
  );
}
