import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpRequestContext } from "../auth";
import type { ServiceContainer } from "../services/container";

export function registerGetFoodProfileTool(server: McpServer, context: McpRequestContext, services: ServiceContainer): void {
  server.registerTool(
    "get_food_profile",
    {
      title: "Get food profile",
      description:
        "Read-only. Returns this Simmer user's food context: dietary preferences, dislikes, favorite " +
        "ingredients, cooking goals, and household members with their own likes/dislikes. Call this before " +
        "recommending or filtering recipes for the user or their household, so suggestions respect real " +
        "constraints (e.g. vegan, a nut allergy, a picky kid) instead of guessing. Returns only " +
        "food-related data, never a general profile.",
      inputSchema: {},
      annotations: {
        title: "Get food profile",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      const profile = await services.foodProfileService.get(context.userId);
      return { content: [{ type: "text", text: JSON.stringify(profile, null, 2) }] };
    }
  );
}
