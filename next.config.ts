import type { NextConfig } from "next";

// Deployed as a normal Next.js server on Vercel — no more static export.
// Recipes/food data live in Postgres (src/db/), not the browser, so
// there's a real backend to talk to now (see docs/architecture.md and
// docs/mcp.md for why this replaced the old static-export + IndexedDB
// design).
const nextConfig: NextConfig = {
  // Every internal <a href="..."> in this app is written with a trailing
  // slash (see docs/architecture.md's "Navigation" section) — unrelated to
  // the old static export, so it stayed when that did not.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
