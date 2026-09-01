import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe2, Menu, Search, Store, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  marketplaceLinks,
  marketplaceNavItems,
} from "../../data/landing/marketplaceData";
import { useCustomerSession } from "../../api/customerSession";
import CustomerAccountMenu from "../Customer/CustomerAccountMenu";

const languages = [
  { code: "en", label: "EN" },
  { code: "fa", label: "دری" },
  { code: "ps", label: "پښتو" },
];

function NavigationLink({ children, className, href, onClick }) {
  if (href.startsWith("/")) {
    return <Link to={href} className={className} onClick={onClick}>{children}</Link>;
  }
  return <a href={href} className={className} onClick={onClick}>{children}</a>;
}

export default function MarketplaceNavbar() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const customer = useCustomerSession();

  useEffect(() => {
    const landingPage = document.querySelector(".landing-page");
    const scrollContainer = landingPage?.closest("main") || window;
    const updateScrolled = () => {
      const top = scrollContainer === window ? window.scrollY : scrollContainer.scrollTop;
      setScrolled(top > 12);
    };
    updateScrolled();
    scrollContainer.addEventListener("scroll", updateScrolled, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", updateScrolled);
  }, []);

  const focusSearch = (event) => {
    event.preventDefault();
    setOpen(false);
    const searchSection = document.getElementById("restaurant-search");
    const searchInput = document.getElementById("marketplace-restaurant-search");
    searchSection?.scrollIntoView({ block: "center", behavior: "smooth" });
    searchInput?.focus({ preventScroll: true });
  };

  return (
    <header className={`marketplace-navbar ${scrolled ? "is-scrolled" : ""}`}>
      <nav className="marketplace-navbar-inner" aria-label={t("landing.marketplace.nav.primary")}>
        <a href="#top" className="marketplace-brand">
          <img src="/rmsFavicon.png" alt="" className="h-10 w-10 object-contain" width="40" height="40" />
          <div className="min-w-0">
            <p className="truncate text-lg font-black tracking-[-0.04em] text-stone-950">
              {t("landing.marketplace.brand.name")}
            </p>
            <p className="truncate text-[0.64rem] font-bold uppercase tracking-[0.14em] text-stone-400">
              {t("landing.marketplace.brand.tagline")}
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {marketplaceNavItems.map((item) => (
            <NavigationLink key={item.href} href={item.href} className="marketplace-nav-link">
              {t(item.labelKey)}
            </NavigationLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="#restaurant-search"
            onClick={focusSearch}
            className="marketplace-nav-icon"
            aria-label={t("landing.marketplace.nav.search")}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </a>
          <label className="marketplace-language-select">
            <Globe2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">{t("landing.marketplace.nav.language")}</span>
            <select
              value={i18n.language?.split("-")[0] || "en"}
              onChange={(event) => i18n.changeLanguage(event.target.value)}
              className="max-w-24 bg-transparent text-base font-extrabold outline-none"
              aria-label={t("landing.marketplace.nav.language")}
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>{language.label}</option>
              ))}
            </select>
          </label>
          <CustomerAccountMenu />
          <a href={marketplaceLinks.forRestaurants} className="marketplace-restaurant-link">
            <Store className="h-4 w-4" aria-hidden="true" />
            {t("landing.marketplace.nav.forRestaurants")}
          </a>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          {customer ? (
            <CustomerAccountMenu compact showGuestActions={false} />
          ) : null}
          <a
            href="#restaurant-search"
            onClick={focusSearch}
            className="marketplace-nav-icon"
            aria-label={t("landing.marketplace.nav.search")}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="marketplace-nav-icon"
            aria-label={open ? t("landing.marketplace.nav.closeMenu") : t("landing.marketplace.nav.openMenu")}
            aria-expanded={open}
            aria-controls="marketplace-mobile-navigation"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div id="marketplace-mobile-navigation" className="marketplace-mobile-menu lg:hidden">
          <div className="grid gap-1">
            {marketplaceNavItems.map((item) => (
              <NavigationLink
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="marketplace-mobile-link"
              >
                {t(item.labelKey)}
              </NavigationLink>
            ))}
          </div>
          <div className="mt-3 grid gap-2 border-t border-stone-100 pt-3 sm:grid-cols-2">
            <label className="marketplace-mobile-link border border-stone-200">
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{t("landing.marketplace.nav.language")}</span>
              <select
                value={i18n.language?.split("-")[0] || "en"}
                onChange={(event) => i18n.changeLanguage(event.target.value)}
                className="w-full bg-transparent text-base font-semibold outline-none"
                aria-label={t("landing.marketplace.nav.language")}
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>{language.label}</option>
                ))}
              </select>
            </label>
            {!customer ? (
              <>
                <Link to={marketplaceLinks.login} onClick={() => setOpen(false)} className="marketplace-mobile-link justify-center border border-stone-200">
                  {t("landing.marketplace.nav.login")}
                </Link>
                <Link to={marketplaceLinks.signup} onClick={() => setOpen(false)} className="marketplace-mobile-link justify-center border border-orange-200 bg-orange-50 text-orange-800">
                  {t("landing.marketplace.nav.register")}
                </Link>
              </>
            ) : null}
            <a href={marketplaceLinks.forRestaurants} onClick={() => setOpen(false)} className="marketplace-mobile-owner-link">
              <Store className="h-4 w-4" aria-hidden="true" />
              {t("landing.marketplace.nav.forRestaurants")}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
