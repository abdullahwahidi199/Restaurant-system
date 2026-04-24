// src/components/login.jsx
import React, { useState } from "react";
import { loginCustomer, getProfile } from "../../api/auth";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { slug } = useParams();
  console.log("Current slug:", slug); // Debugging line to check slug value
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === "ps" || i18n.language === "fa";
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginCustomer(slug, formData);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      const profileRes = await getProfile(slug);
      localStorage.setItem("customer", JSON.stringify(profileRes.data));

      navigate(`/r/${slug}/`);
    } catch (err) {
      setLoading(false);
      setError(t("login.error"));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-[#111] to-[#0a0a0a] text-white px-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Toaster poistion="bottom-center" />
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
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
            required
          />
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password"
            name="password"
            placeholder={t("login.password")}
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
            required
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
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
