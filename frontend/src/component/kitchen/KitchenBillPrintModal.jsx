import React, { useContext, useEffect, useRef } from "react";

const KitchenBillPrintModal = ({ order, onClose }) => {
  const printedRef = useRef(false);

  const generatePrintContent = () => {
    const tableName = order.table_name || order.tableName || "N/A";
    const createdBy = order.created_by_name || "System";
    const createdAt = order.created_at
      ? new Date(order.created_at).toLocaleString()
      : new Date().toLocaleString();

    const itemsHtml = (order.items || [])
      .map(
        (item) => `
        <tr>
          <td>${item.name || item.item_name || ""}</td>
          <td class="center">${item.qty || item.quantity || 0}</td>
        </tr>
      `,
      )
      .join("");

    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Kitchen Order #${order.order_number || ""}</title>
        <style>
          @page {
            size: 60mm auto;
            margin: 0;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
          }

          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            color: #000;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .bill-wrapper {
            padding: 4mm 4mm 4mm 4mm; /* same top and bottom */
            margin: 0;
          }

          h2 {
            margin: 0 0 4mm 0;
            text-align: center;
          }

          p {
            margin: 0 0 2mm 0;
            font-size: 14px;
          }

          hr {
            margin: 4mm 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2mm;
          }

          th, td {
            border-bottom: 1px solid #ddd;
            padding: 2mm 0;
            font-size: 14px;
          }

          th {
            text-align: left;
          }

          .center {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="bill-wrapper">
          <h2>Kitchen Order</h2>

          <p><strong>Order number:</strong> ${order.order_number || ""}</p>
          ${
            order.order_type === "dine-in"
              ? `<p><strong>Table:</strong> ${tableName}</p>`
              : ""
          }
          ${
            order.order_type
              ? `<p><strong>Type:</strong> ${order.order_type}</p>`
              : ""
          }
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
        </div>
      </body>
    </html>
  `;
  };

  useEffect(() => {
    if (!order || printedRef.current) return;

    printedRef.current = true;

    const iframe = document.createElement("iframe");

    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    iframe.style.width = "800px";
    iframe.style.height = "1000px";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";

    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;
    const iframeDocument = iframe.contentDocument || iframeWindow.document;

    iframeDocument.open();
    iframeDocument.write(generatePrintContent());
    iframeDocument.close();

    iframe.onload = () => {
      iframeWindow.focus();
      iframeWindow.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
        if (onClose) onClose();
      }, 500);
    };
  }, [order]);

  return null;
};

export default KitchenBillPrintModal;
