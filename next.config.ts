import type { NextConfig } from "next";

// Deployed as a normal Next.js server on Vercel — no more static export.
// Recipes/food data live in Postgres (src/db/), not the browser, so
// there's a real backend to talk to now (see docs/architecture.md and
// docs/mcp.md for why this replaced the old static-export + IndexedDB
// design).
const nextConfig: NextConfig = {
  // Deliberately NOT trailingSlash: true. That option made the trailing-
  // slash form canonical and 308-redirected /api/mcp -> /api/mcp/ — and
  // external MCP clients (Claude, ChatGPT) calling /api/mcp don't reliably
  // follow a redirect on a POST, which broke real connections. Leaving
  // this unset flips which form is canonical (Next's default redirects
  // the *trailing-slash* form to the bare path instead), so /api/mcp now
  // serves directly. Every internal <a href="..."> in this app still uses
  // a trailing slash (see docs/architecture.md's "Navigation" section) —
  // those now take one extra redirect hop for browser navigation, which
  // is harmless; updating them to drop the trailing slash is a fine
  // follow-up but wasn't done here.
  images: { unoptimized: true },
};

export default nextConfig;
