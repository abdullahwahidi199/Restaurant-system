import { useTranslation } from "react-i18next";
import { trustItems } from "../../data/landing/landingData";

function TrustSection() {
  const { t } = useTranslation();

  return (
    <section className="border-y border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8" aria-label={t("landing.trust.label")}>
      <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {trustItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.titleKey} className="landing-reveal rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Icon className="mb-3 h-5 w-5 text-emerald-600" aria-hidden="true" />
              <h2 className="text-sm font-bold text-slate-950">{t(item.titleKey)}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t(item.descriptionKey)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TrustSection;
