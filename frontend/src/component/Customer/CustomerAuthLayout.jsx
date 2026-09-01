import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./customer-auth.css";

const BENEFITS = [
  "customerAuth.visual.benefitSaved",
  "customerAuth.visual.benefitOrders",
  "customerAuth.visual.benefitReorder",
];

const CustomerAuthLayout = ({
  eyebrow,
  title,
  description,
  children,
  footer,
  imagePosition = "center",
  direction = "ltr",
}) => {
  const { t } = useTranslation();

  return (
    <div className="customer-auth-page" dir={direction}>
      <header className="customer-auth-header">
        <Link
          to="/"
          className="customer-auth-brand"
          aria-label={t("customerAuth.shared.home", "Pakhlai home")}
        >
          <img src="/rmsLogo.png" alt="Pakhlai" />
        </Link>

        <Link to="/" className="customer-auth-back">
          <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.2} />
          <span>{t("customerAuth.shared.back", "Back to restaurants")}</span>
        </Link>
      </header>

      <div className="customer-auth-stage">
        <section
          className="customer-auth-visual"
          aria-label={t(
            "customerAuth.visual.ariaLabel",
            "Pakhlai customer benefits",
          )}
        >
          <img
            className="customer-auth-visual-image"
            src="/images/pakhlai-hero-feast.webp"
            alt={t(
              "customerAuth.visual.imageAlt",
              "A table filled with a freshly prepared Afghan meal",
            )}
            width="1535"
            height="1025"
            loading="eager"
            fetchPriority="high"
            style={{ objectPosition: imagePosition }}
          />
          <div className="customer-auth-visual-shade" aria-hidden="true" />
          <div className="customer-auth-visual-content">
            <div className="customer-auth-visual-badge">
              <ShieldCheck aria-hidden="true" size={16} />
              <span>
                {t("customerAuth.visual.secure", "Secure customer account")}
              </span>
            </div>
            <p className="customer-auth-visual-kicker">
              {t("customerAuth.visual.kicker", "Made for food lovers")}
            </p>
            <h2>
              {t(
                "customerAuth.visual.title",
                "Good food is closer than you think.",
              )}
            </h2>
            <p className="customer-auth-visual-copy">
              {t(
                "customerAuth.visual.description",
                "Discover local restaurants, choose what you are craving, and keep your orders easy to find.",
              )}
            </p>
            <ul className="customer-auth-benefits">
              {BENEFITS.map((key) => (
                <li key={key}>
                  <CheckCircle2 aria-hidden="true" size={18} />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="customer-auth-panel">
          <div className="customer-auth-panel-inner">
            <div className="customer-auth-heading">
              <p className="customer-auth-eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
            {children}
            {footer ? (
              <div className="customer-auth-footer">{footer}</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerAuthLayout;
