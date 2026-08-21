import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChefHat, MapPin, ScanLine, ShoppingBag } from "lucide-react";
import CTAButton from "./CTAButton";
import ProductMockup from "./ProductMockup";
import { landingLinks } from "../../data/landing/landingData";

function HeroSection() {
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
    <section id="top" className="landing-hero relative overflow-hidden px-4 pb-14 pt-24 sm:px-6 lg:px-8 lg:pb-16 lg:pt-28">
      <div className="landing-hero-grid absolute inset-0" aria-hidden="true" />
      <div className="landing-hero-glow landing-hero-glow-one" aria-hidden="true" />
      <div className="landing-hero-glow landing-hero-glow-two" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl min-w-0">
        <div className="grid min-h-[520px] min-w-0 items-center gap-9 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="landing-reveal relative z-10 w-full max-w-3xl min-w-0">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 whitespace-normal break-words rounded-md border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100 shadow-lg shadow-emerald-950/20">
              <ChefHat className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
              <span>{t("landing.hero.kicker")}</span>
            </div>
            <h1 className="max-w-4xl whitespace-pre-line text-5xl font-extrabold leading-[1.04] text-white sm:text-6xl lg:text-7xl">
              {t("landing.hero.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100 md:text-xl">
              {t("landing.hero.description")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTAButton to={landingLinks.demo} className="w-full sm:w-auto">
                {t("landing.actions.bookLiveDemo")}
              </CTAButton>
              <CTAButton to={landingLinks.explore} variant="secondary" className="w-full sm:w-auto">
                {t("landing.actions.explore")}
              </CTAButton>
            </div>

            <form
              onSubmit={openRestaurantMenu}
              className="mt-8 max-w-2xl rounded-lg border border-white/20 bg-white p-3 text-slate-950 shadow-2xl shadow-emerald-950/25 sm:p-4"
            >
              <label className="sr-only" htmlFor="restaurant-slug">
                {t("landing.slug.label")}
              </label>
              <div className="mb-3 flex items-center gap-3 px-1">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-extrabold text-slate-950">
                    {t("landing.slug.label")}
                  </p>
                  <p className="text-sm font-medium text-slate-500">
                    {t("landing.slug.placeholder")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-inner shadow-slate-200/60">
                  <ScanLine className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <input
                    id="restaurant-slug"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder={t("landing.slug.placeholder")}
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  {t("landing.slug.action")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </button>
              </div>
            </form>

            <div className="mt-5 grid max-w-2xl gap-3 text-sm font-semibold text-slate-200 sm:grid-cols-3">
              {[ChefHat, MapPin, ShoppingBag].map((Icon, index) => (
                <div key={index} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 backdrop-blur">
                  <Icon className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                  <span>{t(["landing.trust.allInOne.title", "landing.trust.multiBranch.title", "landing.slug.action"][index])}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-hero-preview relative z-0 min-w-0">
            <ProductMockup variant="hero" className="landing-reveal" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
