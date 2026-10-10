import { useEffect, useState } from "react";

import { CheckCircle, Coffee, Ban, Calendar } from "lucide-react";

import TableActionModal from "./TableActionModal";

import OrderCancellationToast from "../OrderCancellationToast";

import instance from "../../api/axiosInstance";
import { useTranslation as useAutoTranslation } from "react-i18next";

// Color palettes — multiple shades per status for visual variety
const PALETTES = {
  available: [
    {
      bg: "bg-[#00c875]/15",
      border: "border-[#00c875]",
      hover: "",
      icon: "text-[#008f54]",
      filter: "border-[#00c875] bg-[#00c875]/15 text-[#007a48]",
      dot: "bg-[#00c875]",
    },
  ],
  occupied: [
    {
      bg: "bg-[#f59e0b]/15",
      border: "border-[#f59e0b]",
      hover: "",
      icon: "text-[#b45309]",
      filter: "border-[#f59e0b] bg-[#f59e0b]/15 text-[#92400e]",
      dot: "bg-[#f59e0b]",
    },
  ],
  reserved: [
    {
      bg: "bg-[#8f5fd2]/15",
      border: "border-[#8f5fd2]",
      hover: "",
      icon: "text-[#7040b3]",
      filter: "border-[#8f5fd2] bg-[#8f5fd2]/15 text-[#61349d]",
      dot: "bg-[#8f5fd2]",
    },
  ],
  unavailable: [
    {
      bg: "bg-black/10",
      border: "border-black/60",
      hover: "",
      icon: "text-black",
      filter: "border-black/60 bg-black/10 text-black",
      dot: "bg-black",
    },
  ],
};

// Stable index derived from table id so colors don't shuffle on re-render
const pickPalette = (status, tableId) => {
  const key = hasReservationOverride(status) ? "reserved" : status;
  const list = PALETTES[key] || PALETTES.available;
  // use tableId to get a stable but varied index
  const idx = typeof tableId === "number" ? tableId : String(tableId).length;
  return list[idx % list.length];
};

const hasReservationOverride = (status) => status === "reserved";

const getFilterStyle = (status) => {
  if (status === "all") {
    return {
      button: "border-slate-300 bg-white text-slate-700",
      dot: "bg-blue-500",
    };
  }

  const palette = PALETTES[status]?.[0];
  return {
    button: palette?.filter || "border-slate-300 bg-white text-slate-700",
    dot: palette?.dot || "bg-slate-400",
  };
};

export default function TablesDisplayModal({ tables, refetchTables }) {
                 const { t: autoT } = useAutoTranslation();
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

  const sortedTables = [...filteredTables].sort((a, b) => {
    const extractNumber = (name) => {
      const match = name.match(/\d+/);
      return match ? parseInt(match[0], 10) : null;
    };

    const numA = extractNumber(a.name);
    const numB = extractNumber(b.name);

    if (numA !== null && numB !== null) {
      return numA - numB;
    }

    if (numA !== null) return -1;
    if (numB !== null) return 1;

    return a.name.localeCompare(b.name);
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

  const getStatusIcon = (status, hasReservation, tableId) => {
    if (hasReservation) {
      const p = pickPalette("reserved", tableId);
      return <Calendar className={`${p.icon} w-5 h-5`} />;
    }
    const p = pickPalette(status, tableId);
    switch (status) {
      case "available":
        return <CheckCircle className={`${p.icon} w-5 h-5`} />;
      case "occupied":
        return <Coffee className={`${p.icon} w-5 h-5`} />;
      case "unavailable":
        return <Ban className={`${p.icon} w-5 h-5`} />;
      default:
        return null;
    }
  };

  const getCardStyle = (status, hasReservation, tableId) => {
    const key = hasReservation ? "reserved" : status;
    const p = pickPalette(key, tableId);

    if (key === "unavailable") {
      return `${p.bg} ${p.border} opacity-80 cursor-not-allowed`;
    }
    return `${p.bg} ${p.border} ${p.hover}`;
  };

  const formatReservationTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
  };

  const formatOrderTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString([], {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  useEffect(() => {
    if (!selectedTable) return;

    const updated = tables.find((t) => t.id === selectedTable.id);

    if (updated) {
      setSelectedTable(updated);
    }
  }, [tables, selectedTable]);

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
        <h1 className="text-2xl font-semibold">{autoT("legacy.waiter_dashboard_1ca0cba4")}</h1>
        <div className="flex flex-wrap gap-2">
          {["all", "available", "occupied", "reserved", "unavailable"].map(
            (s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex items-center gap-2 rounded-full border px-4 py-1.5 font-semibold transition
                ${filter === s ? "scale-105 shadow-sm ring-2 ring-current/20" : "opacity-90 hover:opacity-100"}
                ${getFilterStyle(s).button}`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 rounded-full ${getFilterStyle(s).dot}`}
                />
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 font-medium text-gray-700">
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full bg-[#00c875]" />
          {availableCount} {autoT("available")}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full bg-[#f59e0b]" />
          {occupiedCount} {autoT("legacy.occupied_30c51a99")}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full bg-[#8f5fd2]" />
          {reservedCount} {autoT("legacy.reserved_67a6ff10")}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full bg-black" />
          {unavailableCount} {autoT("menu.unavailable")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedTables.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-8">
            {autoT("legacy.no_tables_found_5d9c4b8e")}
          </p>
        ) : (
          sortedTables.map((table) => {
            const order = table.current_order;
            const hasReservation = !!table.current_reservation;

            const canCancel = order && order.status === "pending";
            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`p-4 rounded-2xl shadow-md border transition cursor-pointer relative
                  ${getCardStyle(table.status, hasReservation, table.id)}`}
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {getStatusIcon(table.status, hasReservation, table.id)}
                    <h2 className="text-lg font-bold truncate">
                      {autoT("legacy.table_0424f6e7")} {table.name}
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
                      {autoT("staff.cancel")}
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-700">
                  {autoT("legacy.capacity_218347e0")} {table.capacity}
                </p>
                <p className="text-sm capitalize text-gray-800">
                  {autoT("legacy.status_11dc9e19")} {hasReservation ? autoT("legacy.reserved_67a6ff10") : table.status}
                </p>

                {["pending", "in_progress", "ready"].includes(
                  order?.status,
                ) && (
                  <p className="text-sm capitalize text-gray-800">
                    {autoT("legacy.kitchen_e03f03a7")} {order.status}
                  </p>
                )}
                {order?.created_at && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    🕒 {formatOrderTime(order.created_at)}
                  </p>
                )}
                {table.note && (
                  <p className="text-xs text-gray-600 italic mt-1">
                    {autoT("legacy.note_83423c19")} {table.note}
                  </p>
                )}

                {/* Reservation Details Block */}
                {table.current_reservation && (
                  <div className="mt-3 p-2 bg-white/60 rounded-lg border border-purple-200">
                    <p className="text-xs font-semibold text-purple-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {autoT("legacy.current_reservation_2dce6841")}
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
                      <Calendar className="w-3 h-3" /> {autoT("legacy.next_reservation_9d9fd4b7")}
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
          orderNumber={orderToCancel?.order_number}
          onClose={() => {
            setShowCancelToast(false);
            setOrderToCancel(null);
          }}
          onConfirm={() => cancelOrder(orderToCancel.id)}
        />
      )}
    </div>
  );
}
