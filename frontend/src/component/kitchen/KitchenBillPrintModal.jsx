import React, { useCallback, useEffect, useMemo, useRef } from "react";
import instance from "../../api/axiosInstance";

const KitchenBillPrintModal = ({
  order,
  onClose,
  onOrderPrinted,
  printMode,
}) => {
  const printedRef = useRef(false);
  const receiptFooter = "Powered by Pakhlai - pakhlai.com";

  const escapeHtml = (str) => {
    if (typeof str !== "string") return str;
    return str.replace(/[&<>"'`=/]/g, function (s) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;",
      }[s];
    });
  };

  const markItemsPrinted = useCallback(async () => {
    if (printMode !== "new") return;
    try {
      await instance.post(`/orders/kitchen/${order.id}/mark-items-printed/`);
      const printedIds = order.items
        .filter((item) => !item.is_printed_to_kitchen)
        .map((item) => item.id);

      onOrderPrinted?.(order.id, printedIds);
    } catch (error) {
      console.error("Failed to mark items as printed:", error);
    }
  }, [onOrderPrinted, order.id, order.items, printMode]);

  const itemsToPrint = useMemo(() => {
    if (printMode === "new") {
      return order.items.filter(
        (item) => !item.is_printed_to_kitchen && item.status !== "cancelled",
      );
    }

    return order.items.filter((item) => item.status !== "cancelled");
  }, [order.items, printMode]);
  console.log(order);

  const generatePrintContent = useCallback(() => {
    const tableName = order.table_name || order.tableName || "N/A";
    const createdBy = order.created_by_name || "System";
    const createdAt = order.created_at
      ? new Date(order.created_at).toLocaleString()
      : new Date().toLocaleString();

    const itemsHtml = itemsToPrint
      .map(
        (item) => `
      <tr>
        <td>
          <div class="item-name">
            ${item.name || item.item_name || ""}
          </div>

          ${
            item.description
              ? `
                <div class="item-description">
                  📝 ${item.description}
                </div>
              `
              : ""
          }
        </td>

        <td class="center qty">
          ${item.qty || item.quantity || 0}
        </td>
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
            color: var(--theme-text-primary);
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .bill-wrapper {
  padding: 2mm 3mm;
  margin: 0;
}

h2 {
  margin: 0 0 2mm 0;
  text-align: center;
  font-size: 18px;
}

p {
  margin: 0 0 1mm 0;
  font-size: 12px;
  line-height: 1.2;
}

hr {
  margin: 2mm 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1mm;
}

th,
td {
  border-bottom: 1px solid var(--theme-border);
  padding: 1mm 0;
  font-size: 12px;
  vertical-align: top;
}

th {
  text-align: left;
}

.center {
  text-align: center;
}

.item-name {
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  margin: 0;
  padding: 0;
}

.item-description {
  margin-top: 0;
  padding-left: 2px;
  font-size: 10px;
  color: var(--theme-text-secondary);
  font-style: italic;
  line-height: 1;
  white-space: pre-line;
}

.qty {
  vertical-align: top;
  font-weight: bold;
  width: 20px;
}

.receipt-footer {
  margin-top: 3mm;
  padding-top: 2mm;
  border-top: 1px dashed var(--theme-border-strong);
  text-align: center;
  font-size: 10px;
  color: var(--theme-text-secondary);
  white-space: pre-line;
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
          <div class="receipt-footer">${escapeHtml(receiptFooter)}</div>
        </div>
      </body>
    </html>
  `;
  }, [itemsToPrint, order, receiptFooter]);

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

      const handleAfterPrint = async () => {
        iframeWindow.removeEventListener("afterprint", handleAfterPrint);

        const confirmed = window.confirm(
          "Was the kitchen ticket printed successfully?",
        );

        if (confirmed && printMode === "new") {
          await markItemsPrinted();
        }

        setTimeout(() => {
          document.body.removeChild(iframe);
          onClose?.();
        }, 300);
      };

      iframeWindow.addEventListener("afterprint", handleAfterPrint);

      iframeWindow.print();
    };
  }, [generatePrintContent, markItemsPrinted, onClose, order, printMode]);

  return null;
};

export default KitchenBillPrintModal;
