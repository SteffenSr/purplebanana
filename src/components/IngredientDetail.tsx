"use client";

import { getIngredientProfile } from "@/lib/ingredients";
import { useLocale } from "@/lib/use-locale";

export function IngredientDetail({ id }: { id: string }) {
  const { locale, t } = useLocale();
  const ingredient = getIngredientProfile(id);

  if (!ingredient) {
    return (
      <div className="container">
        <p className="empty-state">{t.ingredientDetail.notFound}</p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full navigation needed offline, see RecipeCard.tsx */}
        <a href="/" className="btn btn-secondary">
          {t.recipeDetail.backToRecipes}
        </a>
      </div>
    );
  }

  const { nutrition } = ingredient;

  return (
    <div className="container">
      {/* Browser back rather than a fixed href: an ingredient page can be
          reached from any recipe, so there's no single "back to recipe" target. */}
      <button
        type="button"
        className="btn btn-secondary btn-icon"
        aria-label={t.ingredientDetail.back}
        onClick={() => history.back()}
      >
        ←
      </button>

      <div className="ingredient-hero">
        {ingredient.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="ingredient-hero-image" src={ingredient.images[0]} alt={ingredient.name[locale]} />
        ) : (
          <span className="ingredient-hero__emoji" aria-hidden>
            {ingredient.emoji}
          </span>
        )}
        <h1>{ingredient.name[locale]}</h1>
      </div>

      {ingredient.images && ingredient.images.length > 1 && (
        <div className="ingredient-gallery">
          {ingredient.images.slice(1).map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} className="ingredient-gallery__image" src={src} alt="" loading="lazy" />
          ))}
        </div>
      )}

      {ingredient.otherNames.length > 0 && (
        <>
          <h2 className="section-title">{t.ingredientDetail.otherNames}</h2>
          <ul className="ingredient-tag-list">
            {ingredient.otherNames.map((name) => (
              <li key={name.en} className="badge">
                {name[locale]}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="section-title">{t.ingredientDetail.flavorAndRole}</h2>
      <p>{ingredient.flavorAndRole[locale]}</p>

      {nutrition && (
        <>
          <h2 className="section-title">{t.ingredientDetail.nutrition}</h2>
          <p className="text-muted">{nutrition.per[locale]}</p>
          <div className="badge-row">
            <span className="badge">{t.ingredientDetail.calories(nutrition.calories)}</span>
            <span className="badge">{t.ingredientDetail.protein(nutrition.proteinG)}</span>
            <span className="badge">{t.ingredientDetail.carbs(nutrition.carbsG)}</span>
            <span className="badge">{t.ingredientDetail.fat(nutrition.fatG)}</span>
            {nutrition.fiberG != null && (
              <span className="badge">{t.ingredientDetail.fiber(nutrition.fiberG)}</span>
            )}
          </div>
          {nutrition.note && <p className="text-muted">{nutrition.note[locale]}</p>}
        </>
      )}

      <h2 className="section-title">{t.ingredientDetail.whereToBuy}</h2>
      <ul className="ingredient-buy-list">
        {ingredient.whereToBuy.map((place) => (
          <li key={place.en}>{place[locale]}</li>
        ))}
      </ul>

      {ingredient.greenlistTag && (
        // Real external link, opened in a new tab — unlike every other link
        // in this app, this one isn't a bundled route and needs a live
        // connection. rel="noopener noreferrer" since target="_blank" would
        // otherwise give the opened page access back to this window.
        <a
          href={`https://greenlist.dk/tags/${ingredient.greenlistTag}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-block"
        >
          {t.ingredientDetail.viewOnGreenlist} ↗
        </a>
      )}
    </div>
  );
}
