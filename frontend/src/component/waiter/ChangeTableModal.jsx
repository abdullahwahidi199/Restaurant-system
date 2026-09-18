import { useEffect, useState } from "react";
import { X } from "lucide-react";
import instance from "../../api/axiosInstance";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ChangeTableModal({
  currentTable,
  order,
  onClose,
  refetchTables,
}) {
                 const { t: autoT } = useAutoTranslation();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await instance.get("/orders/tables/", {
        params: { view: "panel" },
      });
      const availableTables = res.data.filter(
        (t) =>
          t.status === "available" &&
          !t.current_reservation &&
          t.id !== currentTable.id,
      );

      setTables(availableTables);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTable) return;

    try {
      setLoading(true);

      await instance.patch(`/orders/orders/${order.id}/change-table/`, {
        table: selectedTable,
      });

      refetchTables();

      onClose();
    } catch (err) {
      console.log(err);

      alert(err?.response?.data?.error || "Failed to change table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex justify-center items-center">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl">
        <div className="flex justify-between items-center border-b px-5 py-4">
          <h2 className="text-lg font-semibold">{autoT("legacy.change_table_bb49e68f")}</h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-sm text-gray-500">{autoT("legacy.current_table_9d59ab6e")}</p>

            <p className="font-semibold">{autoT("legacy.table_0424f6e7")} {currentTable.name}</p>
          </div>

          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full border rounded-xl px-3 py-3"
          >
            <option value="">{autoT("legacy.select_new_table_82a7413c")}</option>

            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                {autoT("legacy.table_0424f6e7")} {table.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSubmit}
            disabled={!selectedTable || loading}
            className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? autoT("legacy.changing_99922775") : autoT("legacy.confirm_change_ad676c64")}
          </button>
        </div>
      </div>
    </div>
  );
}
