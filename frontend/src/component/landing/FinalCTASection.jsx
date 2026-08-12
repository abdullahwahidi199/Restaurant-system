import { useTranslation } from "react-i18next";
import CTAButton from "./CTAButton";
import { landingLinks } from "../../data/landing/landingData";

function FinalCTASection() {
  const { t } = useTranslation();

  return (
    <section id="contact" className="bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-lg border border-white/10 bg-white/10">
        <div className="grid gap-8 p-6 lg:grid-cols-[1fr_0.8fr] lg:p-10">
          <div className="landing-reveal">
            <p className="text-sm font-semibold uppercase text-emerald-300">{t("landing.finalCta.eyebrow")}</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
              {t("landing.finalCta.title")}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              {t("landing.finalCta.description")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTAButton to={landingLinks.demo}>{t("landing.actions.bookLiveDemo")}</CTAButton>
              <CTAButton to={landingLinks.demo} variant="secondary">
                {t("landing.actions.contactUs")}
              </CTAButton>
            </div>
          </div>

          <div className="landing-reveal rounded-lg bg-white p-5 text-slate-950">
            <p className="text-sm font-bold uppercase text-emerald-600">{t("landing.finalCta.panelEyebrow")}</p>
            <h3 className="mt-3 text-2xl font-bold">{t("landing.finalCta.panelTitle")}</h3>
            <div className="mt-5 grid gap-3">
              {["landing.finalCta.panelItems.restaurant", "landing.finalCta.panelItems.branches", "landing.finalCta.panelItems.modules"].map((key) => (
                <div key={key} className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {t(key)}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-500">{t("landing.finalCta.panelNote")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTASection;
