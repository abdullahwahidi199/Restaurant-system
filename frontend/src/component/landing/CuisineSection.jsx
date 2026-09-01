import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cuisineItems } from "../../data/landing/marketplaceData";

export default function CuisineSection({ onSelect }) {
  const { t } = useTranslation();

  return (
    <section id="cuisines" className="marketplace-section marketplace-cuisine-section" aria-labelledby="cuisine-title">
      <div className="marketplace-container">
        <div className="marketplace-section-heading is-compact">
          <div>
            <span className="marketplace-eyebrow">{t("landing.marketplace.cuisines.eyebrow")}</span>
            <h2 id="cuisine-title" className="marketplace-section-title">
              {t("landing.marketplace.cuisines.title")}
            </h2>
          </div>
          <button type="button" onClick={() => onSelect("", [])} className="marketplace-text-link">
            {t("landing.marketplace.cuisines.viewAll")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </button>
        </div>

        <div className="marketplace-cuisine-rail">
          {cuisineItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.query, item.aliases || [])}
                className={`marketplace-cuisine-card tone-${item.tone}`}
              >
                <span className="marketplace-cuisine-icon">
                  <Icon className="h-7 w-7" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="mt-4 text-sm font-black tracking-[-0.01em] text-stone-950">
                  {t(`landing.marketplace.cuisines.items.${item.key}`)}
                </span>
                <span className="mt-1 text-xs font-semibold text-stone-500">
                  {t("landing.marketplace.cuisines.explore")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
