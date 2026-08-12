import React, { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  Plus,
  Minus,
  ShoppingCart,
  Check,
  UtensilsCrossed,
  Sparkles,
  ChevronLeft,
  ListChecks,
} from "lucide-react";
import instance from "../../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { buildThemedImagePlaceholder } from "../../theme/themeRuntime";

/* ═══════════════════════════════════════════
   IMAGE WRAPPER (Luxury style)
═══════════════════════════════════════════ */
const ImageWrapper = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-[var(--theme-secondary)] to-[var(--theme-text-primary)] flex items-center justify-center`}
      >
        <UtensilsCrossed className="w-16 h-16 text-[var(--theme-secondary)]/20" />
      </div>
    );
  }

  const fullUrl = src.startsWith("http")
    ? src
    : `${import.meta.env.VITE_MEDIA_URL || ""}${src.replace(/\/$/g, "")}`;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-secondary)] to-[var(--theme-text-primary)] animate-pulse" />
      )}
      <img
        src={fullUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        }`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          e.target.onerror = null;
          setLoaded(true);
          e.target.src = buildThemedImagePlaceholder();
        }}
      />
    </div>
  );
};

/* ═══════════════════════════════════════════
   SHIMMER TEXT
═══════════════════════════════════════════ */
const ShimmerText = ({ children, className = "" }) => (
  <span
    className={`inline-block bg-gradient-to-r from-[var(--theme-secondary)] via-[var(--theme-warning-soft)] to-[var(--theme-secondary)] bg-[length:200%_100%] bg-clip-text text-transparent ${className}`}
    style={{ animation: "shimmerText 4s linear infinite" }}
  >
    {children}
  </span>
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function PublicPlatterDetails() {
  const { id, slug } = useParams();
  const [platter, setPlatter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Localized name helper
  const getLocalizedName = (item) => {
    if (!item) return "";
    if (i18n.language === "fa") return item.name_dari || item.name;
    if (i18n.language === "ps") return item.name_pashto || item.name;
    return item.name;
  };

  // Localized description helper
  const getLocalizedDescription = (item) => {
    if (!item) return "";
    if (i18n.language === "fa")
      return item.description_dari || item.description;
    if (i18n.language === "ps")
      return item.description_pashto || item.description;
    return item.description;
  };

  // Localized menu item name inside platter
  const getLocalizedItemName = (item) => {
    if (!item) return "";
    if (i18n.language === "fa")
      return item.menu_item_name_dari || item.menu_item_name;
    if (i18n.language === "ps")
      return item.menu_item_name_pashto || item.menu_item_name;
    return item.menu_item_name;
  };

  const fetchPlatterDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await instance.get(`/menu/public/${slug}/platters/${id}/`);
      setPlatter(res.data);
    } catch (err) {
      console.error(err);
      setError(t("labels.platter_not_found_desc"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPlatterDetails();
  }, [id]);

  // Set document direction based on language
  useEffect(() => {
    const dir =
      i18n.language === "fa" || i18n.language === "ps" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const handleAddToCart = () => {
    const cartKey = `cart_${slug}`;
    let cart = [];
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) cart = JSON.parse(saved);
    } catch {}

    const existing = cart.find((i) => i.id === platter.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: platter.id,
        name: platter.name,
        name_dari: platter.name_dari,
        name_pashto: platter.name_pashto,
        price: parseFloat(platter.price),
        image: platter.image,
        quantity,
        type: "platter",
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  /* ────── LOADING ────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--theme-text-primary)] flex items-center justify-center px-4 relative overflow-hidden">
        <style>{`
          @keyframes shimmerText {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div
          className="text-center relative z-10"
          style={{ animation: "fadeInUp 1s ease-out" }}
        >
          <div className="relative mx-auto mb-8 w-20 h-20">
            <div
              className="absolute inset-0 rounded-full border-2 border-[var(--theme-secondary)]/20"
              style={{ animation: "spinSlow 3s linear infinite" }}
            />
            <div
              className="absolute inset-2 rounded-full border-2 border-t-[var(--theme-secondary)] border-r-transparent border-b-transparent border-l-transparent"
              style={{ animation: "spinSlow 1.5s linear infinite" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[var(--theme-secondary)]" />
            </div>
          </div>
          <ShimmerText className="text-lg sm:text-xl font-light tracking-[0.3em] uppercase">
            {t("labels.loading_platter")}
          </ShimmerText>
        </div>
      </div>
    );
  }

  /* ────── ERROR ────── */
  if (error || !platter) {
    return (
      <div className="min-h-screen bg-[var(--theme-text-primary)] flex items-center justify-center p-4 relative overflow-hidden">
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div
          className="bg-[var(--theme-text-primary)]/80 backdrop-blur-xl rounded-3xl border border-[var(--theme-secondary)]/10 p-8 sm:p-12 max-w-md w-full text-center relative z-10"
          style={{ animation: "fadeInUp 0.6s ease-out" }}
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-light text-white mb-2 tracking-wide">
            {t("labels.platter_not_found")}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {error || t("labels.platter_not_found_desc")}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchPlatterDetails}
              className="px-8 py-3 bg-gradient-to-r from-[var(--theme-secondary)] to-[var(--theme-secondary-hover)] text-[var(--theme-text-primary)] rounded-full font-medium text-sm tracking-wide hover:shadow-lg hover:shadow-[var(--theme-secondary)]/20 transition-all active:scale-95"
            >
              {t("labels.try_again")}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-3 border border-[var(--theme-secondary)]/20 text-gray-400 rounded-full font-medium text-sm tracking-wide hover:bg-[var(--theme-secondary)]/5 hover:text-[var(--theme-secondary)] transition-all active:scale-95"
            >
              {t("labels.go_back")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = (parseFloat(platter.price) * quantity).toFixed(2);

  return (
    <div className="min-h-screen bg-[var(--theme-text-primary)] pb-32 md:pb-8 relative overflow-x-hidden">
      {/* Global Keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmerText {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes cartBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        .glass-morphism {
          background: rgb(var(--theme-text-primary-rgb) /  0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .btn-gold {
          background: linear-gradient(135deg, var(--theme-secondary), var(--theme-secondary-hover));
          color: var(--theme-text-primary);
          transition: all 0.3s ease;
        }
        .btn-gold:hover {
          box-shadow: 0 4px 25px rgb(var(--theme-secondary-rgb) /  0.4);
          transform: translateY(-1px);
        }
        .btn-gold:active {
          transform: scale(0.97);
        }

        .gold-glow {
          box-shadow: 0 0 30px rgb(var(--theme-secondary-rgb) / 0.1), 0 0 60px rgb(var(--theme-secondary-rgb) / 0.05);
        }

        .platter-item-card {
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .platter-item-card:hover {
          border-color: rgb(var(--theme-secondary-rgb) /  0.25);
          background: rgb(var(--theme-secondary-rgb) /  0.03);
          transform: translateX(4px);
        }
        [dir="rtl"] .platter-item-card:hover {
          transform: translateX(-4px);
        }
      `}</style>

      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            top: "-5%",
            right: "-5%",
            background:
              "radial-gradient(circle, rgb(var(--theme-secondary-rgb) / 0.04) 0%, transparent 70%)",
            animation: "pulseGlow 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            bottom: "-10%",
            left: "-10%",
            background:
              "radial-gradient(circle, rgb(var(--theme-primary-rgb) / 0.03) 0%, transparent 70%)",
            animation: "pulseGlow 12s ease-in-out 3s infinite",
          }}
        />
      </div>

      {/* ══════════════════════════════════════
          STICKY HEADER
      ══════════════════════════════════════ */}
      <header className="sticky top-0 z-30 bg-[var(--theme-text-primary)]/80 backdrop-blur-2xl border-b border-[var(--theme-secondary)]/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full border border-[var(--theme-secondary)]/10 hover:border-[var(--theme-secondary)]/30 hover:bg-[var(--theme-secondary)]/5 flex items-center justify-center transition-all group"
            aria-label={t("labels.go_back")}
          >
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-[var(--theme-secondary)] transition-colors rtl:rotate-180" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-light text-white truncate tracking-wide">
              {getLocalizedName(platter)}
            </h1>
            <p className="text-[10px] text-[var(--theme-secondary)]/40 tracking-[0.2em] uppercase">
              {t("labels.back_to_menu")}
            </p>
          </div>
          {/* Platter badge in header */}
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--theme-secondary)]/15 bg-[var(--theme-secondary)]/5 text-[var(--theme-secondary)] text-[10px] sm:text-xs font-medium tracking-wider uppercase">
            <UtensilsCrossed className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {t("labels.platter")}
          </span>
        </div>
      </header>

      {/* ══════════════════════════════════════
          HERO IMAGE
      ══════════════════════════════════════ */}
      <div className="relative" style={{ animation: "fadeIn 0.8s ease-out" }}>
        <div className="relative h-64 sm:h-80 md:h-[28rem] overflow-hidden bg-[var(--theme-text-primary)]">
          <ImageWrapper
            src={platter.image}
            alt={getLocalizedName(platter)}
            className="w-full h-full"
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-text-primary)] via-[var(--theme-text-primary)]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-text-primary)]/30 to-transparent" />

          {/* Availability Badge */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <span
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-medium tracking-wide backdrop-blur-md ${
                platter.final_availability
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "bg-gray-500/15 text-gray-400 border border-gray-500/20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  platter.final_availability
                    ? "theme-dot-success"
                    : "theme-dot-muted"
                }`}
                style={
                  platter.final_availability
                    ? { animation: "pulseGlow 2s ease-in-out infinite" }
                    : {}
                }
              />
              {platter.final_availability
                ? t("labels.available")
                : t("labels.unavailable")}
            </span>
          </div>

          {/* Price floating on image */}
          <div className="absolute bottom-6 left-4 sm:bottom-8 sm:left-6">
            <div style={{ animation: "slideUp 0.8s ease-out 0.3s both" }}>
              <p className="text-[var(--theme-secondary)]/50 text-[10px] sm:text-xs tracking-[0.2em] uppercase mb-1">
                {t("labels.per_platter")}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-[var(--theme-secondary)] text-sm sm:text-base tracking-wider">
                  {t("labels.afn")}
                </span>
                <span className="text-white text-3xl sm:text-4xl md:text-5xl font-light tracking-wide">
                  {parseFloat(platter.price).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Items count badge on image */}
          {platter.items && platter.items.length > 0 && (
            <div className="absolute bottom-6 right-4 sm:bottom-8 sm:right-6">
              <div
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--theme-text-primary)]/70 backdrop-blur-md border border-[var(--theme-secondary)]/15"
                style={{ animation: "slideUp 0.8s ease-out 0.5s both" }}
              >
                <ListChecks className="w-4 h-4 text-[var(--theme-secondary)]" />
                <span className="text-white text-xs sm:text-sm font-light">
                  {platter.items.length}{" "}
                  {platter.items.length === 1
                    ? t("labels.item")
                    : t("labels.items")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          CONTENT BODY
      ══════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div
          className="space-y-8"
          style={{ animation: "fadeInUp 0.6s ease-out 0.2s both" }}
        >
          {/* ────── Title & Description ────── */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-wide mb-4">
              {getLocalizedName(platter)}
            </h2>
            <div className="h-[1px] w-20 bg-gradient-to-r from-[var(--theme-secondary)]/50 to-transparent mb-4" />
            {getLocalizedDescription(platter) ? (
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light max-w-2xl">
                {getLocalizedDescription(platter)}
              </p>
            ) : (
              <p className="text-gray-600 italic text-sm font-light">
                {t("labels.platter_description_placeholder")}
              </p>
            )}
          </div>

          {/* ────── What's Inside ────── */}
          {platter.items && platter.items.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-[var(--theme-secondary)]/10 flex items-center justify-center">
                  <ListChecks className="w-4 h-4 text-[var(--theme-secondary)]" />
                </div>
                <h3 className="text-lg sm:text-xl font-light text-white tracking-wide">
                  {t("labels.whats_inside")}
                </h3>
              </div>

              <div className="space-y-2.5">
                {platter.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="platter-item-card flex items-center justify-between glass-morphism border border-[var(--theme-secondary)]/5 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4"
                    style={{
                      animation: `slideInRight 0.5s ease-out ${0.08 * index}s both`,
                    }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Quantity circle */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[var(--theme-secondary)] to-[var(--theme-primary-hover)] flex items-center justify-center flex-shrink-0">
                        <span className="text-[var(--theme-text-primary)] font-medium text-xs sm:text-sm">
                          {item.quantity}×
                        </span>
                      </div>
                      {/* Item name */}
                      <span className="font-light text-white text-sm sm:text-base tracking-wide">
                        {getLocalizedItemName(item)}
                      </span>
                    </div>
                    <UtensilsCrossed className="w-4 h-4 text-[var(--theme-secondary)]/25 flex-shrink-0" />
                  </div>
                ))}
              </div>

              {/* Individual cost note */}
              {platter.total_cost && (
                <div className="mt-5 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--theme-secondary)]/5 bg-[var(--theme-text-primary)]/40">
                    <span className="text-[10px] sm:text-xs text-gray-500 tracking-wide">
                      {t("labels.individual_cost")}:
                    </span>
                    <span className="text-[10px] sm:text-xs text-[var(--theme-secondary)]/60 font-light">
                      {t("labels.afn")}{" "}
                      {parseFloat(platter.total_cost).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom decorative divider */}
          <div className="flex items-center justify-center gap-3 py-2 select-none">
            <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[var(--theme-secondary)]/20" />
            <Sparkles
              className="w-4 h-4 text-[var(--theme-secondary)]/30"
              style={{ animation: "float 4s ease-in-out infinite" }}
            />
            <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[var(--theme-secondary)]/20" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          STICKY ADD-TO-CART BAR
      ══════════════════════════════════════ */}
      {platter.final_availability && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--theme-text-primary)]/95 backdrop-blur-2xl border-t border-[var(--theme-secondary)]/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3 sm:gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center bg-[var(--theme-text-primary)] border border-[var(--theme-secondary)]/10 rounded-full p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[var(--theme-secondary)]/10 hover:bg-[var(--theme-secondary)]/10 flex items-center justify-center transition-all text-[var(--theme-secondary)] disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span
                className="w-10 sm:w-12 text-center font-medium text-white text-lg"
                style={added ? { animation: "cartBounce 0.3s ease-out" } : {}}
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full btn-gold flex items-center justify-center active:scale-90"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3.5 sm:py-4 rounded-2xl font-medium text-sm sm:text-base tracking-wide flex items-center justify-center gap-2.5 transition-all duration-500 active:scale-[0.98] ${
                added
                  ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                  : "btn-gold shadow-lg shadow-[var(--theme-secondary)]/10"
              }`}
              style={added ? { animation: "cartBounce 0.4s ease-out" } : {}}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>{t("labels.added_to_cart")}</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    {t("labels.add_to_cart")} —
                  </span>
                  <span>
                    {t("labels.afn")} {totalPrice}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          UNAVAILABLE NOTICE
      ══════════════════════════════════════ */}
      {!platter.final_availability && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--theme-text-primary)]/95 backdrop-blur-2xl border-t border-[var(--theme-secondary)]/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
            <p className="text-gray-400 font-light text-sm tracking-wide">
              {t("labels.platter_unavailable_notice")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
