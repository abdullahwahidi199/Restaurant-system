import { Check, MapPin, ShoppingBag, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import MarketplaceSearch from "./MarketplaceSearch";

const trustKeys = ["menus", "ordering", "location"];

function HeroSection({
  cuisines,
  dishes,
  location,
  onExplore,
  onLocationChange,
  onSearchValueChange,
  restaurants,
  searchResults,
  searchValue,
  searchStatus,
  status,
}) {
  const { t } = useTranslation();

  return (
    <section id="top" className="marketplace-hero">
      <div className="marketplace-hero-texture" aria-hidden="true" />
      <div className="marketplace-container relative">
        <div className="marketplace-hero-layout">
          <div className="marketplace-hero-copy marketplace-enter">
            <span className="marketplace-hero-eyebrow">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t("landing.marketplace.hero.eyebrow")}
            </span>
            <h1>{t("landing.marketplace.hero.title")}</h1>
            <p>{t("landing.marketplace.hero.description")}</p>

            <div className="marketplace-hero-trust" aria-label={t("landing.marketplace.hero.trustLabel")}>
              {trustKeys.map((key) => (
                <span key={key}>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  {t(`landing.marketplace.hero.trust.${key}`)}
                </span>
              ))}
            </div>
          </div>

          <figure className="marketplace-hero-visual marketplace-enter" aria-label={t("landing.marketplace.hero.imageLabel")}>
            <img
              src="/images/pakhlai-hero-feast.webp"
              alt={t("landing.marketplace.hero.imageAlt")}
              className="h-full w-full object-cover"
              width="1535"
              height="1025"
              loading="eager"
              fetchPriority="high"
            />
            <div className="marketplace-hero-image-shade" aria-hidden="true" />
            <figcaption className="marketplace-hero-caption">
              <span className="marketplace-hero-caption-icon">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <strong>{t("landing.marketplace.hero.captionTitle")}</strong>
                <small>
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("landing.marketplace.hero.captionDescription")}
                </small>
              </span>
            </figcaption>
          </figure>

          <div id="restaurant-search" className="marketplace-hero-search marketplace-enter">
            <MarketplaceSearch
              cuisines={cuisines}
              dishes={dishes}
              location={location}
              onExplore={onExplore}
              onLocationChange={onLocationChange}
              onValueChange={onSearchValueChange}
              restaurants={restaurants}
              searchResults={searchResults}
              searchStatus={searchStatus}
              status={status}
              value={searchValue}
            />
            <p className="marketplace-search-hint">
              {t("landing.marketplace.search.hint")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
