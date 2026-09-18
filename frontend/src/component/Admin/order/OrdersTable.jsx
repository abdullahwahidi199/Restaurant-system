import { Eye, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatusBadge from "../../../modules/shared/erp/components/StatusBadge";
export default function OrdersTable({ orders, onView, onCancel, role }) {
  const { t } = useTranslation();

  const canCancelOrder = (order, role) => {
    if (!order) return false;
    if (["completed", "cancelled"].includes(order.status)) {
      return false;
    }
    if (role === "Admin" || role === "BranchAdmin") {
      return true;
    }
    if (role === "Waiter") {
      return order.status === "pending";
    }
    return false;
  };

  const getOrderTableLabel = (order) => {
    if (order.order_type === "dine-in") {
      return order.tableName || order.order_type_display || order.order_type;
    }

    return order.order_type_display || order.order_type;
  };

  return (
    <div className="theme-table mt-4 overflow-x-auto">
      <table className="w-full min-w-[760px] rtl:text-right ltr:text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th>{t("table.order_number")}</th>
            <th>{t("table.customer")}</th>
            <th>{t("table.total")}</th>
            <th>{t("table.table")}</th>
            <th>{t("table.status")}</th>
            <th>{t("legacy.created_by_5d73cc30")}</th>
            <th>{t("legacy.recieved_by_da0fed0b")}</th>

            <th>{t("table.date")}</th>
            <th className="text-center">{t("table.actions")}</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{order.order_number}</td>
              <td className="p-3">{order.name}</td>
              <td className="p-3">{order.total} {t("labels.afn")}</td>
              <td className="p-3">{getOrderTableLabel(order)}</td>
              <td className="p-3">
                <StatusBadge status={order.status} label={order.status_display} />
              </td>
              <td className="p-3">{order.created_by_name}</td>
              {order.received_by_name ? (
                <td>{order.received_by_name}</td>
              ) : (
                <td>{t("legacy.not_paid_yet_413df8dd")}</td>
              )}
              <td className="p-3">
                {new Date(order.created_at).toLocaleDateString()}
              </td>
              <td className="p-3 text-center">
                <div className="flex justify-center gap-2 rtl:flex-row-reverse">
                  <button
                    onClick={() => onView(order)}
                    className="theme-btn theme-btn-outline theme-btn-icon text-[var(--theme-info)]"
                    aria-label={t("legacy.view_order_0df27975")}
                  >
                    <Eye size={16} />
                  </button>
                  {canCancelOrder(order, role) ? (
                    <button
                      onClick={() => onCancel(order)}
                      className="theme-btn theme-btn-icon bg-[var(--theme-danger-soft)] text-[var(--theme-danger)] hover:bg-[var(--theme-danger)] hover:text-[var(--theme-text-inverse)]"
                      aria-label={t("orders.labels.cancel_order")}
                    >
                      <XCircle size={16} />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="theme-btn theme-btn-icon theme-muted cursor-not-allowed opacity-40"
                      title={t("legacy.cannot_cancel_this_order_26731abf")}
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
