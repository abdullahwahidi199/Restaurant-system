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
  Utensils,
} from "lucide-react";
import instance from "../../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { buildThemedImagePlaceholder } from "../../theme/themeRuntime";
import {
  getMenuApiBase,
  getPublicCartKey,
  getPublicContextFromParams,
} from "../../api/publicOrdering";

// Reusable Image fallback
const ImageWrapper = ({ src, alt, className }) => {
  if (!src) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-[var(--theme-primary-subtle)] to-[var(--theme-danger-soft)] flex items-center justify-center`}
      >
        <Utensils className="w-16 h-16 text-[var(--theme-primary)]/30" />
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
          fontSize: 18,
          label: "Image not available",
        });
      }}
    />
  );
};

export default function OnlineMenuItemDetails() {
  const params = useParams();
  const { id } = params;
  const publicContext = getPublicContextFromParams(params);
  const slug = publicContext.branchSlug || publicContext.restaurantSlug;
  const menuApiBase = getMenuApiBase(publicContext);
  const cartKey = getPublicCartKey(publicContext);
  const [itemDetails, setItemDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const navigate = useNavigate();

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await instance.get(`${menuApiBase}/menu-items/${id}/`);
      setItemDetails(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load item details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchItemDetails();
  }, [id, menuApiBase]);

  const handleAddToCart = () => {
    let cart = [];

    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) cart = JSON.parse(saved);
    } catch {}

    const existing = cart.find(
      (i) => i.id === itemDetails.id && i.type === "menu_item",
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: itemDetails.id,
        name: itemDetails.name,
        price: parseFloat(itemDetails.price),
        image: itemDetails.image,
        type: "menu_item",
        restaurant_slug: publicContext.restaurantSlug,
        branch_slug: publicContext.branchSlug,
        quantity,
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));

    // 👇 ADD THIS: Dispatch custom event to notify other components
    window.dispatchEvent(
      new CustomEvent("cart-updated", {
        detail: { cart, slug, branchSlug: publicContext.branchSlug },
      }),
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !itemDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Item Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "This item is unavailable right now."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchItemDetails}
              className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors"
            >
              Try Again
            </button>

            <button
              onClick={() => navigate(-1)}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              Back
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
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-8">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          {
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          }
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {itemDetails.name}
            </h1>
            <p className="text-xs text-gray-500">{slug?.toUpperCase()}</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-80 md:h-96 bg-gray-100 overflow-hidden">
            <ImageWrapper
              src={itemDetails.image}
              alt={itemDetails.name}
              className="w-full h-full object-cover"
            />

            {/* Availability Badge */}
            <div className="absolute top-4 left-4">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm ${
                  itemDetails.final_availability
                    ? "bg-emerald-500/90 text-white"
                    : "bg-gray-700/90 text-white"
                }`}
              >
                {itemDetails.final_availability
                  ? "● Available"
                  : "● Unavailable"}
              </span>
            </div>

            {/* Rating Badge */}
            {avgRating && (
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-gray-900 text-sm">
                  {avgRating}
                </span>
                <span className="text-xs text-gray-500">
                  ({itemDetails.reviews.length})
                </span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            {/* Title & Price */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {itemDetails.name}
                </h2>
                {itemDetails.description ? (
                  <p className="text-gray-600 leading-relaxed">
                    {itemDetails.description}
                  </p>
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    A delicious dish made with the finest ingredients.
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-orange-600">
                  AFN {parseFloat(itemDetails.price).toFixed(2)}
                </span>
                <p className="text-xs text-gray-500">per piece</p>
              </div>
            </div>

            {/* Ingredients (Customer-friendly: only names) */}
            {itemDetails.ingredients && itemDetails.ingredients.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Utensils className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Ingredients
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {itemDetails.ingredients.map((ing) => (
                    <span
                      key={ing.id}
                      className="px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-100"
                    >
                      {ing.ingredient_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Customer Reviews
                </h3>
                {itemDetails.reviews.length > 0 && (
                  <span className="text-sm text-gray-500">
                    ({itemDetails.reviews.length})
                  </span>
                )}
              </div>

              {itemDetails.reviews.length === 0 ? (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    No reviews yet. Be the first to share your experience!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {itemDetails.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-gray-50 border border-gray-100 rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                            {(review.user_name || review.user || "A")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">
                            {review.user_name || review.user || "Anonymous"}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (review.rating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 text-sm leading-relaxed">
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
      </div>

      {/* STICKY ADD TO CART BAR */}
      {itemDetails.final_availability && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3 sm:gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-sm hover:bg-gray-50 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4 text-gray-700" />
              </button>
              <span className="w-10 text-center font-bold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-900 hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 sm:py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] shadow-lg ${
                added
                  ? "bg-emerald-500 shadow-emerald-500/30"
                  : "bg-gray-900 hover:bg-orange-600 shadow-gray-900/20"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span className="hidden sm:inline">Add to Cart —</span>
                  <span>AFN {totalPrice}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Unavailable Notice */}
      {!itemDetails.final_availability && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
            <p className="font-medium">
              This item is currently unavailable. Please check back later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
