// src/components/cashier/OrderEditModal.jsx
import { useEffect, useState } from "react";
import { X, PlusCircle, Save } from "lucide-react";
import instance from "../../../api/axiosInstance"; // adjust path if needed
import AddNewItemModal from "../../waiter/AddNewItemModal"; // reuse the same one (takes orderId)

export default function OrderEditModal({ order, onClose }) {
  const [items, setItems] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);
  const [addNewItemDisplay, setAddNewItemDisplay] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ESC to close
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Sync local items with order
  useEffect(() => {
    setItems(order?.items || []);
  }, [order?.items]);

  if (!order) return null;

  // 🔒 Restrict to takeaway / delivery only
  const orderType = (order.order_type || "").toLowerCase();
  if (!["takeaway", "delivery"].includes(orderType)) return null;

  // Permissions — only pending items can be touched
  const canEditItem = (item) => item.status === "pending";
  const canDeleteItem = (item) => item.status === "pending";
  const canChangeQuantity = (item) => item.status === "pending";

  const updateQty = (id, qty) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, qty) } : item,
      ),
    );
  };

  const deleteItem = (id) => {
    setDeletedItems((prev) => [...prev, id]);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const cancelItem = async (id) => {
    try {
      await instance.patch(`/orders/order-items/${id}/cancel/`);
      //   refetchOrders();
    } catch (err) {
      console.log(err);
    }
  };

  const fetchOrder = async () => {
    const res = await instance.get(`/orders/orders/${order.id}/`);
    setItems(res.data.items || []);
  };
  const saveChanges = async () => {
    try {
      await instance.patch(`/orders/orders/${order.id}/bulk-update-items/`, {
        items: items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
        })),
        deleted_items: deletedItems,
      });
      setIsEditing(false);
      //   refetchOrders();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-lg relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-5 py-3 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">
            Order #{order.order_number} —{" "}
            <span className="capitalize text-blue-600">{orderType}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer Info */}
          <div className="border-b pb-3">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              👤 {order.name || order.customer || "Customer"}
            </h2>
            {order.phone && (
              <p className="text-gray-600 text-sm">📞 {order.phone}</p>
            )}
            {orderType === "delivery" && order.address && (
              <p className="text-gray-600 text-sm">📍 {order.address}</p>
            )}
            <p className="mt-2 text-gray-700 font-medium">
              💰 Total:{" "}
              <span className="text-green-600">
                {order.total ?? order.remaining_total} AFN
              </span>
            </p>
          </div>

          {/* Edit toggle */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition"
            >
              Edit Order
            </button>
          )}

          {/* Items */}
          {items.length > 0 ? (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between border rounded-lg p-2 bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-800">
                        {item.item_name}
                      </p>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          item.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "approved"
                              ? "bg-blue-100 text-blue-700"
                              : item.status === "in_progress"
                                ? "bg-orange-100 text-orange-700"
                                : item.status === "ready"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>

                      {item.is_new && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          New • {item.added_by_name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing && (
                        <button
                          disabled={!canChangeQuantity(item)}
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className={`px-2 rounded ${
                            canChangeQuantity(item)
                              ? "bg-gray-200"
                              : "bg-gray-100 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          -
                        </button>
                      )}

                      <span className="text-gray-500">× {item.quantity}</span>

                      {isEditing && (
                        <>
                          <button
                            disabled={!canChangeQuantity(item)}
                            onClick={() =>
                              updateQty(item.id, item.quantity + 1)
                            }
                            className={`px-2 rounded ${
                              canChangeQuantity(item)
                                ? "bg-gray-200"
                                : "bg-gray-100 opacity-50 cursor-not-allowed"
                            }`}
                          >
                            +
                          </button>

                          <button
                            disabled={!canDeleteItem(item)}
                            onClick={() => cancelItem(item.id)}
                            className={`ml-2 ${
                              canDeleteItem(item)
                                ? "text-red-500"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}

              {isEditing && (
                <button
                  onClick={saveChanges}
                  className="w-full mt-3 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save Changes
                </button>
              )}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No items in this order.</p>
          )}

          {/* Bottom Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <button
              onClick={() => setAddNewItemDisplay(true)}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <PlusCircle size={16} /> Add Item
            </button>
          </div>
        </div>
      </div>

      {addNewItemDisplay && (
        <AddNewItemModal
          orderId={order.id}
          onClose={() => setAddNewItemDisplay(false)}
          onItemAdded={fetchOrder}
          //   refetchTables={refetchOrders}
        />
      )}
    </div>
  );
}
