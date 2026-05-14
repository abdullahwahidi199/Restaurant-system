import React, { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Check,
  Utensils,
  Users,
  ListChecks,
} from "lucide-react";
import instance from "../../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";

// Reuse the same ImageWrapper
const ImageWrapper = ({ src, alt, className }) => {
  if (!src) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center`}
      >
        <Utensils className="w-16 h-16 text-orange-200" />
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
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' fill='%239ca3af' text-anchor='middle'%3EImage not available%3C/text%3E%3C/svg%3E";
      }}
    />
  );
};

export default function PublicPlatterDetails() {
  const { id, slug } = useParams();
  const [platter, setPlatter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  const fetchPlatterDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await instance.get(`/menu/public/${slug}/platters/${id}/`);
      setPlatter(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load platter details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPlatterDetails();
  }, [id]);

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
        price: parseFloat(platter.price),
        image: platter.image,
        quantity,
        type: "platter", // distinguish from regular menu item
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading platter details...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !platter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Platter Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "This platter is unavailable right now."}
          </p>
          <button
            onClick={fetchPlatterDetails}
            className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = (parseFloat(platter.price) * quantity).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-8">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {platter.name}
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
              src={platter.image}
              alt={platter.name}
              className="w-full h-full object-cover"
            />

            {/* Availability Badge */}
            <div className="absolute top-4 left-4">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm ${
                  platter.is_available
                    ? "bg-emerald-500/90 text-white"
                    : "bg-gray-700/90 text-white"
                }`}
              >
                {platter.is_available ? "● Available" : "● Unavailable"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            {/* Title & Price */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {platter.name}
                </h2>
                {platter.description ? (
                  <p className="text-gray-600 leading-relaxed">
                    {platter.description}
                  </p>
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    A generous platter perfect for sharing with friends and
                    family.
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-orange-600">
                  AFN {parseFloat(platter.price).toFixed(2)}
                </span>
                <p className="text-xs text-gray-500">per platter</p>
              </div>
            </div>

            {/* Platter Items */}
            {platter.items && platter.items.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    What's Inside
                  </h3>
                </div>
                <div className="space-y-2">
                  {platter.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-xs">
                          {item.quantity}x
                        </div>
                        <span className="font-semibold text-gray-800">
                          {item.menu_item_name}
                        </span>
                      </div>
                      <Utensils className="w-4 h-4 text-orange-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost note (optional, subtle) */}
            <div className="text-center mb-4">
              <span className="text-xs text-gray-400">
                Individual cost: ~AFN{" "}
                {parseFloat(platter.total_cost).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY ADD TO CART BAR */}
      {platter.is_available && (
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
      {!platter.is_available && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
            <p className="font-medium">
              This platter is currently unavailable. Please check back later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
