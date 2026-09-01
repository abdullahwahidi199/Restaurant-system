import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Heart,
  ShoppingCart,
  X,
  Trash2,
  Search,
  Plus,
  Minus,
  Loader2,
  ShoppingBag,
  ChevronRight,
  Star,
  LayoutGrid,
  List as ListIcon,
  MapPin,
  Clock3,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import CheckoutForm from "./CheckoutForm";
import ReviewItemModel from "./ReviewPage";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { buildThemedImagePlaceholder } from "../../theme/themeRuntime";
import {
  getMenuApiBase,
  getMediaUrl,
  getMenuItemPath,
  getOnlineOrderApiPath,
  getPlatterPath,
  getPublicCartKey,
  getPublicContextFromParams,
  persistPublicOrderingContext,
} from "../../api/publicOrdering";
import {
  flattenMenuCategories,
  sortMenuCategories,
} from "../Admin/MenuManagement/menuOrdering";

// Fallback image component
const ImageWrapper = ({ src, alt, className }) => {
  if (!src) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-[var(--theme-muted)] to-[var(--theme-border)] flex items-center justify-center`}
      >
        <span className="text-[var(--theme-text-muted)] text-xs sm:text-sm">
          No Image
        </span>
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
        e.target.src = buildThemedImagePlaceholder({
          width: 400,
          height: 300,
          fontSize: 16,
          label: "Image not available",
        });
      }}
    />
  );
};

export default function MenuPage({
  orderingClosed,
  restaurantInfo,
  branchInfo,
  restaurantSlug,
  branchSlug,
}) {
  const params = useParams();
  const routeRestaurantSlug = params.restaurantSlug || params.slug;
  const routeBranchSlug = params.branchSlug || "";
  const publicContext = useMemo(
    () => ({
      ...getPublicContextFromParams({
        restaurantSlug: routeRestaurantSlug,
        branchSlug: routeBranchSlug,
      }),
      restaurantSlug: restaurantSlug || routeRestaurantSlug,
      branchSlug: branchSlug || routeBranchSlug,
    }),
    [branchSlug, restaurantSlug, routeBranchSlug, routeRestaurantSlug],
  );
  const menuApiBase = useMemo(
    () => getMenuApiBase(publicContext),
    [publicContext],
  );
  const orderApiPath = useMemo(
    () => getOnlineOrderApiPath(publicContext),
    [publicContext],
  );
  const cartKey = useMemo(
    () => getPublicCartKey(publicContext),
    [publicContext],
  );
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sortOption, setSortOption] = useState(t("menu.sort.default"));
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [reviewItemId, setReviewItemId] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("menu_view_mode") || "grid";
  });

  const isRTL = i18n.language === "ps" || i18n.language === "fa";

  const user = localStorage.getItem("customer");
  const BASE_URL = import.meta.env.VITE_API_URL;
  const BASE_MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(cartKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("menu_view_mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    const saved = localStorage.getItem(cartKey);
    if (saved) {
      setCart(JSON.parse(saved));
    } else {
      setCart([]);
    }
  }, [cartKey]);

  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  useEffect(() => {
    persistPublicOrderingContext({
      restaurant: restaurantInfo,
      branch: branchInfo,
    });
  }, [branchInfo, restaurantInfo]);

  const fetchMenuData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}${menuApiBase}/categories/`);
      if (!res.ok) throw new Error("Failed to fetch menu data");
      const data = await res.json();

      const orderedCategories = sortMenuCategories(data);
      setCategories(["All", ...orderedCategories.map((cat) => cat.name)]);

      const items = flattenMenuCategories(orderedCategories, (item) => ({
          ...item,
          category: item.categoryName,
          image: item.image
            ? item.image.startsWith("http")
              ? item.image
              : `${BASE_MEDIA_URL}${item.image}`
            : "/images/placeholder.png",
          reviews: item.reviews || [],
        }));
      setMenuItems(items);
    } catch (err) {
      console.error(err);
      toast.error(t("menu.messages.load_failed"));
    } finally {
      setLoading(false);
    }
  }, [BASE_MEDIA_URL, BASE_URL, menuApiBase, t]);

  useEffect(() => {
    fetchMenuData();
    const storedFavs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavs);
  }, [fetchMenuData]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  };
  const toastRef = useRef(false);

  const addToCart = (item) => {
    if (!item?.final_availability) return;

    const exists = cart.find((i) => i.id === item.id && i.type === item.type);

    if (!exists && !toastRef.current) {
      toast.success(`${item.name} ${t("menu.messages.added")}`);
      toastRef.current = true;
      setTimeout(() => (toastRef.current = false), 500);
    }

    setCart((prev) => {
      const existing = prev.find(
        (i) => i.id === item.id && i.type === item.type,
      );
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          image: item.image,
          type: item.type,
          restaurant_slug: publicContext.restaurantSlug,
          branch_slug: publicContext.branchSlug,
          branch_id: branchInfo?.id || null,
          quantity: 1,
        },
      ];
    });
  };

  const incrementItem = (id, type) => {
    const item = menuItems.find((i) => i.id === id && i.type === type);
    if (!item?.final_availability) return;

    setCart((prev) =>
      prev.map((i) => {
        if (i.id !== id || i.type !== type) return i;

        // apply limit ONLY if item uses daily production
        if (
          item.uses_daily_production &&
          i.quantity >= item.production_remaining
        ) {
          toast.error("Not enough remaining quantity");
          return i;
        }

        return { ...i, quantity: i.quantity + 1 };
      }),
    );
  };

  const decrementItem = (id, type) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id && i.type === type
            ? { ...i, quantity: i.quantity - 1 }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const removeFromCart = (id, type) => {
    setCart((prev) => prev.filter((i) => i.id !== id || i.type !== type));
  };

  const clearCart = () => setCart([]);

  const getItemQuantity = (id, type) => {
    const item = cart.find((i) => i.id === id && i.type === type);
    return item ? item.quantity : 0;
  };

  const handleCheckout = () => {
    if (cart.length === 0) return toast.error(t("menu.messages.empty_cart"));
    setShowCheckout(true);
  };

  const handlePlaceOrder = async (data) => {
    const user = JSON.parse(localStorage.getItem("customer"));

    const orderData = {
      customer: user ? user.id : null,
      name: data.name,
      phone: data.phone,
      address: data.address,
      order_type: "delivery",
      items: cart.map((item) => ({
        ...(item.type === "platter"
          ? { platter: item.id }
          : { menu_item: item.id }),
        quantity: item.quantity,
      })),
      longitude: data.longitude,
      latitude: data.latitude,
    };

    try {
      const res = await fetch(`${BASE_URL}${orderApiPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.access ? { Authorization: `Bearer ${user.access}` } : {}),
        },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();

      if (!res.ok) {
        const message =
          result?.non_field_errors?.[0] ||
          result?.error ||
          Object.values(result)[0]?.[0] ||
          "Order failed";

        toast.error(message);
        return;
      }

      toast.success(t("menu.messages.order_success"));
      setOrders((prev) => [...prev, ...cart]);
      clearCart();
      setShowCart(false);
      setShowCheckout(false);
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    }
  };

  const filteredItems = menuItems
    .filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOption === t("menu.sort.low_high"))
        return parseFloat(a.price) - parseFloat(b.price);
      if (sortOption === t("menu.sort.high_low"))
        return parseFloat(b.price) - parseFloat(a.price);
      return 0;
    });

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, i) => sum + parseFloat(i.price) * i.quantity,
      0,
    );
    const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
    return { subtotal, total: subtotal, itemCount };
  }, [cart]);

  const getCategoryCount = (catName) => {
    if (catName === "All") return menuItems.length;
    return menuItems.filter((i) => i.category === catName).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">
            {t("menu.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="customer-ordering-page min-h-screen bg-[#fbfaf7] pb-28 text-stone-950 sm:pb-8 font-sans"
    >
      <Toaster position="bottom-center" />

      <section className="border-y border-orange-100 bg-[#fffaf3]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            {restaurantInfo?.logo ? (
              <img
                src={getMediaUrl(restaurantInfo.logo)}
                alt=""
                className="h-20 w-20 shrink-0 rounded-lg border border-orange-100 bg-white object-cover shadow-sm"
                width="80"
                height="80"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/rmsFavicon.png";
                }}
              />
            ) : (
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                <ShoppingBag className="h-8 w-8" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-xs font-black uppercase text-orange-700">
                Online menu
              </p>
              <h1 className="mt-1 truncate text-2xl font-black text-stone-950 sm:text-3xl">
                {restaurantInfo?.name || "Restaurant"}
              </h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-stone-600 sm:text-sm">
                {branchInfo?.name ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-orange-600" aria-hidden="true" />
                    {branchInfo.name}
                  </span>
                ) : null}
                {branchInfo?.opening_hours ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4 text-orange-600" aria-hidden="true" />
                    {branchInfo.opening_hours}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-black ${
              orderingClosed
                ? "bg-amber-100 text-amber-900"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
            {orderingClosed ? "Delivery unavailable" : "Accepting orders"}
          </span>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Search + Sort + View Toggle */}
        <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-0 sm:flex sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("menu.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:py-3 sm:pl-12 sm:pr-4 sm:text-base"
            />
          </div>

          {/* Sort + View Toggle Row */}
          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-xs text-stone-700 shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:flex-none sm:px-5 sm:py-3 sm:text-sm"
            >
              <option>{t("menu.sort.default")}</option>
              <option>{t("menu.sort.low_high")}</option>
              <option>{t("menu.sort.high_low")}</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex flex-shrink-0 items-center rounded-lg border border-stone-200 bg-white p-0.5 shadow-sm sm:p-1">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-orange-600 text-white shadow-md"
                    : "text-stone-500 hover:bg-stone-100"
                }`}
              >
                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all ${
                  viewMode === "list"
                    ? "bg-orange-600 text-white shadow-md"
                    : "text-stone-500 hover:bg-stone-100"
                }`}
              >
                <ListIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ============ CATEGORIES ============ */}
        <div className="flex gap-2 overflow-x-auto pb-3 sm:pb-4 mb-4 sm:mb-6 scrollbar-hide snap-x snap-mandatory -mx-3 px-3 sm:-mx-4 sm:px-4 lg:-mx-8 lg:px-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`snap-start flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full whitespace-nowrap transition-all duration-300 text-xs sm:text-sm ${
                selectedCategory === cat
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-700/15"
                  : "bg-white text-stone-700 hover:bg-orange-50 border border-stone-200"
              }`}
            >
              <span className="font-medium">{cat}</span>
              {getCategoryCount(cat) > 0 && (
                <span
                  className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                    selectedCategory === cat
                      ? "bg-white/20 text-white"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {getCategoryCount(cat)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ============ MENU ITEMS ============ */}
        {filteredItems.length > 0 ? (
          viewMode === "grid" ? (
            // ===== GRID VIEW (Mobile-first: 2 columns) =====
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
              {filteredItems.map((item) => {
                const qty = getItemQuantity(item.id, item.type);
                const avgRating =
                  item.reviews?.length > 0
                    ? item.reviews.reduce((sum, r) => sum + r.rating, 0) /
                      item.reviews.length
                    : 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.type === "platter") {
                        navigate(getPlatterPath(publicContext, item.id));
                      } else {
                        navigate(getMenuItemPath(publicContext, item.id));
                      }
                    }}
                    className="group flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-stone-950/10 cursor-pointer active:scale-[0.98] sm:active:scale-100"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 sm:h-40 md:h-48 lg:h-56">
                      <ImageWrapper
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Availability Badge */}
                      <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
                        <span
                          className={`px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-semibold shadow-sm ${
                            item.final_availability
                              ? "bg-emerald-500/90 text-white"
                              : "bg-gray-500/90 text-white"
                          }`}
                        >
                          {item.final_availability
                            ? t("menu.available") || "Available"
                            : t("menu.unavailable")}
                        </span>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className={`absolute top-1.5 ${
                          isRTL ? "left-1.5 sm:left-3" : "right-1.5 sm:right-3"
                        } sm:top-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors`}
                      >
                        <Heart
                          size={14}
                          className={`sm:w-[18px] sm:h-[18px] ${
                            favorites.includes(item.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-500"
                          } transition-colors`}
                        />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-2 sm:p-3 md:p-5 flex-1 flex flex-col min-h-0">
                      <h3 className="mb-1 line-clamp-2 text-xs font-black leading-tight text-stone-950 sm:mb-2 sm:text-sm md:text-lg">
                        {item.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                        {item.reviews?.length > 0 ? (
                          <>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  size={10}
                                  className={`sm:w-3 sm:h-3 ${
                                    i < Math.round(avgRating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] sm:text-xs text-gray-500">
                              {avgRating.toFixed(1)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] sm:text-xs text-gray-400 italic">
                            {t("menu.no_reviews")}
                          </span>
                        )}
                      </div>

                      {/* Rate Button */}
                      {user && item.type === "menu_item" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewItemId(item.id);
                          }}
                          className="text-[10px] sm:text-xs text-blue-500 hover:text-blue-600 underline self-start mb-1 sm:mb-2"
                        >
                          {t("menu.rate")}
                        </button>
                      )}

                      {/* Price + Cart */}
                      <div className="mt-auto border-t border-stone-100 pt-2 sm:pt-3">
                        <div className="flex items-baseline gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                          <span className="text-sm font-black text-stone-950 sm:text-lg md:text-2xl">
                            AFN{" "}
                            <span className="text-xs sm:text-sm md:text-xl">
                              {parseFloat(item.price).toFixed(2)}
                            </span>
                          </span>
                        </div>

                        {qty === 0 ? (
                          <button
                            disabled={
                              !item.final_availability || orderingClosed
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="flex w-full items-center justify-center gap-1 rounded-lg bg-orange-600 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-orange-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300 sm:py-3 sm:text-sm"
                          >
                            <span>
                              {item.final_availability
                                ? t("menu.buttons.add")
                                : t("menu.unavailable")}
                            </span>
                            {item.final_availability && (
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center justify-between rounded-lg bg-stone-950 p-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                decrementItem(item.id, item.type);
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
                                incrementItem(item.id, item.type);
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
                const qty = getItemQuantity(item.id, item.type);
                const avgRating =
                  item.reviews?.length > 0
                    ? item.reviews.reduce((sum, r) => sum + r.rating, 0) /
                      item.reviews.length
                    : 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.type === "platter") {
                        navigate(getPlatterPath(publicContext, item.id));
                      } else {
                        navigate(getMenuItemPath(publicContext, item.id));
                      }
                    }}
                    className="group flex cursor-pointer overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-md active:scale-[0.99] sm:active:scale-100"
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 flex-shrink-0 overflow-hidden bg-gray-100">
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
                            ? t("menu.available") || "Available"
                            : t("menu.unavailable")}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-2 sm:p-3 md:p-4 flex flex-col min-w-0">
                      <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                        <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-900 leading-tight line-clamp-2">
                          {item.name}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <Heart
                            size={13}
                            className={`sm:w-4 sm:h-4 ${
                              favorites.includes(item.id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-500"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Rating + Rate */}
                      <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1 mb-1 sm:mb-2 flex-wrap">
                        {item.reviews?.length > 0 ? (
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  size={9}
                                  className={`sm:w-[11px] sm:h-[11px] ${
                                    i < Math.round(avgRating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] sm:text-xs text-gray-500">
                              {avgRating.toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] sm:text-xs text-gray-400 italic">
                            {t("menu.no_reviews")}
                          </span>
                        )}
                        {user && item.type === "menu_item" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewItemId(item.id);
                            }}
                            className="text-[10px] sm:text-[11px] text-blue-500 hover:text-blue-600 underline"
                          >
                            {t("menu.rate")}
                          </button>
                        )}
                      </div>

                      {/* Footer: Price + Add */}
                      <div className="mt-auto flex items-center justify-between gap-2 border-t border-stone-100 pt-1.5 sm:pt-2">
                        <div className="flex items-baseline gap-0.5 whitespace-nowrap min-w-0">
                          <span className="text-xs sm:text-lg md:text-xl font-bold text-gray-900">
                            AFN{" "}
                            <span className="text-[10px] sm:text-base">
                              {parseFloat(item.price).toFixed(2)}
                            </span>
                          </span>
                        </div>

                        {qty === 0 ? (
                          <button
                            disabled={
                              !item.final_availability || orderingClosed
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="flex flex-shrink-0 items-center gap-0.5 rounded-lg bg-orange-600 px-2 py-1.5 text-xs font-bold text-white transition-all hover:bg-orange-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300 sm:gap-1 sm:px-4 sm:py-2 sm:text-sm"
                          >
                            {item.final_availability
                              ? t("menu.buttons.add")
                              : t("menu.unavailable")}
                            {item.final_availability && (
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center bg-gray-900 rounded-lg sm:rounded-xl p-0.5 sm:p-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                decrementItem(item.id, item.type);
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
                                incrementItem(item.id, item.type);
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
              {t("menu.no_items")}
            </h3>
          </div>
        )}
      </div>

      {/* ============ MOBILE STICKY CART BAR ============ */}
      {cartTotals.itemCount > 0 && (
        <div className=" fixed bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-6">
          <button
            onClick={() => setShowCart(true)}
            className="w-full flex items-center justify-between bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl shadow-gray-900/30 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-orange-500 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartTotals.itemCount}
                </span>
              </div>
              <span className="font-medium text-sm">
                {t("menu.cart.title")}
              </span>
            </div>
            <span className="font-bold text-sm">
              AFN {cartTotals.total.toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* ============ CART DRAWER OVERLAY ============ */}
      <div
        onClick={() => setShowCart(false)}
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          showCart && !orderingClosed
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ============ CART DRAWER PANEL ============ */}
      <aside
        className={`fixed top-0 ${
          isRTL ? "left-0" : "right-0"
        } z-50 h-full w-full sm:w-[400px] md:w-[440px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          showCart && !orderingClosed
            ? "translate-x-0"
            : isRTL
              ? "-translate-x-full"
              : "translate-x-full"
        }`}
      >
        {/* Cart Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {t("menu.cart.title")}
              </h2>
              <p className="text-xs text-gray-500">
                {cartTotals.itemCount}{" "}
                {cartTotals.itemCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCart(false)}
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
                {t("menu.cart.empty")}
              </h3>
              <button
                onClick={() => setShowCart(false)}
                className="mt-4 px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-orange-600 transition-colors text-sm"
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
                        onClick={() => removeFromCart(item.id, item.type)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-orange-600 font-medium mb-1 sm:mb-2">
                      AFN {parseFloat(item.price).toFixed(2)}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-1">
                      <div className="flex items-center bg-white border border-gray-200 rounded-full">
                        <button
                          onClick={() => decrementItem(item.id, item.type)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-700" />
                        </button>
                        <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => incrementItem(item.id, item.type)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-900 text-white hover:bg-orange-600 rounded-full transition-colors"
                        >
                          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900 text-xs sm:text-sm">
                        AFN{" "}
                        {(parseFloat(item.price) * item.quantity).toFixed(2)}
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
                {t("menu.cart.clear") || "Clear Cart"}
              </button>
            </ul>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 px-4 sm:px-6 py-4 sm:py-5 bg-white">
            <div className="flex justify-between text-sm sm:text-base mb-3 sm:mb-4">
              <span className="font-semibold text-gray-900">
                {t("menu.cart.total")}
              </span>
              <span className="font-bold text-lg sm:text-xl text-gray-900">
                AFN {cartTotals.total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 sm:py-3.5 rounded-lg sm:rounded-xl bg-gray-900 text-white font-semibold text-sm sm:text-base hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {t("menu.cart.checkout")}
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </aside>

      {/* ============ CHECKOUT MODAL ============ */}
      {showCheckout && (
        <CheckoutForm
          user={JSON.parse(localStorage.getItem("customer"))}
          onSubmit={handlePlaceOrder}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {/* ============ REVIEW MODAL ============ */}
      {reviewItemId && (
        <ReviewItemModel
          user={JSON.parse(user)?.id}
          itemId={reviewItemId}
          restaurantSlug={publicContext.restaurantSlug}
          branchSlug={publicContext.branchSlug}
          onClose={() => setReviewItemId(null)}
        />
      )}
    </div>
  );
}
