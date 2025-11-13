import React, { useRef, useEffect } from "react";
import instance from "../../../api/axiosInstance";

const BillPrintModal = ({ order, onClose }) => {
    const printRef = useRef();

    if (!order) return null;

    // Helpers to handle backend item shape
    const itemName = (it) => it.name || it.item_name || "";
    const itemQty = (it) => (it.qty ?? it.quantity ?? 0);
    const itemPrice = (it) => (it.price ?? it.item_price ?? (it.menu_item?.price) ?? 0);

    const total = (order.items || []).reduce(
        (sum, item) => sum + itemQty(item) * itemPrice(item),
        0
    );
    const tax = total * (order.tax ?? 0);
    const finalTotal = (total + tax).toFixed(2);

    const generateHtml = () => {
        const itemsHtml = (order.items || [])
            .map(
                (it) => `<tr>
            <td style="padding:6px;border-bottom:1px solid #eee">${escapeHtml(itemName(it))}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;text-align:center">${escapeHtml(String(itemQty(it)))}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;text-align:right">${(itemQty(it) * itemPrice(it)).toFixed(2)}</td>
          </tr>`
            )
            .join("");

        const customerDisplay = escapeHtml(order.name || order.customer || order.phone || "");

        return `
      <div style="font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111">
        <h2 style="text-align:center;margin:0 0 10px">Restaurant Bill</h2>
        <p style="margin:0 0 6px"><strong>Order ID:</strong> ${escapeHtml(String(order.id))}</p>
        <p style="margin:0 0 6px"><strong>Customer:</strong> ${customerDisplay}</p>
        <p style="margin:0 0 12px"><strong>Date:</strong> ${escapeHtml(new Date(order.created_at || order.createdAt || Date.now()).toLocaleString())}</p>
        <table style="width:100%;border-collapse:collapse;text-align:left">
          <thead>
            <tr>
              <th style="padding:6px;border-bottom:2px solid #ddd;text-align:left">Item</th>
              <th style="padding:6px;border-bottom:2px solid #ddd;text-align:center">Qty</th>
              <th style="padding:6px;border-bottom:2px solid #ddd;text-align:right">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top:12px;text-align:right">
          <div>Subtotal: $${total.toFixed(2)}</div>
          <div>Tax: $${tax.toFixed(2)}</div>
          <h3 style="margin-top:8px">Total: $${finalTotal}</h3>
        </div>

        <p style="text-align:center;color:#666;font-size:12px;margin-top:14px">Thank you for dining with us!</p>
      </div>
    `;
    };

    function escapeHtml(str) {
        if (typeof str !== "string") return str;
        return str.replace(/[&<>"'`=\/]/g, function (s) {
            return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "/": "&#x2F;", "`": "&#x60;", "=": "&#x3D;" }[s]);
        });
    }

    const handlePrint = async() => {
        try {
            if (order.order_type==='dine-in' || order.order_type==="takeaway"){
                const response=await instance.patch(`http://127.0.0.1:8000/orders/orders/${order.id}/update_status/`,{
                
                 status:"completed" 
            })
            }
            
            const printWindow = window.open("", "_blank", "width=600,height=700");
            if (!printWindow) {
                alert("Pop-up blocked. Please allow pop-ups for this site to print the bill.");
                return;
            }
            printWindow.document.open();
            const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Bill - ${escapeHtml(String(order.id))}</title>
            <style>
              @media print { body { -webkit-print-color-adjust: exact; } }
              body { margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; }
            </style>
          </head>
          <body>${generateHtml()}</body>
        </html>
      `;
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 200);
        } catch (err) {
            console.error("Print error:", err);
            alert("Could not open print window. Try printing from your browser.");
        }
    };

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" aria-modal="true" role="dialog">
            <div className="bg-white w-11/12 md:w-2/3 lg:w-1/3 rounded-2xl shadow-lg p-6 relative">
                <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">✕</button>

                <div ref={printRef}>
                    <h2 className="text-xl font-bold mb-2 text-center text-gray-800">Restaurant Bill</h2>
                    <p className="text-sm text-gray-600 mb-1"><strong>Order ID:</strong> {order.id}</p>
                    <p className="text-sm text-gray-600 mb-1"><strong>Customer:</strong> {order.name || order.customer || order.phone}</p>
                    <p className="text-sm text-gray-600 mb-3"><strong>Date:</strong> {new Date(order.created_at || order.createdAt || Date.now()).toLocaleString()}</p>

                    <table className="w-full text-sm text-gray-700 border border-gray-200 mb-3">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-2 text-left">Item</th>
                                <th className="py-2 px-2 text-center">Qty</th>
                                <th className="py-2 px-2 text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(order.items || []).map((item, index) => (
                                <tr key={index} className="border-t">
                                    <td className="py-1 px-2">{item.name || item.item_name}</td>
                                    <td className="py-1 px-2 text-center">{item.qty ?? item.quantity}</td>
                                    <td className="py-1 px-2 text-right">AFN{((item.qty ?? item.quantity) * (item.price ?? item.item_price ?? item.menu_item?.price ?? 0)).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="text-right text-gray-800">
                        <p>Subtotal: AFN{total.toFixed(2)}</p>
                        <p>Tax: AFN{tax.toFixed(2)}</p>
                        <h3 className="text-lg font-bold mt-1">Total: ${finalTotal}</h3>
                    </div>

                    <p className="text-center text-gray-500 text-xs mt-4">Thank you for dining with us!</p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button 
                    onClick={handlePrint} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all">Print</button>
                    <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-all">Close</button>
                </div>
            </div>
        </div>
    );
};

export default BillPrintModal;
