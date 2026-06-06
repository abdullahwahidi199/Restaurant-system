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
  ArrowLeft,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import instance from "../../api/axiosInstance";
import { useLocation, useNavigate } from "react-router-dom";

export default function TakeAwayOrderForm() {
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

  const BASE_URL = import.meta.env.VITE_MEDIA_URL;
  const navigate = useNavigate();

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const res = await instance.get("/menu/categories/");
      const data = res.data;

      const enriched = data.map((cat) => ({
        ...cat,
        menu_items: cat.menu_items.map((item) => ({
          ...item,
          type: "menu_item",
          image: item.image
            ? item.image.startsWith("http")
              ? item.image
              : `${BASE_URL}${item.image}`
            : null,
        })),
        platters: (cat.platters || []).map((platter) => ({
          ...platter,
          type: "platter",
          image: platter.image
            ? platter.image.startsWith("http")
              ? platter.image
              : `${BASE_URL}${platter.image}`
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

    const collect = (cat) => [
      ...cat.menu_items.map((item) => ({ ...item, category: cat.name })),
      ...(cat.platters || []).map((p) => ({ ...p, category: cat.name })),
    ];

    if (activeCategory === "All") {
      items = menuData.flatMap(collect);
    } else {
      const cat = menuData.find((c) => c.name === activeCategory);
      items = cat ? collect(cat) : [];
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
      setCart([...cart, { ...menuItem, qty: 1, note: "" }]);
    }
  };

  const handleItemNoteChange = (itemId, note) => {
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, note } : item)),
    );
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
        ...(item.type === "platter"
          ? { platter: item.id }
          : { menu_item: item.id }),
        quantity: item.qty,
        description: item.note,
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

  const getCategoryCount = (catName) => {
    if (catName === "All") {
      return menuData.reduce(
        (s, c) => s + c.menu_items.length + (c.platters?.length || 0),
        0,
      );
    }
    const catData = menuData.find((c) => c.name === catName);
    return (catData?.menu_items.length || 0) + (catData?.platters?.length || 0);
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50">
      <Toaster position="bottom-center" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200"
            >
              <ArrowLeft
                size={18}
                className="text-gray-600 group-hover:-translate-x-1 transition-transform duration-200"
              />
              <span className="text-sm font-medium text-gray-700">Back</span>
            </button>

            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
              <ShoppingBag size={20} className="text-white" />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Dine-in Order
              </h1>
              <p className="text-xs text-gray-500">
                {table?.name
                  ? `Table: ${table.name}`
                  : "Create a new dine-in order"}
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

      {/* Main Layout: Sidebar + Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Vertical Categories Sidebar */}
          <aside className="w-56 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Categories
                </h3>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {allCategories.map((cat) => {
                  const count = getCategoryCount(cat);
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-medium transition-all duration-150 border-l-4 ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-500"
                          : "bg-white text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {cat === "All" ? (
                          <UtensilsCrossed size={14} />
                        ) : (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-gray-300"
                            }`}
                          />
                        )}
                        <span className="truncate">{cat}</span>
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md flex-shrink-0 ${
                          isActive
                            ? "bg-emerald-200 text-emerald-800"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Side: Search + Items List */}
          <div className="flex-1 min-w-0">
            {/* Search */}
            <div className="mb-4">
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

            {/* Active Category Header */}
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-emerald-500" />
                {activeCategory}
                <span className="text-xs font-normal text-gray-400">
                  {filteredItems.length} item
                  {filteredItems.length !== 1 && "s"}
                </span>
              </h2>
            </div>

            {/* Items List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
                <p className="text-sm text-gray-400">{t("menu.loading")}</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-xl border border-gray-100">
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
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                {filteredItems.map((item) => {
                  const qty = getCartItemQty(item.id);
                  const isSelected = qty > 0;

                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                        isSelected ? "bg-emerald-50/50" : "hover:bg-gray-50"
                      } ${!item.final_availability ? "opacity-60" : ""}`}
                    >
                      {/* Image */}
                      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UtensilsCrossed
                              size={20}
                              className="text-gray-300"
                            />
                          </div>
                        )}
                      </div>

                      {/* Name & Category */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-800 truncate">
                            {item.name}
                          </h3>
                          {item.type === "platter" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                              Platter
                            </span>
                          )}
                          {!item.final_availability && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-medium">
                              {t("menu.unavailable")}
                            </span>
                          )}
                        </div>
                        {activeCategory === "All" && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {item.category}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0 w-24">
                        <span className="text-sm font-bold text-emerald-600">
                          Afs {parseFloat(item.price).toLocaleString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <div className="flex items-center gap-1.5 bg-white border border-emerald-200 rounded-lg p-1">
                            <button
                              onClick={() => handleDecrement(item.id)}
                              className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <Minus size={14} className="text-gray-600" />
                            </button>
                            <span className="w-7 text-center text-sm font-bold text-gray-800">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleIncrement(item)}
                              className="w-7 h-7 rounded bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleIncrement(item)}
                            disabled={!item.final_availability}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={14} />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Afs {parseFloat(item.price).toLocaleString()} each
                      </p>
                      <textarea
                        placeholder="Item note..."
                        value={item.note || ""}
                        onChange={(e) =>
                          handleItemNoteChange(item.id, e.target.value)
                        }
                        className="mt-2 w-full rounded-lg border border-gray-200 px-2 py-1 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleDecrement(item.id)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus size={14} className="text-gray-500" />
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
                        <Plus size={14} className="text-emerald-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4 space-y-4">
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
                      placeholder="Phone Number (optional)"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
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

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium text-gray-600">
                    Total
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    Afs {totalAmount.toLocaleString()}
                  </span>
                </div>

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
