import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpRequestContext } from "../auth";
import { NotFoundError } from "../errors";
import { getRecipeInputShape } from "../schemas";
import type { ServiceContainer } from "../services/container";

export function registerGetRecipeTool(server: McpServer, context: McpRequestContext, services: ServiceContainer): void {
  server.registerTool(
    "get_recipe",
    {
      title: "Get recipe",
      description:
        "Read-only. Fetches one complete recipe by its stable id — full ingredients, step-by-step " +
        "instructions, notes, tags, and source. Use search_recipes first to find the id; calling this " +
        "with an unknown or guessed id returns an error rather than a partial or wrong recipe.",
      inputSchema: getRecipeInputShape,
      annotations: {
        title: "Get recipe",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ id }) => {
      try {
        const recipe = await services.recipeService.getById(context.userId, id);
        return { content: [{ type: "text", text: JSON.stringify(recipe, null, 2) }] };
      } catch (err) {
        if (err instanceof NotFoundError) {
          return { content: [{ type: "text", text: err.message }], isError: true };
        }
        throw err;
      }
    }
  );
}
