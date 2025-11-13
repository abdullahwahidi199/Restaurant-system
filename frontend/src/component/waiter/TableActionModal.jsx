import { useEffect, useState } from "react";
import { X, PlusCircle, CheckCircle } from "lucide-react";
import { useScroll } from "framer-motion";
import NewOrderModal from "./OrderAddModal";
import AddNewItemModal from "./AddNewItemModal";
import instance from "../../api/axiosInstance";

export default function TableActionModal({ table, onClose, refetchTables }) {
  const [newOrderModal, setNewOrderModal] = useState(false)
  const [addNewItemDisplay, setAddNewItemDisplay] = useState(false)

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!table) return null;

  const { number, status, capacity, note, current_order } = table;
  console.log(table)

  const markAvailable = async () => {
    try {
      const res = await instance.patch(`http://127.0.0.1:8000/orders/tables/${table.id}/`, {
        status: "available"
      });

      if (res.ok) {
        // Refresh tables list after successful update
        onClose()
        refetchTables();
        
      } else {
        console.error("Failed to mark table unavailable");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };
  const markUnAvailable=async ()=>{
    const res = await instance.patch(`http://127.0.0.1:8000/orders/tables/${table.id}/`, {
        
        status: "unavailable" 
      });
      onClose();
      refetchTables()
  }

  const handleMarkServed = async () => {
    try {
      const res = await instance.patch(`http://127.0.0.1:8000/orders/orders/${current_order.id}/update_status/`, {
        status: "served"
      })
      refetchTables();
    }
    catch (err) {
      console.log(err)
    }
  }

  

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-lg relative animate-in fade-in-50 slide-in-from-bottom-10">

        <div className="flex justify-between items-center border-b px-5 py-3">
          <h2 className="text-lg font-semibold">
            Table {number} —{" "}
            <span
              className={`capitalize ${status === "available"
                ? "text-green-600"
                : status === "occupied"
                  ? "text-orange-600"
                  : "text-gray-600"
                }`}
            >
              {status}
            </span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>


        <div className="p-5 space-y-4">
          <p className="text-gray-700 text-sm">Capacity: {capacity}</p>
          {note && <p className="text-gray-600 italic text-sm">Note: {note}</p>}

          {status === "available" && (
            <div className="space-y-3">
              <p className="text-gray-700">
                This table is currently available. You can start a new order.
              </p>
              <div className="flex justify-between items-center">
                <button
                onClick={() => {
                  setNewOrderModal(true)

                }}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <PlusCircle size={18} /> Start New Order
              </button>
              <button
                onClick={() => {
                  markUnAvailable(true)

                }}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Mark unavailable
              </button>
              </div>
              {newOrderModal && (
                <NewOrderModal table={table} onClose={() => setNewOrderModal(false)} refetchTables={refetchTables} />
              )}
            </div>
          )}

          {status==="unavailable" && (
            <div>
              <p>This table is currently unavailable</p>
              <button
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg mt-5 hover:bg-green-700 transition"
                 onClick={markAvailable}>Mark Available</button>
            </div>
          )}

          {status === "occupied" && (
            <div className="space-y-3">
              <p className="text-gray-700 font-medium">Current Order:</p>
              {current_order ? (
                <div>
                  <div className="mb-4 border-b pb-3">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      👤 {current_order.name}
                    </h2>
                    {current_order.phone && (
                      <p className="text-gray-600 text-sm">📞 {current_order.phone}</p>
                    )}
                    <p className="mt-2 text-gray-700 font-medium">
                      💰 Total: <span className="text-green-600">{current_order.total} AFN</span>
                    </p>
                  </div>
                  {current_order.items.length > 0 ? (
                    <ul className="space-y-2">
                      {current_order.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between border rounded-lg p-2 bg-white shadow-sm hover:shadow-md transition"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.item_name} <span className="text-gray-500">× {item.quantity}</span>
                            </p>
                          </div>

                          {item.is_new && (
                            <span className="ml-2 text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full animate-pulse">
                              🆕 New
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No active orders</p>
                  )}
                </div>


              ) : (
                <p className="text-gray-500 italic">No current order data.</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setAddNewItemDisplay(true)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Add Item
                </button>
                {addNewItemDisplay && (
                  <AddNewItemModal orderId={current_order.id} onClose={() => setAddNewItemDisplay(false)} refetchTables={refetchTables} />
                )}
                {/* this button will mark serve the order, meaning the order has been prepared and now the customers are eating */}
                {current_order.status === "ready" && (
                  <button
                    onClick={() => {
                      handleMarkServed();
                      onClose();
                    }}
                    className="flex-1 flex items-center justify-center gap-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition"
                  >

                    <CheckCircle size={16} /> Mark Served
                  </button>
                )}

                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
