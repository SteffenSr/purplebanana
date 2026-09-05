import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpRequestContext } from "../auth";
import { getMealHistoryInputShape } from "../schemas";
import type { ServiceContainer } from "../services/container";

export function registerGetMealHistoryTool(server: McpServer, context: McpRequestContext, services: ServiceContainer): void {
  server.registerTool(
    "get_meal_history",
    {
      title: "Get meal history",
      description:
        "Read-only. Returns the user's recorded meals — date, the recipe(s) cooked, and any notes — " +
        "optionally filtered to a date range (from/to, ISO YYYY-MM-DD) and/or free-text matched against " +
        "notes, guests, or occasion. This is the tool for cross-context questions like \"what did I cook " +
        "the night <person> visited\" once that visit's approximate date is known from elsewhere (e.g. a " +
        "calendar or email) — pass it as `from`/`to` or as `query` with the person's name.",
      inputSchema: getMealHistoryInputShape,
      annotations: {
        title: "Get meal history",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (input) => {
      const results = await services.mealHistoryService.search(context.userId, input);
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }
  );
}
