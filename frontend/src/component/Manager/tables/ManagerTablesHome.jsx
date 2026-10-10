import { useState, useEffect, useRef } from "react";
import ManagerTablesDisplay from "./ManagerTablesWorkspace";
import instance from "../../../api/axiosInstance";
import useOrdersSocket from "../../../hooks/useOrdersSocket";
import {
  applyOrderSnapshotToTable,
  applyTableItemsSnapshot,
  mergeTableSnapshot,
  reconcileTableSnapshots,
  rememberFinalizedOrderSnapshot,
} from "../../../utils/orderSnapshot";

export default function ManagerTablesHome() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const finalizedSnapshotsRef = useRef(new Map());
  const socketRevisionRef = useRef(0);

  const fetchTables = async () => {
    const revisionAtStart = socketRevisionRef.current;
    try {
      setError(null);
      const res = await instance.get("/orders/tables/", {
        params: { view: "panel" },
      });
      setTables((current) =>
        reconcileTableSnapshots(current, res.data, {
          finalizedSnapshots: finalizedSnapshotsRef.current,
          preserveMissing: socketRevisionRef.current !== revisionAtStart,
        }),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchTables();
  }, []);

  // real-time update handler
  const handleTableMessage = (msg) => {
    if (!msg) return;
    socketRevisionRef.current++;

    if (msg.order) {
      rememberFinalizedOrderSnapshot(finalizedSnapshotsRef.current, msg.order);
      setTables((prev) =>
        prev.map((table) => applyOrderSnapshotToTable(table, msg.order)),
      );
      return;
    }

    if (msg?.type === "TABLE_ITEMS_UPDATED") {
      setTables((prev) =>
        prev.map((table) =>
          applyTableItemsSnapshot(table, msg, {
            finalizedSnapshots: finalizedSnapshotsRef.current,
          }),
        ),
      );
      return;
    }

    if (!msg?.table) return;

    const incoming = msg.table;

    setTables((prev) => {
      const idx = prev.findIndex((t) => t.id === incoming.id);

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = mergeTableSnapshot(copy[idx], incoming, {
          finalizedSnapshots: finalizedSnapshotsRef.current,
        });
        return copy;
      }

      return [
        mergeTableSnapshot(null, incoming, {
          finalizedSnapshots: finalizedSnapshotsRef.current,
        }),
        ...prev,
      ];
    });
  };

  // SOCKET CONNECTION
  useOrdersSocket(handleTableMessage, fetchTables);

  return (
    <ManagerTablesDisplay
      tables={tables}
      loading={loading}
      error={error}
      onDismissError={() => setError(null)}
      refetchTables={fetchTables}
    />
  );
}
