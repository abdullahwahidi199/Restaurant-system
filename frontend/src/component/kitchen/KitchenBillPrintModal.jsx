import React from "react";

const KitchenBillPrintModal = ({ order, onClose }) => {
  if (!order) return null;

  const generatePrintContent = () => {
    const tableName = order.table_name || order.tableName || "N/A";
    const createdBy = order.created_by_name || "System";
    const createdAt = new Date(order.created_at).toLocaleString();

    const itemsHtml = (order.items || [])
      .map(
        (item) => `
          <tr>
            <td>${item.name || item.item_name}</td>
            <td class="center">${item.qty || item.quantity}</td>
          </tr>
        `,
      )
      .join("");

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Kitchen Order #${order.id}</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border-bottom: 1px solid #ddd; padding: 8px; }
            th { text-align: left; }
            .center { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Kitchen Order</h2>
          
          <p><strong>Order ID:</strong> ${order.id}</p>
          ${order.order_type === "dine-in" ? `<p><strong>Table:</strong> ${tableName}</p>` : ""}
          ${order.order_type ? `<p><strong>Type:</strong> ${order.order_type}</p>` : ""}
          <p><strong>Created By:</strong> ${createdBy}</p>
          <p><strong>Created At:</strong> ${createdAt}</p>
          
          <hr />
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="center">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=600,height=700");

    if (!printWindow) {
      alert("Pop-up blocked. Please allow pop-ups.");
      return;
    }

    printWindow.document.write(generatePrintContent());
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded-xl w-[350px]">
        <h2 className="text-lg font-bold mb-3">Print Kitchen Order</h2>

        <p className="text-sm">Order #{order.id}</p>
        <p className="text-sm">Table: {order.tableName || "N/A"}</p>
        <p className="text-sm">Items: {(order.items || []).length}</p>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default KitchenBillPrintModal;
