import { useEffect, useState } from "react";
import { X, PlusCircle, CheckCircle } from "lucide-react";
import { useScroll } from "framer-motion";
import ManagerOrderAddModal from "./ManagerAddOrder";
import ManagerAddItem from "./MangerAddNewItem";
import instance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import ChangeTableModal from "../../waiter/ChangeTableModal";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function TableActionModal({ table, onClose, refetchTables }) {
                 const { t: autoT } = useAutoTranslation();
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [addNewItemDisplay, setAddNewItemDisplay] = useState(false);
  const [deletedItems, setDeletedItems] = useState([]);
  const [items, setItems] = useState([]);
  const [showChangeTableModal, setShowChangeTableModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);
  const { name, status, capacity, note, current_order } = table;
  useEffect(() => {
    if (current_order?.items) {
      setItems(current_order.items);
    }
  }, [current_order]);
  if (!table) return null;

  const canEditItem = (item) => {
    return ["pending"].includes(item.status);
  };

  const canDeleteItem = (item) => {
    return ["pending"].includes(item.status);
  };

  const canChangeQuantity = (item) => {
    return ["pending"].includes(item.status);
  };
  console.log(table);
  const fetchOrder = async () => {
    if (!current_order?.id) return;

    try {
      const res = await instance.get(`/orders/orders/${current_order.id}/`);
      setItems(res.data.items || []);
    } catch (err) {
      console.log(err);
    }
  };
  // const markAvailable = async () => {
  //   try {
  //     const res = await instance.patch(`/orders/tables/${table.id}/`, {
  //       status: "available",
  //     });

  //     onClose();
  //     refetchTables();
  //   } catch (err) {
  //     console.error("Error:", err);
  //   }
  // };
  // const markUnAvailable = async () => {
  //   const res = await instance.patch(`/orders/tables/${table.id}/`, {
  //     status: "unavailable",
  //   });
  //   onClose();
  //   refetchTables();
  // };

  const handleMarkServed = async () => {
    try {
      const res = await instance.patch(
        `/orders/orders/${current_order.id}/update_status/`,
        {
          status: "served",
        },
      );
      refetchTables();
    } catch (err) {
      console.log(err);
    }
  };

  const cancelItem = async (id) => {
    try {
      await instance.patch(`/orders/order-items/${id}/cancel/`);

      refetchTables();
    } catch (err) {
      console.log(err);
    }
  };
  const increaseQty = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

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
  const saveChanges = async () => {
    try {
      await instance.patch(
        `/orders/orders/${current_order.id}/bulk-update-items/`,
        {
          items: items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
          })),
          deleted_items: deletedItems,
        },
      );

      setIsEditing(false);
      refetchTables();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-lg relative animate-in fade-in-50 slide-in-from-bottom-10">
        <div className="flex justify-between items-center border-b px-5 py-3">
          <h2 className="text-lg font-semibold">
            {autoT("legacy.table_0424f6e7")} {name} —{" "}
            <span
              className={`capitalize ${
                status === "available"
                  ? "text-green-600"
                  : status === "occupied"
                    ? "text-orange-600"
                    : "text-gray-600"
              }`}
            >
              {status}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-gray-700 text-sm">{autoT("legacy.capacity_218347e0")} {capacity}</p>
          {note && <p className="text-gray-600 italic text-sm">{autoT("legacy.note_83423c19")} {note}</p>}

          {status === "available" && (
            <div className="space-y-3">
              <p className="text-gray-700">
                {autoT("legacy.this_table_is_currently_available_you_can_start_a_new__2966a7f6")}
              </p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    navigate("/manager/new-order/", {
                      state: { table },
                    });
                    onClose();
                  }}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <PlusCircle size={18} /> {autoT("legacy.start_new_order_262cef55")}
                </button>
              </div>
            </div>
          )}

          {status === "unavailable" && (
            <div>
              <p>{autoT("legacy.this_table_is_currently_unavailable_80196632")}</p>
            </div>
          )}

          {status === "occupied" && (
            <div className="space-y-3">
              <p className="text-gray-700 font-medium">{autoT("legacy.current_order_5bfab9b0")}</p>
              {current_order ? (
                <div>
                  <div className="mb-4 border-b pb-3">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      👤 {current_order.name}
                    </h2>
                    {current_order.phone && (
                      <p className="text-gray-600 text-sm">
                        📞 {current_order.phone}
                      </p>
                    )}
                    <p className="mt-2 text-gray-700 font-medium">
                      {autoT("legacy.total_2e388225")}{" "}
                      <span className="text-green-600">
                        {current_order.total} {autoT("labels.afn")}
                      </span>
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-yellow-500 text-white px-3 py-2 rounded"
                    >
                      {autoT("legacy.edit_order_13fcf49e")}
                    </button>
                  )}
                  {current_order.items.length > 0 ? (
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between border rounded-lg p-2 bg-white shadow-sm hover:shadow-md transition"
                        >
                          <div className="flex items-center justify-between w-full">
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
                                    {autoT("legacy.new_49c3862e")} {item.added_by_name}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {isEditing && (
                                  <button
                                    disabled={!canChangeQuantity(item)}
                                    onClick={() =>
                                      updateQty(item.id, item.quantity - 1)
                                    }
                                    className={`px-2 rounded ${
                                      canChangeQuantity(item)
                                        ? "bg-gray-200"
                                        : "bg-gray-100 opacity-50 cursor-not-allowed"
                                    }`}
                                  >
                                    -
                                  </button>
                                )}

                                <span className="text-gray-500">
                                  × {item.quantity}
                                </span>

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
                          </div>
                        </li>
                      ))}
                      {isEditing && (
                        <button
                          onClick={saveChanges}
                          className="w-full mt-3 bg-green-600 text-white px-3 py-2 rounded"
                        >
                          {autoT("save_changes")}
                        </button>
                      )}
                    </ul>
                  ) : (
                    <p>{autoT("legacy.no_active_orders_03574d96")}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">{autoT("legacy.no_current_order_data_7841c0b1")}</p>
              )}
              <div className="flex gap-2">
                {!table.current_reservation && (
                  <button
                    onClick={() => setShowChangeTableModal(true)}
                    className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    {autoT("legacy.change_table_bb49e68f")}
                  </button>
                )}
                <button
                  onClick={() => setAddNewItemDisplay(true)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {autoT("add_item")}
                </button>
                {addNewItemDisplay && (
                  <ManagerAddItem
                    orderId={current_order.id}
                    onClose={() => setAddNewItemDisplay(false)}
                    refetchTables={refetchTables}
                    onItemAdded={fetchOrder}
                  />
                )}
                {/* this button will mark serve the order, meaning the order has been prepared and now the customers are eating */}
                {current_order && current_order.status === "ready" && (
                  <button
                    onClick={() => {
                      handleMarkServed();
                      onClose();
                    }}
                    className="flex-1 flex items-center justify-center gap-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition"
                  >
                    <CheckCircle size={16} /> {autoT("legacy.mark_served_69286fd9")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {showChangeTableModal && (
        <ChangeTableModal
          currentTable={table}
          order={current_order}
          onClose={() => setShowChangeTableModal(false)}
          refetchTables={refetchTables}
        />
      )}
    </div>
  );
}
