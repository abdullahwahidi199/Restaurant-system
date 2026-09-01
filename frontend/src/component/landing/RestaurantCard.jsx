import {
  ArrowRight,
  Clock3,
  Heart,
  MapPin,
  Sparkles,
  Star,
  Store,
  Truck,
  Utensils,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getMediaUrl } from "../../api/publicOrdering";

function formatAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

function RestaurantImage({ restaurant, eager = false }) {
  const source = getMediaUrl(restaurant.cover_image || restaurant.logo);

  if (!source) {
    return (
      <div className="marketplace-card-image marketplace-card-image-fallback">
        <span className="marketplace-card-orb marketplace-card-orb-one" />
        <span className="marketplace-card-orb marketplace-card-orb-two" />
        <Utensils className="relative h-10 w-10 text-orange-700" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="marketplace-card-image">
      <img
        src={source}
        alt={restaurant.name}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-transparent to-transparent" />
    </div>
  );
}

export default function RestaurantCard({
  compact = false,
  eager = false,
  favorite = false,
  onToggleFavorite,
  restaurant,
}) {
  const { t } = useTranslation();
  const minOrder = formatAmount(restaurant.min_order_amount);
  const rating = Number(restaurant.rating);
  const hasRating = Number.isFinite(rating) && rating > 0;
  const hasDistanceValue = restaurant.distance_km !== null && restaurant.distance_km !== undefined && restaurant.distance_km !== "";
  const distance = Number(restaurant.distance_km);
  const hasDistance = hasDistanceValue && Number.isFinite(distance);
  const deliveryMinutes = restaurant.estimated_delivery_minutes;
  const hasOpenStatus = typeof restaurant.is_open === "boolean";

  const deliveryLabel = (() => {
    if (restaurant.delivers_to_location === true) {
      return t("landing.marketplace.card.deliversToYou");
    }
    if (restaurant.delivers_to_location === false) {
      return t("landing.marketplace.card.outsideArea");
    }
    if (restaurant.delivery_available) {
      return t("landing.marketplace.card.deliveryAvailable");
    }
    return t("landing.marketplace.card.pickupOnly");
  })();

  return (
    <article className={`marketplace-restaurant-card group ${compact ? "is-compact" : ""}`}>
      <div className="relative">
        <RestaurantImage restaurant={restaurant} eager={eager} />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-3">
          <span
            className={`marketplace-status-pill ${
              hasOpenStatus
                ? restaurant.is_open
                  ? "is-open"
                  : "is-closed"
                : "is-unknown"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {hasOpenStatus
              ? restaurant.is_open
                ? t("landing.marketplace.card.open")
                : t("landing.marketplace.card.closed")
              : t("landing.marketplace.card.hoursUnavailable")}
          </span>
          <button
            type="button"
            onClick={() => onToggleFavorite?.(restaurant.slug)}
            className={`marketplace-favorite-button ${favorite ? "is-favorite" : ""}`}
            aria-label={
              favorite
                ? t("landing.marketplace.card.removeFavorite", { name: restaurant.name })
                : t("landing.marketplace.card.addFavorite", { name: restaurant.name })
            }
            aria-pressed={favorite}
          >
            <Heart className="h-5 w-5" fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black tracking-[-0.02em] text-stone-950 sm:text-xl">
              {restaurant.name}
            </h3>
            <p className="mt-1 truncate text-sm font-medium text-stone-500">
              {(restaurant.cuisines || []).slice(0, 3).join(" · ") ||
                restaurant.slogan ||
                t("landing.marketplace.card.localRestaurant")}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-800">
            {hasRating ? (
              <>
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                {rating.toFixed(1)}
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {t("landing.marketplace.card.new")}
              </>
            )}
          </span>
        </div>

        <div className="mt-4 grid gap-2 text-xs font-semibold text-stone-600 sm:grid-cols-2">
          <span className="flex min-h-7 items-center gap-2">
            <Truck className="h-4 w-4 shrink-0 text-orange-600" aria-hidden="true" />
            <span className="truncate">{deliveryLabel}</span>
          </span>
          {deliveryMinutes ? (
            <span className="flex min-h-7 items-center gap-2">
              <Clock3 className="h-4 w-4 shrink-0 text-orange-600" aria-hidden="true" />
              {t("landing.marketplace.card.minutes", { count: deliveryMinutes })}
            </span>
          ) : hasDistance ? (
            <span className="flex min-h-7 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-orange-600" aria-hidden="true" />
              {t("landing.marketplace.card.distance", { distance: distance.toFixed(1) })}
            </span>
          ) : restaurant.address ? (
            <span className="flex min-h-7 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-orange-600" aria-hidden="true" />
              <span className="truncate">{restaurant.address}</span>
            </span>
          ) : null}
          {minOrder && Number(restaurant.min_order_amount) > 0 ? (
            <span className="flex min-h-7 items-center gap-2 sm:col-span-2">
              <Store className="h-4 w-4 shrink-0 text-orange-600" aria-hidden="true" />
              {t("landing.marketplace.card.minimumOrder", { amount: minOrder })}
            </span>
          ) : null}
        </div>

        <Link
          to={`/${restaurant.slug}`}
          className="marketplace-view-menu mt-5"
          aria-label={t("landing.marketplace.card.viewMenuFor", { name: restaurant.name })}
        >
          {t("landing.marketplace.card.viewMenu")}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
