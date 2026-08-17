// Minimal offline app shell for the static export.
//
// Strategy: network-first, cache-fallback for same-origin GET requests.
// Every page/asset the cook actually visits while online gets cached, so a
// weak or dropped kitchen wifi signal doesn't interrupt a recipe already in
// progress. Bump CACHE_VERSION when shipping a release that should replace
// previously cached assets.
const CACHE_VERSION = "v1";
const CACHE_NAME = `kitchen-recipes-${CACHE_VERSION}`;
const APP_SHELL = ["/", "/manifest.json", "/icon.svg", "/icon-maskable.svg"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(APP_SHELL.map((url) => cache.add(url).catch(() => {})))
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
