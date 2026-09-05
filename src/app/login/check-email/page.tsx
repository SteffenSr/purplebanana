"use client";

import { useLocale } from "@/lib/use-locale";

/** Auth.js's `pages.verifyRequest` target — shown right after the magic-link email is sent. */
export default function CheckEmailPage() {
  const { t } = useLocale();
  return (
    <div className="container">
      <h1>{t.auth.checkEmailHeading}</h1>
      <p className="text-muted">{t.auth.checkEmailSubheading}</p>
    </div>
  );
}
