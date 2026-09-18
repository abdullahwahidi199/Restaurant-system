import React from "react";
import { useTranslation as useAutoTranslation } from "react-i18next";

const OrderDetailsModal = ({
  order,
  onClose,
  onPrintBill,
  onAssignDelivery,
  onMarkCompleted,
}) => {
                            const { t: autoT } = useAutoTranslation();
  if (!order) return null;

  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => {
    // Skip cancelled items
    if (item.status === "cancelled") {
      return sum;
    }

    const qty = item.qty ?? item.quantity ?? 0;

    const price =
      item.price_at_order ?? item.item_price ?? item.menu_item?.price ?? 0;

    return sum + qty * price;
  }, 0);

  //   const finalTotal = (subtotal + reservation_fee).toFixed(2);
  const finalTotal = Number(order.total || 0);
  const remainingTotal = Number(order.remaining_total || 0);
  const reservationPaid = Number(order.reservation_payment?.paid || 0);

  const statusLabel =
    order.status_display ||
    (order.status
      ? String(order.status)
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Pending");

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 rounded-2xl shadow-lg p-6 relative">
        <button
          onClick={onClose}
          aria-label={autoT("menuDetails.close")}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          {autoT("legacy.order_7e7d5202")}{order.order_number}
        </h2>

        <div className="mb-4">
          <p className="text-gray-600 mb-1">
            <strong>{autoT("legacy.customer_5e0d7363")}</strong> {order.name || order.customer}
          </p>
          <p className="text-gray-600 mb-1">
            <strong>{autoT("legacy.type_ee3fb11d")}</strong>{" "}
            {order.order_type_display || order.order_type}
          </p>
          {order.table && (
            <p className="text-gray-600 mb-1">
              <strong>{autoT("legacy.table_692eeda0")}</strong> {order.tableName}
            </p>
          )}
          <p className="text-gray-600 mb-1">
            <strong>{autoT("legacy.phone_daeea4d0")}</strong> {order.phone || "—"}
          </p>
          <p className="text-gray-600 mb-1">
            <strong>{autoT("legacy.status_11dc9e19")}</strong> {statusLabel}
          </p>
          <p className="text-gray-600 mb-1">
            <strong>{autoT("legacy.created_by_99d17454")}</strong> {order.created_by_name}
          </p>
          {order.status === "out_for_delivery" && (
            <p className="text-gray-600 mb-1">
              <strong>{autoT("legacy.delivered_by_087880ce")} </strong> {order.delivery_boy_details.name}
            </p>
          )}
          {order.status === "out_for_delivery" && (
            <p className="text-gray-600 mb-1">
              <strong>{autoT("legacy.vehicle_number_5c76b92c")} </strong>{" "}
              {order.delivery_boy_details.vehicle_number}
            </p>
          )}
        </div>

        <div className="border-t pt-3 mb-3">
          <h3 className="font-semibold text-lg mb-2">{autoT("modal.items")}</h3>
          <table className="w-full text-sm text-gray-600">
            <thead>
              <tr className="text-left border-b">
                <th className="py-1">{autoT("legacy.item_ecdda59a")}</th>
                <th className="py-1 text-center">{autoT("inventory_manager.common.qty")}</th>
                <th className="py-1 text-right">{autoT("menuDetails.price")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const qty = item.qty ?? item.quantity ?? 0;
                const price =
                  item.price_at_order ??
                  item.item_price ??
                  item.menu_item?.price ??
                  0;
                const name = item.name ?? item.item_name ?? "Item";

                const isCancelled = item.status === "cancelled";

                return (
                  <tr
                    key={index}
                    className={`border-b last:border-none ${
                      isCancelled ? "opacity-50" : ""
                    }`}
                  >
                    <td
                      className={`py-1 ${
                        isCancelled ? "line-through text-red-500" : ""
                      }`}
                    >
                      {name}
                      {isCancelled && (
                        <span className="ml-1 text-[10px] text-red-500">
                          {autoT("legacy.cancelled_948c9daf")}
                        </span>
                      )}
                    </td>

                    <td className="py-1 text-center">{qty}</td>

                    <td className="py-1 text-right">
                      {isCancelled
                        ? autoT("legacy.afn_0_00_bf1a9b95")
                        : `AFN ${(qty * price).toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-right text-gray-800 space-y-1">
          <p>{autoT("legacy.food_subtotal_afn_51340b9c")}{subtotal.toFixed(2)}</p>

          {order.reservation_payment && (
            <>
              <p>
                {autoT("legacy.reservation_total_afn_140cea0f")}
                {Number(order.reservation_payment.total).toFixed(2)}
              </p>

              <p className="text-green-600">
                {autoT("legacy.reservation_paid_afn_a2c97586")}
                {reservationPaid.toFixed(2)}
              </p>
            </>
          )}

          {Number(order.delivery_fee) > 0 && (
            <p>
              {autoT("legacy.delivery_fee_afn_c6e8adff")}
              {Number(order.delivery_fee).toFixed(2)}
            </p>
          )}

          {Number(order.discount_percent) > 0 && (
            <p className="text-red-600">{autoT("legacy.discount_811474dc")} {order.discount_percent}%</p>
          )}

          <h3 className="text-xl font-bold mt-2">
            {autoT("legacy.total_afn_2633598b")}{finalTotal.toFixed(2)}
          </h3>

          {reservationPaid > 0 && (
            <p className="text-blue-600 font-semibold">
              {autoT("legacy.remaining_afn_7b89e368")}{remainingTotal.toFixed(2)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-all"
          >
            {autoT("menuDetails.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
