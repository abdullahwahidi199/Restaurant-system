import { useTranslation } from "react-i18next";
import SectionHeading from "./SectionHeading";
import { whyItems } from "../../data/landing/landingData";

function WhyPakhlaiSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrowKey="landing.why.eyebrow"
          titleKey="landing.why.title"
          descriptionKey="landing.why.description"
          invert
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {whyItems.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.titleKey} className="landing-reveal rounded-lg border border-white/10 bg-white/10 p-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-300 text-slate-950">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-white">{t(item.titleKey)}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{t(item.descriptionKey)}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyPakhlaiSection;
