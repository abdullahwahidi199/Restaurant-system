import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import CTAButton from "./CTAButton";
import SectionHeading from "./SectionHeading";
import { landingLinks } from "../../data/landing/landingData";

function PricingSection() {
  const { t } = useTranslation();
  const bullets = [
    "landing.pricing.items.single",
    "landing.pricing.items.multi",
    "landing.pricing.items.operations",
    "landing.pricing.items.setup",
  ];

  return (
    <section id="pricing" className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-8 rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/10 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <SectionHeading
            eyebrowKey="landing.pricing.eyebrow"
            titleKey="landing.pricing.title"
            descriptionKey="landing.pricing.description"
            align="left"
            className="mx-0"
          />
          <div className="landing-reveal rounded-lg bg-slate-950 p-6 text-white">
            <p className="text-sm font-semibold uppercase text-emerald-300">
              {t("landing.pricing.cardEyebrow")}
            </p>
            <h3 className="mt-3 text-3xl font-bold">{t("landing.pricing.cardTitle")}</h3>
            <p className="mt-4 leading-7 text-slate-300">{t("landing.pricing.cardDescription")}</p>
            <ul className="mt-6 grid gap-3">
              {bullets.map((key) => (
                <li key={key} className="flex gap-2 text-sm font-semibold text-slate-100">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTAButton to={landingLinks.demo}>{t("landing.actions.talkToUs")}</CTAButton>
              <CTAButton to={landingLinks.explore} variant="secondary">
                {t("landing.actions.viewFeatures")}
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
