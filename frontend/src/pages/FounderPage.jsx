import { Link } from "react-router-dom";
import { Code2, Database, Server, Workflow } from "lucide-react";

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
            to="/about"
            className="rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
          >
            About
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-700">
                AW
              </div>
              <h1 className="mt-6 text-3xl font-bold text-gray-950">
                Abdullah Wahidi
              </h1>
              <p className="mt-2 text-lg font-semibold text-orange-700">
                Founder of Pakhlai
              </p>
              <p className="mt-1 text-gray-600">Software Engineer</p>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                Developer of Pakhlai Restaurant Management System, a
                cloud-based RMS for restaurant menus, orders, tables, billing,
                kitchen workflow, and daily operations.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="mailto:contact@pakhlai.com"
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
                >
                  contact@pakhlai.com
                </a>
                <Link
                  to="/about"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                >
                  Company Story
                </Link>
              </div>
            </aside>

            <article>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                Founder Profile
              </p>
              <h2 className="mt-3 text-4xl font-bold leading-tight text-gray-950 sm:text-5xl">
                Building practical software for restaurant teams
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Abdullah Wahidi is the founder and creator of Pakhlai, a
                cloud-based restaurant management system designed to support
                real restaurant workflows. As a software engineer, Abdullah
                developed Pakhlai to bring menu management, order handling,
                table service, billing, kitchen coordination, reporting, and
                staff operations into one connected platform.
              </p>
              <p className="mt-4 text-base leading-7 text-gray-600">
                Pakhlai reflects a product-focused engineering approach:
                organize the busy parts of restaurant service, make daily tasks
                easier to track, and give teams a reliable system that can grow
                with their operations.
              </p>

              <section className="mt-10">
                <h3 className="text-2xl font-semibold text-gray-950">
                  Technologies Used to Build Pakhlai
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
        © 2026 Pakhlai.{" "}
        <Link to="/founder" className="font-semibold text-orange-700">
          Founded and Developed by Abdullah Wahidi
        </Link>
        .
      </footer>
    </div>
  );
}
