/**
 * Errors thrown by services, translated by each tool handler into an
 * MCP tool result with `isError: true` and a message safe to show both
 * the calling MCP client and the model driving it (see docs/mcp.md's
 * "Errors" note). Never include credentials or tokens in these messages.
 */

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
