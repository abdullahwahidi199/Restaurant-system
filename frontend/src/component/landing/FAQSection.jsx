import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { faqItems } from "../../data/landing/landingData";

function FAQSection() {
  const { t } = useTranslation();

  return (
    <section id="faq" className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrowKey="landing.faq.eyebrow"
          titleKey="landing.faq.title"
          descriptionKey="landing.faq.description"
        />

        <div className="mt-10 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {faqItems.map((item) => (
            <details key={item.questionKey} className="group landing-faq-item">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left text-base font-bold text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-emerald-500 rtl:text-right">
                <span>{t(item.questionKey)}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-slate-500 transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="px-5 pb-5 text-sm leading-7 text-slate-600">
                {t(item.answerKey)}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
