import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpRequestContext } from "../auth";
import { NotFoundError } from "../errors";
import { updateRecipeNoteInputShape } from "../schemas";
import type { ServiceContainer } from "../services/container";

export function registerUpdateRecipeNoteTool(server: McpServer, context: McpRequestContext, services: ServiceContainer): void {
  server.registerTool(
    "update_recipe_note",
    {
      title: "Update recipe note",
      description:
        "WRITE OPERATION — records or updates the signed-in user's personal note on one recipe (e.g. a " +
        "substitution, a timing tweak, or anything else that works for them specifically while cooking it). " +
        "This note is private to this user, separate from the recipe's own ingredients/instructions, and " +
        "separate even on a recipe shared with other users. Call get_recipe first if you need to see the " +
        "existing note before deciding what to do. By default (`mode` omitted, or \"append\"), `note` is " +
        "appended to whatever note already exists, on its own line — nothing already stored is ever lost. " +
        "Only pass `mode: \"replace\"` when you have already read the existing note yourself and merged it " +
        "with the new information — in that case `note` must be the complete final text, since it fully " +
        "replaces what was stored. Returns the note exactly as now stored, so an append can be confirmed.",
      inputSchema: updateRecipeNoteInputShape,
      annotations: {
        title: "Update recipe note",
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ id, note, mode }) => {
      try {
        const result = await services.recipeService.updateNote(context.userId, id, note, mode ?? "append");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        if (err instanceof NotFoundError) {
          return { content: [{ type: "text", text: err.message }], isError: true };
        }
        throw err;
      }
    }
  );
}
