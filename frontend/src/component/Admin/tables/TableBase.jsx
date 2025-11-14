import { useEffect, useState } from "react";
import TablesDisplay from "./TablesDisplayModal";
import TableAddModal from "./TableAddModal";
import { Plus } from "lucide-react";
import instance from "../../../api/axiosInstance";

export default function TableBaseModal() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addTableDisplay, setAddTableDisplay] = useState(false);

  const fetchTables = async () => {
    try {
      const res = await instance.get("/orders/tables/");
      
      const data = res.data;
      setTables(data);
    } catch (err) {
      console.error("Failed to fetch tables",err)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading tables...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="p-6">
     
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Tables</h2>
        <button
          onClick={() => setAddTableDisplay(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
        >
          <Plus size={18} />
          Add Table
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <TablesDisplay tables={tables} />
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
