import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Search,
  UtensilsCrossed,
  ShoppingBag,
  Check,
  User,
  Phone,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import instance from "../../api/axiosInstance";
import { useLocation } from "react-router-dom";

export default function TakeAwayForm() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ps" || i18n.language === "fa";
  const location = useLocation();
  const table = location.state?.table || null;

  const [menuData, setMenuData] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    note: "",
  });
  console.log(table);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const res = await instance.get("/menu/categories/");
      const data = res.data;

      const enriched = data.map((cat) => ({
        ...cat,
        menu_items: cat.menu_items.map((item) => ({
          ...item,
          image: item.image
            ? item.image.startsWith("http")
              ? item.image
              : `${BASE_URL}${item.image}`
            : null,
        })),
      }));

      setMenuData(enriched);
      if (data.length > 0) {
        setActiveCategory(data[0].name);
      }
    } catch (err) {
      console.error(err);
      toast.error(t("menu.messages.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  useEffect(() => {
    if (table?.current_reservation) {
      setFormData({
        name: table.current_reservation.customer_name || "",
        phone: table.current_reservation.customer_phone || "",
        note: table.note || "",
      });
    }
  }, [table]);

  const allCategories = ["All", ...menuData.map((cat) => cat.name)];

  const getFilteredItems = () => {
    let items = [];
    if (activeCategory === "All") {
      items = menuData.flatMap((cat) =>
        cat.menu_items.map((item) => ({ ...item, category: cat.name })),
      );
    } else {
      const cat = menuData.find((c) => c.name === activeCategory);
      items = cat
        ? cat.menu_items.map((item) => ({ ...item, category: cat.name }))
        : [];
    }

    if (searchQuery.trim()) {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return items;
  };

  const getCartItemQty = (menuItemId) => {
    const found = cart.find((i) => i.id === menuItemId);
    return found ? found.qty : 0;
  };

  const handleIncrement = (menuItem) => {
    const existing = cart.find((i) => i.id === menuItem.id);
    if (existing) {
      setCart(
        cart.map((i) => (i.id === menuItem.id ? { ...i, qty: i.qty + 1 } : i)),
      );
    } else {
      setCart([...cart, { ...menuItem, qty: 1 }]);
    }
  };

  const handleDecrement = (menuItemId) => {
    const existing = cart.find((i) => i.id === menuItemId);
    if (!existing) return;
    if (existing.qty <= 1) {
      setCart(cart.filter((i) => i.id !== menuItemId));
    } else {
      setCart(
        cart.map((i) => (i.id === menuItemId ? { ...i, qty: i.qty - 1 } : i)),
      );
    }
  };

  const handleRemoveFromCart = (menuItemId) => {
    setCart(cart.filter((i) => i.id !== menuItemId));
  };

  const handleChangeQty = (menuItemId, qty) => {
    if (qty < 1) return;
    setCart(cart.map((i) => (i.id === menuItemId ? { ...i, qty } : i)));
  };

  const totalAmount = cart.reduce(
    (sum, i) => sum + parseFloat(i.price) * i.qty,
    0,
  );
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error(t("menu.messages.empty_cart"));
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Please fill in customer name ");
      return;
    }

    setSubmitting(true);
    const payload = {
      name: formData.name,
      phone: formData.phone,
      order_type: "dine-in",
      table: table.id,
      note: formData.note,
      items: cart.map((item) => ({
        menu_item: item.id,
        quantity: item.qty,
      })),
    };

    try {
      await instance.post("/orders/orders/", payload);
      toast.success(t("menu.messages.order_success"));
      setCart([]);
      setShowCart(false);
      setFormData({ name: "", phone: "", note: "" });
    } catch (err) {
      console.error(err);
      toast.error(t("menu.messages.order_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = getFilteredItems();

  const groupedItems = () => {
    if (activeCategory !== "All") {
      return [{ category: activeCategory, items: filteredItems }];
    }
    const groups = [];
    menuData.forEach((cat) => {
      const items = filteredItems.filter((i) => i.category === cat.name);
      if (items.length > 0) {
        groups.push({
          category: cat.name,
          description: cat.description,
          items,
        });
      }
    });
    return groups;
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50">
      <Toaster position="bottom-center" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {t("menu.title") || "Takeaway Order"}
              </h1>
              <p className="text-xs text-gray-500">
                Create a new takeaway order
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative w-12 h-12 rounded-xl bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors"
          >
            <ShoppingBag size={22} className="text-emerald-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={t("menu.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {allCategories.map((cat) => {
            const catData = menuData.find((c) => c.name === cat);
            const count =
              cat === "All"
                ? menuData.reduce((s, c) => s + c.menu_items.length, 0)
                : catData?.menu_items.length || 0;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                  activeCategory === cat
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {cat === "All" ? (
                  <UtensilsCrossed size={14} />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                )}
                {cat}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-md ${
                    activeCategory === cat
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
            <p className="text-sm text-gray-400">{t("menu.loading")}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <UtensilsCrossed size={28} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">
              {searchQuery
                ? `No items found for "${searchQuery}"`
                : "No items in this category"}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedItems().map((group) => (
              <div key={group.category}>
                {activeCategory === "All" && (
                  <div className="mb-4">
                    <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <span className="w-1 h-5 rounded-full bg-emerald-500" />
                      {group.category}
                      <span className="text-xs font-normal text-gray-400">
                        {group.items.length} item
                        {group.items.length !== 1 && "s"}
                      </span>
                    </h2>
                    {group.description && (
                      <p className="text-xs text-gray-400 ml-3 mt-0.5">
                        {group.description}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {group.items.map((item) => {
                    const qty = getCartItemQty(item.id);
                    const isSelected = qty > 0;

                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -2 }}
                        className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200 cursor-pointer bg-white ${
                          isSelected
                            ? "border-emerald-400 shadow-lg shadow-emerald-100 ring-1 ring-emerald-200"
                            : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                        }`}
                        onClick={() =>
                          item.is_available && handleIncrement(item)
                        }
                      >
                        {/* Selected badge */}
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                            <Check
                              size={13}
                              className="text-white"
                              strokeWidth={3}
                            />
                          </div>
                        )}

                        {/* Image */}
                        <div className="relative h-36 bg-gray-100 overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full items-center justify-center ${item.image ? "hidden" : "flex"}`}
                          >
                            <UtensilsCrossed
                              size={32}
                              className="text-gray-300"
                            />
                          </div>

                          {/* Availability overlay */}
                          {!item.is_available && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-xs font-semibold text-white bg-red-500/90 px-2.5 py-1 rounded-lg">
                                {t("menu.unavailable")}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h3 className="text-sm font-semibold text-gray-800 truncate leading-tight">
                            {item.name}
                          </h3>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-base font-bold text-emerald-600">
                              Afs {parseFloat(item.price).toLocaleString()}
                            </span>
                            {isSelected ? (
                              <div
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDecrement(item.id);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                  <Minus size={13} className="text-gray-600" />
                                </button>
                                <span className="w-7 text-center text-sm font-bold text-gray-800">
                                  {qty}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleIncrement(item);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors"
                                >
                                  <Plus size={13} className="text-white" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleIncrement(item);
                                }}
                                disabled={!item.is_available}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                  item.is_available
                                    ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                }`}
                              >
                                <Plus size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ x: isRTL ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed top-0 ${
              isRTL ? "left-0" : "right-0"
            } w-full sm:w-96 h-full bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100`}
          >
            {/* Cart Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {t("menu.cart.title")}
                </h2>
                {totalItems > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {totalItems} item{totalItems !== 1 && "s"}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <ShoppingBag size={24} className="text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      {t("menu.cart.empty")}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      Tap items from the menu to add
                    </p>
                  </div>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50/80 rounded-xl border border-gray-100 p-3 flex gap-3 items-center"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full items-center justify-center ${item.image ? "hidden" : "flex"}`}
                      >
                        <UtensilsCrossed size={16} className="text-gray-300" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Afs {parseFloat(item.price).toLocaleString()} each
                      </p>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleDecrement(item.id)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus size={12} className="text-gray-500" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) =>
                          handleChangeQty(
                            item.id,
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="w-9 text-center text-sm font-bold text-gray-800 bg-transparent border-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => handleIncrement(item)}
                        className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                      >
                        <Plus size={12} className="text-emerald-600" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors flex-shrink-0 group/del"
                    >
                      <Trash2
                        size={14}
                        className="text-gray-300 group-hover/del:text-red-500 transition-colors"
                      />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Customer Form & Total */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4 space-y-4">
                {/* Form */}
                <div className="space-y-3">
                  <div className="relative">
                    <User
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Customer Name *"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Phone
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number "
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                      required
                    />
                  </div>
                  <div className="relative">
                    <FileText
                      size={14}
                      className="absolute left-3.5 top-4 text-gray-400"
                    />
                    <textarea
                      placeholder="Note (optional)"
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium text-gray-600">
                    Total
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    Afs {totalAmount.toLocaleString()}
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <Check size={16} strokeWidth={3} />
                      Create Order • Afs {totalAmount.toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
