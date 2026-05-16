import { useState } from "react";
import { X, Percent, FileText, Send } from "lucide-react";
import instance from "../../../api/axiosInstance";

export default function DiscountRequestModal({ order, onClose, onSuccess }) {
  const [discountPercent, setDiscountPercent] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  console.log(order);

  const managerLimit = Number(order.manager_discount_limit);
  const total = Number(order.total || 0);

  const previewDiscount = total * (Number(discountPercent || 0) / 100);

  const finalTotal = total - previewDiscount;
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (!discountPercent || Number(discountPercent) <= 0) {
        setError("Please enter a valid discount percentage");
        return;
      }

      if (!reason.trim()) {
        setError("Reason is required");
        return;
      }

      await instance.post(`/orders/orders/${order.id}/discount-request/`, {
        discount_percent: discountPercent,
        reason,
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.error || "Failed to submit discount request",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Discount Request
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Order #{order.order_number}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Customer</span>
              <span className="font-medium">{order.name}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Current Total</span>

              <span className="font-semibold text-lg">{total.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Discount Percentage
            </label>

            <div className="relative">
              <Percent
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="Enter discount %"
                className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {Number(discountPercent) > managerLimit && (
              <p className="text-xs text-red-500 mt-2">
                Discounts above {managerLimit}% require Admin approval.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>

            <div className="relative">
              <FileText
                size={18}
                className="absolute left-3 top-4 text-gray-400"
              />

              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this discount is needed..."
                className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
          </div>

          {discountPercent && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Discount Amount</span>

                <span className="text-red-500 font-medium">
                  -{previewDiscount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between font-bold text-lg">
                <span>Final Total</span>

                <span className="text-green-600">{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={16} />

            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
