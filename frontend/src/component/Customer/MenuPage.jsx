import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, X, Trash2 } from "lucide-react";
import MenuDetails from "./MenuDetails";
import toast, { Toaster } from "react-hot-toast";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sortOption, setSortOption] = useState("Default");
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "http://127.0.0.1:8000";

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/menu/categories/`);
      if (!res.ok) throw new Error("Failed to fetch menu data");
      const data = await res.json();

      setCategories(["All", ...data.map((cat) => cat.name)]);

      const items = data.flatMap((cat) =>
        cat.menu_items.map((item) => ({
          ...item,
          category: cat.name,
          image: item.image
            ? `${BASE_URL}${item.image}`
            : "/images/placeholder.png",
        }))
      );
      setMenuItems(items);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
    const storedFavs = JSON.parse(localStorage.getItem("favorites")) || [];
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setFavorites(storedFavs);
    setOrders(storedOrders);
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        toast.error("Item already in cart");
        return prev;
      }
      toast.success(`${item.name} added to cart 🛒`);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Your cart is empty!");
    const name = prompt("Enter your name:");
    const phone = prompt("Enter your phone number:");
    if (!name || !phone) return toast.error("Name and phone are required.");

    const orderData = {
      name,
      phone,
      order_type: "delivery",
      items: cart.map((item) => ({
        menu_item: item.id,
        quantity: item.qty,
      })),
    };

    try {
      const res = await fetch(`${BASE_URL}/orders/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Order placed successfully!");
        setOrders((prev) => [...prev, ...cart]);
        setCart([]);
        setShowCart(false);
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while placing order");
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
      if (sortOption === "Price: Low to High")
        return parseFloat(a.price) - parseFloat(b.price);
      if (sortOption === "Price: High to Low")
        return parseFloat(b.price) - parseFloat(a.price);
      return 0;
    });

  const fetchSelectedItem = async (id) => {
    const response = await fetch(`${BASE_URL}/menu/menu-items/${id}/`);
    const data = await response.json();
    setSelectedItem(data);
  };

  return (
    <div className="bg-gradient-to-b from-black via-[#111] to-[#0a0a0a] text-white min-h-screen px-6 py-12 font-sans">
      <Toaster position="bottom-center" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
          Delivery of <span className="text-white">fresh</span>{" "}
          <span className="text-red-500">hot food</span>
          <br />
          within 40 minutes
        </h1>
        <p className="text-gray-400 text-lg">
          Taste the difference. Made with passion, served with love.
        </p>
      </motion.div>

      {/* Search & Sort */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10">
        <input
          type="text"
          placeholder="Search menu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 bg-[#1a1a1a] border border-gray-700 text-gray-100 rounded-full px-5 py-3 focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="bg-[#1a1a1a] border border-gray-700 text-gray-100 rounded-full px-5 py-3 focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          <option>Default</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      {/* Category Tabs */}
      <div className="relative w-full mb-14">
        <div className="flex justify-start gap-10 border-b border-gray-700 pb-2 relative">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`relative pb-2 cursor-pointer text-sm font-semibold text-gray-400 transition-all duration-300
                hover:text-white hover:scale-105
                ${selectedCategory === cat ? "text-white" : ""}`}
            >
              {cat}
              <span
                className={`absolute left-0 bottom-0 h-[2px] bg-red-500 transition-all duration-300 ease-out`}
                style={{
                  width: selectedCategory === cat ? "100%" : "0%",
                }}
              ></span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      {loading ? (
        <p className="text-center text-gray-400">Loading menu...</p>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
          className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.03 }}
                className="relative bg-[#121212] rounded-3xl overflow-hidden p-5 border border-[#1f1f1f] 
                           hover:border-red-500/50 transition-all shadow-md hover:shadow-red-600/30"
              >
                {/* Unavailable overlay */}
                {!item.is_available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl z-20">
                    <p className="text-red-500 font-bold text-lg">Unavailable</p>
                  </div>
                )}

                {/* Favorite */}
                <div
                  className="absolute top-4 right-4 cursor-pointer z-30"
                  onClick={() => toggleFavorite(item.id)}
                >
                  <Heart
                    size={22}
                    className={`${
                      favorites.includes(item.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400 hover:text-red-500"
                    } transition-colors`}
                  />
                </div>

                {/* Item Image & Name */}
                <div
                  onClick={() => fetchSelectedItem(item.id)}
                  className="cursor-pointer flex flex-col items-center z-10"
                >
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#1f1f1f] mb-4 hover:scale-105 transition-transform duration-300">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">
                    {item.name}
                  </h3>
                  <p className="text-red-500 text-lg font-bold">
                    AFN {parseFloat(item.price).toFixed(2)}
                  </p>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => addToCart(item)}
                  disabled={!item.is_available}
                  className={`mt-5 w-full font-semibold py-2 rounded-full transition-all duration-300 ${
                    item.is_available
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                >
                  {item.is_available ? "Add to Cart" : "Unavailable"}
                </button>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400 col-span-full text-center mt-10">
              No menu items found.
            </p>
          )}
        </motion.div>
      )}

      {/* Floating Cart Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        onClick={() => setShowCart(true)}
        className="fixed bottom-6 right-6 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition z-50"
      >
        <ShoppingCart size={22} />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full px-2">
            {cart.length}
          </span>
        )}
      </motion.button>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 80 }}
            className="fixed top-0 right-0 w-80 md:w-96 h-full bg-[#111] border-l border-[#222] shadow-2xl p-5 z-50 flex flex-col"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-white">Your Cart</h2>
              <X
                onClick={() => setShowCart(false)}
                className="cursor-pointer text-gray-400 hover:text-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center mt-20">
                  Your cart is empty.
                </p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-xl"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-gray-400 text-sm">
                        {item.qty} × AFN {parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                    <Trash2
                      onClick={() => removeFromCart(item.id)}
                      className="cursor-pointer text-gray-400 hover:text-red-500"
                    />
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-5 border-t border-gray-700 pt-4">
                <p className="text-lg font-bold flex justify-between">
                  Total:
                  <span>
                    AFN
                    {cart
                      .reduce(
                        (acc, item) => acc + item.qty * parseFloat(item.price),
                        0
                      )
                      .toFixed(2)}
                  </span>
                </p>
                <button
                  onClick={handleCheckout}
                  className="mt-4 w-full py-3 rounded-full bg-red-500 hover:bg-red-600 font-bold transition"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Details Modal */}
      {selectedItem && (
        <MenuDetails item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
