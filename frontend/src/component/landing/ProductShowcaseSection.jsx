import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import ProductMockup from "./ProductMockup";
import SectionHeading from "./SectionHeading";
import { productShowcases } from "../../data/landing/landingData";

function ProductShowcaseSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrowKey="landing.showcase.eyebrow"
          titleKey="landing.showcase.title"
          descriptionKey="landing.showcase.description"
          invert
        />

        <div className="mt-14 space-y-16">
          {productShowcases.map((showcase, index) => {
            const Icon = showcase.icon;
            const reverse = index % 2 === 1;

            return (
              <article
                key={showcase.id}
                className={`landing-reveal grid items-center gap-8 lg:grid-cols-2 ${
                  reverse ? "lg:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <p className="inline-flex items-center gap-2 rounded-md border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-200">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {t(showcase.eyebrowKey)}
                  </p>
                  <h3 className="mt-5 text-3xl font-bold leading-tight text-white md:text-4xl">
                    {t(showcase.titleKey)}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-300 md:text-lg">
                    {t(showcase.descriptionKey)}
                  </p>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {showcase.itemKeys.map((key) => (
                      <li key={key} className="flex items-start gap-2 text-sm font-semibold text-slate-200">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                        <span>{t(key)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <ProductMockup variant={showcase.id} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ProductShowcaseSection;
