import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Search,
  X,
  Loader2,
  AlertCircle,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Star,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import instance from "../../api/axiosInstance";

/* ═══════════════════════════════════════════
   FLOATING GOLD PARTICLES (Live Objects)
═══════════════════════════════════════════ */
const FloatingParticles = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.4 + 0.1,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle, rgba(212,168,83,${p.opacity}) 0%, rgba(212,168,83,0) 70%)`,
            animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      {/* Large ambient glow orbs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          top: "-10%",
          right: "-10%",
          background:
            "radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)",
          animation: "pulseGlow 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          bottom: "-15%",
          left: "-15%",
          background:
            "radial-gradient(circle, rgba(139,90,43,0.05) 0%, transparent 70%)",
          animation: "pulseGlow 12s ease-in-out 3s infinite",
        }}
      />
    </div>
  );
};

/* ═══════════════════════════════════════════
   ANIMATED ORNAMENTAL DIVIDER
═══════════════════════════════════════════ */
const OrnamentalDivider = () => (
  <div className="flex items-center justify-center gap-3 py-4 sm:py-6 select-none">
    <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#d4a853]/40" />
    <div className="relative">
      <Sparkles
        className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4a853]"
        style={{ animation: "shimmerIcon 3s ease-in-out infinite" }}
      />
      <div
        className="absolute inset-0 blur-md bg-[#d4a853]/30 rounded-full"
        style={{ animation: "shimmerIcon 3s ease-in-out infinite" }}
      />
    </div>
    <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#d4a853]/40" />
  </div>
);

/* ═══════════════════════════════════════════
   SCROLL REVEAL HOOK
═══════════════════════════════════════════ */
function useScrollReveal() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

/* ═══════════════════════════════════════════
   ANIMATED CARD WRAPPER
═══════════════════════════════════════════ */
const RevealCard = ({ children, delay = 0, className = "" }) => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "translateY(0) scale(1)"
          : "translateY(30px) scale(0.97)",
        transition: `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════
   IMAGE WRAPPER
