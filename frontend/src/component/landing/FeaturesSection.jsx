import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { featureGroups } from "../../data/landing/landingData";

function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="features" className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrowKey="landing.features.eyebrow"
          titleKey="landing.features.title"
          descriptionKey="landing.features.description"
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureGroups.map((group) => {
            const Icon = group.icon;
            return (
              <article
                key={group.titleKey}
                className="landing-reveal flex h-full flex-col rounded-lg border border-slate-200 bg-slate-50 p-5 transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-xl hover:shadow-slate-950/10"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-emerald-300">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">{t(group.titleKey)}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{t(group.descriptionKey)}</p>
                  </div>
                </div>
                <ul className="mt-6 grid gap-2">
                  {group.itemKeys.map((key) => (
                    <li key={key} className="flex items-start gap-2 text-sm font-semibold text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
