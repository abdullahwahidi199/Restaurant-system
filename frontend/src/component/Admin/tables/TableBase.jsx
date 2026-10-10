import { useEffect, useRef, useState } from "react";
import TablesDisplay from "./TablesDisplayModal";
import TableAddModal from "./TableAddModal";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import instance from "../../../api/axiosInstance";
import useOrdersSocket from "../../../hooks/useOrdersSocket";
import ActionButton from "../../../modules/shared/erp/components/ActionButton";
import Alert from "../../../modules/shared/erp/components/Alert";
import EmptyState from "../../../modules/shared/erp/components/EmptyState";
import LoadingState from "../../../modules/shared/erp/components/LoadingState";
import PageHeader from "../../../modules/shared/erp/components/PageHeader";
import TableWorkspaceToolbar from "../../ui/TableWorkspaceToolbar";
import {
  applyOrderSnapshotToTable,
  applyTableItemsSnapshot,
  isFinalizedOrder,
  mergeTableSnapshot,
  reconcileTableSnapshots,
  rememberFinalizedOrderSnapshot,
} from "../../../utils/orderSnapshot";

export default function TableBaseModal() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addTableDisplay, setAddTableDisplay] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const finalizedSnapshotsRef = useRef(new Map());
  const socketRevisionRef = useRef(0);

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  const fetchTables = async () => {
    const revisionAtStart = socketRevisionRef.current;
    try {
      setError(null);
      const res = await instance.get("/orders/tables/", {
        params: { view: "panel" },
      });

      const data = res.data;
      setTables((current) =>
        reconcileTableSnapshots(current, data, {
          finalizedSnapshots: finalizedSnapshotsRef.current,
          preserveMissing: socketRevisionRef.current !== revisionAtStart,
        }),
      );
    } catch (err) {
      console.error("Failed to fetch tables", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleOrder = (order) => {
    rememberFinalizedOrderSnapshot(finalizedSnapshotsRef.current, order);
    setTables((prev) =>
      prev.map((table) => {
        const synced = applyOrderSnapshotToTable(table, order);
        return !isFinalizedOrder(order) && table.id === order.table
          ? { ...synced, status: "occupied" }
          : synced;
      }),
    );
  };

  const handleSocketMessage = (msg) => {
    if (!msg) return;
    socketRevisionRef.current++;

    if (msg.type === "NEW_ORDER") {
      handleOrder(msg.order);
    }

    if (msg.type === "TABLE_UPDATED") {
      const incomingTable = msg.table;

      setTables((prev) => {
        const idx = prev.findIndex((t) => t.id === incomingTable.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = mergeTableSnapshot(copy[idx], incomingTable, {
            finalizedSnapshots: finalizedSnapshotsRef.current,
          });
          return copy;
        }
        return [
          mergeTableSnapshot(null, incomingTable, {
            finalizedSnapshots: finalizedSnapshotsRef.current,
          }),
          ...prev,
        ];
      });
    }

    if (msg.type === "TABLE_ITEMS_UPDATED") {
      setTables((prev) =>
        prev.map((table) =>
          applyTableItemsSnapshot(table, msg, {
            finalizedSnapshots: finalizedSnapshotsRef.current,
          }),
        ),
      );
    }
  };

  useOrdersSocket(handleSocketMessage, fetchTables);

  const getDisplayStatus = (table) =>
    table.current_reservation ? "reserved" : table.status;

  const statusCounts = tables.reduce(
    (counts, table) => {
      const status = getDisplayStatus(table);
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    },
    { available: 0, occupied: 0, reserved: 0, unavailable: 0 },
  );

  const filteredTables = tables
    .filter((t) => {
      const name = String(t.name || "").toLowerCase();
      const matchesSearch = name.includes(search.trim().toLowerCase());
      const matchesFilter =
        filter === "all" || getDisplayStatus(t) === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
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
  const filters = [
    {
      key: "all",
      label: t("tables_workspace.all"),
      count: tables.length,
    },
    {
      key: "available",
      label: t("tables_workspace.available"),
      count: statusCounts.available,
    },
    {
      key: "occupied",
      label: t("tables_workspace.occupied"),
      count: statusCounts.occupied,
    },
    {
      key: "reserved",
      label: t("tables_workspace.reserved"),
      count: statusCounts.reserved,
    },
    {
      key: "unavailable",
      label: t("tables_workspace.unavailable"),
      count: statusCounts.unavailable,
    },
  ];

  const totalCapacity = tables.reduce(
    (total, table) => total + Number(table.capacity || 0),
    0,
  );

  return (
    <div className="space-y-5" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        title={t("tables")}
        description={loading ? t("loading_tables") : t("tables_workspace.overview", {
          tables: tables.length,
          seats: totalCapacity,
        })}
        actions={
          <ActionButton
            icon={Plus}
            variant="primary"
            onClick={() => setAddTableDisplay(true)}
          >
            {t("add_table")}
          </ActionButton>
        }
      />

      {error ? (
        <Alert tone="error" message={error} onClose={() => setError(null)} />
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
              <TablesDisplay tables={filteredTables} onUpdate={fetchTables} />
            </div>
          ) : (
            <EmptyState
              title={t("tables_workspace.no_results_title")}
              description={t("tables_workspace.no_results_description")}
            />
          )}
        </>
      )}

      {addTableDisplay && (
        <TableAddModal
          onClose={() => setAddTableDisplay(false)}
          onTableAdded={() => {
            setAddTableDisplay(false);
            fetchTables();
          }}
        />
      )}
    </div>
  );
}
