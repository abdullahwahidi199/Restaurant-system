import { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import { AlertTriangle, PackageX, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LowStockItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/inventory/low-stock/");
      setItems(res.data);
    } catch (err) {
      setError("Failed to load low stock items");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border p-5"
    >
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-red-500 w-5 h-5" />
          <h2 className="text-lg font-semibold text-gray-800">
            Low Stock Items
          </h2>
        </div>

        <span className="text-sm text-gray-500">
          {items.length} item{items.length !== 1 && "s"}
        </span>
      </div>

      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <PackageX className="w-8 h-8 mb-2" />
          <p className="text-sm">All ingredients are sufficiently stocked</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Ingredient</th>
                <th className="py-2">Available</th>
                <th className="py-2">Minimum</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => {
                const critical =
                  Number(item.quantity_available) === 0;

                return (
                  <tr
                    key={item.id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="py-3 font-medium text-gray-800">
                      {item.name}
                    </td>

                    <td className="py-3">
                      {item.quantity_available} {item.unit}
                    </td>

                    <td className="py-3">
                      {item.minimum_threshold} {item.unit}
                    </td>

                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                          ${
                            critical
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                      >
                        {critical ? "Out of Stock" : "Low Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
