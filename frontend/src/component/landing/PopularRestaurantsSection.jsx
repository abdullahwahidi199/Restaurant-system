import { MessageCircleMore, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import RestaurantCard from "./RestaurantCard";

export default function PopularRestaurantsSection({
  favorites = [],
  onToggleFavorite,
  restaurants = [],
  status,
}) {
  const { t } = useTranslation();
  const popular = useMemo(
    () =>
      restaurants
        .filter((restaurant) => Number(restaurant.review_count) > 0 && Number(restaurant.rating) > 0)
        .sort((a, b) => {
          const scoreA = Number(a.rating) * Math.log2(Number(a.review_count) + 2);
          const scoreB = Number(b.rating) * Math.log2(Number(b.review_count) + 2);
          return scoreB - scoreA;
        })
        .slice(0, 3),
    [restaurants],
  );

  if (status === "loading" || status === "error") return null;

  return (
    <section className="marketplace-section bg-white" aria-labelledby="popular-title">
      <div className="marketplace-container">
        <div className="marketplace-section-heading is-compact">
          <div>
            <span className="marketplace-eyebrow">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t("landing.marketplace.popular.eyebrow")}
            </span>
            <h2 id="popular-title" className="marketplace-section-title">
              {t("landing.marketplace.popular.title")}
            </h2>
            <p className="marketplace-section-description">
              {t("landing.marketplace.popular.description")}
            </p>
          </div>
        </div>

        {popular.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {popular.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id || restaurant.slug}
                compact
                restaurant={restaurant}
                favorite={favorites.includes(restaurant.slug)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="marketplace-popular-empty">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <MessageCircleMore className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-black text-stone-950">
                {t("landing.marketplace.popular.emptyTitle")}
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">
                {t("landing.marketplace.popular.emptyDescription")}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
