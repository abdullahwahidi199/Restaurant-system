import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  getPublicContextFromParams,
  getStoredPublicOrderingContext,
  getReviewApiPath,
} from "../../api/publicOrdering";

export default function ReviewItemModel({
  itemId = "",
  onClose,
  deliveryId = "",
  restaurantSlug,
  branchSlug,
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("customer"));

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ps" || i18n.language === "fa";
  const BASE_URL = import.meta.env.VITE_API_URL;
  const params = useParams();
  const storedContext = getStoredPublicOrderingContext();
  const publicContext = {
    ...getPublicContextFromParams(params),
    restaurantSlug:
      restaurantSlug ||
      params.restaurantSlug ||
      params.slug ||
      storedContext?.restaurantSlug ||
      "",
    branchSlug: branchSlug || params.branchSlug || storedContext?.branchSlug || "",
  };

  const handleSubmit = async () => {
    if (!rating) return toast.error(t("review.errors.select_rating"));
    if (!user) return toast.error(t("review.errors.auth_required"));
    if (!publicContext.restaurantSlug) {
      return toast.error(t("review.errors.submit_failed"));
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}${getReviewApiPath(publicContext)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.access ? { Authorization: `Bearer ${user.access}` } : {}),
        },
        body: JSON.stringify({
          customer: user.id,
          menu_item: itemId,
          delivery: deliveryId,
          rating: rating,
          comment: comment,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(t("review.success"));
        setRating(0);
        setComment("");
        onClose();
      } else {
        toast.error(result.error || t("review.errors.submit_failed"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("review.errors.submit_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          transition={{ type: "spring", stiffness: 120 }}
            className="relative w-96 rounded-2xl bg-white p-6 text-gray-950 shadow-2xl"
          >
            <X
              onClick={onClose}
              className={`absolute top-4 cursor-pointer text-gray-400 hover:text-red-500 ${isRTL ? "left-4" : "right-4"}`}
            />
            <h2 className="text-2xl font-bold mb-4 text-center">
              {t("review.title")}
            </h2>

            <div className="mb-4 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-colors ${
                    rating >= star ? "text-yellow-400" : "text-gray-500"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("review.comment_placeholder")}
              className="mb-4 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-full font-bold transition disabled:opacity-50"
            >
              {loading ? t("review.submitting") : t("review.submit")}
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