═══════════════════════════════════════════ */
const ImageWrapper = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center`}
      >
        <UtensilsCrossed className="w-8 h-8 text-[#d4a853]/30" />
      </div>
    );
  }

  const fullUrl = src.startsWith("http")
    ? src
    : `${import.meta.env.VITE_MEDIA_URL || ""}${src.replace(/\/$/g, "")}`;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] animate-pulse" />
      )}
      <img
        src={fullUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
        }`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          e.target.onerror = null;
          setLoaded(true);
          e.target.src =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23111'/%3E%3Ctext x='50%25' y='50%25' font-family='serif' font-size='14' fill='%23d4a85366' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
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
    className={`inline-block bg-gradient-to-r from-[#d4a853] via-[#f5e6a3] to-[#d4a853] bg-[length:200%_100%] bg-clip-text text-transparent ${className}`}
    style={{ animation: "shimmerText 4s linear infinite" }}
  >
    {children}
  </span>
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function PublicMenu() {
  const { slug } = useParams();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [activeCategoryIndicator, setActiveCategoryIndicator] = useState({
    left: 0,
    width: 0,
  });
  const categoryRefs = useRef({});
  const categoriesContainerRef = useRef(null);
  const navigate = useNavigate();

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(`cart_${slug}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedItemId, setAddedItemId] = useState(null);

  // View mode
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem(`public_menu_view_${slug}`) || "grid";
    } catch {
      return "grid";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`public_menu_view_${slug}`, viewMode);
    } catch {}
  }, [viewMode, slug]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await instance.get(`/menu/public/${slug}/categories/`);
      const categoriesData = res.data || [];

      const allCategory = {
        id: "all",
        name: "All",
        description: "Explore our complete curated collection",
        menu_items: categoriesData.flatMap((c) => c.menu_items || []),
        platters: categoriesData.flatMap((c) => c.platters || []),
      };

      setCategories([allCategory, ...categoriesData]);
    } catch (err) {
      console.error("Error fetching menu:", err);
      setError("Unable to load menu. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantInfo = async () => {
    try {
      const response = await instance.get(
        `/system/restaurant-info/slug/${slug}/`,
      );
      setRestaurantInfo(response.data);
    } catch (error) {
      console.error("Error fetching restaurant info:", error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchRestaurantInfo();
    setTimeout(() => setHeroVisible(true), 100);
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
  }, [cart, slug]);

  // Update category indicator position
  useEffect(() => {
    if (selectedCategory && categoryRefs.current[selectedCategory.id]) {
      const el = categoryRefs.current[selectedCategory.id];
      const container = categoriesContainerRef.current;
      if (el && container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setActiveCategoryIndicator({
          left: elRect.left - containerRect.left + container.scrollLeft,
          width: elRect.width,
        });
      }
    }
  }, [selectedCategory, categories]);

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          image: item.image,
          quantity: 1,
        },
      ];
    });
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 600);
  }, []);

  const incrementItem = (id) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
    );
  };

  const decrementItem = (id) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setCart([]);

  const getCategoryCount = (category) =>
    (category.menu_items?.length || 0) + (category.platters?.length || 0);

  const getItemQuantity = (id) => cart.find((i) => i.id === id)?.quantity || 0;

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
    return { subtotal, total: subtotal, itemCount };
  }, [cart]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    const menuItems = selectedCategory.menu_items || [];
    const platters = selectedCategory.platters || [];
    const allItems = [
      ...menuItems.map((i) => ({ ...i, type: "menu_item" })),
      ...platters.map((p) => ({ ...p, type: "platter" })),
    ];
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
  }, [selectedCategory, searchQuery]);

  // Restaurant logo URL helper
  const getLogoUrl = (logo) => {
    if (!logo) return null;
    return logo.startsWith("http")
      ? logo
      : `${import.meta.env.VITE_MEDIA_URL || ""}${logo}`;
  };

  /* ────── LOADING ────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
        <FloatingParticles />
        <div
          className="text-center relative z-10"
          style={{
            opacity: 1,
            animation: "fadeInUp 1s ease-out",
          }}
        >
          <div className="relative mx-auto mb-8 w-20 h-20">
            <div
              className="absolute inset-0 rounded-full border-2 border-[#d4a853]/20"
              style={{ animation: "spinSlow 3s linear infinite" }}
            />
            <div
              className="absolute inset-2 rounded-full border-2 border-t-[#d4a853] border-r-transparent border-b-transparent border-l-transparent"
              style={{ animation: "spinSlow 1.5s linear infinite" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#d4a853]" />
            </div>
          </div>
          <ShimmerText className="text-lg sm:text-xl font-light tracking-[0.3em] uppercase">
            Preparing Your Experience
          </ShimmerText>
        </div>
      </div>
    );
  }

  /* ────── ERROR ────── */
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
        <FloatingParticles />
        <div
          className="bg-[#111]/80 backdrop-blur-xl rounded-3xl border border-[#d4a853]/10 p-8 sm:p-12 max-w-md w-full text-center relative z-10"
          style={{ animation: "fadeInUp 0.6s ease-out" }}
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-light text-white mb-2 tracking-wide">
            Menu Unavailable
          </h2>
          <p className="text-gray-500 text-sm mb-8">{error}</p>
          <button
            onClick={fetchMenuItems}
            className="px-8 py-3 bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-[#0a0a0a] rounded-full font-medium text-sm tracking-wide hover:shadow-lg hover:shadow-[#d4a853]/20 transition-all active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ────── MAIN RENDER ────── */
  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-28 sm:pb-8 relative overflow-x-hidden">
      {/* Global CSS Keyframes */}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(30px, -60px) scale(1.2); opacity: 0.6; }
          50% { transform: translate(-20px, -120px) scale(0.8); opacity: 0.2; }
          75% { transform: translate(40px, -60px) scale(1.1); opacity: 0.5; }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
        @keyframes shimmerText {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes shimmerIcon {
          0%, 100% { opacity: 0.6; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(5deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(212,168,83,0.1); }
          50% { border-color: rgba(212,168,83,0.3); }
        }
        @keyframes cartBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes ripple {
          0% { transform: scale(0); opacity: 0.6; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes lineExpand {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(40px) scale(0.95); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        .glass-card {
          background: rgba(17,17,17,0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(212,168,83,0.08);
        }
        .glass-card:hover {
          border-color: rgba(212,168,83,0.2);
          background: rgba(17,17,17,0.8);
        }
        .gold-glow {
          box-shadow: 0 0 30px rgba(212,168,83,0.1), 0 0 60px rgba(212,168,83,0.05);
        }
        .text-shadow-gold {
          text-shadow: 0 0 40px rgba(212,168,83,0.3);
        }

        .menu-card-hover {
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .menu-card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212,168,83,0.08);
          border-color: rgba(212,168,83,0.25);
        }
        .menu-card-hover:hover .card-image {
          transform: scale(1.08);
        }
        .card-image {
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .category-pill {
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .category-pill.active {
          background: linear-gradient(135deg, #d4a853, #b8922e);
          color: #0a0a0a;
          box-shadow: 0 4px 20px rgba(212,168,83,0.3);
        }

        .hero-section {
          background: linear-gradient(180deg, rgba(212,168,83,0.03) 0%, transparent 100%);
        }

        .cart-drawer-panel {
          background: linear-gradient(180deg, #111 0%, #0a0a0a 100%);
        }

        .input-luxury:focus {
          box-shadow: 0 0 0 1px rgba(212,168,83,0.3), 0 0 20px rgba(212,168,83,0.1);
          border-color: rgba(212,168,83,0.4);
        }

        .btn-gold {
          background: linear-gradient(135deg, #d4a853, #b8922e);
          color: #0a0a0a;
          transition: all 0.3s ease;
        }
        .btn-gold:hover {
          box-shadow: 0 4px 25px rgba(212,168,83,0.4);
          transform: translateY(-1px);
        }
        .btn-gold:active {
          transform: scale(0.97);
        }

        .availability-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
        .availability-dot.available {
          background: #4ade80;
          box-shadow: 0 0 8px rgba(74,222,128,0.5);
          animation: pulseGlow 2s ease-in-out infinite;
        }
        .availability-dot.unavailable {
          background: #6b7280;
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
      `}</style>

      <FloatingParticles />

      {/* ══════════════════════════════════════
          HERO / RESTAURANT INFO SECTION
      ══════════════════════════════════════ */}
      <section className="hero-section relative pt-8 sm:pt-12 pb-6 sm:pb-10 px-4">
        <div className="max-w-7xl mx-auto relative z-10">
          <div
            className="text-center"
            style={{
              opacity: heroVisible ? 1 : 0,
              animation: heroVisible
                ? "heroReveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards"
                : "none",
            }}
          >
            {/* Restaurant Logo */}
            <div className="mb-6 flex justify-center">
              <div
                className="relative"
                style={{ animation: "float 6s ease-in-out infinite" }}
              >
                <div className="absolute -inset-4 rounded-full bg-[#d4a853]/5 blur-xl" />
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full border-2 border-[#d4a853]/30 overflow-hidden bg-[#111] flex items-center justify-center gold-glow">
                  {restaurantInfo?.logo ? (
                    <img
                      src={getLogoUrl(restaurantInfo.logo)}
                      alt={restaurantInfo.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UtensilsCrossed className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4a853]/50" />
                  )}
                </div>
                {/* Decorative ring */}
                <div
                  className="absolute -inset-2 rounded-full border border-[#d4a853]/10"
                  style={{ animation: "spinSlow 20s linear infinite" }}
                >
                  <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-[#d4a853] rounded-full -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Restaurant Name */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.15em] uppercase mb-3 text-white text-shadow-gold">
              {restaurantInfo?.name || (
                <ShimmerText>
                  {slug
                    ?.replace(/-/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </ShimmerText>
              )}
            </h1>

            {/* Slogan */}
            {restaurantInfo?.slogan && (
              <p
                className="text-[#d4a853]/60 text-sm sm:text-base tracking-[0.3em] uppercase font-light mb-2"
                style={{ animation: "fadeIn 1.5s ease-out 0.5s both" }}
              >
                {restaurantInfo.slogan}
              </p>
            )}

            <OrnamentalDivider />

            {/* Subtitle */}
            <p
              className="text-gray-500 text-xs sm:text-sm tracking-[0.2em] uppercase"
              style={{ animation: "fadeIn 1.5s ease-out 0.8s both" }}
            >
              Our Curated Menu
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STICKY HEADER / TOOLBAR
      ══════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-[#d4a853]/5">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Compact Logo */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#d4a853]/20 overflow-hidden bg-[#111] flex items-center justify-center flex-shrink-0">
                {restaurantInfo?.logo ? (
                  <img
                    src={getLogoUrl(restaurantInfo.logo)}
                    alt="logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UtensilsCrossed className="w-4 h-4 text-[#d4a853]/50" />
                )}
              </div>
              <div className="hidden sm:flex flex-col min-w-0">
                <span className="text-white text-sm font-light tracking-[0.1em] truncate">
                  {restaurantInfo?.name || slug?.replace(/-/g, " ")}
                </span>
                <span className="text-[#d4a853]/40 text-[10px] tracking-[0.2em] uppercase truncate">
                  {restaurantInfo?.slogan || "Menu"}
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4a853]/30" />
              <input
                type="text"
                placeholder="Search our menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-luxury w-full pl-9 sm:pl-11 pr-4 py-2 sm:py-2.5 bg-[#111]/60 border border-[#d4a853]/10 rounded-full text-white placeholder-gray-600 text-sm focus:outline-none transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#d4a853] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Toggle + Cart */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center bg-[#111]/60 border border-[#d4a853]/10 rounded-full p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-[#d4a853] text-[#0a0a0a]"
                      : "text-gray-500 hover:text-[#d4a853]"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-[#d4a853] text-[#0a0a0a]"
                      : "text-gray-500 hover:text-[#d4a853]"
                  }`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 border border-[#d4a853]/20 text-[#d4a853] rounded-full hover:bg-[#d4a853]/10 transition-all duration-300 active:scale-95"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden md:inline font-light text-sm tracking-wide">
                  Cart
                </span>
                {cartTotals.itemCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#d4a853] to-[#b8922e] text-[#0a0a0a] text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
                    style={{ animation: "cartBounce 0.4s ease-out" }}
                  >
                    {cartTotals.itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          CATEGORY NAVIGATION
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6">
        <div className="relative">
          <div
            ref={categoriesContainerRef}
            className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          >
            {categories.map((category) => {
              const isActive = selectedCategory?.id === category.id;
              return (
                <button
                  key={category.id}
                  ref={(el) => (categoryRefs.current[category.id] = el)}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-pill snap-start flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full whitespace-nowrap text-xs sm:text-sm font-light tracking-wide border ${
                    isActive
                      ? "active border-[#d4a853]/40"
                      : "bg-transparent text-gray-500 border-[#d4a853]/5 hover:border-[#d4a853]/15 hover:text-gray-300"
                  }`}
                >
                  <span>{category.name}</span>
                  {getCategoryCount(category) > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-[#0a0a0a]/20 text-[#0a0a0a]/70"
                          : "bg-[#d4a853]/5 text-gray-600"
                      }`}
                    >
                      {getCategoryCount(category)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Animated underline indicator */}
          <div
            className="absolute bottom-2 h-[2px] bg-gradient-to-r from-transparent via-[#d4a853] to-transparent rounded-full transition-all duration-500 ease-out"
            style={{
              left: `${activeCategoryIndicator.left}px`,
              width: `${activeCategoryIndicator.width}px`,
              opacity: activeCategoryIndicator.width > 0 ? 1 : 0,
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 relative z-10">
        {/* Category Title */}
        {selectedCategory && (
          <div
            className="mb-6 sm:mb-8"
            style={{ animation: "fadeInUp 0.5s ease-out" }}
          >
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl sm:text-3xl font-light text-white tracking-wide">
                {selectedCategory.name}
              </h2>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-[#d4a853]/20 to-transparent" />
            </div>
            {selectedCategory.description && (
              <p className="text-gray-500 text-sm font-light tracking-wide">
                {selectedCategory.description}
              </p>
            )}
          </div>
        )}

        {/* Mobile View Toggle */}
        <div className="flex sm:hidden items-center justify-end mb-4">
          <div className="flex items-center bg-[#111]/60 border border-[#d4a853]/10 rounded-full p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-full transition-all ${
                viewMode === "grid"
                  ? "bg-[#d4a853] text-[#0a0a0a]"
                  : "text-gray-500"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-full transition-all ${
                viewMode === "list"
                  ? "bg-[#d4a853] text-[#0a0a0a]"
                  : "text-gray-500"
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ════ MENU ITEMS ════ */}
        {filteredItems.length > 0 ? (
          viewMode === "grid" ? (
            /* ────── GRID VIEW ────── */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {filteredItems.map((item, index) => {
                const qty = getItemQuantity(item.id);
                const justAdded = addedItemId === item.id;
                return (
                  <RevealCard key={item.id} delay={Math.min(index * 0.05, 0.3)}>
                    <div
                      onClick={() => {
                        if (item.type === "platter") {
                          navigate(`/menu/${slug}/platter/${item.id}/`);
                        } else {
                          navigate(`/menu/${slug}/item/${item.id}/`);
                        }
                      }}
                      className="glass-card menu-card-hover rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer group flex flex-col relative"
                      style={{
                        animation: justAdded
                          ? "cartBounce 0.4s ease-out"
                          : "none",
                      }}
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] sm:aspect-[4/3] overflow-hidden bg-[#111]">
                        <ImageWrapper
                          src={item.image}
                          alt={item.name}
                          className="card-image w-full h-full"
                        />
                        {/* Image overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent" />

                        {/* Availability badge */}
                        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3">
                          <span
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-medium tracking-wide backdrop-blur-md ${
                              item.final_availability
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                : "bg-gray-500/15 text-gray-400 border border-gray-500/20"
                            }`}
                          >
                            <span
                              className={`availability-dot ${
                                item.final_availability
                                  ? "available"
                                  : "unavailable"
                              }`}
                            />
                            {item.final_availability
                              ? "Available"
                              : "Unavailable"}
                          </span>
                        </div>

                        {/* Type badge */}
                        {item.type === "platter" && (
                          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
                            <span className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-medium tracking-wide bg-[#d4a853]/15 text-[#d4a853] border border-[#d4a853]/20 backdrop-blur-md">
                              Platter
                            </span>
                          </div>
                        )}

                        {/* Price on image */}
                        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                          <span className="text-white text-base sm:text-xl md:text-2xl font-light tracking-wide">
                            <span className="text-[#d4a853] text-xs sm:text-sm mr-1">
                              AFN
                            </span>
                            {parseFloat(item.price).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col">
                        <h3 className="text-sm sm:text-base md:text-lg font-light text-white leading-snug line-clamp-2 mb-3 group-hover:text-[#d4a853] transition-colors duration-300">
                          {item.name}
                        </h3>

                        <div className="mt-auto">
                          {qty === 0 ? (
                            <button
                              disabled={!item.final_availability}
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(item);
                              }}
                              className="btn-gold w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            >
                              <span>
                                {item.final_availability
                                  ? "Add to Order"
                                  : "Unavailable"}
                              </span>
                              {item.final_availability && (
                                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              )}
                            </button>
                          ) : (
                            <div className="flex items-center justify-between bg-[#111] border border-[#d4a853]/15 rounded-xl p-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  decrementItem(item.id);
                                }}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-[#d4a853]/10 text-[#d4a853] flex items-center justify-center transition-all active:scale-90"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span
                                className="text-white font-medium text-sm sm:text-lg"
                                style={{
                                  animation: justAdded
                                    ? "cartBounce 0.3s ease-out"
                                    : "none",
                                }}
                              >
                                {qty}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  incrementItem(item.id);
                                }}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg btn-gold flex items-center justify-center active:scale-90"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hover gold border glow */}
                      <div
                        className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          boxShadow: "inset 0 0 30px rgba(212,168,83,0.05)",
                        }}
                      />
                    </div>
                  </RevealCard>
                );
              })}
            </div>
          ) : (
            /* ────── LIST VIEW ────── */
            <div className="flex flex-col gap-3 sm:gap-4">
              {filteredItems.map((item, index) => {
                const qty = getItemQuantity(item.id);
                const justAdded = addedItemId === item.id;
                return (
                  <RevealCard key={item.id} delay={Math.min(index * 0.04, 0.2)}>
                    <div
                      onClick={() => {
                        if (item.type === "platter") {
                          navigate(`/menu/${slug}/platter/${item.id}/`);
                        } else {
                          navigate(`/menu/${slug}/item/${item.id}/`);
                        }
                      }}
                      className="glass-card menu-card-hover rounded-2xl overflow-hidden flex cursor-pointer group"
                      style={{
                        animation: justAdded
                          ? "cartBounce 0.4s ease-out"
                          : "none",
                      }}
                    >
                      {/* Image */}
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 flex-shrink-0 overflow-hidden bg-[#111]">
                        <ImageWrapper
                          src={item.image}
                          alt={item.name}
                          className="card-image w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111]/50" />

                        {/* Availability dot */}
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                          <span
                            className={`availability-dot ${
                              item.final_availability
                                ? "available"
                                : "unavailable"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3 sm:p-4 md:p-5 flex flex-col min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm sm:text-base md:text-lg font-light text-white leading-snug line-clamp-2 group-hover:text-[#d4a853] transition-colors duration-300">
                            {item.name}
                          </h3>
                          {item.type === "platter" && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-[#d4a853]/10 text-[#d4a853] border border-[#d4a853]/15 flex-shrink-0">
                              Platter
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1 sm:line-clamp-2 mb-2 font-light">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-auto flex items-center justify-between pt-2 border-t border-[#d4a853]/5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-[#d4a853] text-[10px] sm:text-xs tracking-wider">
                              AFN
                            </span>
                            <span className="text-white text-base sm:text-lg md:text-xl font-light">
                              {parseFloat(item.price).toFixed(2)}
                            </span>
                          </div>

                          {qty === 0 ? (
                            <button
                              disabled={!item.final_availability}
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(item);
                              }}
                              className="btn-gold px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {item.final_availability ? "Add" : "N/A"}
                              {item.final_availability && (
                                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              )}
                            </button>
                          ) : (
                            <div className="flex items-center bg-[#111] border border-[#d4a853]/15 rounded-full p-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  decrementItem(item.id);
                                }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-[#d4a853]/10 text-[#d4a853] flex items-center justify-center transition-all active:scale-90"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-7 sm:w-8 text-center text-white text-sm font-medium">
                                {qty}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  incrementItem(item.id);
                                }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full btn-gold flex items-center justify-center active:scale-90"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </RevealCard>
                );
              })}
            </div>
          )
        ) : (
          /* ────── EMPTY STATE ────── */
          <div
            className="text-center py-20 sm:py-28"
            style={{ animation: "fadeIn 0.5s ease-out" }}
          >
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full border border-[#d4a853]/10 flex items-center justify-center"
              style={{ animation: "float 4s ease-in-out infinite" }}
            >
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4a853]/20" />
            </div>
            <h3 className="text-lg sm:text-xl font-light text-white/60 mb-2 tracking-wide">
              No items found
            </h3>
            <p className="text-gray-600 text-sm font-light">
              Try adjusting your search or selecting a different category
            </p>
          </div>
        )}

        {/* Bottom ornament */}
        {filteredItems.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <OrnamentalDivider />
            <p className="text-center text-gray-600 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-light">
              End of Menu
            </p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          MOBILE STICKY CART BAR
      ══════════════════════════════════════ */}
      {cartTotals.itemCount > 0 && (
        <div
          className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-3"
          style={{
            background:
              "linear-gradient(to top, #0a0a0a 60%, transparent 100%)",
            animation: "slideDown 0.4s ease-out",
          }}
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between btn-gold px-5 py-3.5 rounded-2xl shadow-2xl active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-[#0a0a0a] text-[#d4a853] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-[#d4a853]/30">
                  {cartTotals.itemCount}
                </span>
              </div>
              <span className="font-medium text-sm tracking-wide">
                View Cart
              </span>
            </div>
            <span className="font-medium text-sm tracking-wide">
              AFN {cartTotals.total.toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════
          CART DRAWER OVERLAY
      ══════════════════════════════════════ */}
      <div
        onClick={() => setIsCartOpen(false)}
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-400 ${
          isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ══════════════════════════════════════
          CART DRAWER PANEL
      ══════════════════════════════════════ */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] md:w-[460px] cart-drawer-panel shadow-2xl shadow-black/50 border-l border-[#d4a853]/10 transform transition-transform duration-400 ease-out flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cart Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-[#d4a853]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4a853] to-[#b8922e] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#0a0a0a]" />
            </div>
            <div>
              <h2 className="text-lg font-light text-white tracking-wide">
                Your Order
              </h2>
              <p className="text-[10px] text-gray-500 tracking-[0.2em] uppercase">
                {cartTotals.itemCount}{" "}
                {cartTotals.itemCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 rounded-full border border-[#d4a853]/10 hover:border-[#d4a853]/30 hover:bg-[#d4a853]/5 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div
                className="w-24 h-24 rounded-full border border-[#d4a853]/10 flex items-center justify-center mb-6"
                style={{ animation: "float 5s ease-in-out infinite" }}
              >
                <ShoppingCart className="w-10 h-10 text-[#d4a853]/20" />
              </div>
              <h3 className="text-lg font-light text-white/60 mb-2 tracking-wide">
                Your cart is empty
              </h3>
              <p className="text-gray-600 text-sm font-light mb-8">
                Browse our menu to discover exceptional dishes
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-gold px-8 py-3 rounded-full text-sm font-medium tracking-wide"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.map((item, index) => (
                <li
                  key={item.id}
                  className="flex gap-3 p-3 bg-[#111]/60 rounded-2xl border border-[#d4a853]/5 hover:border-[#d4a853]/15 transition-all duration-300"
                  style={{
                    animation: `slideInRight 0.4s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                    <ImageWrapper
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-light text-white leading-snug line-clamp-2 text-sm">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-[#d4a853]/70 font-light mt-0.5 mb-2">
                      AFN {item.price.toFixed(2)}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center bg-[#0a0a0a] border border-[#d4a853]/10 rounded-full">
                        <button
                          onClick={() => decrementItem(item.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-[#d4a853]/10 rounded-full text-[#d4a853] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 sm:w-8 text-center text-xs text-white font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => incrementItem(item.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[#d4a853] text-[#0a0a0a] hover:bg-[#e0b85e] rounded-full transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-white text-sm font-light">
                        AFN {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="w-full mt-4 py-3 text-xs text-red-400/60 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all flex items-center justify-center gap-2 tracking-wide"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Items
              </button>
            </ul>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="border-t border-[#d4a853]/10 px-5 sm:px-6 py-5 bg-[#0d0d0d]">
            <div className="flex justify-between items-center mb-5">
              <span className="text-gray-400 text-sm font-light tracking-wide">
                Total
              </span>
              <div className="text-right">
                <span className="text-[#d4a853] text-xs tracking-wider mr-1">
                  AFN
                </span>
                <span className="text-white text-2xl font-light">
                  {cartTotals.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
