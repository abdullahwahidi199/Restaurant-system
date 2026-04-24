import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function MenuDetails({ item, onClose }) {
  const { t, i18n } = useTranslation();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir={isRTL ? "rtl" : "ltr"}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
      >
        <img
          src={`${BASE_URL}${item.image}`}
          alt={item.name}
          className="w-full h-56 object-cover"
        />

        <div className={`p-6 ${isRTL ? "text-right" : "text-left"}`}>
          <h2 className="text-3xl font-bold mb-2 text-white">
            {item.name.replace("-", " ")}
          </h2>

          <p className="text-gray-300 mb-4">
            {item.description || t("menuDetails.noDescription")}
          </p>

          <p className="text-red-500 text-2xl font-bold mb-4">
            {t("menuDetails.price")}: {item.price}
          </p>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-3">
              {t("menuDetails.ingredients")}
            </h3>

            {item.ingredients && item.ingredients.length > 0 ? (
              <div className="space-y-2">
                {item.ingredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="bg-gray-700/60 rounded-lg px-4 py-2 flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-200">{ing.ingredient_name}</span>
                    <span className="text-yellow-400 font-medium">
                      {ing.quantity_used}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">{t("menuDetails.noIngredients")}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-300"
          >
            {t("menuDetails.close")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
