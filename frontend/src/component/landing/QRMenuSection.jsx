import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ScanLine } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { qrItems } from "../../data/landing/landingData";

const qrFilledCells = [
  0, 1, 2, 4, 5, 6, 7, 14, 21, 28, 35, 42, 43, 44, 46, 47, 48, 10, 12, 18,
  20, 24, 25, 31, 33, 36, 38,
];

function QRMenuSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");

  const openRestaurantMenu = (event) => {
    event.preventDefault();
    const cleanSlug = slug.trim().replace(/^\/+/, "");
    if (cleanSlug) {
      navigate(`/${encodeURIComponent(cleanSlug)}`);
    }
  };

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading
            eyebrowKey="landing.qr.eyebrow"
            titleKey="landing.qr.title"
            descriptionKey="landing.qr.description"
            align="left"
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {qrItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="landing-reveal flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <p className="text-sm font-semibold leading-6 text-slate-700">{t(item.key)}</p>
                </div>
              );
            })}
          </div>

          <form onSubmit={openRestaurantMenu} className="landing-reveal mt-8 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row">
            <label className="sr-only" htmlFor="qr-restaurant-slug">
              {t("landing.slug.label")}
            </label>
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-md bg-white px-4 py-3 text-slate-900 shadow-sm">
              <ScanLine className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
              <input
                id="qr-restaurant-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder={t("landing.slug.placeholder")}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              {t("landing.slug.action")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </button>
          </form>
        </div>

        <div className="landing-reveal rounded-lg bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/15">
          <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-lg bg-white p-5 text-slate-950">
              <div className="mx-auto grid aspect-square max-w-56 grid-cols-7 gap-1 rounded-md bg-slate-950 p-3" aria-hidden="true">
                {Array.from({ length: 49 }).map((_, index) => (
                  <span
                    key={index}
                    className={`rounded-sm ${qrFilledCells.includes(index) ? "bg-white" : "bg-slate-950"}`}
                  />
                ))}
              </div>
              <p className="mt-5 text-center text-sm font-bold">{t("landing.qr.mockupCode")}</p>
            </div>
            <div className="flex flex-col justify-between rounded-lg border border-white/10 bg-white/10 p-5">
              <div>
                <p className="text-sm font-semibold uppercase text-emerald-300">
                  {t("landing.qr.mockupEyebrow")}
                </p>
                <h3 className="mt-3 text-3xl font-bold">{t("landing.qr.mockupTitle")}</h3>
                <p className="mt-4 leading-7 text-slate-300">{t("landing.qr.mockupText")}</p>
              </div>
              <div className="mt-6 grid gap-2">
                {["landing.qr.menuItems.breakfast", "landing.qr.menuItems.lunch", "landing.qr.menuItems.drinks"].map((key) => (
                  <div key={key} className="flex items-center justify-between rounded-md bg-white px-3 py-3 text-sm font-semibold text-slate-900">
                    <span>{t(key)}</span>
                    <span className="text-emerald-600">{t("landing.qr.menuItems.view")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default QRMenuSection;
