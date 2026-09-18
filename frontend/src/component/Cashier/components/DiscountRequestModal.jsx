import { useState } from "react";
import { X, Percent, FileText, Send } from "lucide-react";
import instance from "../../../api/axiosInstance";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function DiscountRequestModal({ order, onClose, onSuccess }) {
                 const { t: autoT } = useAutoTranslation();
  const [discountPercent, setDiscountPercent] = useState("");
  const [activeTab, setActiveTab] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  console.log(order);

  const managerLimit = Number(order.manager_discount_limit);
  const total = Number(order.total || 0);

  const previewDiscount = total * (Number(discountPercent || 0) / 100);

  const finalTotal = total - previewDiscount;
  const handleSubmit = async () => {
    if (activeTab === "card") {
      if (!cardNumber.trim()) {
        setError(autoT("legacy.card_number_is_required_0487f323"));
        return;
      }
      if (!customerPhone.trim()) {
        setError(autoT("legacy.customer_phone_number_is_required_7e93d152"));
        return;
      }
      try {
        const res = await instance.post(
          `/orders/discount-cards/${order.id}/apply/`,
          {
            card_number: cardNumber,
            customer_phone: customerPhone,
          },
        );
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.error ||
            "Failed to apply discount card",
        );
      }
    } else {
      try {
        setLoading(true);
        setError("");

        if (!discountPercent || Number(discountPercent) <= 0) {
          setError(autoT("legacy.please_enter_a_valid_discount_percentage_8176d715"));
          return;
        }

        if (!reason.trim()) {
          setError(autoT("legacy.reason_is_required_d691fce5"));
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

        const data = err?.response?.data;

        setError(
          data?.detail ||
            data?.error ||
            data?.non_field_errors?.[0] ||
            Object.values(data || {})?.[0]?.[0] ||
            "Failed to apply discount card",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {autoT("legacy.discount_request_aec874ea")}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {autoT("table.order_number")}{order.order_number}
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
              <span className="text-gray-500">{autoT("table.customer")}</span>
              <span className="font-medium">{order.name}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{autoT("legacy.current_total_0db16a8c")}</span>
              <span className="font-semibold text-lg">{total.toFixed(2)}</span>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("card")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "card"
                  ? "bg-white shadow text-orange-600"
                  : "text-gray-600"
              }`}
            >
              {autoT("legacy.discount_card_21f25b27")}
            </button>
            <button
              onClick={() => setActiveTab("request")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "request"
                  ? "bg-white shadow text-orange-600"
                  : "text-gray-600"
              }`}
            >
              {autoT("legacy.request_discount_ed453809")}
            </button>
          </div>

          {activeTab === "request" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {autoT("legacy.discount_percentage_449188f4")}
                </label>

                <div className="relative">
                  <Percent
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder={autoT("legacy.enter_discount_538f54ad")}
                    className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {Number(discountPercent) > managerLimit && (
                  <p className="text-xs text-red-500 mt-1">
                    {autoT("legacy.discounts_above_95fa2340")} {managerLimit}{autoT("legacy.require_admin_approval_aba72fa6")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{autoT("legacy.reason_f219cc06")}</label>

                <div className="relative">
                  <FileText
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />

                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={autoT("legacy.explain_why_this_discount_is_needed_c9b75537")}
                    className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>
              </div>

              {discountPercent && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span>{autoT("legacy.discount_amount_7c937455")}</span>

                    <span className="text-red-500 font-medium">
                      -{previewDiscount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between font-semibold mt-1">
                    <span>{autoT("legacy.final_total_865bf183")}</span>

                    <span className="text-green-600">
                      {finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "card" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {autoT("legacy.card_number_b5e9a5e8")}
                </label>

                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder={autoT("legacy.enter_card_number_7b6a18c5")}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {autoT("legacy.customer_phone_268cb765")}
                </label>

                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={autoT("legacy.enter_phone_number_a2260785")}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border hover:bg-gray-50 transition"
          >
            {autoT("staff.cancel")}
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={16} />

            {loading ? autoT("submitting") : autoT("legacy.submit_request_d0015743")}
          </button>
        </div>
      </div>
    </div>
  );
}
