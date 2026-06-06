import instance from "../../api/axiosInstance";
import { toast } from "react-hot-toast";

export default function OrderItem({ item, readOnly = false }) {
  const updateStatus = async (status) => {
    try {
      await instance.patch(`/orders/order-items/${item.id}/status/`, {
        status,
      });

      toast.success(`Item marked as ${status}`);

      // Callback to parent to refresh the order card
    } catch (error) {
      console.error(error);
      toast.error("Failed to update item");
    }
  };

  const getStatusStyle = () => {
    // Base styles
    let bgClass = "bg-white";
    let borderClass = "border-l-4 border-transparent";

    // Determine background and text color based on status
    switch (item.status) {
      case "pending":
        bgClass = "bg-yellow-50";
        break;
      case "approved":
        bgClass = "bg-blue-50";
        break;
      case "ready":
        bgClass = "bg-green-50";
        break;
      case "cancelled":
        bgClass = "bg-red-50 opacity-60";
        break;
      default:
        bgClass = "bg-white";
    }

    // Green Border Logic:
    // Show green border ONLY if the item is marked as new.
    // If the item is 'ready', the green border should NOT be shown (even if is_new was true initially).
    if (item.is_new && item.status !== "ready" && item.status !== "cancelled") {
      borderClass = "border-l-4 border-green-500";
    }

    return `${bgClass} ${borderClass}`;
  };

  const getStatusBadgeColor = () => {
    switch (item.status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "approved":
        return "bg-blue-100 text-blue-700";
      case "ready":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      className={`py-2 px-3 rounded-md transition-all duration-200 ${getStatusStyle()}`}
    >
      {/* MAIN ROW */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {item.item_name}
            </p>

            <span
              className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${getStatusBadgeColor()}`}
            >
              {item.status.replace("_", " ")}
            </span>

            {item.is_new && item.status !== "ready" && (
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                New • {item.added_by_name}
              </span>
            )}
          </div>

          {/* DESCRIPTION */}
          {item.description && (
            <div className="mt-1 bg-yellow-50 border border-yellow-200 rounded-md px-2 py-1 max-w-full">
              <p className="text-xs text-gray-700 whitespace-pre-line break-words">
                {item.description}
              </p>
            </div>
          )}
        </div>

        {/* QUANTITY */}
        <div className="text-right shrink-0 ml-2">
          <span className="text-lg font-bold text-gray-800">
            ×{item.quantity}
          </span>
        </div>
      </div>

      {/* ACTIONS */}
      {/* Using flex-wrap to ensure buttons don't overflow awkwardly */}
      <div className="mt-2 flex justify-end gap-1 flex-wrap">
        {item.status === "pending" && !readOnly && (
          <button
            onClick={() => updateStatus("approved")}
            className="bg-blue-500 hover:bg-blue-600 active:scale-95 transition-colors text-white text-[10px] px-2 py-1 rounded font-medium shadow-sm"
          >
            Approve
          </button>
        )}

        {item.status === "approved" && !readOnly && (
          <>
            <button
              onClick={() => updateStatus("pending")}
              className="bg-yellow-500 hover:bg-yellow-600 active:scale-95 transition-colors text-white text-[10px] px-2 py-1 rounded font-medium shadow-sm"
            >
              Re-Pending
            </button>

            <button
              onClick={() => updateStatus("ready")}
              className="bg-green-500 hover:bg-green-600 active:scale-95 transition-colors text-white text-[10px] px-2 py-1 rounded font-medium shadow-sm"
            >
              Ready
            </button>
          </>
        )}

        {item.status === "ready" && !readOnly && (
          <span className="text-[10px] text-green-600 flex items-center italic">
            Completed
          </span>
        )}
      </div>
    </div>
  );
}
