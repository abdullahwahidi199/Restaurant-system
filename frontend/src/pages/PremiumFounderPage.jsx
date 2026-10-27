import {
  ArrowUpRight,
  Braces,
  Code2,
  Database,
  Layers3,
  Server,
  Sparkles,
  Workflow,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PremiumPageShell } from "../component/landing/PremiumPublicChrome";
import "../styles/public-premium.css";

const technologies = [
  { name: "React", icon: Braces },
  { name: "Django", icon: Server },
  { name: "Django REST Framework", icon: Workflow },
  { name: "PostgreSQL & SQLite", icon: Database },
  { name: "WebSockets", icon: Layers3 },
  { name: "Tailwind CSS", icon: Code2 },
  { name: "Vite", icon: Sparkles },
];

export default function PremiumFounderPage() {
  const { t } = useTranslation();

  return (
    <PremiumPageShell solidHeader={false}>
      <main>
        <section className="pk-page-hero">
          <div className="pk-container pk-page-hero__inner">
            <div>
              <p className="pk-kicker pk-kicker--light">
                <Sparkles aria-hidden="true" />
                Founder story
              </p>
              <h1>Built with care for the people behind every plate.</h1>
            </div>
            <p className="pk-page-hero__aside">
              Product thinking, practical engineering, and a clear respect for the
              rhythm of restaurant work.
            </p>
          </div>
        </section>

        <section className="pk-founder">
          <div className="pk-container pk-founder__layout">
            <aside className="pk-founder__profile">
              <div className="pk-founder__portrait">
                <span>AW</span>
              </div>
              <div className="pk-founder__profile-copy">
                <h2>{t("legacy.abdullah_wahidi_7db3a50d")}</h2>
                <p>{t("legacy.founder_of_pakhlai_861b73af")}</p>
                <p>{t("legacy.software_engineer_84f982e5")}</p>
                <a href="mailto:contact@pakhlai.com">
                  contact@pakhlai.com
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
            </aside>

            <article className="pk-founder__narrative">
              <p className="pk-kicker">The person behind the product</p>
              <h2>{t("legacy.building_practical_software_for_restaurant_teams_6183487e")}</h2>
              <p>{t("legacy.abdullah_wahidi_is_the_founder_and_creator_of_pakhlai__ad9df0d1")}</p>
              <p>{t("legacy.pakhlai_reflects_a_product_focused_engineering_approac_ca1b44e3")}</p>

              <div className="pk-tech-grid">
                {technologies.map((technology) => {
                  const Icon = technology.icon;
                  return (
                    <div key={technology.name}>
                      <Icon aria-hidden="true" />
                      <span>{technology.name}</span>
                    </div>
                  );
                })}
              </div>
            </article>
          </div>
        </section>
      </main>
    </PremiumPageShell>
  );
}
