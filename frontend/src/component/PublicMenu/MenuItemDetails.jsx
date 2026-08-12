import React, { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Check,
  MessageSquare,
  UtensilsCrossed,
  Sparkles,
  ShoppingBag,
  ChevronLeft,
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
export default function MenuItemDetails() {
  const { id, slug } = useParams();
  const [itemDetails, setItemDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Helper to get localized name
  const getLocalizedName = (item) => {
    if (!item) return "";
    if (i18n.language === "fa") return item.name_dari || item.name;
    if (i18n.language === "ps") return item.name_pashto || item.name;
    return item.name;
  };

  // Helper to get localized description
  const getLocalizedDescription = (item) => {
    if (!item) return "";
    if (i18n.language === "fa")
      return item.description_dari || item.description;
    if (i18n.language === "ps")
      return item.description_pashto || item.description;
    return item.description;
  };

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await instance.get(`/menu/public/${slug}/menu-items/${id}/`);
      setItemDetails(res.data);
    } catch (err) {
      console.error(err);
      setError(t("labels.item_not_found_desc"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchItemDetails();
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

    const existing = cart.find((i) => i.id === itemDetails.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: itemDetails.id,
        name: itemDetails.name,
        name_dari: itemDetails.name_dari,
        name_pashto: itemDetails.name_pashto,
        price: parseFloat(itemDetails.price),
        image: itemDetails.image,
        quantity,
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
            {t("labels.loading_item")}
          </ShimmerText>
        </div>
      </div>
    );
  }

  /* ────── ERROR ────── */
  if (error || !itemDetails) {
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
            {t("labels.item_not_found")}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {error || t("labels.item_not_found_desc")}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchItemDetails}
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

  const avgRating =
    itemDetails.reviews && itemDetails.reviews.length > 0
      ? (
          itemDetails.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
          itemDetails.reviews.length
        ).toFixed(1)
      : null;

  const totalPrice = (parseFloat(itemDetails.price) * quantity).toFixed(2);

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

        .input-luxury:focus {
          box-shadow: 0 0 0 1px rgb(var(--theme-secondary-rgb) / 0.3), 0 0 20px rgb(var(--theme-secondary-rgb) / 0.1);
          border-color: rgb(var(--theme-secondary-rgb) / 0.4);
        }

        .gold-glow {
          box-shadow: 0 0 30px rgb(var(--theme-secondary-rgb) / 0.1), 0 0 60px rgb(var(--theme-secondary-rgb) / 0.05);
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
              {getLocalizedName(itemDetails)}
            </h1>
            <p className="text-[10px] text-[var(--theme-secondary)]/40 tracking-[0.2em] uppercase">
              {t("labels.back_to_menu")}
            </p>
          </div>
          {avgRating && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--theme-secondary)]/10 bg-[var(--theme-text-primary)]/60">
              <Star className="w-3.5 h-3.5 fill-[var(--theme-secondary)] text-[var(--theme-secondary)]" />
              <span className="text-white text-sm font-light">{avgRating}</span>
              <span className="text-gray-500 text-[10px]">
                ({itemDetails.reviews.length})
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════
          HERO IMAGE
      ══════════════════════════════════════ */}
      <div className="relative" style={{ animation: "fadeIn 0.8s ease-out" }}>
        <div className="relative h-64 sm:h-80 md:h-[28rem] overflow-hidden bg-[var(--theme-text-primary)]">
          <ImageWrapper
            src={itemDetails.image}
            alt={getLocalizedName(itemDetails)}
            className="w-full h-full"
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-text-primary)] via-[var(--theme-text-primary)]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-text-primary)]/30 to-transparent" />

          {/* Availability Badge */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <span
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-medium tracking-wide backdrop-blur-md ${
                itemDetails.final_availability
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "bg-gray-500/15 text-gray-400 border border-gray-500/20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  itemDetails.final_availability
                    ? "theme-dot-success"
                    : "theme-dot-muted"
                }`}
                style={
                  itemDetails.final_availability
                    ? { animation: "pulseGlow 2s ease-in-out infinite" }
                    : {}
                }
              />
              {itemDetails.final_availability
                ? t("labels.available")
                : t("labels.unavailable")}
            </span>
          </div>

          {/* Price floating on image */}
          <div className="absolute bottom-6 left-4 sm:bottom-8 sm:left-6">
            <div style={{ animation: "slideUp 0.8s ease-out 0.3s both" }}>
              <p className="text-[var(--theme-secondary)]/50 text-[10px] sm:text-xs tracking-[0.2em] uppercase mb-1">
                {t("labels.per_piece")}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-[var(--theme-secondary)] text-sm sm:text-base tracking-wider">
                  {t("labels.afn")}
                </span>
                <span className="text-white text-3xl sm:text-4xl md:text-5xl font-light tracking-wide">
                  {parseFloat(itemDetails.price).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
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
              {getLocalizedName(itemDetails)}
            </h2>
            <div className="h-[1px] w-20 bg-gradient-to-r from-[var(--theme-secondary)]/50 to-transparent mb-4" />
            {getLocalizedDescription(itemDetails) ? (
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light max-w-2xl">
                {getLocalizedDescription(itemDetails)}
              </p>
            ) : (
              <p className="text-gray-600 italic text-sm font-light">
                {t("labels.description_placeholder")}
              </p>
            )}
          </div>

          {/* ────── Reviews Section ────── */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-[var(--theme-secondary)]/10 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-[var(--theme-secondary)]" />
              </div>
              <h3 className="text-lg sm:text-xl font-light text-white tracking-wide">
                {t("labels.customer_reviews")}
              </h3>
              {itemDetails.reviews.length > 0 && (
                <span className="text-xs text-gray-500 bg-[var(--theme-text-primary)] px-2.5 py-1 rounded-full border border-[var(--theme-secondary)]/5">
                  {itemDetails.reviews.length} {t("labels.reviews_count")}
                </span>
              )}
            </div>

            {itemDetails.reviews.length === 0 ? (
              <div
                className="glass-morphism border border-[var(--theme-secondary)]/5 rounded-2xl p-8 text-center"
                style={{ animation: "fadeIn 0.5s ease-out 0.4s both" }}
              >
                <div
                  className="w-14 h-14 mx-auto mb-4 rounded-full border border-[var(--theme-secondary)]/10 flex items-center justify-center"
                  style={{ animation: "float 5s ease-in-out infinite" }}
                >
                  <MessageSquare className="w-6 h-6 text-[var(--theme-secondary)]/20" />
                </div>
                <p className="text-gray-500 text-sm font-light">
                  {t("labels.no_reviews_yet")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {itemDetails.reviews.map((review, index) => (
                  <div
                    key={review.id}
                    className="glass-morphism border border-[var(--theme-secondary)]/5 hover:border-[var(--theme-secondary)]/15 rounded-2xl p-4 sm:p-5 transition-all duration-300"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${0.1 * index}s both`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--theme-secondary)] to-[var(--theme-primary-hover)] flex items-center justify-center text-[var(--theme-text-primary)] font-medium text-sm">
                          {(review.user_name || review.user || "A")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span className="font-light text-white text-sm tracking-wide">
                          {review.user_name ||
                            review.user ||
                            t("labels.anonymous")}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (review.rating || 0)
                                ? "fill-[var(--theme-secondary)] text-[var(--theme-secondary)]"
                                : "text-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-400 text-sm leading-relaxed font-light">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          STICKY ADD-TO-CART BAR
      ══════════════════════════════════════ */}
      {itemDetails.final_availability && (
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
      {!itemDetails.final_availability && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--theme-text-primary)]/95 backdrop-blur-2xl border-t border-[var(--theme-secondary)]/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
            <p className="text-gray-400 font-light text-sm tracking-wide">
              {t("labels.item_unavailable_notice")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
