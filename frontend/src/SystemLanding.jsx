import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UtensilsCrossed, ArrowRight, ExternalLink } from "lucide-react";
export default function SystemLanding() {
  const [slug, setSlug] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedSlug = slug.trim().toLowerCase();
    if (trimmedSlug) {
      navigate(`/${trimmedSlug}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex flex-col">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Favicon */}
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <img
                src="/rmsFavicon.png"
                alt="Pakhlai favicon"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col justify-center">
              <img
                src="/rmsLogo.png"
                alt="Pakhlai logo"
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>

          <div className="text-sm text-gray-500 font-medium hidden sm:block">
            Restaurant Management & Food Delivery Platform
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          <div className="mx-auto mb-10 w-30 h-32 bg-white rounded-3xl shadow-xl shadow-orange-100 flex items-center justify-center border border-orange-100">
            <img src="/rmsFavicon.png" alt="" />
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter text-gray-900 mb-6">
            Welcome to the
            <br />
            <span className="text-orange-600">pakhlai.com</span>
          </h1>

          <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto">
            Access any restaurant instantly using its unique short link.
          </p>

          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-100/80 border border-gray-100 p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 text-left">
                  RESTAURANT LINK
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium font-mono">
                    /
                  </div>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="restaurant-name"
                    className="w-full pl-14 pr-5 py-4 bg-zinc-50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-2xl text-lg font-medium placeholder:text-gray-400 transition-all outline-none"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.985] shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 text-lg"
              >
                Enter Restaurant
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
