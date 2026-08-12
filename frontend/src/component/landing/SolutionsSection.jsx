import { useTranslation } from "react-i18next";
import SectionHeading from "./SectionHeading";
import { solutionCards } from "../../data/landing/landingData";

function SolutionsSection() {
  const { t } = useTranslation();

  return (
    <section id="solutions" className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrowKey="landing.solutions.eyebrow"
          titleKey="landing.solutions.title"
          descriptionKey="landing.solutions.description"
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {solutionCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.titleKey}
                className="landing-reveal rounded-lg border border-slate-200 bg-slate-50 p-5 transition duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-slate-950/10"
              >
                <Icon className="h-7 w-7 text-emerald-600" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-bold text-slate-950">{t(card.titleKey)}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{t(card.descriptionKey)}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default SolutionsSection;
