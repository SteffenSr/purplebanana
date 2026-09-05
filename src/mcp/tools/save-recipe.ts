import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpRequestContext } from "../auth";
import { saveRecipeInputShape } from "../schemas";
import type { ServiceContainer } from "../services/container";

export function registerSaveRecipeTool(server: McpServer, context: McpRequestContext, services: ServiceContainer): void {
  server.registerTool(
    "save_recipe",
    {
      title: "Save recipe",
      description:
        "WRITE OPERATION — this creates a new recipe in the user's Simmer collection and changes their " +
        "data. Only call this when the user has clearly asked to save, keep, or store a recipe (e.g. " +
        "\"save this in Simmer\"), never speculatively. Input is validated: at least one ingredient and one " +
        "instruction step are required. Returns the new recipe's id, title, and createdAt so it can be " +
        "fetched again with get_recipe.",
      inputSchema: saveRecipeInputShape,
      annotations: {
        title: "Save recipe",
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (input) => {
      const result = await services.recipeService.save(context.userId, input);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
