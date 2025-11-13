import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import instance from "../../../api/axiosInstance";
import {
  Star,
  MessageSquare,
  Send,
  X,
  Truck,
  Utensils,
  User,
  CalendarDays,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function FeedBacksDisplay({ reviews, refresh }) {
  const [responseText, setResponseText] = useState("");
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [loading, setLoading] = useState(false);
  const now=new Date()
  console.log(now)

  const handleRespond = async (reviewId) => {
    if (!responseText.trim()) return toast.error("Response cannot be empty!");
    setLoading(true);
    try {
      await instance.patch(`/menu/reviews/${reviewId}/`, { response: responseText,responded_at: now});
      toast.success("Response submitted!");
      setResponseText("");
      setActiveReviewId(null);
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit response");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <Toaster position="top-center" />
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No reviews found.</p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reviews.map((review) => {
            const isMenuReview = review.menu_item !== null;
            const isDeliveryReview = review.delivery !== null;

            return (
              <div
                key={review.id}
                className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all duration-200"
              >
               
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 text-gray-800 font-medium">
                      <User className="w-4 h-4 text-blue-500" />
                      {review.customerName}
                    </div>

                    <div className="flex items-center gap-1 text-yellow-500 mt-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">
                        ({review.rating})
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {formatDate(review.created_at)}
                  </div>
                </div>

                
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  {isMenuReview ? (
                    <>
                      <Utensils className="w-4 h-4 text-blue-500 mr-1" />
                      <span>
                        Menu Item:{" "}
                        <span className="font-semibold text-gray-800">
                          {review.menu_item_name}
                        </span>
                      </span>
                    </>
                  ) : isDeliveryReview ? (
                    <>
                      <Truck className="w-4 h-4 text-green-500 mr-1" />
                      <span>Delivery Review</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 text-gray-400 mr-1" />
                      <span>General Review</span>
                    </>
                  )}
                </div>

                
                <div className="mb-4">
                  {review.comment ? (
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  ) : (
                    <p className="italic text-gray-400">No comment given.</p>
                  )}
                </div>

                {/* Response Section */}
                {review.response ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-green-800">
                    <div className="flex items-center gap-1 mb-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Response
                    </div>
                    <p>{review.response}</p>

                    <div className="text-xs flex items-center gap-1 text-gray-400 mt-2">
                      <Clock className="w-3 h-3" />
                      Responded on {formatDate(review.responded_at)}
                    </div>
                  </div>
                ) : activeReviewId === review.id ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <textarea
                      rows={2}
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="border border-gray-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="Write your response..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(review.id)}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition"
                      >
                        <Send className="w-4 h-4" />
                        {loading ? "Submitting..." : "Submit"}
                      </button>
                      <button
                        onClick={() => setActiveReviewId(null)}
                        className="text-gray-500 hover:text-red-500 px-3 py-2 text-sm flex items-center gap-1 transition"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveReviewId(review.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mt-1 transition"
                  >
                    <MessageSquare className="w-4 h-4" /> Respond
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
