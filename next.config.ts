import type { NextConfig } from "next";

// Statically exported site: no Node server at runtime, so the app's
// "backend" is the browser's own IndexedDB store (see src/lib/db.ts).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
