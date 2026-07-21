import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  User,
  ShoppingBag,
  LogOut,
} from "lucide-react";

export default function SystemLanding() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const navigate = useNavigate();
  const customer = JSON.parse(localStorage.getItem("customer") || "null");
  const dropdownRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedSlug = slug.trim().toLowerCase();
    if (trimmedSlug) {
      navigate(`/${trimmedSlug}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("customer");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
              <img
                src="/rmsFavicon.png"
                alt="Pakhlai restaurant management system icon"
                className="h-8 w-8 object-contain"
                width="32"
                height="32"
              />
            </div>

            <div className="flex flex-col">
              <img
                src="/rmsLogo.png"
                alt="Pakhlai restaurant management system logo"
                className="h-8 w-auto object-contain"
                width="130"
                height="32"
              />
              <span className="hidden text-xs text-gray-500 sm:block">
                Restaurant Management & Food Delivery Platform
              </span>
            </div>
          </Link>

          {/* Right Actions */}
          <nav className="flex items-center gap-3" aria-label="Primary">
            <Link
              to="/about"
              className="hidden rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-orange-600 sm:inline-flex"
            >
              About
            </Link>
            <Link
              to="/founder"
              className="hidden rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-orange-600 sm:inline-flex"
            >
              Founder
            </Link>
            {customer ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-1 shadow-sm transition hover:border-orange-300 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-semibold text-white shadow-sm">
                    {customer.username?.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="hidden text-left sm:block">
                    <p className="max-w-[140px] truncate text-sm font-semibold text-gray-800">
                      {customer.username}
                    </p>
                    <p className="max-w-[140px] truncate text-xs text-gray-500">
                      {customer.email}
                    </p>
                  </div>

                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 transition-all duration-200 ease-out ${
                    dropdownOpen
                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                  }`}
                >
                  <div className="border-b border-gray-100 px-4 py-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {customer.username}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {customer.email}
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        navigate("/orders");
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <ShoppingBag className="h-4 w-4 text-gray-500" />
                      My Orders
                    </button>

                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-orange-600"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700">
                Smart restaurant access made simple
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Welcome to <span className="text-orange-600">pakhlai.com</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 sm:text-lg lg:mx-0 mx-auto">
                Access any restaurant instantly using its unique short link.
                Fast, simple, and built for a professional ordering experience.
              </p>
            </div>

            {/* Right Card */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-100">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 ring-1 ring-orange-100">
                  <img
                    src="/rmsFavicon.png"
                    alt="Pakhlai restaurant management system icon"
                    className="h-9 w-9 object-contain"
                    width="36"
                    height="36"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Enter Restaurant
                  </h2>
                  <p className="text-sm text-gray-500">
                    Open a restaurant using its custom link
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Restaurant Link
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-gray-400">
                      /
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="restaurant-name"
                      autoComplete="off"
                      spellCheck="false"
                      className="w-full rounded-2xl border border-gray-300 bg-gray-50 py-4 pl-10 pr-4 text-base font-medium text-gray-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-base font-semibold text-white shadow-md transition duration-200 hover:bg-orange-600 hover:shadow-lg active:scale-[0.99]"
                >
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>

          <section className="mt-12 grid gap-4 text-left sm:grid-cols-3">
            <article className="rounded-lg border border-orange-100 bg-white/80 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-950">
                Restaurant Management System
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Pakhlai helps restaurants manage menus, orders, tables,
                billing, kitchen workflow, and daily operations.
              </p>
            </article>
            <article className="rounded-lg border border-orange-100 bg-white/80 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-950">
                Founded by Abdullah Wahidi
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Pakhlai was founded and developed by Abdullah Wahidi, a
                software engineer and creator of the platform.
              </p>
            </article>
            <article className="rounded-lg border border-orange-100 bg-white/80 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-950">
                Built for Restaurant Teams
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Role-based workflows support owners, managers, cashiers,
                waiters, kitchen staff, and daily restaurant operations.
              </p>
            </article>
          </section>
        </div>
      </main>

      <footer className="border-t border-orange-100 bg-white/70 px-6 py-6 text-center text-sm text-gray-600">
        © 2026 Pakhlai.{" "}
        <Link to="/founder" className="font-semibold text-orange-700">
          Founded and Developed by Abdullah Wahidi
        </Link>
        .
      </footer>
    </div>
  );
}
