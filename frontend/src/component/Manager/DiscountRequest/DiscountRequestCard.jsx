import React from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";

const DiscountRequestCard = ({ request, onApprove, onReject }) => {
                              const { t: autoT } = useAutoTranslation();
  // const [actionError, setActionError] = useState("");
  return (
    <div className="bg-white shadow-md rounded-2xl p-5 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold">{autoT("table.order_number")}{request.order_number}</h2>

          <p className="text-sm text-gray-500">{autoT("legacy.table_692eeda0")} {request.table_name}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold
          ${
            request.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : request.status === "approved"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {request.status}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-500">{autoT("table.customer")}</p>
        <p className="font-medium">{request.customer_name || autoT("legacy.walk_in_801d866b")}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">{autoT("legacy.original_c0a8060f")}</p>
          <p className="font-bold text-lg">{autoT("labels.afn")}{request.original_total}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">{autoT("menu_item_sales.discount")}</p>
          <p className="font-bold text-orange-600">
            {request.discount_percent}%
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">{autoT("legacy.final_672b22cc")}</p>
          <p className="font-bold text-green-600 text-lg">
            {autoT("labels.afn")}{request.final_total}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500">{autoT("legacy.reason_f219cc06")}</p>

        <div className="bg-gray-100 rounded-xl p-3 mt-1">{request.reason}</div>
      </div>

      <div className="mb-5 text-sm text-gray-600">
        {autoT("legacy.requested_by_83ddd3bb")}
        <span className="font-semibold ml-1">{request.requested_by_name}</span>
      </div>

      {request.status === "pending" && (
        <div className="flex gap-3">
          <button
            onClick={() => onApprove(request.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            {autoT("inventory_manager.common.approve")}
          </button>

          <button
            onClick={() => onReject(request.id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl flex items-center justify-center gap-2"
          >
            <XCircle size={18} />
            {autoT("inventory_manager.common.reject")}
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscountRequestCard;
