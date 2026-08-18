// Offline app shell for the static export.
//
// Strategy: network-first, cache-fallback for same-origin GET requests.
// Every asset actually fetched while online gets cached, so a weak or
// dropped kitchen wifi signal doesn't interrupt a recipe already in
// progress. On top of that, PRECACHE_URLS below is populated at build time
// (see scripts/generate-sw-precache.mjs, which IS `npm run build`) with
// every recipe/cook route AND every hashed JS/CSS chunk, so a recipe opens
// offline even on the very first visit — a service worker never controls
// the page load that first registers it, so without this precache step a
// cold offline visit could show the right cached HTML for a recipe page
// but fail to load the JS it needs to hydrate.
//
// This file as committed is just the template (CACHE_VERSION "dev",
// PRECACHE_URLS holding only the fallback shell). `npm run build` briefly
// overwrites THIS file with the real precache list (so that Vercel's
// build-time snapshot of public/ picks it up — see the generator script
// for why editing only the built out/sw.js doesn't work), then restores
// this template afterwards so the committed source stays clean. Don't
// hand-edit PRECACHE_URLS here — it has no lasting effect either way.
const CACHE_VERSION = "dev";
const CACHE_NAME = `kitchen-recipes-${CACHE_VERSION}`;
const PRECACHE_URLS = ["/", "/manifest.json", "/icon.svg", "/icon-maskable.svg"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(PRECACHE_URLS.map((url) => cache.add(url).catch(() => {})))
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  // Only navigations (HTML page loads) should ever fall back to the cached
  // app shell — falling back for a failed JS/CSS/data request would serve
  // HTML mislabeled as that asset and break the page.
  const isNavigation = request.mode === "navigate";

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (isNavigation) {
          const shell = await caches.match("/");
          if (shell) return shell;
        }
        return Response.error();
      })
  );
});
