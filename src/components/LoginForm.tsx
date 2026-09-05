"use client";

import { useLocale } from "@/lib/use-locale";
import { sendMagicLink } from "@/app/actions/auth";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const { t } = useLocale();

  return (
    <div className="container">
      <h1>{t.auth.signInHeading}</h1>
      <p className="text-muted">{t.auth.signInSubheading}</p>
      <form action={sendMagicLink}>
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
        <label className="field">
          <span className="field-label">{t.auth.emailLabel}</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t.auth.emailPlaceholder}
            className="text-input"
          />
        </label>
        <button type="submit" className="btn btn-primary btn-block">
          {t.auth.sendLink}
        </button>
      </form>
    </div>
  );
}
