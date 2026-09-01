import { ArrowUpRight, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { footerGroups } from "../../data/landing/marketplaceData";

function FooterLink({ children, href }) {
  const className = "marketplace-footer-link";
  if (href.startsWith("/") && !href.startsWith("//")) {
    return <Link to={href} className={className}>{children}</Link>;
  }
  return <a href={href} className={className}>{children}</a>;
}

export default function MarketplaceFooter() {
  const { t } = useTranslation();

  return (
    <footer className="marketplace-footer">
      <div className="marketplace-container">
        <div className="marketplace-footer-grid">
          <div className="max-w-sm">
            <a href="#top" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400">
              <img src="/rmsFavicon.png" alt="" className="h-10 w-10 object-contain" width="40" height="40" loading="lazy" />
              <span>
                <strong className="block text-lg font-black tracking-[-0.03em] text-white">
                  {t("landing.marketplace.brand.name")}
                </strong>
                <small className="block text-xs font-semibold text-stone-500">
                  {t("landing.marketplace.brand.byCompany")}
                </small>
              </span>
            </a>
            <p className="mt-4 text-sm leading-6 text-stone-400">
              {t("landing.marketplace.footer.description")}
            </p>
            <a href="mailto:contact@pakhlai.com" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-orange-300 transition hover:text-orange-200">
              <Mail className="h-4 w-4" aria-hidden="true" />
              contact@pakhlai.com
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.key}>
                <h2 className="text-sm font-black text-white">
                  {t(`landing.marketplace.footer.groups.${group.key}.title`)}
                </h2>
                <ul className="mt-4 grid gap-3">
                  {group.links.map((link) => (
                    <li key={link.key}>
                      <FooterLink href={link.href}>
                        {t(`landing.marketplace.footer.links.${link.key}`)}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="marketplace-footer-bottom">
          <p>{t("landing.marketplace.footer.copyright", { year: new Date().getFullYear() })}</p>
          <a href="#top" className="inline-flex min-h-11 items-center gap-2 font-bold text-stone-400 transition hover:text-white">
            {t("landing.marketplace.footer.backToTop")}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
