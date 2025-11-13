import React from "react";
import instance from "../../../api/axiosInstance";

const OrderCard = ({ order = {}, onViewDetails, onPrintBill, onAssignDelivery }) => {
    const items = order.items || [];
    const getQty = (it) => (it.qty ?? it.quantity ?? 0);
    const getPrice = (it) => (it.price ?? it.item_price ?? (it.menu_item?.price) ?? 0);
    const subtotal = items.reduce((sum, it) => sum + getQty(it) * getPrice(it), 0);
    const tax = subtotal * (order.tax ?? 0);
    const formattedTotal = (subtotal + tax).toFixed(2);

    const statusLabel = order.status_display || (order.status ? String(order.status).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Pending");

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-700";
            case "In Progress":
                return "bg-blue-100 text-blue-700";
            case "Ready":
                return "bg-green-100 text-green-700";
            case "Out for Delivery":
                return "bg-purple-100 text-purple-700";
            case "Completed":
                return "bg-gray-200 text-gray-600";
            default:
                if (status && status.startsWith("Assigned to")) return "bg-green-100 text-green-700";
                return "bg-gray-100 text-gray-600";
        }
    };

    const handleMarkDelivered=async ()=>{
        try{
            const response=await instance.patch(`http://127.0.0.1:8000/orders/orders/${order.id}/update_status/`,{
                status:"delivered" 
            })
        }
        catch(error){
            console.error(error)
        }
    }
    return (
        <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">{order.id || "—"}</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(statusLabel)}`}>
                    {statusLabel}
                </span>
            </div>

            <p className="text-sm text-gray-600 mb-1"><strong>Type:</strong> {order.order_type_display || (order.order_type && order.order_type.replace(/_/g, " ")) || "—"}</p>

            {order.table && (
                <p className="text-sm text-gray-600 mb-1"><strong>Table:</strong> {order.table}</p>
            )}

            <p className="text-sm text-gray-600 mb-2"><strong>Customer:</strong> {order.name || order.customer || "—"}</p>

            <div className="flex flex-col mt-3 gap-2">
                <p className="font-semibold text-gray-800">Total: {formattedTotal}AFN</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => onViewDetails && onViewDetails(order)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-lg transition-all"
                        aria-label={`View details for ${order.id}`}
                    >
                        View
                    </button>

                    
                        {order.status!=='out_for_delivery' &&(
                            <button
                            onClick={() => onPrintBill && onPrintBill(order)}
                            className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-lg transition-all"
                            aria-label={`Print bill for ${order.id}`}
                        >
                            Print
                        </button>
                        )}
                    

                    {String(order.order_type || order.order_type_display || "").toLowerCase().includes("delivery") && order.status!=='out_for_delivery' && (
                        // show assign when appropriate (cashier will typically receive delivery orders in 'ready' state)
                        <button
                            onClick={() => onAssignDelivery && onAssignDelivery(order)}
                            className="bg-purple-500 hover:bg-purple-600 text-white text-sm px-3 py-1 rounded-lg transition-all"
                            aria-label={`Assign delivery for ${order.id}`}
                        >
                            Assign
                        </button>
                    )}

                    {order.order_type=='delivery' && order.status=='out_for_delivery' && (
                        <button
                            onClick={handleMarkDelivered}
                            className="bg-purple-500 hover:bg-purple-600 text-white text-sm px-3 py-1 rounded-lg transition-all"
                        >Confirm Cash</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
