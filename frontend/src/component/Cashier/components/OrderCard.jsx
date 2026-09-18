import React, { useState } from "react";
import instance from "../../../api/axiosInstance";
import { toast } from "react-hot-toast";
import DiscountRequestModal from "./DiscountRequestModal";
import OrderEditModal from "./OrderEditModal";
import OrderCancellationToast from "../../OrderCancellationToast";
import { useTranslation as useAutoTranslation } from "react-i18next";

const OrderCard = ({
  order = {},
  onViewDetails,
  onPrintBill,
  onAssignDelivery,
  onMarkCompleted,
}) => {
                    const { t: autoT } = useAutoTranslation();
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  // console.log(order);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const items = order.items || [];
  const canEditOrder = () => {
    const t = (order.order_type || "").toLowerCase();
    return ["takeaway", "delivery"].includes(t);
  };

  const canCancelOrder = () => {
    const t = (order.order_type || "").toLowerCase();
    return ["takeaway", "delivery"].includes(t) && order.status === "pending";
  };
  const getQty = (it) => it.qty ?? it.quantity ?? 0;
  console.log(order);

  const getPrice = (it) =>
    it.price ?? it.item_price ?? it.menu_item?.price ?? 0;

  const subtotal = items.reduce(
    (sum, it) => sum + getQty(it) * getPrice(it),
    0,
  );

  const isPrinted = order.is_printed;

  const tax = subtotal * (order.tax ?? 0);

  const formattedTotal = (Number(order.remaining_total) + tax).toFixed(2);
  const latestDiscountRequest =
    order.discount_requests?.[order.discount_requests.length - 1] || null;

  const statusLabel =
    order.status_display ||
    (order.status
      ? String(order.status)
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Pending");

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "In Progress":
        return "bg-blue-100 text-blue-700";

      case "Ready":
        return "bg-green-100 text-green-700";

      case "Out for Delivery":
        return "bg-purple-100 text-purple-700";

      case "Completed":
        return "bg-gray-200 text-gray-600";

      default:
        if (status && status.startsWith("Assigned to"))
          return "bg-green-100 text-green-700";

        return "bg-gray-100 text-gray-600";
    }
  };

  const handleMarkDelivered = async () => {
    try {
      const response = await instance.patch(
        `/orders/orders/${order.id}/update_status/`,
        {
          status: "delivered",
        },
      );

      onMarkCompleted(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrint = async (order) => {
    // If not served yet
    if (order.status !== "served" && order.order_type === "dine-in") {
      const confirmed = window.confirm(
        "This order is not marked as served yet.\n\nMark as served and print bill?",
      );

      if (!confirmed) return;

      try {
        // Mark as served first
        await instance.patch(`/orders/orders/${order.id}/update_status/`, {
          status: "served",
        });

        toast.success(autoT("legacy.order_marked_as_served_3beeb984"));

        // Then print
        onPrintBill && onPrintBill(order);
      } catch (error) {
        console.error(error);
        toast.error(autoT("legacy.failed_to_mark_order_as_served_e87fbf52"));
      }

      return;
    }

    onPrintBill && onPrintBill(order);
  };

  const handleMarkPaid = async (order) => {
    try {
      const response = await instance.patch(
        `/orders/orders/${order.id}/update_status/`,
        {
          status: "completed",
        },
      );

      onMarkCompleted(response.data);

      toast.success(autoT("legacy.payment_completed_456b71b4"));
    } catch (error) {
      console.error(error);

      toast.error(autoT("legacy.failed_to_mark_paid_fc464c28"));
    }
  };

  const cancelOrder = async () => {
    if (order.status !== "pending") {
      toast.error(autoT("legacy.only_pending_orders_can_be_cancelled_15257a77"));
      return;
    }

    try {
      await instance.patch(`/orders/${order.id}/cancel/`);

      toast.success(autoT("legacy.order_cancelled_successfully_646b7eb7"));

      setShowCancelConfirm(false);
    } catch (error) {
      console.error(error);
      toast.error(autoT("legacy.failed_to_cancel_order_5cc659d5"));
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all">
        =
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-lg">
            {autoT("table.order_number")}{order.order_number || "—"}
          </h3>

          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
              statusLabel,
            )}`}
          >
            {statusLabel}
          </span>
        </div>
        {/* Info */}
        <p className="text-sm text-gray-600 mb-1">
          <strong>{autoT("legacy.type_ee3fb11d")}</strong>{" "}
          {order.order_type_display ||
            (order.order_type && order.order_type.replace(/_/g, " ")) ||
            "—"}
        </p>
        {order.table && (
          <p className="text-lg text-gray-600 mb-1">
            <strong>{autoT("legacy.table_692eeda0")}</strong> {order.tableName}
          </p>
        )}
        <p className="text-sm text-gray-600 mb-1">
          <strong>{autoT("legacy.customer_5e0d7363")}</strong> {order.name || order.customer || "—"}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          <strong>{autoT("legacy.created_by_99d17454")}</strong> {order.created_by_name}
        </p>
        {order.delivery_boy && (
          <p className="text-sm text-gray-600 mb-1">
            <strong>{autoT("legacy.delivery_person_cbbce489")}</strong> {order.delivery_boy_details.name}
          </p>
        )}
        {Number(order.discount_percent) > 0 && (
          <div className="mt-2 inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            {order.discount_percent}{autoT("legacy.discount_applied_9a15d802")}
          </div>
        )}
        <div className="flex flex-col mt-3 gap-2">
          <div>
            <p className="font-semibold text-gray-800 text-lg">
              {autoT("legacy.total_d8e7170f")} {formattedTotal} {autoT("labels.afn")}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 flex-wrap">
            {/* View */}
            <button
              onClick={() => onViewDetails && onViewDetails(order)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-lg transition-all"
            >
              {autoT("inventory_manager.common.view")}
            </button>
            {canEditOrder() && order.status !== "completed" && (
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1 rounded-lg transition-all"
              >
                {autoT("staff.table.edit")}
              </button>
            )}
            {order.status !== "in_progress" && order.status !== "pending" && (
              <button
                onClick={() => handlePrint(order)}
                className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-lg transition-all"
              >
                {autoT("legacy.print_5b221e9c")}
              </button>
            )}

            {/* Discount Section */}
            {order.status !== "completed" &&
              Number(order.discount_percent) <= 0 && (
                <>
                  {/* No Request Yet */}
                  {!latestDiscountRequest && (
                    <button
                      onClick={() => setShowDiscountModal(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded-lg transition-all"
                    >
                      {autoT("menu_item_sales.discount")}
                    </button>
                  )}

                  {/* Pending */}
                  {latestDiscountRequest?.status === "pending" && (
                    <div className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-lg font-medium">
                      {autoT("legacy.discount_request_pending_61339f2e")}
                    </div>
                  )}

                  {/* Approved */}
                  {latestDiscountRequest?.status === "approved" && (
                    <div className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-lg font-medium">
                      {autoT("legacy.discount_approved_2a79dd32")}
                    </div>
                  )}

                  {/* Rejected */}
                  {latestDiscountRequest?.status === "rejected" && (
                    <div className="flex items-center gap-2">
                      <div className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-lg font-medium">
                        {autoT("legacy.discount_rejected_f3816d6b")}
                      </div>

                      <button
                        onClick={() => setShowDiscountModal(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded-lg transition-all"
                      >
                        {autoT("legacy.request_again_5a9e942e")}
                      </button>
                    </div>
                  )}
                </>
              )}
            {canCancelOrder() && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-lg transition-all"
              >
                {autoT("staff.cancel")}
              </button>
            )}

            {order.status !== "completed" &&
              order.order_type !== "delivery" &&
              order.status !== "pending" &&
              order.status !== "in_progress" && (
                <button
                  disabled={!isPrinted}
                  onClick={() => handleMarkPaid(order)}
                  className={`text-white text-sm px-3 py-1 rounded-lg transition-all
                  ${
                    isPrinted
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {autoT("legacy.mark_paid_522bb480")}
                </button>
              )}

            {/* Assign Delivery */}
            {/* Assign/Reassign Delivery */}
            {String(order.order_type || order.order_type_display || "")
              .toLowerCase()
              .includes("delivery") &&
              order.status !== "completed" &&
              order.status !== "cancelled" && (
                <button
                  onClick={() => onAssignDelivery && onAssignDelivery(order)}
                  className={`text-white text-sm px-3 py-1 rounded-lg transition-all
      ${
        order.delivery_boy
          ? "bg-amber-500 hover:bg-amber-600"
          : "bg-purple-500 hover:bg-purple-600"
      }`}
                >
                  {order.delivery_boy ? autoT("legacy.reassign_55843fb0") : autoT("legacy.assign_24449284")}
                </button>
              )}

            {/* Confirm Cash */}
            {order.order_type == "delivery" &&
              order.status == "out_for_delivery" && (
                <button
                  disabled={!isPrinted}
                  onClick={handleMarkDelivered}
                  className={`text-white text-sm px-3 py-1 rounded-lg transition-all
                  ${
                    isPrinted
                      ? "bg-purple-500 hover:bg-purple-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {autoT("legacy.confirm_cash_1b9603c3")}
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <DiscountRequestModal
          order={order}
          onClose={() => setShowDiscountModal(false)}
          onSuccess={() => {
            toast.success(autoT("legacy.discount_request_submitted_successfully_a68638a2"));

            setShowDiscountModal(false);

            // if (onViewDetails) {
            //   onViewDetails(order);
            // }
          }}
        />
      )}

      {showEditModal && (
        <OrderEditModal
          order={order}
          onClose={() => setShowEditModal(false)}
          // refetchOrders={refetchOrders}
        />
      )}

      {showCancelConfirm && (
        <OrderCancellationToast
          onConfirm={cancelOrder}
          onClose={() => setShowCancelConfirm(false)}
          orderNumber={order.order_number}
        />
      )}
    </>
  );
};

export default OrderCard;
