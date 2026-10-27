import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUp,
  ArrowUpRight,
  Globe2,
  Mail,
  Menu,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import CustomerAccountMenu from "../Customer/CustomerAccountMenu";
import { isStaffApp } from "../../config/appEnvironment";

const languages = [
  { code: "en", label: "EN" },
  { code: "fa", label: "دری" },
  { code: "ps", label: "پښتو" },
];

const navigation = [
  { key: "landing.marketplace.nav.restaurants", href: "/#restaurants" },
  { key: "landing.marketplace.nav.explore", href: "/#cuisines" },
  { key: "landing.marketplace.nav.about", href: "/about" },
];

function SmartLink({ children, className = "", href, onClick }) {
  if (href.startsWith("/") && !href.includes("#")) {
    return (
      <Link to={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

export function PremiumPublicHeader({ solid = false }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const publicHome = isStaffApp() ? "/landing" : "/";
  const resolvePublicHref = (href) =>
    href.startsWith("/#") ? publicHome + href.slice(1) : href;

  useEffect(() => {
    const scrollContainer = document.querySelector(".theme-app-shell > main") || window;
    const update = () => {
      const top = scrollContainer === window ? window.scrollY : scrollContainer.scrollTop;
      setScrolled(top > 24);
    };

    update();
    scrollContainer.addEventListener("scroll", update, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [i18n.language]);

  const isSolid = solid || scrolled || open;

  return (
    <header className={"pk-header" + (isSolid ? " is-solid" : "")}>
      <div className="pk-header__inner">
        <Link to={publicHome} className="pk-brand" aria-label="Pakhlai home">
          <span className="pk-brand__mark">
            <img src="/rmsFavicon.png" alt="" width="34" height="34" />
          </span>
          <span className="pk-brand__word">
            Pakhlai
            <small>{t("landing.marketplace.brand.tagline")}</small>
          </span>
        </Link>

        <nav className="pk-desktop-nav" aria-label={t("landing.marketplace.nav.primary")}>
          {navigation.map((item) => (
            <SmartLink
              key={item.href}
              href={resolvePublicHref(item.href)}
              className="pk-nav-link"
            >
              {t(item.key)}
            </SmartLink>
          ))}
        </nav>

        <div className="pk-header__actions">
          <label className="pk-language">
            <Globe2 aria-hidden="true" />
            <span className="sr-only">{t("landing.marketplace.nav.language")}</span>
            <select
              value={i18n.language?.split("-")[0] || "en"}
              onChange={(event) => i18n.changeLanguage(event.target.value)}
              aria-label={t("landing.marketplace.nav.language")}
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>

          <CustomerAccountMenu className="pk-account" />

          <a className="pk-owner-link" href={publicHome + "#for-restaurants"}>
            <Store aria-hidden="true" />
            <span>{t("landing.marketplace.nav.forRestaurants")}</span>
          </a>

          <button
            type="button"
            className="pk-menu-button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="premium-mobile-navigation"
            aria-label={
              open
                ? t("landing.marketplace.nav.closeMenu")
                : t("landing.marketplace.nav.openMenu")
            }
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="premium-mobile-navigation" className="pk-mobile-nav">
          <nav>
            {navigation.map((item, index) => (
              <SmartLink
                key={item.href}
                href={resolvePublicHref(item.href)}
                className="pk-mobile-nav__link"
                onClick={() => setOpen(false)}
              >
                <span>0{index + 1}</span>
                {t(item.key)}
                <ArrowUpRight aria-hidden="true" />
              </SmartLink>
            ))}
          </nav>
          <div className="pk-mobile-nav__footer">
            <Link to="/login" onClick={() => setOpen(false)}>
              {t("landing.marketplace.nav.login")}
            </Link>
            <Link to="/signup" onClick={() => setOpen(false)}>
              {t("landing.marketplace.nav.register")}
            </Link>
            <a href={publicHome + "#for-restaurants"} onClick={() => setOpen(false)}>
              {t("landing.marketplace.nav.forRestaurants")}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

const footerGroups = [
  {
    title: "landing.marketplace.footer.groups.customer.title",
    links: [
      ["landing.marketplace.footer.links.findRestaurants", "/#restaurants"],
      ["landing.marketplace.footer.links.browseFood", "/#cuisines"],
      ["landing.marketplace.footer.links.orders", "/orders"],
      ["landing.marketplace.footer.links.help", "mailto:contact@pakhlai.com"],
    ],
  },
  {
    title: "landing.marketplace.footer.groups.restaurants.title",
    links: [
      ["landing.marketplace.footer.links.restaurantSolutions", "/#for-restaurants"],
      ["landing.marketplace.footer.links.features", "/#owner-features"],
      [
        "landing.marketplace.footer.links.pricing",
        "mailto:contact@pakhlai.com?subject=Pakhlai restaurant pricing",
      ],
      ["landing.marketplace.owner.existingRestaurant", "/staff-login"],
    ],
  },
  {
    title: "landing.marketplace.footer.groups.company.title",
    links: [
      ["landing.marketplace.footer.links.about", "/about"],
      ["Founder", "/founder"],
      ["landing.marketplace.footer.links.privacy", "/privacy"],
      ["landing.marketplace.footer.links.terms", "/terms"],
    ],
  },
];

export function PremiumPublicFooter() {
  const { t } = useTranslation();
  const publicHome = isStaffApp() ? "/landing" : "/";
  const resolvePublicHref = (href) =>
    href.startsWith("/#") ? publicHome + href.slice(1) : href;

  const scrollToTop = () => {
    const scrollContainer = document.querySelector(".theme-app-shell > main");
    (scrollContainer || window).scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="pk-footer">
      <div className="pk-container">
        <div className="pk-footer__lead">
          <div>
            <p className="pk-kicker pk-kicker--light">
              <Sparkles aria-hidden="true" />
              Food, found beautifully
            </p>
            <h2>Good food should feel easy to find.</h2>
          </div>
          <a href="mailto:contact@pakhlai.com" className="pk-footer__contact">
            <span>
              <small>Talk to us</small>
              contact@pakhlai.com
            </span>
            <Mail aria-hidden="true" />
          </a>
        </div>

        <div className="pk-footer__grid">
          <div className="pk-footer__brand">
            <Link to={publicHome} className="pk-brand">
              <span className="pk-brand__mark">
                <img src="/rmsFavicon.png" alt="" width="34" height="34" />
              </span>
              <span className="pk-brand__word">Pakhlai</span>
            </Link>
            <p>{t("landing.marketplace.footer.description")}</p>
          </div>

          {footerGroups.map((group) => (
            <div className="pk-footer__group" key={group.title}>
              <h3>{t(group.title)}</h3>
              {group.links.map(([label, href]) => (
                <SmartLink key={href} href={resolvePublicHref(href)}>
                  {label === "Founder" ? label : t(label)}
                </SmartLink>
              ))}
            </div>
          ))}
        </div>

        <div className="pk-footer__bottom">
          <p>
            {t("landing.marketplace.footer.copyright", {
              year: new Date().getFullYear(),
            })}
          </p>
          <button type="button" onClick={scrollToTop}>
            {t("landing.marketplace.footer.backToTop")}
            <ArrowUp aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export function PremiumPageShell({ children, solidHeader = true }) {
  const { i18n } = useTranslation();
  const direction = i18n.dir(i18n.language);

  useEffect(() => {
    document.documentElement.lang = i18n.language?.split("-")[0] || "en";
    document.documentElement.dir = direction;
  }, [direction, i18n.language]);

  return (
    <div className="pk-public" dir={direction}>
      <PremiumPublicHeader solid={solidHeader} />
      {children}
      <PremiumPublicFooter />
    </div>
  );
}
