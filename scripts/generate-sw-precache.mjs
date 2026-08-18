// This IS the "build" script (see package.json — `"build": "node
// scripts/generate-sw-precache.mjs"`), not a step chained after `next
// build`. That used to be the design, and it shipped broken on Vercel:
// Next's docs put it plainly — "the public directory isn't a real
// directory, it's a collection of routes created at build time." Vercel
// snapshots public/ into its serving manifest DURING `next build` itself,
// so editing the built out/sw.js afterwards (which works fine for a plain
// static file server, and is how this was first written/tested) has no
// effect on what Vercel actually serves.
//
// The real fix has to get the correct content into public/sw.js BEFORE a
// build snapshots it. But the precache list needs to include every hashed
// JS/CSS chunk, and those hashes don't exist until AFTER a build compiles
// them — so this runs `next build` twice:
//
//   1. Build once (throwaway) to learn the real chunk filenames.
//   2. Compute the precache list from that output and write it into
//      public/sw.js — the committed *source* file, not out/sw.js.
//   3. Build again so this build's snapshot of public/sw.js (and thus
//      out/sw.js) carries the real precache list.
//   4. Restore public/sw.js to its original committed template content,
//      so a local `npm run build` doesn't leave the working tree dirty —
//      out/sw.js (gitignored) keeps the generated version from step 3.
//
// Re-running `next build` with only public/sw.js changed does not affect
// the content-hashed chunk filenames from step 1: public/ assets aren't
// bundled into JS/CSS, so the hashes are stable across the two passes.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const outDir = path.join(repoRoot, "out");
const builtSwPath = path.join(outDir, "sw.js");
const publicSwPath = path.join(repoRoot, "public", "sw.js");

function runNextBuild() {
  rmSync(outDir, { recursive: true, force: true });
  execFileSync("npx", ["next", "build"], { cwd: repoRoot, stdio: "inherit" });
}

function walkAssets(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkAssets(full));
    } else if (/\.(js|css)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function computePrecacheUrls() {
  const staticDir = path.join(outDir, "_next", "static");
  const chunkUrls = walkAssets(staticDir).map(
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

  return { precacheUrls, cacheVersion, recipeUrls, chunkUrls };
}

function writeSwContent(targetPath, template, { precacheUrls, cacheVersion }) {
  let swSource = template;
  swSource = swSource.replace(
    /const CACHE_VERSION = "[^"]*";/,
    `const CACHE_VERSION = "${cacheVersion}";`
  );
  swSource = swSource.replace(
    /const PRECACHE_URLS = \[[\s\S]*?\];/,
    `const PRECACHE_URLS = ${JSON.stringify(precacheUrls, null, 2)};`
  );
  writeFileSync(targetPath, swSource);
}

const originalTemplate = readFileSync(publicSwPath, "utf8");

try {
  runNextBuild(); // pass 1: throwaway, just to learn chunk hashes
  const result = computePrecacheUrls();

  writeSwContent(publicSwPath, originalTemplate, result); // so pass 2's snapshot is correct
  runNextBuild(); // pass 2: the real, deployed build

  writeSwContent(builtSwPath, originalTemplate, result); // belt-and-suspenders for plain static hosts

  console.log(
    `Precached ${result.precacheUrls.length} URLs ` +
      `(${result.recipeUrls.length} recipe routes, ${result.chunkUrls.length} chunks) ` +
      `[${result.cacheVersion}]`
  );
} finally {
  writeFileSync(publicSwPath, originalTemplate); // never leave the working tree dirty
}
