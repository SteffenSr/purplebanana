// Runs after `next build` (see package.json's "postbuild" script) and
// rewrites the BUILT out/sw.js — not the public/sw.js source template —
// with a precache list covering every recipe/cook route plus every hashed
// JS/CSS chunk actually produced by this build. Without the hashed chunks
// included, a cold offline visit could serve the right cached HTML for a
// recipe page from the install-time precache but fail to load the JS it
// needs to hydrate, since chunk filenames are content-hashed and unknown
// until after the build runs.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const outDir = path.join(repoRoot, "out");
const swPath = path.join(outDir, "sw.js");

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (/\.(js|css)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const staticDir = path.join(outDir, "_next", "static");
const chunkUrls = walk(staticDir).map(
  (file) => "/" + path.relative(outDir, file).split(path.sep).join("/")
);

const seedSource = readFileSync(path.join(repoRoot, "src/lib/seed-recipes.ts"), "utf8");
const ids = [...seedSource.matchAll(/^\s*id:\s*"([^"]+)"/gm)].map((m) => m[1]);
if (ids.length === 0) {
  throw new Error("No recipe ids found in seed-recipes.ts — regex may be out of sync");
}
const recipeUrls = ids.flatMap((id) => [`/recipes/${id}/`, `/recipes/${id}/cook/`]);

const precacheUrls = [
  "/",
  "/manifest.json",
  "/icon.svg",
  "/icon-maskable.svg",
  ...recipeUrls,
  ...chunkUrls,
];

// Version the cache off the actual asset list + each file's size, so any
// build that changes output gets a fresh cache namespace (old caches are
// evicted in the SW's "activate" handler) and an unchanged rebuild doesn't
// needlessly invalidate returning users' caches.
const fingerprint = precacheUrls
  .map((url) => {
    if (url.startsWith("/_next/")) {
      const size = statSync(path.join(outDir, url.slice(1))).size;
      return `${url}:${size}`;
    }
    return url;
  })
  .join("\n");
const cacheVersion = createHash("sha256").update(fingerprint).digest("hex").slice(0, 10);

let swSource = readFileSync(swPath, "utf8");
swSource = swSource.replace(
  /const CACHE_VERSION = "[^"]*";/,
  `const CACHE_VERSION = "${cacheVersion}";`
);
swSource = swSource.replace(
  /const PRECACHE_URLS = \[[\s\S]*?\];/,
  `const PRECACHE_URLS = ${JSON.stringify(precacheUrls, null, 2)};`
);
writeFileSync(swPath, swSource);

console.log(
  `Precached ${precacheUrls.length} URLs (${recipeUrls.length} recipe routes, ${chunkUrls.length} chunks) into out/sw.js [${cacheVersion}]`
);
