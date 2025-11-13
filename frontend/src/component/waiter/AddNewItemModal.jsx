import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import instance from "../../api/axiosInstance";

export default function AddItemToOrderModal({ orderId, onClose, refetchTables }) {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,setError]=useState(null)

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await instance.get("/menu/menu-items/");
        const data = res.data
        setMenuItems(data);
      } catch (err) {
        console.error("Error fetching menu:", err);
        setError(err.message)
      }
    };
    fetchMenu();
  }, []);

  const handleAddToOrder = (menuItem) => {
    const existing = selectedItems.find((i) => i.menu_item.id === menuItem.id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.menu_item.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([...selectedItems, { menu_item: menuItem, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (menuItemId) => {
    setSelectedItems(selectedItems.filter((i) => i.menu_item.id !== menuItemId));
  };

  const handleChangeQuantity = (menuItemId, qty) => {
    setSelectedItems(
      selectedItems.map((i) =>
        i.menu_item.id === menuItemId ? { ...i, quantity: qty } : i
      )
    );
  };

  const handleAddItems = async () => {
    if (selectedItems.length === 0) return alert("No items selected!");
    setLoading(true);

    const payload = {
      items: selectedItems.map((i) => ({
        menu_item: i.menu_item.id,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await instance.patch(`/orders/orders/${orderId}/add-items/`, 
        
        payload
      );

      
      alert("Items added successfully!");
      refetchTables();
      onClose();
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  if (error){
    return(
      <p>{error}</p>
    )
  }
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start pt-4 z-50 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95%] h-[90vh] p-6 flex flex-col md:flex-row gap-6 animate-in fade-in-50 slide-in-from-bottom-10">
        
       
        <div className="flex-1 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Add Items to Order #{orderId}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleAddToOrder(item)}
                className="border rounded-lg p-3 flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
              >
                <div className="font-semibold text-gray-800">{item.name}</div>
                <div className="text-sm text-gray-500 mt-1">Afs{item.price}</div>
                <button
                  type="button"
                  className="mt-3 bg-blue-600 text-white py-1 rounded hover:bg-blue-700 text-sm flex justify-center items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* === RIGHT SIDE: ORDER SUMMARY === */}
        <div className="w-full md:w-96 flex flex-col border-l pl-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Selected Items</h3>

          <div className="flex-1 overflow-auto space-y-2 mb-3">
            {selectedItems.length === 0 && (
              <p className="text-gray-400 italic">No items selected yet</p>
            )}

            {selectedItems.map((item) => (
              <div
                key={item.menu_item.id}
                className="flex items-center justify-between border rounded-lg p-2 hover:shadow-sm transition"
              >
                <div className="flex-1">
                  <div className="font-medium">{item.menu_item.name}</div>
                  <div className="text-sm text-gray-500">Afs{item.menu_item.price}</div>
                </div>

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleChangeQuantity(item.menu_item.id, parseInt(e.target.value))
                  }
                  className="w-20 border rounded px-2 py-1 mr-2"
                />

                <button
                  onClick={() => handleRemoveItem(item.menu_item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddItems}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex justify-center items-center gap-2 font-semibold"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Add Items to Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
