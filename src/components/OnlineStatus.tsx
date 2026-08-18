"use client";

import { useSyncExternalStore } from "react";
import { useLocale } from "@/lib/use-locale";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/** Reassures the cook that the app still works without a connection. */
export function OnlineStatus() {
  const { t } = useLocale();
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true // server snapshot: assume online during prerender
  );

  return (
    <span className={`status-pill ${online ? "" : "status-pill--offline"}`}>
      <span className="status-pill__dot" aria-hidden />
      {online ? t.online : t.offline}
    </span>
  );
}
