import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../api/authforRBC";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

// Maps technical errors to friendly messages
const getFriendlyError = (errorMessage) => {
  if (!errorMessage) return "Something went wrong. Please try again.";

  const msg = errorMessage.toLowerCase();

  if (
    msg.includes("invalid credentials") ||
    msg.includes("401") ||
    msg.includes("unauthorized")
  )
    return "Incorrect username or password. Please try again.";

  if (
    msg.includes("user not found") ||
    msg.includes("404") ||
    msg.includes("does not exist")
  )
    return "No account found with that username.";

  if (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("failed to fetch")
  )
    return "Network error. Please check your internet connection.";

  if (msg.includes("timeout") || msg.includes("timed out"))
    return "The request timed out. Please try again.";

  if (
    msg.includes("too many") ||
    msg.includes("429") ||
    msg.includes("rate limit")
  )
    return "Too many login attempts. Please wait a moment and try again.";

  if (msg.includes("server") || msg.includes("500") || msg.includes("internal"))
    return "Server error. Please try again later or contact support.";

  if (
    msg.includes("account disabled") ||
    msg.includes("inactive") ||
    msg.includes("suspended")
  )
    return "Your account has been disabled. Please contact your administrator.";

  if (msg.includes("password expired"))
    return "Your password has expired. Please contact your administrator.";

  // Fallback for anything not matched
  return "Login failed. Please check your credentials and try again.";
};

export default function StaffLogin() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(username, password);
      const role = data.role;

      toast.success("Welcome back! Redirecting...");

      if (role === "SuperAdmin") nav("/super-admin");
      else if (role === "Admin") nav("/admin/dashboard");
      else if (role === "Manager") nav("/manager");
      else if (role === "Cashier") nav("/cashier");
      else if (role === "Waiter") nav("/waiter");
      else if (role === "Kitchen_manager") nav("/kitchen");
      else nav("/");
    } catch (err) {
      console.error(err); // Keep technical log for debugging
      const friendlyMessage = getFriendlyError(err.message);

      toast.error(friendlyMessage, {
        duration: 4000,
        style: {
          background: "#1a1a1a",
          color: "#fff",
          border: "1px solid #ef4444",
        },
        iconTheme: {
          primary: "#ef4444",
          secondary: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-[#111] to-[#0a0a0a] text-white px-6">
      {/* Fixed typo: poistion -> position */}
      <Toaster position="bottom-center" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="bg-[#121212] border border-[#1f1f1f] shadow-xl rounded-3xl w-full max-w-md p-8"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-6"
        >
          <span className="text-red-500">Login</span>
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
            required
          />
          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-12 bg-[#1a1a1a] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-full font-bold transition-all duration-300 ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
