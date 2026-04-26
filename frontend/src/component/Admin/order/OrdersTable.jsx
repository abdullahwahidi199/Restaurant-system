import { Eye, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function OrdersTable({ orders, onView, onCancel, role }) {
  const { t } = useTranslation();
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-blue-100 text-blue-700",
    ready: "bg-indigo-100 text-indigo-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const canCancelOrder = (order, role) => {
    if (!order) return false;
    if (["completed", "cancelled"].includes(order.status)) {
      return false;
    }
    if (role === "Admin") {
      return true;
    }
    if (role === "Waiter") {
      return order.status === "pending";
    }
    return false;
  };
  return (
    <div className="mt-4 overflow-x-auto bg-white rounded-xl shadow">
      <table className="w-full rtl:text-right ltr:text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th>{t("table.order_id")}</th>
            <th>{t("table.customer")}</th>
            <th>{t("table.total")}</th>
            <th>{t("table.table")}</th>
            <th>{t("table.status")}</th>
            <th>Created by</th>
            <th>Recieved by</th>

            <th>{t("table.date")}</th>
            <th className="text-center">{t("table.actions")}</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{order.id}</td>
              <td className="p-3">{order.name}</td>
              <td className="p-3">{order.total} AFN</td>
              <td className="p-3">
                {order.table ? order.tableName : t("table.takeaway")}
              </td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}
                >
                  {order.status_display}
                </span>
              </td>
              <td className="p-3">{order.created_by_name}</td>
              {order.received_by_name ? (
                <td>{order.received_by_name}</td>
              ) : (
                <td>Not paid yet</td>
              )}
              <td className="p-3">
                {new Date(order.created_at).toLocaleDateString()}
              </td>
              <td className="p-3 text-center">
                <div className="flex justify-center gap-2 rtl:flex-row-reverse">
                  <button
                    onClick={() => onView(order)}
                    className="bg-blue-100 p-2 rounded hover:bg-blue-200"
                    aria-label="View order"
                  >
                    <Eye size={16} />
                  </button>
                  {canCancelOrder(order, role) ? (
                    <button
                      onClick={() => onCancel(order)}
                      className="bg-red-100 p-2 rounded hover:bg-red-200"
                    >
                      <XCircle size={16} />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-100 p-2 rounded opacity-40 cursor-not-allowed"
                      title="Cannot cancel this order"
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
