import { ArrowLeft, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import "../styles/landing.css";

const sectionKeys = {
  privacy: ["information", "use", "sharing", "retention", "choices"],
  terms: ["accounts", "orders", "cancellations", "acceptableUse", "service"],
};

export default function LegalPage({ type }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const pageType = type || (location.pathname.includes("terms") ? "terms" : "privacy");
  const direction = i18n.dir(i18n.language);

  return (
    <div className="landing-page min-h-screen bg-[#fbfaf6] text-stone-950" dir={direction}>
      <header className="border-b border-stone-200 bg-white">
        <div className="marketplace-container flex min-h-20 items-center justify-between gap-4">
          <Link to="/" className="marketplace-brand">
            <img src="/rmsFavicon.png" alt="" width="40" height="40" className="h-10 w-10 object-contain" />
            <span className="text-lg font-black tracking-[-0.04em] text-stone-950">
              {t("landing.marketplace.brand.name")}
            </span>
          </Link>
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-stone-700 transition hover:border-orange-300 hover:text-orange-700">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {t("landing.marketplace.legal.backHome")}
          </Link>
        </div>
      </header>

      <main className="marketplace-container py-12 sm:py-16">
        <article className="mx-auto max-w-3xl rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_rgba(41,37,36,0.07)] sm:p-10">
          <p className="marketplace-eyebrow">
            {t(`landing.marketplace.legal.${pageType}.eyebrow`)}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] text-stone-950 sm:text-5xl">
            {t(`landing.marketplace.legal.${pageType}.title`)}
          </h1>
          <p className="mt-4 text-sm font-semibold text-stone-500">
            {t("landing.marketplace.legal.lastUpdated")}
          </p>
          <p className="mt-7 text-base leading-7 text-stone-600">
            {t(`landing.marketplace.legal.${pageType}.intro`)}
          </p>

          <div className="mt-10 grid gap-8">
            {sectionKeys[pageType].map((key) => (
              <section key={key}>
                <h2 className="text-xl font-black text-stone-950">
                  {t(`landing.marketplace.legal.${pageType}.sections.${key}.title`)}
                </h2>
                <p className="mt-2 text-sm leading-7 text-stone-600">
                  {t(`landing.marketplace.legal.${pageType}.sections.${key}.body`)}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-orange-50 p-5">
            <p className="font-black text-stone-950">
              {t("landing.marketplace.legal.questions")}
            </p>
            <a
              href="mailto:contact@pakhlai.com"
              className="mt-2 inline-flex min-h-11 items-center gap-2 font-bold text-orange-700 hover:text-orange-800"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              contact@pakhlai.com
            </a>
          </div>
        </article>
      </main>
    </div>
  );
}
