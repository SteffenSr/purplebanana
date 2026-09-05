import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpRequestContext } from "./auth";
import type { ServiceContainer } from "./services/container";
import { registerGetFoodProfileTool } from "./tools/get-food-profile";
import { registerGetMealHistoryTool } from "./tools/get-meal-history";
import { registerGetRecipeTool } from "./tools/get-recipe";
import { registerSaveRecipeTool } from "./tools/save-recipe";
import { registerSearchRecipesTool } from "./tools/search-recipes";

/**
 * Builds one MCP server instance scoped to a single request's
 * McpRequestContext (userId). Cheap to create — it just registers five thin
 * tool wrappers around the shared ServiceContainer — so http.ts creates a
 * fresh one per stateless HTTP request while stdio.ts creates exactly one
 * for the whole process. See docs/mcp.md's "Architecture" section.
 */
export function createSimmerMcpServer(context: McpRequestContext, services: ServiceContainer): McpServer {
  const server = new McpServer(
    { name: "simmer", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  registerGetFoodProfileTool(server, context, services);
  registerSearchRecipesTool(server, context, services);
  registerGetRecipeTool(server, context, services);
  registerSaveRecipeTool(server, context, services);
  registerGetMealHistoryTool(server, context, services);

  return server;
}
