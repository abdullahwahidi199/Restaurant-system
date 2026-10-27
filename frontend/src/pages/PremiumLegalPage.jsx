import { Mail, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { PremiumPageShell } from "../component/landing/PremiumPublicChrome";
import "../styles/public-premium.css";

const sectionKeys = {
  privacy: ["information", "use", "sharing", "retention", "choices"],
  terms: ["accounts", "orders", "cancellations", "acceptableUse", "service"],
};

export default function PremiumLegalPage({ type }) {
  const { t } = useTranslation();
  const location = useLocation();
  const pageType = type || (location.pathname.includes("terms") ? "terms" : "privacy");

  return (
    <PremiumPageShell>
      <main className="pk-legal">
        <div className="pk-container">
          <header className="pk-legal__heading">
            <div>
              <p className="pk-kicker">
                <ShieldCheck aria-hidden="true" />
                {t("landing.marketplace.legal." + pageType + ".eyebrow")}
              </p>
              <h1>{t("landing.marketplace.legal." + pageType + ".title")}</h1>
            </div>
            <p>{t("landing.marketplace.legal.lastUpdated")}</p>
          </header>

          <div className="pk-legal__body">
            <aside className="pk-legal__intro">
              <p>{t("landing.marketplace.legal." + pageType + ".intro")}</p>
              <a className="pk-legal__contact" href="mailto:contact@pakhlai.com">
                <Mail aria-hidden="true" />
                contact@pakhlai.com
              </a>
            </aside>

            <article className="pk-legal__sections">
              {sectionKeys[pageType].map((key) => (
                <section key={key}>
                  <h2>
                    {t(
                      "landing.marketplace.legal." +
                        pageType +
                        ".sections." +
                        key +
                        ".title",
                    )}
                  </h2>
                  <p>
                    {t(
                      "landing.marketplace.legal." +
                        pageType +
                        ".sections." +
                        key +
                        ".body",
                    )}
                  </p>
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>
    </PremiumPageShell>
  );
}
