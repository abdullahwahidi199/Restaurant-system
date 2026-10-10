import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import instance from "../../../api/axiosInstance";
import Alert from "../../../modules/shared/erp/components/Alert";
import EmptyState from "../../../modules/shared/erp/components/EmptyState";
import LoadingState from "../../../modules/shared/erp/components/LoadingState";
import PageHeader from "../../../modules/shared/erp/components/PageHeader";
import OrderCancellationToast from "../../OrderCancellationToast";
import RestaurantTableCard from "../../ui/RestaurantTableCard";
import RestaurantTableDetails from "../../ui/RestaurantTableDetails";
import TableWorkspaceToolbar from "../../ui/TableWorkspaceToolbar";
import ManagerTableActionModal from "./ManagerTableActionModal";

const displayStatus = (table) =>
  table.current_reservation ? "reserved" : table.status;

const sortTables = (left, right) => {
  const numberFrom = (name) => {
    const match = String(name || "").match(/\d+/);
    return match ? Number.parseInt(match[0], 10) : null;
  };

  const leftNumber = numberFrom(left.name);
  const rightNumber = numberFrom(right.name);

  if (leftNumber !== null && rightNumber !== null) {
    return leftNumber - rightNumber;
  }
  if (leftNumber !== null) return -1;
  if (rightNumber !== null) return 1;
  return String(left.name || "").localeCompare(String(right.name || ""));
};

export default function ManagerTablesWorkspace({
  tables,
  loading,
  error,
  onDismissError,
  refetchTables,
}) {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);
  const [showCancelToast, setShowCancelToast] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const isRTL = i18n.dir() === "rtl";

  let role;
  try {
    role = JSON.parse(localStorage.getItem("user"))?.role;
  } catch {
    role = null;
  }

  const counts = tables.reduce(
    (totals, table) => {
      const status = displayStatus(table);
      totals[status] = (totals[status] || 0) + 1;
      return totals;
    },
    { available: 0, occupied: 0, reserved: 0, unavailable: 0 },
  );

  const filteredTables = tables
    .filter((table) => {
      const matchesSearch = String(table.name || "")
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesStatus =
        filter === "all" || displayStatus(table) === filter;
      return matchesSearch && matchesStatus;
    })
    .sort(sortTables);

  const filters = [
    { key: "all", label: t("tables_workspace.all"), count: tables.length },
    {
      key: "available",
      label: t("tables_workspace.available"),
      count: counts.available,
    },
    {
      key: "occupied",
      label: t("tables_workspace.occupied"),
      count: counts.occupied,
    },
    {
      key: "reserved",
      label: t("tables_workspace.reserved"),
      count: counts.reserved,
    },
    {
      key: "unavailable",
      label: t("tables_workspace.unavailable"),
      count: counts.unavailable,
    },
  ];

  const totalCapacity = tables.reduce(
    (total, table) => total + Number(table.capacity || 0),
    0,
  );

  const handleCancelClick = (order) => {
    setOrderToCancel(order);
    setShowCancelToast(true);
  };

  const cancelOrder = async () => {
    if (!orderToCancel?.id) return;
    if (role === "waiter" && orderToCancel.status !== "pending") {
      return;
    }

    try {
      await instance.patch(`/orders/${orderToCancel.id}/cancel/`);
      setShowCancelToast(false);
      setOrderToCancel(null);
      await refetchTables();
    } catch (cancelError) {
      console.error("Cancel failed:", cancelError);
    }
  };

  useEffect(() => {
    if (!selectedTable) return;
    const updatedTable = tables.find((table) => table.id === selectedTable.id);
    if (updatedTable && updatedTable !== selectedTable) {
      setSelectedTable(updatedTable);
    }
  }, [tables, selectedTable]);

  return (
    <div className="space-y-5" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        title={t("tables")}
        description={loading ? t("loading_tables") : t("tables_workspace.overview", {
          tables: tables.length,
          seats: totalCapacity,
        })}
      />

      {error ? (
        <Alert tone="error" message={error} onClose={onDismissError} />
      ) : loading ? (
        <LoadingState label={t("loading_tables")} />
      ) : (
        <>
          <TableWorkspaceToolbar
            search={search}
            onSearch={setSearch}
            searchPlaceholder={t("tables_workspace.search_placeholder")}
            filters={filters}
            activeFilter={filter}
            onFilter={setFilter}
          />

          {filteredTables.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredTables.map((table) => {
                const order = table.current_order;
                const status = displayStatus(table);
                const canCancel = order?.status === "pending";
                return (
                  <RestaurantTableCard
                    key={table.id ?? table.name}
                    table={table}
                    status={status}
                    statusLabel={t(`tables_workspace.${status}`)}
                    tableLabel={t("tables_workspace.table")}
                    capacityLabel={t("capacity")}
                    noteLabel={t("note")}
                    actionLabel={t("tables_workspace.open_table")}
                    onClick={() => setSelectedTable(table)}
                    actions={
                      canCancel ? (
                        <button
                          type="button"
                          className="cursor-pointer rounded px-1 py-1 text-xs leading-5 theme-text-muted transition-colors hover:text-[var(--theme-danger-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-input-focus)]"
                          onClick={() => handleCancelClick(order)}
                        >
                          {t("staff.cancel")}
                        </button>
                      ) : null
                    }
                  >
                    <RestaurantTableDetails table={table} />
                  </RestaurantTableCard>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title={t("tables_workspace.no_results_title")}
              description={t("tables_workspace.no_results_description")}
            />
          )}
        </>
      )}

      {selectedTable && (
        <ManagerTableActionModal
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
          onConfirm={cancelOrder}
        />
      )}
    </div>
  );
}
