import React, { useEffect, useState } from "react";
import api from "../../api/auth";
import ReviewItemModel from "./ReviewPage";
import useOrdersSocket from "../../hooks/useOrdersSocket";
import OrderCancellationToast from "../OrderCancellationToast";
import { useTranslation } from "react-i18next";
import { Clock3, Receipt, Star, Trash2, PackageCheck } from "lucide-react";
import { useParams } from "react-router-dom";

export default function Orders() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ps" || i18n.language === "fa";
  const { slug } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrderId, setReviewOrderID] = useState(null);
  const [showCancelToast, setShowCancelToast] = useState(false);
  const [orderToBeCancelled, setOrderToBeCanceled] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getRemainingTime = (created_at) => {
    const created = new Date(created_at).getTime();
    const diff = 120000 - (now - created);

    if (diff <= 0) return null;

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useOrdersSocket((data) => {
    setOrders((prev) => {
      if (data.action === "order_created") {
        return [data.order, ...prev];
      }

      if (data.action === "order_updated") {
        return prev.map((o) => (o.id === data.order.id ? data.order : o));
      }

      if (data.action === "order_deleted") {
        return prev.filter((o) => o.id !== data.order.id);
      }

      return prev;
    });
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(`/customer/${slug}/orders`);
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const canCancel = (order) => {
    if (order.status !== "pending") return false;

    const created = new Date(order.created_at);
    const current = new Date();

    return (current - created) / 1000 / 60 <= 2;
  };

  const handleCancelClick = (id) => {
    setOrderToBeCanceled(id);
    setShowCancelToast(true);
  };

  const cancelOrder = async () => {
    try {
      await api.patch(
        `/orders/online-orders/${slug}/${orderToBeCancelled}/cancel/`,
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderToBeCancelled
            ? { ...order, status: "cancelled" }
            : order,
        ),
      );
    } catch (error) {
      alert(error?.response?.data?.error || t("orders.errors.cancel_failed"));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "ready":
      case "ready_for_pickup":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "completed":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center text-lg">
        {t("orders.loading")}
      </div>
    );
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-gray-950 text-white px-4 md:px-6 py-8"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-red-500">
            {t("orders.title")}
          </h2>

          <p className="text-gray-400 mt-2 text-sm md:text-base">
            {orders.length} {t("orders.count")}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center shadow-lg">
            <PackageCheck className="mx-auto mb-4 text-gray-500" size={44} />
            <p className="text-gray-400 text-lg">{t("orders.empty")}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const remaining = getRemainingTime(order.created_at);

              return (
                <div
                  key={order.id}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-5 shadow-lg hover:border-red-500/30 hover:shadow-red-500/10 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {t(`orders.status.${order.status}`)}
                      </span>

                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <Receipt size={14} />#{order.id}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock3 size={14} />
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            {item.menu_item}
                          </p>

                          <p className="text-sm text-gray-400 mt-1">
                            {t("orders.labels.quantity")}: {item.quantity}
                          </p>
                        </div>

                        <p className="font-bold text-red-400 whitespace-nowrap">
                          {item.subtotal} AFN
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setReviewOrderID(order.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition"
                      >
                        <Star size={16} />
                        {t("orders.labels.rate")}
                      </button>

                      {canCancel(order) && (
                        <button
                          onClick={() => handleCancelClick(order.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 transition"
                        >
                          <Trash2 size={16} />
                          {t("orders.labels.cancel_order")}
                        </button>
                      )}
                    </div>

                    <div className="text-lg font-bold text-red-500">
                      {t("orders.labels.total")}: {order.total} AFN
                    </div>
                  </div>

                  {remaining && order.status === "pending" && (
                    <div className="mt-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 text-sm text-yellow-300 flex items-center gap-2">
                      <Clock3 size={16} />
                      {t("orders.labels.cancel_available_for")}: {remaining}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {reviewOrderId && (
        <ReviewItemModel
          deliveryId={reviewOrderId}
          onClose={() => setReviewOrderID(null)}
        />
      )}

      {showCancelToast && (
        <OrderCancellationToast
          onClose={() => setShowCancelToast(false)}
          onConfirm={cancelOrder}
        />
      )}
    </div>
  );
}
