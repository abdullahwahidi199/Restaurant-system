import { X } from "lucide-react";

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;
  console.log(order)

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[90%] md:w-[600px] max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg  font-semibold">Order #{order.id}</h2>
          <button onClick={onClose} className="cursor-pointer">
            <X />
          </button>
        </div>

        <p><strong>Customer:</strong> {order.name}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
        <p><strong>Address:</strong> {order.address || "—"}</p>
        <p><strong>Order Type:</strong> {order.order_type_display}</p>
        <p><strong>Status:</strong> {order.status_display}</p>
        <p><strong>Note:</strong> {order.note || "—"}</p>
        {order.waiter&&<p><strong>Placed by:</strong>{order.waiter_name||"_"}</p>}
        {order.order_type==="delivery"&&<p><strong>Delivered by:</strong>{order.delivery_boy_details.name}({order.delivery_boy_details.vehicle_number})</p>}

        <h3 className="mt-4 font-semibold">Items:</h3>
        <ul className="mt-2 border rounded-lg divide-y">
          {order.items.map((item) => (
            <li key={item.id} className="p-2 flex justify-between">
              <span>{item.item_name} × {item.quantity}</span>
              <span>{item.subtotal} AFN</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-right font-bold text-lg">
          Total: {order.total} AFN
        </p>
      </div>
    </div>
  );
}
