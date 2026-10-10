import { useTranslation } from "react-i18next";
import { money } from "../../modules/shared/erp/formatters";

export default function RestaurantTableDetails({ table }) {
  const { t, i18n } = useTranslation();
  const order = table.current_order;
  const itemCount =
    order?.item_count ??
    (Array.isArray(order?.items) ? order.items.length : null);
  const reservations = [
    { label: t("tables_workspace.current_reservation"), value: table.current_reservation },
    { label: t("tables_workspace.next_reservation"), value: table.upcoming_reservation },
  ].filter((reservation) => reservation.value);

  const formatTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString(i18n.language, {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  if (!order && reservations.length === 0) {
    return <p className="text-xs leading-5 theme-text-muted">{t("no_orders_yet")}</p>;
  }

  return (
    <>
      {order && (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs leading-5">
            <p className="theme-text-muted">
              {t("tables_workspace.active_order")}
              {order.order_number && (
                <bdi className="ms-1.5">#{order.order_number}</bdi>
              )}
            </p>
            {order.total != null && (
              <bdi className="font-medium tabular-nums theme-text-primary">
                {money(order.total)}
              </bdi>
            )}
          </div>
          {(order.name || order.phone) && (
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs leading-5">
              {order.name && <p className="break-words theme-text-secondary">{order.name}</p>}
              {order.phone && <bdi className="theme-text-muted">{order.phone}</bdi>}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-x-2 text-xs leading-5 theme-text-secondary">
            {itemCount != null && <span>{t("items")}: {itemCount}</span>}
            {itemCount != null && order.status && <span aria-hidden="true">·</span>}
            {order.status && (
              <span>
                {t(`status.${order.status}`, {
                  defaultValue: String(order.status).replaceAll("_", " "),
                })}
              </span>
            )}
          </div>
        </div>
      )}

      {reservations.map(({ label, value }) => (
        <div key={label} className="space-y-1 text-xs leading-5">
          <p className="theme-text-muted">{label}</p>
          <p className="break-words theme-text-secondary">{value.customer_name || "-"}</p>
          {value.time && (
            <p className="theme-text-muted">{formatTime(value.time)}</p>
          )}
        </div>
      ))}
    </>
  );
}
