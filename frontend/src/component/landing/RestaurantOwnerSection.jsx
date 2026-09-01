import { ArrowRight, Check, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ownerCapabilities } from "../../data/landing/marketplaceData";

export default function RestaurantOwnerSection() {
  const { t } = useTranslation();

  return (
    <section id="for-restaurants" className="marketplace-owner-section" aria-labelledby="owner-title">
      <div className="marketplace-owner-glow" aria-hidden="true" />
      <div className="marketplace-container relative">
        <div className="marketplace-owner-grid">
          <div>
            <span className="marketplace-owner-eyebrow">
              <Store className="h-4 w-4" aria-hidden="true" />
              {t("landing.marketplace.owner.eyebrow")}
            </span>
            <h2 id="owner-title" className="marketplace-owner-title">
              {t("landing.marketplace.owner.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
              {t("landing.marketplace.owner.description")}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:contact@pakhlai.com?subject=Start%20with%20Pakhlai"
                className="marketplace-owner-primary"
              >
                {t("landing.marketplace.owner.start")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </a>
              <Link to="/about" className="marketplace-owner-secondary">
                {t("landing.marketplace.owner.learnMore")}
              </Link>
            </div>
          </div>

          <div id="owner-features" className="marketplace-owner-capabilities">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">
              {t("landing.marketplace.owner.manage")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {ownerCapabilities.map((item) => (
                <span key={item} className="marketplace-owner-capability">
                  <Check className="h-4 w-4 shrink-0 text-orange-300" aria-hidden="true" />
                  {t(`landing.marketplace.owner.items.${item}`)}
                </span>
              ))}
            </div>
            <Link to="/staff-login" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-stone-300 transition hover:text-white">
              {t("landing.marketplace.owner.existingRestaurant")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
