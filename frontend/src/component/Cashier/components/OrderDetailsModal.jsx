import React from "react";

const OrderDetailsModal = ({ order, onClose, onPrintBill, onAssignDelivery, onMarkCompleted }) => {
    if (!order) return null;

    const items = order.items || [];
    const subtotal = items.reduce((sum, item) => {
        const qty = item.qty ?? item.quantity ?? 0;
        const price = item.price ?? item.item_price ?? (item.menu_item?.price ?? 0);
        return sum + qty * price;
    }, 0);

    const tax = subtotal * (order.tax ?? 0);
    const finalTotal = (subtotal + tax).toFixed(2);

    const statusLabel = order.status_display || (order.status ? String(order.status).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Pending");

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" aria-modal="true" role="dialog">
            <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 rounded-2xl shadow-lg p-6 relative">
                <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">✕</button>

                <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">{order.id} Details</h2>

                <div className="mb-4">
                    <p className="text-gray-600 mb-1"><strong>Customer:</strong> {order.name || order.customer}</p>
                    <p className="text-gray-600 mb-1"><strong>Type:</strong> {order.order_type_display || order.order_type}</p>
                    {order.table && <p className="text-gray-600 mb-1"><strong>Table:</strong> {order.table}</p>}
                    <p className="text-gray-600 mb-1"><strong>Phone:</strong> {order.phone || "—"}</p>
                    <p className="text-gray-600 mb-1"><strong>Status:</strong> {statusLabel}</p>
                </div>

                <div className="border-t pt-3 mb-3">
                    <h3 className="font-semibold text-lg mb-2">Items</h3>
                    <table className="w-full text-sm text-gray-600">
                        <thead>
                            <tr className="text-left border-b">
                                <th className="py-1">Item</th>
                                <th className="py-1 text-center">Qty</th>
                                <th className="py-1 text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                const qty = item.qty ?? item.quantity ?? 0;
                                const price = item.price ?? item.item_price ?? (item.menu_item?.price ?? 0);
                                const name = item.name ?? item.item_name ?? "Item";
                                return (
                                    <tr key={index} className="border-b last:border-none">
                                        <td className="py-1">{name}</td>
                                        <td className="py-1 text-center">{qty}</td>
                                        <td className="py-1 text-right">AFN{(qty * price).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-3 text-right text-gray-800">
                    <p>Subtotal: AFN{subtotal.toFixed(2)}</p>
                    <p>Tax: AFN{tax.toFixed(2)}</p>
                    <h3 className="text-xl font-bold mt-1">Total: {finalTotal}AFN</h3>
                </div>

                <div className="flex flex-wrap justify-end gap-3 mt-6">
                    {String(statusLabel).toLowerCase() === "ready" && (
                        <button onClick={() => onPrintBill && onPrintBill(order)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all">Print Bill</button>
                    )}

                    {String(order.order_type || "").toLowerCase().includes("delivery") && (
                        <button onClick={() => onAssignDelivery && onAssignDelivery(order)} className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all">Assign Delivery</button>
                    )}

                    {String(order.status || "").toLowerCase() !== "completed" && (
                        <button onClick={() => onMarkCompleted && onMarkCompleted(order.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all">Mark Completed</button>
                    )}
    
                    <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-all">Close</button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
