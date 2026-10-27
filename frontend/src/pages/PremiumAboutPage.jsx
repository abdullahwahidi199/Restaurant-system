import { Check, Compass, Layers3, Sparkles, Workflow } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PremiumPageShell } from "../component/landing/PremiumPublicChrome";
import "../styles/public-premium.css";

const pillars = [
  {
    title: "Menu and item management",
    icon: Compass,
  },
  {
    title: "Order, table, billing, and reservation workflows",
    icon: Workflow,
  },
  {
    title: "Kitchen production and daily operations",
    icon: Sparkles,
  },
  {
    title: "Role-based dashboards for restaurant teams",
    icon: Layers3,
  },
];

export default function PremiumAboutPage() {
  const { t } = useTranslation();

  return (
    <PremiumPageShell solidHeader={false}>
      <main>
        <section className="pk-page-hero">
          <div className="pk-container pk-page-hero__inner">
            <div>
              <p className="pk-kicker pk-kicker--light">
                <Sparkles aria-hidden="true" />
                {t("legacy.about_pakhlai_538ca7d2")}
              </p>
              <h1>Restaurant technology, shaped around real service.</h1>
            </div>
            <p className="pk-page-hero__aside">
              Pakhlai brings the guest marketplace and the operating room together:
              beautiful discovery outside, calm control inside.
            </p>
          </div>
        </section>

        <section className="pk-story">
          <div className="pk-container pk-story__grid">
            <aside className="pk-story__index">
              <strong>01</strong>
              <p>
                A connected restaurant platform built for the pace, detail, and
                humanity of hospitality.
              </p>
            </aside>

            <article className="pk-story__content">
              <p>{t("legacy.pakhlai_was_founded_and_developed_by_abdullah_wahidi_i_36935dc9")}</p>
              <p>{t("legacy.the_company_story_is_rooted_in_a_simple_idea_restauran_a69777ba")}</p>

              <div className="pk-pillar-list">
                {pillars.map((pillar, index) => {
                  const Icon = pillar.icon;
                  return (
                    <div className="pk-pillar" key={pillar.title}>
                      <span>
                        0{index + 1}
                        <Icon aria-hidden="true" />
                      </span>
                      <h2>{pillar.title}</h2>
                    </div>
                  );
                })}
              </div>

              <a href="/#for-restaurants" className="pk-button pk-button--dark">
                Discover the platform
                <Check aria-hidden="true" />
              </a>
            </article>
          </div>
        </section>
      </main>
    </PremiumPageShell>
  );
}
