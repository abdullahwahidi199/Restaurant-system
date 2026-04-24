// src/components/Header.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { logoutCustomer, getProfile } from "../../api/auth";
import { Menu, X } from "lucide-react"; // burger icons
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import toast from "react-hot-toast";

export default function Header({ restaurantInfo }) {
  const [username, setUsername] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams();
  const isRTL = document.documentElement.dir === "rtl";
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const res = await getProfile(slug);
          setUsername(res.data.username);
        } catch (err) {
          console.error(err);
          logoutCustomer();
        }
      }
    };
    fetchUserProfile();
  }, []);

  const handleOrdersClick = () => {
    const customer = localStorage.getItem("customer");

    if (customer) {
      navigate(`/r/${slug}/orders`);
    } else {
      toast("🔒 To unlock this feature, please log in.");
    }
  };
  const handleLogout = () => {
    logoutCustomer();
    navigate("/");
    window.location.reload();
  };

  const navLinks = [
    { name: t("nav.faqs"), path: `/r/${slug}/faqs` },
    { name: t("nav.info"), path: `/r/${slug}/info` },
  ];

  return (
    <header
      className={`w-full bg-gradient-to-r from-black via-[#111] to-[#1a1a1a] px-6 py-4 shadow-md`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex justify-between items-center">
        <div
          className={`flex justify-between items-center ${
            isRTL ? "flex-row-reverse" : ""
          }`}
          onClick={() => navigate("/")}
        >
          {restaurantInfo && (
            <img
              src={`${BASE_URL}${restaurantInfo.logo}`}
              alt="logo"
              className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-md"
            />
          )}
          <h2 className="text-2xl font-bold text-red-500 hover:text-red-600 transition">
            {restaurantInfo?.name}
          </h2>
        </div>
        <LanguageSwitcher />

        <div className={`hidden md:flex items-center gap-8 `}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-gray-300 hover:text-white font-medium transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <button
            onClick={handleOrdersClick}
            className="text-gray-300 hover:text-white font-medium transition-colors"
          >
            {t("nav.orders")}
          </button>

          {username ? (
            <div
              className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div
                className="bg-red-500 text-white rounded-full w-10 h-10 flex justify-center items-center font-bold uppercase cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                {username.slice(0, 2)}
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                {t("auth.logout")}
              </button>
            </div>
          ) : (
            <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Link
                to={`/r/${slug}/login`}
                className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
              >
                {t("auth.login")}
              </Link>

              <Link
                to={`/r/${slug}/signup`}
                className="px-4 py-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition"
              >
                {t("auth.signup")}
              </Link>
            </div>
          )}
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {menuOpen && (
        <div
          className={`md:hidden mt-4 flex flex-col gap-4 bg-[#111] p-4 rounded-lg animate-fadeIn ${
            isRTL ? "items-end text-right" : ""
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-gray-300 hover:text-white text-lg"
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <button
            onClick={() => {
              handleOrdersClick();
              setMenuOpen(false);
            }}
            className="text-gray-300 hover:text-white text-lg text-left"
          >
            {t("nav.orders")}
          </button>

          {username ? (
            <div className={`flex flex-col gap-4 ${isRTL ? "items-end" : ""}`}>
              <div
                className="bg-red-500 text-white rounded-full w-12 h-12 flex justify-center items-center font-bold uppercase"
                onClick={() => {
                  navigate("/profile");
                  setMenuOpen(false);
                }}
              >
                {username.slice(0, 2)}
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="text-gray-400 hover:text-white"
              >
                {t("auth.logout")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full bg-red-500 text-white text-center"
                onClick={() => setMenuOpen(false)}
              >
                {t("auth.login")}
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-full bg-gray-700 text-white text-center"
                onClick={() => setMenuOpen(false)}
              >
                {t("auth.signup")}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
