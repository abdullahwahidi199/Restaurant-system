import { AlertCircle, ArrowRight, LoaderCircle, MapPin, SearchX, Store } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import RestaurantCard from "./RestaurantCard";

function normalized(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

function restaurantMatches(restaurant, terms) {
  if (!terms.length) return true;
  const haystack = [
    restaurant.name,
    restaurant.slogan,
    restaurant.address,
    ...(restaurant.cuisines || []),
    ...(restaurant.cuisine_details || []).flatMap((cuisine) => [
      cuisine.name,
      cuisine.name_dari,
      cuisine.name_pashto,
    ]),
    ...(restaurant.dishes || []).flatMap((dish) => [
      dish.name,
      dish.name_dari,
      dish.name_pashto,
      dish.category,
      dish.category_dari,
      dish.category_pashto,
    ]),
    ...(restaurant.branches || []).flatMap((branch) => [branch.name, branch.address]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

  return terms.some((term) => haystack.includes(normalized(term)));
}

function restaurantMatchesLocation(restaurant, location) {
  if (location?.mode !== "manual" || !normalized(location.label)) return true;
  const places = [
    restaurant.address,
    ...(restaurant.branches || []).flatMap((branch) => [branch.name, branch.address]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
  return places.includes(normalized(location.label));
}

function RestaurantSkeleton() {
  return (
    <div className="marketplace-restaurant-card animate-pulse" aria-hidden="true">
      <div className="h-48 bg-stone-200" />
      <div className="p-5">
        <div className="h-5 w-2/3 rounded-full bg-stone-200" />
        <div className="mt-3 h-4 w-1/2 rounded-full bg-stone-100" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="h-4 rounded-full bg-stone-100" />
          <div className="h-4 rounded-full bg-stone-100" />
        </div>
        <div className="mt-5 h-11 rounded-xl bg-stone-200" />
      </div>
    </div>
  );
}

export default function RestaurantDiscoverySection({
  favorites = [],
  filterAliases = [],
  filterQuery = "",
  location,
  onClearFilter,
  onRetry,
  onToggleFavorite,
  restaurants = [],
  serverFiltered = false,
  status,
}) {
  const { t } = useTranslation();
  const terms = useMemo(
    () => [filterQuery, ...filterAliases].filter(Boolean),
    [filterAliases, filterQuery],
  );

  const visibleRestaurants = useMemo(() => {
    const filtered = restaurants.filter(
      (restaurant) =>
        (serverFiltered || restaurantMatches(restaurant, terms)) &&
        restaurantMatchesLocation(restaurant, location),
    );
    if (location?.coordinates) return filtered;
    return [...filtered].sort((a, b) => {
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    });
  }, [location, restaurants, serverFiltered, terms]);

  return (
    <section id="restaurants" className="marketplace-section bg-[#fbfaf6]" aria-labelledby="restaurants-title">
      <div className="marketplace-container">
        <div className="marketplace-section-heading">
          <div>
            <span className="marketplace-eyebrow">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {location?.label || t("landing.marketplace.discovery.eyebrow")}
            </span>
            <h2 id="restaurants-title" className="marketplace-section-title">
              {t("landing.marketplace.discovery.title")}
            </h2>
            <p className="marketplace-section-description">
              {location?.coordinates
                ? t("landing.marketplace.discovery.locationDescription")
                : t("landing.marketplace.discovery.description")}
            </p>
          </div>
          {filterQuery ? (
            <button
              type="button"
              onClick={onClearFilter}
              className="marketplace-filter-chip"
              aria-label={t("landing.marketplace.discovery.clearFilterLabel", {
                query: filterQuery,
              })}
            >
              <span>{t("landing.marketplace.discovery.showing", { query: filterQuery })}</span>
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
        </div>

        {status === "loading" ? (
          <div className="marketplace-restaurant-rail" role="status">
            <span className="sr-only">{t("landing.marketplace.discovery.loading")}</span>
            {[1, 2, 3].map((item) => <RestaurantSkeleton key={item} />)}
          </div>
        ) : status === "error" ? (
          <div className="marketplace-state-card" role="alert">
            <span className="marketplace-state-icon is-error">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3>{t("landing.marketplace.discovery.errorTitle")}</h3>
            <p>{t("landing.marketplace.discovery.errorDescription")}</p>
            <button type="button" onClick={onRetry} className="marketplace-state-action">
              <LoaderCircle className="h-4 w-4" aria-hidden="true" />
              {t("landing.marketplace.discovery.retry")}
            </button>
          </div>
        ) : visibleRestaurants.length ? (
          <div className="marketplace-restaurant-rail">
            {visibleRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id || restaurant.slug}
                restaurant={restaurant}
                favorite={favorites.includes(restaurant.slug)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : restaurants.length ? (
          <div className="marketplace-state-card">
            <span className="marketplace-state-icon">
              <SearchX className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3>{t("landing.marketplace.discovery.noResultsTitle")}</h3>
            <p>{t("landing.marketplace.discovery.noResultsDescription")}</p>
            <button type="button" onClick={onClearFilter} className="marketplace-state-action">
              {t("landing.marketplace.discovery.clearSearch")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="marketplace-state-card">
            <span className="marketplace-state-icon">
              <Store className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3>{t("landing.marketplace.discovery.emptyTitle")}</h3>
            <p>{t("landing.marketplace.discovery.emptyDescription")}</p>
            <a href="#for-restaurants" className="marketplace-state-action">
              {t("landing.marketplace.discovery.joinPakhlai")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
