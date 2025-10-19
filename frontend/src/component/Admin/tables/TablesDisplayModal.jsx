import { Users, Coffee } from "lucide-react";

export default function TablesDisplay({ tables }) {
  console.log(tables)
  return (
    <>
      {tables.map((table) => (
        <div
          key={table.number}
          className={`border rounded-xl p-4 shadow-md transition hover:scale-105 ${
            table.status === "available"
              ? "bg-green-50 border-green-400"
              : table.status==="unavailable"
              ?"bg-gray-200 border-gray-400"
              :"bg-red-50 border-red-400"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold text-gray-800">
              Table {table.number}
            </h3>
            <span
              className={`px-2 py-1 text-sm rounded-full font-medium ${
                table.status === "available"
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {table.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center text-gray-700 mb-2">
            <Users size={16} className="mr-1" />
            <span>Capacity: {table.capacity}</span>
          </div>

          {table.note && (
            <div className="text-gray-600 italic mb-2">Note: {table.note}</div>
          )}

          {table.current_order  ? (
            <div className="mt-2">
              <h4 className="font-semibold text-gray-800 mb-1">Current Order:</h4>
              <div className="space-y-2">
                
                  <div
                    
                    className="border p-2 rounded-lg bg-gray-50 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{table.current_order.name}</span>
                      <span className="text-gray-500">{table.current_order.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mt-1">
                      <Coffee size={16} className="mr-1" />
                      <span>
                        Items: {table.current_order.items.length} | Total: Afs{table.current_order.total}
                      </span>
                    </div>
                  </div>
                
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic mt-2">No orders yet.</div>
          )}
        </div>
      ))}
    </>
  );
}
