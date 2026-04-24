import { useState, useEffect } from "react";
import TablesDisplayModal from "../waiter/TablesDisplayModal";
import instance from "../../api/axiosInstance";
import useOrdersSocket from "../../hooks/useOrdersSocket";

export default function HomePage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTables = async () => {
    try {
      const res = await instance.get("/orders/tables/");
      setTables(res.data);
      console.log(res.data);
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
