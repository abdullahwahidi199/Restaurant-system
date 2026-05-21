import instance from "../../api/axiosInstance";
import { toast } from "react-hot-toast";

export default function OrderItem({ item, onItemPrepared }) {
  const handlePrepared = async () => {
    try {
      await instance.patch(`/orders/order-items/${item.id}/prepared/`);

      toast.success("Item marked as ready");

      if (onItemPrepared) {
        onItemPrepared(item.id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update item");
    }
  };

  return (
    <div
      className={`py-3 px-2 rounded-md transition ${
        item.is_new && !item.is_prepared
          ? "bg-green-50 border-l-4 border-green-400"
          : "bg-white"
      }`}
    >
      {/* MAIN ROW */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {item.item_name}
          </p>

          {/* ITEM DESCRIPTION */}
          {item.description && (
            <div className="mt-1 bg-yellow-50 border border-yellow-200 rounded-md px-2 py-1">
              <p className="text-xs text-gray-700 whitespace-pre-line">
                {item.description}
              </p>
            </div>
          )}
        </div>

        {/* BIG QUANTITY */}
        <div className="text-right shrink-0">
          <span className="text-xl font-bold text-gray-800">
            ×{item.quantity}
          </span>
        </div>
      </div>

      {item.is_new && !item.is_prepared && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={handlePrepared}
            className="bg-green-500 hover:bg-green-600 active:scale-95 transition text-white text-xs px-3 py-1 rounded-md font-medium"
          >
            Ready
          </button>
        </div>
      )}
    </div>
  );
}
