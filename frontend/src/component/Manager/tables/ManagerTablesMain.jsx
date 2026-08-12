import { useState, useEffect } from "react";
import TablesDisplayModal from "../waiter/TablesDisplayModal";
import instance from "../../../api/axiosInstance";
import useOrdersSocket from "../../../hooks/useOrdersSocket";

export default function HomePage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTables = async () => {
    try {
      const res = await instance.get("/orders/tables/", {
        params: { view: "panel" },
      });
      setTables(res.data);
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
    if (msg?.type === "TABLE_ITEMS_UPDATED") {
      setTables((prev) =>
        prev.map((table) => {
          if (table.id !== msg.table_id || !table.current_order) return table;
          if (table.current_order.id !== msg.order_id) return table;

          return {
            ...table,
            current_order: {
              ...table.current_order,
              item_count: msg.item_count,
              total: msg.order_total,
              status: msg.order_status,
            },
          };
        }),
      );
      return;
    }

    if (!msg?.table) return;

    const incoming = msg.table;

    setTables((prev) => {
      const idx = prev.findIndex((t) => t.id === incoming.id);

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = incoming;
        return copy;
      }

      return [incoming, ...prev];
    });
  };

  // SOCKET CONNECTION
  useOrdersSocket(handleTableMessage);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading tables...</p>
      </div>
    );

  if (error) return <p>{error}</p>;

  return (
    <div>
      <TablesDisplayModal tables={tables} refetchTables={fetchTables} />
    </div>
  );
}
