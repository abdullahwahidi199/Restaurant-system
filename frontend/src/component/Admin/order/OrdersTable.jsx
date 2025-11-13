import { Eye, Printer } from "lucide-react";

export default function OrdersTable({ orders, onView }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-blue-100 text-blue-700",
    ready: "bg-indigo-100 text-indigo-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  console.log(orders)

  return (
    <div className="mt-4 overflow-x-auto bg-white rounded-xl shadow">
      <table className="w-full text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3">Order ID</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Total</th>
            <th className="p-3">Table #</th>
            <th className="p-3">Status</th>
            <th className="p-3">Date</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b hover:bg-gray-50">
              <td className="p-3">#{order.id}</td>
              <td className="p-3">{order.name}</td>
              <td className="p-3">{order.total} AFN</td>
              <td className="p-3">{order.table?order.tableNumber:'Takeaway/Online order'}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}
                >
                  {order.status_display}
                </span>
              </td>
              <td className="p-3">
                {new Date(order.created_at).toLocaleDateString()}
              </td>
              <td className="p-3 text-center flex justify-center gap-2">
                <button
                  onClick={() => onView(order)}
                  className="bg-blue-100 p-2 rounded cursor-pointer hover:bg-blue-200"
                >
                  <Eye size={16} />
                </button>
                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
