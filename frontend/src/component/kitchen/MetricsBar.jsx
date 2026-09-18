import { useTranslation as useAutoTranslation } from "react-i18next";export default function MetricsBar({ orders }) {
                 const { t: autoT } = useAutoTranslation();
  const totalOrders = orders.length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const inProgress = orders.filter((o) => o.status === "in_progress").length;
  const ready = orders.filter((o) => o.status === "ready").length;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 flex justify-between items-center text-sm text-gray-700">
      <span>{autoT("legacy.total_orders_7c2384ae")} <b>{totalOrders}</b></span>
      <span>{autoT("legacy.pending_cacc0744")} <b>{pending}</b></span>
      <span>{autoT("legacy.in_progress_5a2e9a5f")} <b>{inProgress}</b></span>
      <span>{autoT("legacy.ready_e9569035")} <b>{ready}</b></span>
    </div>
  );
}
