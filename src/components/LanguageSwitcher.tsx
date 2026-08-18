"use client";

import { useLocale } from "@/lib/use-locale";

/**
 * Manual DA/EN override. Browser-language detection (src/lib/locale.ts)
 * only picks the *initial* language — a cook might want English-language
 * UI but still be in the mood for a Danish recipe, or detection might
 * simply have guessed wrong, so this always stays available rather than
 * only showing up when detection seems off.
 */
export function LanguageSwitcher() {
  const { locale, t, setLocale } = useLocale();

  return (
    <div className="lang-switch" role="group" aria-label={t.languageSwitcher.label}>
      <button
        type="button"
        className={`lang-switch__option${locale === "da" ? " lang-switch__option--active" : ""}`}
        aria-pressed={locale === "da"}
        onClick={() => setLocale("da")}
      >
        DA
      </button>
      <button
        type="button"
        className={`lang-switch__option${locale === "en" ? " lang-switch__option--active" : ""}`}
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}
