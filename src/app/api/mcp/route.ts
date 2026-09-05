import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { resolveUserIdFromHeaders, UnauthorizedError, type HeaderBag } from "@/mcp/auth";
import { createSimmerMcpServer } from "@/mcp/server";
import { createServiceContainer } from "@/mcp/services/container";

/**
 * The Simmer MCP server, mounted as a Vercel Function in the same
 * deployment as the recipe app — see docs/mcp.md's "Transport" section.
 * Runs in stateless mode (`sessionIdGenerator: undefined`): a fresh
 * McpServer + transport per request, so there's no server-side session
 * state to scale or expire across Vercel's stateless function instances.
 * `services` is a module-level singleton so its Drizzle-backed
 * repositories aren't rebuilt on every request within a warm instance.
 */

const services = createServiceContainer();

function headerBagFrom(headers: Headers): HeaderBag {
  const bag: HeaderBag = {};
  headers.forEach((value, key) => {
    bag[key] = value;
  });
  return bag;
}

function unauthorizedResponse(message: string): Response {
  return Response.json({ jsonrpc: "2.0", error: { code: -32001, message }, id: null }, { status: 401 });
}

async function handle(request: Request): Promise<Response> {
  let context;
  try {
    context = await resolveUserIdFromHeaders(headerBagFrom(request.headers));
  } catch (err) {
    if (err instanceof UnauthorizedError) return unauthorizedResponse(err.message);
    throw err;
  }

  const server = createSimmerMcpServer(context, services);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  return transport.handleRequest(request);
}

export async function POST(request: Request): Promise<Response> {
  return handle(request);
}

export async function GET(request: Request): Promise<Response> {
  return handle(request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handle(request);
}
