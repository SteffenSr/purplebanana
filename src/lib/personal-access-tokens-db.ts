import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { personalAccessTokens } from "@/db/schema";

/**
 * Server-only data-access layer for personal access tokens — how Claude,
 * ChatGPT, or another MCP client authenticate to the MCP server (see
 * src/mcp/auth.ts) once it's backed by real accounts. Only a sha256 hash
 * of the raw token is ever stored; the raw value is generated here, shown
 * to the user exactly once (src/app/settings/page.tsx), and never
 * persisted or logged anywhere.
 */

export interface PersonalAccessTokenRow {
  id: string;
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function listPersonalAccessTokens(userId: string): Promise<PersonalAccessTokenRow[]> {
  const rows = await db.select().from(personalAccessTokens).where(eq(personalAccessTokens.userId, userId));
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    createdAt: row.createdAt.toISOString(),
    lastUsedAt: row.lastUsedAt ? row.lastUsedAt.toISOString() : null,
  }));
}

/** Returns the raw token — shown to the caller exactly once and never stored. */
export async function createPersonalAccessToken(userId: string, label: string): Promise<string> {
  const rawToken = `simmer_pat_${randomBytes(24).toString("base64url")}`;
  await db.insert(personalAccessTokens).values({ userId, label, tokenHash: hashToken(rawToken) });
  return rawToken;
}

export async function revokePersonalAccessToken(userId: string, tokenId: string): Promise<void> {
  await db
    .delete(personalAccessTokens)
    .where(and(eq(personalAccessTokens.userId, userId), eq(personalAccessTokens.id, tokenId)));
}

/**
 * Resolves a raw bearer token to its owning userId, or undefined if it's
 * unknown/revoked. Updates `lastUsedAt` best-effort (fire-and-forget) so a
 * slow write to that bookkeeping column never adds latency to an MCP
 * request. Never logs the raw token itself, only failures updating it.
 */
export async function resolveUserIdForToken(rawToken: string): Promise<string | undefined> {
  const [row] = await db
    .select()
    .from(personalAccessTokens)
    .where(eq(personalAccessTokens.tokenHash, hashToken(rawToken)));
  if (!row) return undefined;

  void db
    .update(personalAccessTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(personalAccessTokens.id, row.id))
    .catch((err) => {
      console.error("Failed to record personal access token usage:", err instanceof Error ? err.message : err);
    });

  return row.userId;
}
