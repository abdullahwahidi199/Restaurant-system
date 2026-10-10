import { Eye, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatusBadge from "../../../modules/shared/erp/components/StatusBadge";
import EmptyState from "../../../modules/shared/erp/components/EmptyState";
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
    if (role === "Manager") {
      return order.status === "pending";
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

  const renderActions = (order) => (
    <div className="flex justify-end gap-2 rtl:flex-row-reverse">
      <button
        type="button"
        onClick={() => onView(order)}
        className="theme-btn theme-btn-outline theme-btn-icon text-[var(--theme-info)]"
        aria-label={t("legacy.view_order_0df27975")}
      >
        <Eye size={16} />
      </button>
      {canCancelOrder(order, role) ? (
        <button
          type="button"
          onClick={() => onCancel(order)}
          className="theme-btn theme-btn-icon bg-[var(--theme-danger-soft)] text-[var(--theme-danger)] hover:bg-[var(--theme-danger)] hover:text-[var(--theme-text-inverse)]"
          aria-label={t("orders.labels.cancel_order")}
        >
          <XCircle size={16} />
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="theme-btn theme-btn-icon theme-muted cursor-not-allowed opacity-40"
          title={t("legacy.cannot_cancel_this_order_26731abf")}
        >
          <XCircle size={16} />
        </button>
      )}
    </div>
  );

  return (
    <div className="theme-table overflow-hidden">
      <div className="space-y-2 p-3 md:hidden">
        {orders.length ? orders.map((order) => (
          <article key={order.id} className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--theme-border)] pb-3">
              <div>
                <p className="font-semibold theme-text-primary">{order.order_number}</p>
                <p className="mt-0.5 text-xs theme-text-muted">{order.name || "—"}</p>
              </div>
              <StatusBadge status={order.status} label={order.status_display} />
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 py-3 text-xs">
              <div><dt className="theme-text-muted">{t("table.total")}</dt><dd className="mt-0.5 font-semibold tabular-nums theme-text-primary">{order.total} {t("labels.afn")}</dd></div>
              <div><dt className="theme-text-muted">{t("table.table")}</dt><dd className="mt-0.5 theme-text-secondary">{getOrderTableLabel(order)}</dd></div>
              <div><dt className="theme-text-muted">{t("legacy.created_by_5d73cc30")}</dt><dd className="mt-0.5 theme-text-secondary">{order.created_by_name || "—"}</dd></div>
              <div><dt className="theme-text-muted">{t("table.date")}</dt><dd className="mt-0.5 theme-text-secondary">{new Date(order.created_at).toLocaleDateString()}</dd></div>
            </dl>
            <div className="border-t border-[var(--theme-border)] pt-3">{renderActions(order)}</div>
          </article>
        )) : <EmptyState title={t("legacy.no_records_found_96f4f9b2")} />}
      </div>
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[760px] rtl:text-right ltr:text-left">
        <thead>
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
          {orders.length ? orders.map((order) => (
            <tr key={order.id} className="border-b border-[var(--theme-border)]">
              <td className="font-semibold theme-text-primary">{order.order_number}</td>
              <td>{order.name}</td>
              <td className="tabular-nums">{order.total} {t("labels.afn")}</td>
              <td>{getOrderTableLabel(order)}</td>
              <td>
                <StatusBadge status={order.status} label={order.status_display} />
              </td>
              <td>{order.created_by_name}</td>
              {order.received_by_name ? (
                <td>{order.received_by_name}</td>
              ) : (
                <td>{t("legacy.not_paid_yet_413df8dd")}</td>
              )}
              <td>
                {new Date(order.created_at).toLocaleDateString()}
              </td>
              <td>{renderActions(order)}</td>
            </tr>
          )) : (
            <tr><td colSpan={9} className="p-5"><EmptyState title={t("legacy.no_records_found_96f4f9b2")} /></td></tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
