import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe2, Menu, X } from "lucide-react";
import CTAButton from "./CTAButton";
import { landingLinks, navItems } from "../../data/landing/landingData";

const languages = [
  { code: "en", label: "EN" },
  { code: "fa", label: "دری" },
  { code: "ps", label: "PS" },
];

function LandingNavbar() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const landingPage = document.querySelector(".landing-page");
    const scrollContainer = landingPage?.closest("main") || window;
    const updateScrolled = () => {
      const top = scrollContainer === window ? window.scrollY : scrollContainer.scrollTop;
      setScrolled(top > 8);
    };

    updateScrolled();
    scrollContainer.addEventListener("scroll", updateScrolled, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", updateScrolled);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav
        className={`mx-auto flex w-full max-w-7xl items-center justify-between rounded-lg border px-4 py-3 transition duration-300 ${
          scrolled
            ? "border-slate-200/80 bg-white/90 shadow-lg shadow-slate-950/5 backdrop-blur-xl"
            : "border-white/20 bg-slate-950/40 text-white shadow-lg shadow-slate-950/10 backdrop-blur-xl"
        }`}
        aria-label={t("landing.nav.primary")}
      >
        <a
          href="#top"
          className="flex min-w-0 max-w-[calc(100%-3.5rem)] items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400 lg:max-w-none"
        >
          <img
            src="/rmsFavicon.png"
            alt={t("landing.brand.logoAlt")}
            className="h-10 w-10 rounded-lg bg-white object-contain p-1"
            width="40"
            height="40"
          />
          <div className="min-w-0 leading-none">
            <p className={`truncate text-base font-bold ${scrolled ? "text-slate-950" : "text-white"}`}>
              {t("landing.brand.product")}
            </p>
            <p className={`mt-1 truncate text-xs ${scrolled ? "text-slate-500" : "text-slate-300"}`}>
              {t("landing.brand.byCompany")}
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
                scrolled
                  ? "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t(item.labelKey)}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <label
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
              scrolled
                ? "border-slate-200 bg-white text-slate-700"
                : "border-white/20 bg-white/10 text-white"
            }`}
          >
            <Globe2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{t("landing.nav.language")}</span>
            <select
              value={i18n.language?.split("-")[0] || "en"}
              onChange={(event) => i18n.changeLanguage(event.target.value)}
              className="bg-transparent text-sm font-semibold outline-none"
              aria-label={t("landing.nav.language")}
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>
          <CTAButton to={landingLinks.login} variant={scrolled ? "ghost" : "secondary"} showArrow={false}>
            {t("landing.actions.login")}
          </CTAButton>
          <CTAButton to={landingLinks.demo}>{t("landing.actions.bookDemo")}</CTAButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 lg:hidden ${
            scrolled
              ? "border-slate-200 bg-white text-slate-950"
              : "border-white/20 bg-white/10 text-white"
          }`}
          aria-label={open ? t("landing.nav.closeMenu") : t("landing.nav.openMenu")}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      {open ? (
        <div className="mx-auto mt-2 max-w-7xl rounded-lg border border-slate-200 bg-white p-3 shadow-xl shadow-slate-950/10 lg:hidden">
          <div className="grid gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-md px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t(item.labelKey)}
              </a>
            ))}
          </div>
          <div className="mt-3 grid gap-2 border-t border-slate-200 pt-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-3 text-sm text-slate-700">
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{t("landing.nav.language")}</span>
              <select
                value={i18n.language?.split("-")[0] || "en"}
                onChange={(event) => i18n.changeLanguage(event.target.value)}
                className="w-full bg-transparent font-semibold outline-none"
                aria-label={t("landing.nav.language")}
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
            <CTAButton to={landingLinks.login} variant="light" showArrow={false} onClick={closeMenu}>
              {t("landing.actions.login")}
            </CTAButton>
            <CTAButton to={landingLinks.demo} variant="primary" onClick={closeMenu}>
              {t("landing.actions.bookDemo")}
            </CTAButton>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default LandingNavbar;
