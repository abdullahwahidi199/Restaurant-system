import { useTranslation } from "react-i18next";
import SectionHeading from "./SectionHeading";
import { problemItems, solutionItems } from "../../data/landing/landingData";

function ProblemSolutionSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrowKey="landing.problem.eyebrow"
          titleKey="landing.problem.title"
          descriptionKey="landing.problem.description"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="landing-reveal rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">{t("landing.problem.commonTitle")}</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {problemItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex gap-3 rounded-md bg-slate-50 p-4">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden="true" />
                    <p className="text-sm font-semibold leading-6 text-slate-700">{t(item.key)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="landing-reveal rounded-lg bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/15">
            <p className="text-sm font-semibold uppercase text-emerald-300">
              {t("landing.problem.solutionEyebrow")}
            </p>
            <h3 className="mt-3 text-3xl font-bold leading-tight">
              {t("landing.problem.solutionTitle")}
            </h3>
            <p className="mt-4 leading-8 text-slate-300">
              {t("landing.problem.solutionDescription")}
            </p>
            <div className="mt-6 space-y-3">
              {solutionItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/10 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-300 text-slate-950">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-slate-100">{t(item.key)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProblemSolutionSection;
