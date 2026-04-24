import { useEffect, useState } from "react";
import TablesDisplay from "./TablesDisplayModal";
import TableAddModal from "./TableAddModal";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import instance from "../../../api/axiosInstance";
import useOrdersSocket from "../../../hooks/useOrdersSocket";

export default function TableBaseModal() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addTableDisplay, setAddTableDisplay] = useState(false);
  console.log(tables);

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  const fetchTables = async () => {
    try {
      const res = await instance.get("/orders/tables/");

      const data = res.data;
      setTables(data);
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

  const handleSocketMessage = (msg) => {
    if (!msg) return;

    if (msg.type === "NEW_ORDER") {
      handleOrder(msg.order);
    }

    if (msg.type === "TABLE_UPDATED") {
      const incomingTable = msg.table;

      setTables((prev) => {
        const idx = prev.findIndex((t) => t.id === incomingTable.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = incomingTable;
          return copy;
        }
        return [incomingTable, ...prev];
      });
    }
  };

  useOrdersSocket(handleSocketMessage);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">{t("loading_tables")}</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div
        className={`flex items-center mb-6 ${isRTL ? "justify-between flex-row-reverse" : "justify-between"}`}
      >
        <h2 className="text-2xl font-semibold text-gray-800">{t("tables")}</h2>
        <button
          onClick={() => setAddTableDisplay(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
        >
          <Plus size={18} />
          {t("add_table")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <TablesDisplay tables={tables} onUpdate={fetchTables} />
      </div>

      {addTableDisplay && (
        <TableAddModal
          onClose={() => setAddTableDisplay(false)}
          onTableAdded={() => {
            fetchTables();
          }}
        />
      )}
    </div>
  );
}
