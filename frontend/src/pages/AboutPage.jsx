import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const pillars = [
  "Menu and item management",
  "Order, table, billing, and reservation workflows",
  "Kitchen production and daily operations",
  "Role-based dashboards for restaurant teams",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/rmsFavicon.png"
              alt="Pakhlai restaurant management system icon"
              className="h-10 w-10 object-contain"
              width="40"
              height="40"
            />
            <img
              src="/rmsLogo.png"
              alt="Pakhlai restaurant management system logo"
              className="h-8 w-auto object-contain"
              width="130"
              height="32"
            />
          </Link>
          <Link
            to="/founder"
            className="rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
          >
            Founder
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              About Pakhlai
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-gray-950 sm:text-5xl">
              Cloud restaurant management software built for daily operations
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Pakhlai was founded and developed by Abdullah Wahidi. It was
              created to help restaurants manage the practical flow of service,
              from menus and orders to table activity, billing, kitchen work,
              and operational reporting.
            </p>
            <p className="mt-4 text-base leading-7 text-gray-600">
              The company story is rooted in a simple idea: restaurant teams
              should have software that feels clear, fast, and reliable during
              real service hours. Pakhlai brings core restaurant workflows into
              one web-based system so owners, managers, cashiers, waiters, and
              kitchen staff can work from the same operational source.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-xl font-semibold text-gray-950">
              What Pakhlai Helps Manage
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
        © 2026 Pakhlai.{" "}
        <Link to="/founder" className="font-semibold text-orange-700">
          Founded and Developed by Abdullah Wahidi
        </Link>
        .
      </footer>
    </div>
  );
}
