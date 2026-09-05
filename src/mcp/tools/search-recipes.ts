import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpRequestContext } from "../auth";
import { searchRecipesInputShape } from "../schemas";
import type { ServiceContainer } from "../services/container";

export function registerSearchRecipesTool(server: McpServer, context: McpRequestContext, services: ServiceContainer): void {
  server.registerTool(
    "search_recipes",
    {
      title: "Search recipes",
      description:
        "Read-only. Searches this Simmer user's own saved recipes (their private collection plus Simmer's " +
        "bundled starter recipes) by free-text query and/or tags. Returns compact summaries only — id, " +
        "title, description, tags, lastCookedAt — never full ingredients or instructions. Use this first to " +
        "find candidates, then call get_recipe with the id of the one the user actually wants in full.",
      inputSchema: searchRecipesInputShape,
      annotations: {
        title: "Search recipes",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (input) => {
      const results = await services.recipeService.search(context.userId, input);
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }
  );
}
