// src/components/login.jsx
import React, { useState } from "react";
import { loginCustomer, getProfile } from "../../api/auth";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const formatRetryAfter = (seconds) => {
  const value = Number(seconds || 0);
  if (!value || value < 1) return "a moment";
  if (value < 60) return `${value} second${value === 1 ? "" : "s"}`;
  const minutes = Math.ceil(value / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
};

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // const { slug } = useParams();
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === "ps" || i18n.language === "fa";
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginCustomer(formData);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      const profileRes = await getProfile();
      localStorage.setItem("customer", JSON.stringify(profileRes.data));

      navigate(`/`);
    } catch (err) {
      if (err.response?.status === 429) {
        const retryAfter =
          err.response.data?.retry_after || err.response.headers?.["retry-after"];
        setError(
          `Too many login attempts. Please try again in ${formatRetryAfter(retryAfter)}.`,
        );
        toast.error(
          `Too many login attempts. Please try again in ${formatRetryAfter(retryAfter)}.`,
        );
      } else {
        setError(t("login.error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-[var(--theme-text-primary)] to-[var(--theme-text-primary)] text-white px-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Toaster position="bottom-center" />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="bg-[var(--theme-elevated)] border border-[var(--theme-border)] shadow-xl rounded-3xl w-full max-w-md p-8"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-6"
        >
          <span className="text-red-500">{t("login.title")}</span>
        </motion.h2>

        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.input
            type="text"
            name="username"
            placeholder={t("login.username")}
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 bg-[var(--theme-secondary)] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
            required
          />
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password"
            name="password"
            placeholder={t("login.password")}
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 bg-[var(--theme-secondary)] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
            required
          />

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
            {loading ? t("login.loading") : t("login.button")}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
