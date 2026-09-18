import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";

const pillars = [
  "Menu and item management",
  "Order, table, billing, and reservation workflows",
  "Kitchen production and daily operations",
  "Role-based dashboards for restaurant teams",
];

export default function AboutPage() {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/rmsFavicon.png"
              alt={autoT("legacy.pakhlai_restaurant_management_system_icon_7b4721a2")}
              className="h-10 w-10 object-contain"
              width="40"
              height="40"
            />
            <img
              src="/rmsLogo.png"
              alt={autoT("legacy.pakhlai_restaurant_management_system_logo_8b15816a")}
              className="h-8 w-auto object-contain"
              width="130"
              height="32"
            />
          </Link>
          <Link
            to="/founder"
            className="rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
          >
            {autoT("legacy.founder_b170e7e7")}
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              {autoT("legacy.about_pakhlai_538ca7d2")}
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-gray-950 sm:text-5xl">
              {autoT("legacy.cloud_restaurant_management_software_built_for_daily_o_7b533b63")}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {autoT("legacy.pakhlai_was_founded_and_developed_by_abdullah_wahidi_i_36935dc9")}
            </p>
            <p className="mt-4 text-base leading-7 text-gray-600">
              {autoT("legacy.the_company_story_is_rooted_in_a_simple_idea_restauran_a69777ba")}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-xl font-semibold text-gray-950">
              {autoT("legacy.what_pakhlai_helps_manage_72402882")}
            </h2>
            <ul className="mt-6 space-y-4">
              {pillars.map((pillar) => (
                <li key={pillar} className="flex gap-3 text-gray-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-orange-600" />
                  <span>{pillar}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 px-6 py-6 text-center text-sm text-gray-600">
        {autoT("legacy.2026_pakhlai_2984a54c")}{" "}
        <Link to="/founder" className="font-semibold text-orange-700">
          {autoT("legacy.founded_and_developed_by_abdullah_wahidi_a1ec64fe")}
        </Link>
        .
      </footer>
    </div>
  );
}
