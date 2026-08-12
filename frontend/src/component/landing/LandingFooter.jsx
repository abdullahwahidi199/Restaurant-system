import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { footerGroups } from "../../data/landing/landingData";

function FooterLink({ href, children }) {
  const className =
    "text-sm font-medium text-slate-400 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400";

  if (!href) {
    return <span className="text-sm font-medium text-slate-500">{children}</span>;
  }

  if (href.startsWith("/")) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/10 bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <a
            href="#top"
            className="inline-flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
          >
            <img
              src="/rmsFavicon.png"
              alt={t("landing.brand.logoAlt")}
              className="h-10 w-10 rounded-lg bg-white object-contain p-1"
              width="40"
              height="40"
              loading="lazy"
            />
            <div>
              <p className="font-bold">{t("landing.brand.product")}</p>
              <p className="mt-1 text-sm text-slate-400">{t("landing.brand.byCompany")}</p>
            </div>
          </a>
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
            {t("landing.footer.description")}
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.titleKey}>
              <h2 className="text-sm font-bold text-white">{t(group.titleKey)}</h2>
              <div className="mt-4 grid gap-3">
                {group.links.map((link) => (
                  <FooterLink key={link.labelKey} href={link.href}>
                    {t(link.labelKey)}
                  </FooterLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-slate-500">
        {t("landing.footer.copyright")}
      </div>
    </footer>
  );
}

export default LandingFooter;
