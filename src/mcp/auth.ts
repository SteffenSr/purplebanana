/**
 * Auth abstraction for the Simmer MCP server. Every repository/service call
 * downstream takes a `userId` from a `McpRequestContext` resolved here — see
 * docs/mcp.md's "Authentication" section for the full picture.
 *
 * DEVELOPMENT ONLY: userId is resolved from a static dev-token map
 * (env var SIMMER_MCP_DEV_TOKENS) or a single fallback dev user
 * (SIMMER_MCP_DEV_USER_ID). There is no real authentication here.
 *
 * PRODUCTION TODO: replace `resolveUserIdFromHeaders` below with real
 * OAuth/OIDC bearer-token verification (validate a JWT's signature and
 * issuer against Simmer's identity provider, then use its `sub` claim as
 * userId). This is the *only* place that needs to change — every service
 * and repository already takes userId as an opaque, already-authenticated
 * value and never re-derives it.
 */
export interface McpRequestContext {
  userId: string;
}

export class UnauthorizedError extends Error {
  constructor(message = "Missing or invalid Simmer credentials.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

const DEFAULT_DEV_USER_ID = "dev-user";

function parseDevTokenMap(raw: string | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!raw) return map;
  for (const pair of raw.split(",")) {
    const [token, userId] = pair.split(":").map((part) => part.trim());
    if (token && userId) map.set(token, userId);
  }
  return map;
}

export type HeaderBag = Record<string, string | string[] | undefined>;

/**
 * Resolves the calling user from an `Authorization: Bearer <token>` header,
 * mapping dev tokens to user ids via SIMMER_MCP_DEV_TOKENS
 * ("token-for-anna:user-anna,token-for-bo:user-bo"). With no Authorization
 * header at all, falls back to SIMMER_MCP_DEV_USER_ID (default "dev-user")
 * so a local client can connect with zero setup. Never logs the header
 * value or token itself — only ever the resolved userId.
 */
export function resolveUserIdFromHeaders(headers: HeaderBag): McpRequestContext {
  const authHeader = headers["authorization"] ?? headers["Authorization"];
  const value = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (!value) {
    return { userId: process.env.SIMMER_MCP_DEV_USER_ID || DEFAULT_DEV_USER_ID };
  }

  const match = /^Bearer\s+(.+)$/i.exec(value.trim());
  if (!match) {
    throw new UnauthorizedError("Authorization header must be a Bearer token.");
  }

  const token = match[1] ?? "";
  const userId = parseDevTokenMap(process.env.SIMMER_MCP_DEV_TOKENS).get(token);
  if (!userId) {
    throw new UnauthorizedError("Unknown Simmer credentials.");
  }
  return { userId };
}

/** stdio has no HTTP headers — for local dev, resolve directly from env. */
export function resolveUserIdForStdio(): McpRequestContext {
  return { userId: process.env.SIMMER_MCP_DEV_USER_ID || DEFAULT_DEV_USER_ID };
}
