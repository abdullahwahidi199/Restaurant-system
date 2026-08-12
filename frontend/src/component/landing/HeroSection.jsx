import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ScanLine } from "lucide-react";
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
    <section id="top" className="landing-hero relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-20 lg:pt-32">
      <div className="landing-hero-grid absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl min-w-0">
        <div className="grid min-h-[560px] min-w-0 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="landing-reveal relative z-10 w-full max-w-3xl min-w-0">
            <p className="mb-5 inline-flex max-w-full whitespace-normal break-words rounded-md border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-200">
              {t("landing.hero.kicker")}
            </p>
            <h1 className="max-w-4xl whitespace-pre-line text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {t("landing.hero.title")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
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
              className="mt-8 flex max-w-xl flex-col gap-3 rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur sm:flex-row"
            >
              <label className="sr-only" htmlFor="restaurant-slug">
                {t("landing.slug.label")}
              </label>
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-md bg-white px-4 py-3 text-slate-900">
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
                className="rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
              >
                {t("landing.slug.action")}
              </button>
            </form>
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
