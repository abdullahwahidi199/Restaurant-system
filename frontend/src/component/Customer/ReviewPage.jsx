import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { X } from "lucide-react";

export default function ReviewItemModel({  itemId='', onClose,deliveryId='' }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const user=JSON.parse(localStorage.getItem("customer"))
 
  

  const BASE_URL = "http://127.0.0.1:8000";

  const handleSubmit = async () => {
    if (!rating) return toast.error("Please select a rating!");
    if (!user) return toast.error("You must sign up before u rate item!")
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/menu/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.access ? { Authorization: `Bearer ${user.access}` } : {}),
        },
        body: JSON.stringify({
          customer: user.id,
          menu_item: itemId,
          delivery:deliveryId,
          rating: rating,
          comment: comment,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Review submitted successfully!");
        setRating(0);
        setComment("");
        onClose();
      } else {
        toast.error(result.error || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while submitting review");
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
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="bg-[#111] text-white rounded-2xl p-6 w-96 relative"
          >
            <X
              onClick={onClose}
              className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-red-500"
            />
            <h2 className="text-2xl font-bold mb-4 text-center">Leave a Review</h2>

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
              placeholder="Write your comment..."
              className="w-full bg-[#1a1a1a] rounded-lg p-3 text-white placeholder-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={4}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-full font-bold transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
