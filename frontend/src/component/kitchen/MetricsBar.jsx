export default function MetricsBar({ orders }) {
  const totalOrders = orders.length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const inProgress = orders.filter((o) => o.status === "in_progress").length;
  const ready = orders.filter((o) => o.status === "ready").length;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 flex justify-between items-center text-sm text-gray-700">
      <span>Total Orders: <b>{totalOrders}</b></span>
      <span>Pending: <b>{pending}</b></span>
      <span>In Progress: <b>{inProgress}</b></span>
      <span>Ready: <b>{ready}</b></span>
    </div>
  );
}
