import {
  ArrowRight,
  Heart,
  MapPinned,
  RotateCcw,
  Search,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const steps = [
  { key: "find", icon: Search },
  { key: "choose", icon: UtensilsCrossed },
  { key: "order", icon: ShoppingBag },
];

const conveniences = [
  { key: "favorites", icon: Heart },
  { key: "orders", icon: RotateCcw, href: "/orders" },
  { key: "locations", icon: MapPinned },
];

function HowItWorksSection() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="marketplace-section marketplace-how-section" aria-labelledby="how-title">
      <div className="marketplace-container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="marketplace-eyebrow justify-center">{t("landing.marketplace.how.eyebrow")}</span>
          <h2 id="how-title" className="marketplace-section-title">
            {t("landing.marketplace.how.title")}
          </h2>
          <p className="marketplace-section-description mx-auto">
            {t("landing.marketplace.how.description")}
          </p>
        </div>

        <ol className="marketplace-steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.key} className="marketplace-step">
                <div className="flex items-center gap-4">
                  <span className="marketplace-step-icon">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-black text-stone-950">
                  {t(`landing.marketplace.how.steps.${step.key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {t(`landing.marketplace.how.steps.${step.key}.description`)}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="marketplace-convenience-strip" aria-label={t("landing.marketplace.convenience.label")}>
          <p className="text-sm font-black text-stone-950">
            {t("landing.marketplace.convenience.title")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {conveniences.map((item) => {
              const Icon = item.icon;
              const content = (
                <>
                  <Icon className="h-4 w-4 text-orange-600" aria-hidden="true" />
                  {t(`landing.marketplace.convenience.items.${item.key}`)}
                  {item.href ? (
                    <ArrowRight className="h-3.5 w-3.5 text-stone-400 rtl:rotate-180" aria-hidden="true" />
                  ) : null}
                </>
              );
              return item.href?.startsWith("/") ? (
                <Link key={item.key} to={item.href} className="marketplace-convenience-link">{content}</Link>
              ) : item.href ? (
                <a key={item.key} href={item.href} className="marketplace-convenience-link">{content}</a>
              ) : (
                <span key={item.key} className="marketplace-convenience-link">{content}</span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
