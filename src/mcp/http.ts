import http from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { resolveUserIdFromHeaders, UnauthorizedError, type HeaderBag } from "./auth";
import { createSimmerMcpServer } from "./server";
import { createServiceContainer } from "./services/container";

/**
 * Remote MCP transport: Streamable HTTP (the current recommended transport
 * for remote MCP servers), run in stateless mode — a fresh McpServer and
 * transport per request, so there is no server-side session state to scale
 * or expire. See docs/mcp.md's "Running the server" and "Transport"
 * sections.
 */

const PORT = Number(process.env.PORT ?? 3939);
const MCP_PATH = "/mcp";

const services = createServiceContainer();

function sendJsonRpcError(res: http.ServerResponse, status: number, message: string): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message }, id: null }));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  if (url.pathname !== MCP_PATH) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: `Not found. The Simmer MCP endpoint is ${MCP_PATH}.` }));
    return;
  }

  let context;
  try {
    context = resolveUserIdFromHeaders(req.headers as HeaderBag);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      sendJsonRpcError(res, 401, err.message);
      return;
    }
    throw err;
  }

  try {
    const mcpServer = createSimmerMcpServer(context, services);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    res.on("close", () => {
      transport.close();
      mcpServer.close();
    });

    await mcpServer.connect(transport);

    let parsedBody: unknown;
    if (req.method === "POST") {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const raw = Buffer.concat(chunks).toString("utf8");
      parsedBody = raw ? JSON.parse(raw) : undefined;
    }

    await transport.handleRequest(req, res, parsedBody);
  } catch (err) {
    // Never log Authorization headers or tokens — only the failure itself.
    console.error("Simmer MCP request failed:", err instanceof Error ? err.message : err);
    if (!res.headersSent) {
      sendJsonRpcError(res, 500, "Internal server error");
    }
  }
});

server.listen(PORT, () => {
  console.log(`Simmer MCP server (Streamable HTTP) listening on http://localhost:${PORT}${MCP_PATH}`);
});
