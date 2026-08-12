import { useTranslation } from "react-i18next";
import ProductMockup from "./ProductMockup";
import SectionHeading from "./SectionHeading";
import { analyticsItems } from "../../data/landing/landingData";

function AnalyticsSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionHeading
            eyebrowKey="landing.analytics.eyebrow"
            titleKey="landing.analytics.title"
            descriptionKey="landing.analytics.description"
            align="left"
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {analyticsItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="landing-reveal flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-emerald-600 shadow-sm">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-bold text-slate-700">{t(item.key)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <ProductMockup variant="analytics" className="landing-reveal" />
      </div>
    </section>
  );
}

export default AnalyticsSection;
