import type { NextConfig } from "next";

// Statically exported site: no Node server at runtime, so the app's
// "backend" is the browser's own IndexedDB store (see src/lib/db.ts).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // scripts/generate-sw-precache.mjs runs `next build` twice (see that
  // file for why) and needs both passes to produce identical
  // _next/static/<buildId>/ paths, since it computes the service worker's
  // precache list from the first pass but ships whatever the second pass
  // produces. Next.js randomizes the build ID per invocation by default,
  // which would otherwise make the two passes disagree on that directory
  // name. A fixed ID is safe for a static export with no ISR/SSR to
  // cache-bust — this app's own CACHE_VERSION (derived from actual file
  // content hashes) already handles service-worker cache invalidation.
  generateBuildId: async () => "static",
};

export default nextConfig;
