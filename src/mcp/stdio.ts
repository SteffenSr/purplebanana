import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolveUserIdForStdio } from "./auth";
import { createSimmerMcpServer } from "./server";
import { createServiceContainer } from "./services/container";

/**
 * Local-development transport: stdio, for connecting an MCP Inspector or a
 * desktop MCP client running on the same machine. Not the primary way this
 * server is meant to be used — see docs/mcp.md's "Transport" section — but
 * useful while iterating without standing up an HTTP server.
 */
async function main(): Promise<void> {
  const services = createServiceContainer();
  const context = resolveUserIdForStdio();
  const server = createSimmerMcpServer(context, services);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Simmer MCP stdio server failed to start:", err instanceof Error ? err.message : err);
  process.exit(1);
});
