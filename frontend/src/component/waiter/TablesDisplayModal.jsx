import { useState } from "react";
import { CheckCircle, Coffee, Ban, Calendar } from "lucide-react";
import TableActionModal from "./TableActionModal";
import OrderCancellationToast from "../OrderCancellationToast";
import instance from "../../api/axiosInstance";

export default function TablesDisplayModal({ tables, refetchTables }) {
  const [filter, setFilter] = useState("all");
  const [selectedTable, setSelectedTable] = useState(null);
  const [showCancelToast, setShowCancelToast] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const role = JSON.parse(localStorage.getItem("user"))?.role;

  const handleTableClick = (table) => setSelectedTable(table);

  // Filter logic: "reserved" checks for current_reservation object
  const filteredTables =
    filter === "all"
      ? tables
      : tables.filter((t) => {
          if (filter === "reserved") return !!t.current_reservation;
          return t.status === filter;
        });

  const handleCancelClick = (order) => {
    setOrderToCancel(order);
    setShowCancelToast(true);
  };

  const cancelOrder = async (id) => {
    if (!id) return;
    const order = orderToCancel;
    const isWaiter = role === "waiter";
    const isPending = order?.status === "pending";

    if (isWaiter && !isPending) {
      alert("Waiters can only cancel pending orders.");
      return;
    }

    try {
      await instance.patch(`/orders/${id}/cancel/`);
      setShowCancelToast(false);
      setOrderToCancel(null);
      refetchTables();
    } catch (error) {
      console.error("Cancel failed:", error);
    }
  };

  const getStatusIcon = (status, hasReservation) => {
    if (hasReservation) return <Calendar className="text-purple-600 w-5 h-5" />;
    switch (status) {
      case "available":
        return <CheckCircle className="text-green-600 w-5 h-5" />;
      case "occupied":
        return <Coffee className="text-orange-600 w-5 h-5" />;
      case "unavailable":
        return <Ban className="text-gray-600 w-5 h-5" />;
      default:
        return null;
    }
  };

  const getCardStyle = (status, hasReservation) => {
    if (hasReservation)
      return "bg-purple-100 border-purple-500 hover:bg-purple-200";
    switch (status) {
      case "available":
        return "bg-green-100 border-green-500 hover:bg-green-200";
      case "occupied":
        return "bg-orange-100 border-orange-500 hover:bg-orange-200";
      case "unavailable":
        return "bg-gray-200 border-gray-400 opacity-70 cursor-not-allowed";
      default:
        return "";
    }
  };

  const formatReservationTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
  };

  // Accurate counts (excludes reserved from available count)
  const availableCount = tables.filter(
    (t) => t.status === "available" && !t.current_reservation,
  ).length;
  const occupiedCount = tables.filter((t) => t.status === "occupied").length;
  const reservedCount = tables.filter((t) => !!t.current_reservation).length;
  const unavailableCount = tables.filter(
    (t) => t.status === "unavailable",
  ).length;

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Waiter Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          {["all", "available", "occupied", "reserved", "unavailable"].map(
            (s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-white transition
                ${filter === s ? "scale-105 shadow" : ""}
                ${
                  s === "available"
                    ? "bg-green-500 hover:bg-green-600"
                    : s === "occupied"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : s === "reserved"
                        ? "bg-purple-500 hover:bg-purple-600"
                        : s === "unavailable"
                          ? "bg-gray-500 hover:bg-gray-600"
                          : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="mb-4 text-gray-700 font-medium flex flex-wrap gap-4">
        <span>🟢 {availableCount} Available</span>
        <span>🟠 {occupiedCount} Occupied</span>
        <span>🟣 {reservedCount} Reserved</span>
        <span>⚫ {unavailableCount} Unavailable</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-8">
            No tables found.
          </p>
        ) : (
          filteredTables.map((table) => {
            const order = table.current_order;
            const hasReservation = !!table.current_reservation;

            const canCancel = order && order.status === "pending";
            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`p-4 rounded-2xl shadow-md border transition cursor-pointer relative
                  ${getCardStyle(table.status, hasReservation)}`}
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {getStatusIcon(table.status, hasReservation)}
                    <h2 className="text-lg font-bold truncate">
                      Table {table.name}
                    </h2>
                  </div>

                  {order && (
                    <button
                      disabled={!canCancel}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!canCancel) return;
                        handleCancelClick(order);
                      }}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition ${
                        canCancel
                          ? "bg-red-500 hover:bg-red-600 shadow-sm"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-700">
                  Capacity: {table.capacity}
                </p>
                <p className="text-sm capitalize text-gray-800">
                  Status: {hasReservation ? "Reserved" : table.status}
                </p>

                {["pending", "in_progress", "ready"].includes(
                  order?.status,
                ) && (
                  <p className="text-sm capitalize text-gray-800">
                    Kitchen: {order.status}
                  </p>
                )}

                {table.note && (
                  <p className="text-xs text-gray-600 italic mt-1">
                    Note: {table.note}
                  </p>
                )}

                {/* Reservation Details Block */}
                {table.current_reservation && (
                  <div className="mt-3 p-2 bg-white/60 rounded-lg border border-purple-200">
                    <p className="text-xs font-semibold text-purple-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Current Reservation
                    </p>
                    <p className="text-xs text-purple-700 mt-0.5">
                      👤 {table.current_reservation.customer_name}
                    </p>
                    <p className="text-xs text-purple-600">
                      🕒 {formatReservationTime(table.current_reservation.time)}
                    </p>
                  </div>
                )}

                {/* Upcoming Reservation */}
                {table.upcoming_reservation && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Next Reservation
                    </p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      👤 {table.upcoming_reservation.customer_name}
                    </p>
                    <p className="text-xs text-blue-600">
                      🕒{" "}
                      {formatReservationTime(table.upcoming_reservation.time)}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedTable && (
        <TableActionModal
          table={selectedTable}
          refetchTables={refetchTables}
          onClose={() => setSelectedTable(null)}
        />
      )}

      {showCancelToast && (
        <OrderCancellationToast
          orderId={orderToCancel?.id}
          onClose={() => {
            setShowCancelToast(false);
            setOrderToCancel(null);
          }}
          onConfirm={async (id) => await cancelOrder(id)}
        />
      )}
    </div>
  );
}
