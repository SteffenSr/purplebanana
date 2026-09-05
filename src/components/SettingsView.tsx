"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addHouseholdMemberAction,
  generateTokenAction,
  removeHouseholdMemberAction,
  revokeTokenAction,
  saveFoodPreferencesAction,
} from "@/app/actions/settings";
import { signOutAction } from "@/app/actions/auth";
import { useLocale } from "@/lib/use-locale";
import type { FoodPreferences, HouseholdMemberRow } from "@/lib/food-profile-db";
import type { PersonalAccessTokenRow } from "@/lib/personal-access-tokens-db";

export function SettingsView({
  email,
  tokens,
  preferences,
  members,
}: {
  email: string;
  tokens: PersonalAccessTokenRow[];
  preferences: FoodPreferences;
  members: HouseholdMemberRow[];
}) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [newToken, setNewToken] = useState<string | null>(null);
  const [tokenLabel, setTokenLabel] = useState("");

  return (
    <div className="container">
      <h1>{t.settings.heading}</h1>

      <h2 className="section-title">{t.settings.account.heading}</h2>
      <p className="text-muted">{t.settings.account.signedInAs(email)}</p>
      <button type="button" className="btn btn-secondary" onClick={() => signOutAction()}>
        {t.settings.account.signOut}
      </button>

      <h2 className="section-title">{t.settings.tokens.heading}</h2>
      <p className="text-muted">{t.settings.tokens.subheading}</p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const token = await generateTokenAction(tokenLabel);
          setNewToken(token);
          setTokenLabel("");
          router.refresh();
        }}
      >
        <label className="field">
          <input
            className="text-input"
            value={tokenLabel}
            onChange={(e) => setTokenLabel(e.target.value)}
            placeholder={t.settings.tokens.labelPlaceholder}
          />
        </label>
        <button type="submit" className="btn btn-primary">
          {t.settings.tokens.generate}
        </button>
      </form>

      {newToken && (
        <div className="badge-row">
          <p className="text-muted">{t.settings.tokens.newTokenNotice}</p>
          <code style={{ wordBreak: "break-all" }}>{newToken}</code>
        </div>
      )}

      {tokens.length === 0 ? (
        <p className="empty-state">{t.settings.tokens.empty}</p>
      ) : (
        <ul className="ingredient-list">
          {tokens.map((token) => (
            <li key={token.id}>
              <div className="ingredient-list__button">
                <span>{token.label}</span>
                <span className="text-muted">
                  {t.settings.tokens.createdAt(new Date(token.createdAt).toLocaleDateString(locale))}
                  {" · "}
                  {token.lastUsedAt
                    ? t.settings.tokens.lastUsed(new Date(token.lastUsedAt).toLocaleDateString(locale))
                    : t.settings.tokens.neverUsed}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={async () => {
                    await revokeTokenAction(token.id);
                    router.refresh();
                  }}
                >
                  {t.settings.tokens.revoke}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="section-title">{t.settings.foodProfile.heading}</h2>
      <p className="text-muted">{t.settings.foodProfile.subheading}</p>
      <form
        action={async (formData) => {
          await saveFoodPreferencesAction(formData);
          router.refresh();
        }}
      >
        <label className="field">
          <span className="field-label">{t.settings.foodProfile.dietaryPreferences}</span>
          <input
            className="text-input"
            name="dietaryPreferences"
            defaultValue={preferences.dietaryPreferences.join(", ")}
            placeholder={t.settings.foodProfile.listPlaceholder}
          />
        </label>
        <label className="field">
          <span className="field-label">{t.settings.foodProfile.dislikes}</span>
          <input
            className="text-input"
            name="dislikes"
            defaultValue={preferences.dislikes.join(", ")}
            placeholder={t.settings.foodProfile.listPlaceholder}
          />
        </label>
        <label className="field">
          <span className="field-label">{t.settings.foodProfile.favoriteIngredients}</span>
          <input
            className="text-input"
            name="favoriteIngredients"
            defaultValue={preferences.favoriteIngredients.join(", ")}
            placeholder={t.settings.foodProfile.listPlaceholder}
          />
        </label>
        <label className="field">
          <span className="field-label">{t.settings.foodProfile.goals}</span>
          <input
            className="text-input"
            name="goals"
            defaultValue={preferences.goals.join(", ")}
            placeholder={t.settings.foodProfile.listPlaceholder}
          />
        </label>
        <button type="submit" className="btn btn-primary">
          {t.settings.foodProfile.save}
        </button>
      </form>

      <h2 className="section-title">{t.settings.household.heading}</h2>
      <p className="text-muted">{t.settings.household.subheading}</p>

      <ul className="ingredient-list">
        {members.map((member) => (
          <li key={member.id}>
            <div className="ingredient-list__button">
              <span>{member.name}</span>
              <span className="text-muted">
                {member.likes.join(", ")}
                {member.dislikes.length > 0 ? ` · ${member.dislikes.join(", ")}` : ""}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={async () => {
                  await removeHouseholdMemberAction(member.id);
                  router.refresh();
                }}
              >
                {t.settings.household.remove}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form
        action={async (formData) => {
          await addHouseholdMemberAction(formData);
          router.refresh();
        }}
      >
        <label className="field">
          <input className="text-input" name="name" placeholder={t.settings.household.namePlaceholder} required />
        </label>
        <label className="field">
          <input className="text-input" name="likes" placeholder={t.settings.household.likesPlaceholder} />
        </label>
        <label className="field">
          <input className="text-input" name="dislikes" placeholder={t.settings.household.dislikesPlaceholder} />
        </label>
        <button type="submit" className="btn btn-primary">
          {t.settings.household.add}
        </button>
      </form>
    </div>
  );
}
