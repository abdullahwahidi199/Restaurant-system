import { useTranslation } from "react-i18next";
import SectionHeading from "./SectionHeading";
import { howItWorksSteps } from "../../data/landing/landingData";

function HowItWorksSection() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrowKey="landing.how.eyebrow"
          titleKey="landing.how.title"
          descriptionKey="landing.how.description"
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {howItWorksSteps.map((step) => (
            <article
              key={step.number}
              className="landing-reveal relative overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="text-5xl font-bold text-slate-100">{step.number}</span>
              <h3 className="mt-8 text-xl font-bold text-slate-950">{t(step.titleKey)}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{t(step.descriptionKey)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
