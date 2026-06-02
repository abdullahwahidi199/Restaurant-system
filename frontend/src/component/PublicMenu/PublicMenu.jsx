import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  ChevronRight,
  Search,
  Menu as MenuIcon,
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
} from "lucide-react";
import instance from "../../api/axiosInstance";
import MenuItemDetails from "./MenuItemDetails";

// Fallback image component
const ImageWrapper = ({ src, alt, className }) => {
  if (!src) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}
      >
        <span className="text-gray-400 text-xs sm:text-sm">No Image</span>
      </div>
    );
  }

  const fullUrl = src.startsWith("http")
    ? src
    : `${import.meta.env.VITE_MEDIA_URL || ""}${src.replace(/\/$/g, "")}`;

  return (
    <img
      src={fullUrl}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src =
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle'%3EImage not available%3C/text%3E%3C/svg%3E";
      }}
    />
  );
};

export default function PublicMenu() {
  const { slug } = useParams();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // View mode: "grid" | "list"
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

      // Create virtual "All" category
      const allCategory = {
        id: "all",
        name: "All",
        description: "All menu items",
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

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategory(categories[0]); // All category
    }
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
  }, [cart, slug]);

  const addToCart = (item) => {
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
  };

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

  const clearCart = () => {
    setCart([]);
  };

  const getCategoryCount = (category) => {
    const menuCount = category.menu_items?.length || 0;
    const platterCount = category.platters?.length || 0;
    return menuCount + platterCount;
  };

  const getItemQuantity = (id) => {
    const item = cart.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

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

    return allItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
            Menu Not Available
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6">{error}</p>
          <button
            onClick={fetchMenuItems}
            className="bg-orange-600 text-white px-6 py-2.5 rounded-full hover:bg-orange-700 transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 sm:pb-8">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo Section */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br flex items-center justify-center shadow-md flex-shrink-0">
                <img
                  src="/rmsFavicon.png"
                  alt="favicon"
                  className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <img
                    src="/rmsLogo.png"
                    alt="logo"
                    className="h-6 sm:h-8 w-auto object-contain flex-shrink-0"
                  />
                  <span className="text-sm sm:text-lg font-bold tracking-wide truncate">
                    {slug?.charAt(0).toUpperCase() + slug?.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cart Button - Desktop */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hidden md:flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-900 text-white rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-gray-900/20 active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Cart</span>
              {cartTotals.itemCount > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full">
                  {cartTotals.itemCount}
                </span>
              )}
            </button>

            {/* Cart Button - Mobile */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="md:hidden relative flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-gray-900/20 active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartTotals.itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartTotals.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ============ MAIN CONTENT ============ */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Categories - Always visible */}
        <div className="flex gap-2 overflow-x-auto pb-3 sm:pb-4 mb-4 sm:mb-6 scrollbar-hide snap-x snap-mandatory -mx-3 px-3 sm:-mx-4 sm:px-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className={`snap-start flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full whitespace-nowrap transition-all duration-300 text-xs sm:text-sm ${
                selectedCategory?.id === category.id
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span className="font-medium">{category.name}</span>
              {(category.menu_items?.length || 0) +
                (category.platters?.length || 0) >
                0 && (
                <span
                  className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                    selectedCategory?.id === category.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {getCategoryCount(category)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar + View Toggle */}
        <div className="flex gap-2 mb-4 sm:mb-6">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm sm:text-base"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 shadow-sm flex-shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all ${
                viewMode === "grid"
                  ? "bg-gray-900 text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all ${
                viewMode === "list"
                  ? "bg-gray-900 text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <ListIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Category Title */}
        {selectedCategory && (
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
              {selectedCategory.name}
            </h2>
            {selectedCategory.description && (
              <p className="text-xs sm:text-base text-gray-600 max-w-2xl line-clamp-2">
                {selectedCategory.description}
              </p>
            )}
          </div>
        )}

        {/* ============ MENU ITEMS ============ */}
        {filteredItems.length > 0 ? (
          viewMode === "grid" ? (
            // ===== GRID VIEW (Mobile-first: 2 columns) =====
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
              {filteredItems.map((item) => {
                const qty = getItemQuantity(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.type === "platter") {
                        navigate(`/menu/${slug}/platter/${item.id}/`);
                      } else {
                        navigate(`/menu/${slug}/item/${item.id}/`);
                      }
                    }}
                    className="group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col cursor-pointer active:scale-[0.98] sm:active:scale-100"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] sm:h-40 md:h-48 lg:h-56 overflow-hidden bg-gray-100">
                      <ImageWrapper
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
                        <span
                          className={`px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-semibold shadow-sm ${
                            item.final_availability
                              ? "bg-emerald-500/90 text-white"
                              : "bg-gray-500/90 text-white"
                          }`}
                        >
                          {item.final_availability
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2 sm:p-3 md:p-5 flex-1 flex flex-col min-h-0">
                      <h3 className="text-xs sm:text-sm md:text-lg font-bold text-gray-900 leading-tight line-clamp-2 mb-1 sm:mb-2">
                        {item.name}
                      </h3>

                      <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-100">
                        {/* Price */}
                        <div className="flex items-baseline gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                          <span className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900">
                            AFN{" "}
                            <span className="text-xs sm:text-sm md:text-xl">
                              {parseFloat(item.price).toFixed(2)}
                            </span>
                          </span>
                        </div>

                        {/* Add to Cart Button */}
                        {qty === 0 ? (
                          <button
                            disabled={!item.final_availability}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="w-full py-2 sm:py-3 bg-gray-900 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-orange-600 active:scale-95 transition-all duration-200 flex items-center justify-center gap-1 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            <span>
                              {item.final_availability ? "Add" : "Unavailable"}
                            </span>
                            {item.final_availability && (
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-gray-900 rounded-lg sm:rounded-xl p-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                decrementItem(item.id);
                              }}
                              className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95"
                            >
                              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <span className="text-white font-bold text-sm sm:text-lg">
                              {qty}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                incrementItem(item.id);
                              }}
                              className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-colors active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // ===== LIST VIEW =====
            <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
              {filteredItems.map((item) => {
                const qty = getItemQuantity(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.type === "platter") {
                        navigate(`/menu/${slug}/platter/${item.id}/`);
                      } else {
                        navigate(`/menu/${slug}/item/${item.id}/`);
                      }
                    }}
                    className="group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex cursor-pointer active:scale-[0.99] sm:active:scale-100"
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 flex-shrink-0 overflow-hidden bg-gray-100">
                      <ImageWrapper
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
                        <span
                          className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] md:text-xs font-semibold shadow-sm ${
                            item.final_availability
                              ? "bg-emerald-500/90 text-white"
                              : "bg-gray-500/90 text-white"
                          }`}
                        >
                          {item.final_availability
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-2 sm:p-3 md:p-4 flex flex-col min-w-0">
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-tight line-clamp-2 mb-0.5 sm:mb-1">
                        {item.name}
                      </h3>

                      {item.description && (
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-2">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-2 pt-1.5 sm:pt-2 border-t border-gray-100">
                        <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                          <span className="text-sm sm:text-lg md:text-xl font-bold text-gray-900">
                            AFN{" "}
                            <span className="text-xs sm:text-base">
                              {parseFloat(item.price).toFixed(2)}
                            </span>
                          </span>
                        </div>

                        {qty === 0 ? (
                          <button
                            disabled={!item.final_availability}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-orange-600 active:scale-95 transition-all flex items-center gap-1 disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
                          >
                            {item.final_availability ? "Add" : "N/A"}
                            {item.final_availability && (
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center bg-gray-900 rounded-lg sm:rounded-xl p-0.5 sm:p-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                decrementItem(item.id);
                              }}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 sm:w-8 text-center text-white font-bold text-xs sm:text-sm">
                              {qty}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                incrementItem(item.id);
                              }}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-colors active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
              No items found
            </h3>
            <p className="text-gray-500 text-sm">
              Try adjusting your search or category filter
            </p>
          </div>
        )}
      </div>

      {/* ============ MOBILE STICKY CART BAR ============ */}
      {cartTotals.itemCount > 0 && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-6">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between bg-gray-900 text-white px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl shadow-gray-900/30 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-orange-500 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartTotals.itemCount}
                </span>
              </div>
              <span className="font-medium text-sm">View Cart</span>
            </div>
            <span className="font-bold text-sm sm:text-lg">
              AFN {cartTotals.total.toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* ============ CART DRAWER OVERLAY ============ */}
      <div
        onClick={() => setIsCartOpen(false)}
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ============ CART DRAWER PANEL ============ */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] md:w-[440px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cart Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Your Cart
              </h2>
              <p className="text-xs text-gray-500">
                {cartTotals.itemCount}{" "}
                {cartTotals.itemCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                Your cart is empty
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Add items from the menu to get started
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-orange-600 transition-colors text-sm"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <ul className="space-y-2 sm:space-y-3">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    <ImageWrapper
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-gray-900 leading-tight line-clamp-2 text-xs sm:text-sm">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-orange-600 font-medium mb-1 sm:mb-2">
                      AFN {item.price.toFixed(2)}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center bg-white border border-gray-200 rounded-full">
                        <button
                          onClick={() => decrementItem(item.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-700" />
                        </button>
                        <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => incrementItem(item.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-900 text-white hover:bg-orange-600 rounded-full transition-colors"
                        >
                          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>

                      <span className="font-bold text-gray-900 text-xs sm:text-sm">
                        AFN {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
              <button
                onClick={clearCart}
                className="w-full mt-3 sm:mt-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Clear Cart
              </button>
            </ul>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 px-4 sm:px-6 py-4 sm:py-5 bg-white">
            <div className="flex justify-between text-sm sm:text-base pt-2 border-t border-gray-100">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-lg sm:text-xl text-gray-900">
                AFN {cartTotals.total.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
