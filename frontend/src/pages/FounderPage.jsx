import { Link } from "react-router-dom";
import { Code2, Database, Server, Workflow } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";

const technologies = [
  "React",
  "Django",
  "Django REST Framework",
  "PostgreSQL or SQLite-backed development workflows",
  "WebSockets for live restaurant operations",
  "Tailwind CSS",
  "Vite",
];

export default function FounderPage() {
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
            to="/about"
            className="rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
          >
            {autoT("nav.about")}
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-700">
                {autoT("legacy.aw_073d8783")}
              </div>
              <h1 className="mt-6 text-3xl font-bold text-gray-950">
                {autoT("legacy.abdullah_wahidi_7db3a50d")}
              </h1>
              <p className="mt-2 text-lg font-semibold text-orange-700">
                {autoT("legacy.founder_of_pakhlai_861b73af")}
              </p>
              <p className="mt-1 text-gray-600">{autoT("legacy.software_engineer_84f982e5")}</p>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                {autoT("legacy.developer_of_pakhlai_restaurant_management_system_a_cl_7c2458d0")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="mailto:contact@pakhlai.com"
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
                >
                  {autoT("legacy.contact_pakhlai_com_18a17676")}
                </a>
                <Link
                  to="/about"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                >
                  {autoT("legacy.company_story_9fa26d25")}
                </Link>
              </div>
            </aside>

            <article>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                {autoT("legacy.founder_profile_fb734839")}
              </p>
              <h2 className="mt-3 text-4xl font-bold leading-tight text-gray-950 sm:text-5xl">
                {autoT("legacy.building_practical_software_for_restaurant_teams_6183487e")}
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {autoT("legacy.abdullah_wahidi_is_the_founder_and_creator_of_pakhlai__ad9df0d1")}
              </p>
              <p className="mt-4 text-base leading-7 text-gray-600">
                {autoT("legacy.pakhlai_reflects_a_product_focused_engineering_approac_ca1b44e3")}
              </p>

              <section className="mt-10">
                <h3 className="text-2xl font-semibold text-gray-950">
                  {autoT("legacy.technologies_used_to_build_pakhlai_07e521fb")}
                </h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {technologies.map((technology, index) => {
                    const Icon = [Code2, Server, Database, Workflow][index % 4];
                    return (
                      <div
                        key={technology}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4"
                      >
                        <Icon className="h-5 w-5 text-orange-600" />
                        <span className="font-medium text-gray-800">
                          {technology}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </article>
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
