"use client";

import { useEffect } from "react";

/** Registers the offline app-shell cache once, on first client mount. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline support is a progressive enhancement; ignore registration
        // failures (e.g. unsupported browser, dev server without HTTPS).
      });
    }
  }, []);

  return null;
}
