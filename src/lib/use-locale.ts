"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getLocaleSnapshot, getServerLocaleSnapshot, setLocale, subscribeLocale, type Locale } from "@/lib/locale";
import { dictionaries } from "@/lib/translations";

/** Current language plus its UI-string dictionary and a setter to switch it. */
export function useLocale() {
  const locale = useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getServerLocaleSnapshot);
  const changeLocale = useCallback((next: Locale) => setLocale(next), []);

  return { locale, t: dictionaries[locale], setLocale: changeLocale };
}

export type { Locale };
