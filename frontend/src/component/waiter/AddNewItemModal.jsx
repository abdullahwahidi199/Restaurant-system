import { useState, useEffect, useRef } from "react";
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
  ChevronRight,
} from "lucide-react";
import instance from "../../api/axiosInstance";
import toast from "react-hot-toast";

export default function AddItemToOrderModal({
  orderId,
  onClose,
  refetchTables,
}) {
  const [menuData, setMenuData] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const categoryScrollRef = useRef(null);
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
      if (data.length > 0 && data[0].menu_items.length > 0) {
        setActiveCategory(data[0].name);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

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

  const getSelectedItemQty = (menuItemId) => {
    const found = selectedItems.find((i) => i.menu_item.id === menuItemId);
    return found ? found.quantity : 0;
  };

  const handleIncrement = (menuItem) => {
    const existing = selectedItems.find((i) => i.menu_item.id === menuItem.id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.menu_item.id === menuItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        ),
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        { menu_item: menuItem, quantity: 1 },
      ]);
    }
  };

  const handleDecrement = (menuItemId) => {
    const existing = selectedItems.find((i) => i.menu_item.id === menuItemId);
    if (!existing) return;
    if (existing.quantity <= 1) {
      handleRemoveItem(menuItemId);
    } else {
      setSelectedItems(
        selectedItems.map((i) =>
          i.menu_item.id === menuItemId
            ? { ...i, quantity: i.quantity - 1 }
            : i,
        ),
      );
    }
  };

  const handleRemoveItem = (menuItemId) => {
    setSelectedItems(
      selectedItems.filter((i) => i.menu_item.id !== menuItemId),
    );
  };

  const handleChangeQuantity = (menuItemId, qty) => {
    if (qty < 1) return;
    setSelectedItems(
      selectedItems.map((i) =>
        i.menu_item.id === menuItemId ? { ...i, quantity: qty } : i,
      ),
    );
  };

  const totalAmount = selectedItems.reduce(
    (sum, i) => sum + parseFloat(i.menu_item.price) * i.quantity,
    0,
  );

  const totalItems = selectedItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleAddItems = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }
    setSubmitting(true);
    const payload = {
      items: selectedItems.map((i) => ({
        menu_item: i.menu_item.id,
        quantity: i.quantity,
      })),
    };

    try {
      await instance.patch(`/orders/orders/${orderId}/add-items/`, payload);
      toast.success("Items added successfully!");
      refetchTables();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add items");
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Add Items to Order
                <span className="ml-2 text-sm font-medium text-gray-400">
                  #{orderId}
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Browse the menu and tap to add
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── LEFT: Menu ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="px-5 pt-4 pb-2">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/80 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition placeholder:text-gray-400"
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
            <div
              ref={categoryScrollRef}
              className="px-5 pb-3 flex gap-2 overflow-x-auto scrollbar-hide"
            >
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

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <Loader2
                    className="animate-spin text-emerald-500"
                    size={32}
                  />
                  <p className="text-sm text-gray-400">Loading menu...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
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
                <div className="space-y-5">
                  {groupedItems().map((group) => (
                    <div key={group.category}>
                      {activeCategory === "All" && (
                        <div className="mb-3">
                          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <span className="w-1 h-4 rounded-full bg-emerald-500" />
                            {group.category}
                            <span className="text-xs font-normal text-gray-400">
                              {group.items.length} item
                              {group.items.length !== 1 && "s"}
                            </span>
                          </h3>
                          {group.description && (
                            <p className="text-xs text-gray-400 ml-3 mt-0.5">
                              {group.description}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {group.items.map((item) => {
                          const qty = getSelectedItemQty(item.id);
                          const isSelected = qty > 0;

                          return (
                            <div
                              key={item.id}
                              className={`group relative rounded-2xl border-2 overflow-hidden transition-all duration-200 cursor-pointer ${
                                isSelected
                                  ? "border-emerald-400 shadow-lg shadow-emerald-100 ring-1 ring-emerald-200"
                                  : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                              }`}
                              onClick={() => handleIncrement(item)}
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
                              <div className="relative h-28 bg-gray-100 overflow-hidden">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`w-full h-full items-center justify-center ${item.image ? "hidden" : "flex"}`}
                                >
                                  <UtensilsCrossed
                                    size={28}
                                    className="text-gray-300"
                                  />
                                </div>

                                {/* Availability overlay */}
                                {!item.is_available && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-white bg-red-500/90 px-2.5 py-1 rounded-lg">
                                      Unavailable
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="p-3">
                                <h4 className="text-sm font-semibold text-gray-800 truncate leading-tight">
                                  {item.name}
                                </h4>
                                <div className="flex items-center justify-between mt-1.5">
                                  <span className="text-sm font-bold text-emerald-600">
                                    Afs{" "}
                                    {parseFloat(item.price).toLocaleString()}
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
                                        <Minus
                                          size={13}
                                          className="text-gray-600"
                                        />
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
                                        <Plus
                                          size={13}
                                          className="text-white"
                                        />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleIncrement(item);
                                      }}
                                      className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                                    >
                                      <Plus
                                        size={14}
                                        className="text-emerald-600"
                                      />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="w-80 lg:w-96 border-l border-gray-100 flex flex-col bg-gray-50/50">
            {/* Summary Header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                  Order Summary
                </h3>
                {totalItems > 0 && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {totalItems} item{totalItems !== 1 && "s"}
                  </span>
                )}
              </div>
            </div>

            {/* Selected Items List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {selectedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <ShoppingBag size={24} className="text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      No items selected
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      Tap items from the menu to add
                    </p>
                  </div>
                </div>
              ) : (
                selectedItems.map((item) => (
                  <div
                    key={item.menu_item.id}
                    className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3 items-center transition-all hover:shadow-sm"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.menu_item.image ? (
                        <img
                          src={item.menu_item.image}
                          alt={item.menu_item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full items-center justify-center ${item.menu_item.image ? "hidden" : "flex"}`}
                      >
                        <UtensilsCrossed size={16} className="text-gray-300" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {item.menu_item.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Afs {parseFloat(item.menu_item.price).toLocaleString()}{" "}
                        each
                      </p>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleDecrement(item.menu_item.id)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus size={12} className="text-gray-500" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleChangeQuantity(
                            item.menu_item.id,
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="w-9 text-center text-sm font-bold text-gray-800 bg-transparent border-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => handleIncrement(item.menu_item)}
                        className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                      >
                        <Plus size={12} className="text-emerald-600" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveItem(item.menu_item.id)}
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

            {/* Total & Submit */}
            {selectedItems.length > 0 && (
              <div className="border-t border-gray-100 bg-white px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-lg font-bold text-gray-900">
                    Afs {totalAmount.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handleAddItems}
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check size={16} strokeWidth={3} />
                      Add {totalItems} Item{totalItems !== 1 && "s"} — Afs{" "}
                      {totalAmount.toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
