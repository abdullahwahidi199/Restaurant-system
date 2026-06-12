import React, { useRef, useEffect, useContext } from "react";
import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";

const BillPrintModal = ({ order, onClose }) => {
  const printRef = useRef();
  const { restaurantDetails } = useContext(AuthContext);
  const BASE_URL = import.meta.env.VITE_MEDIA_URL;
  const logo = restaurantDetails?.logo
    ? `${BASE_URL}${restaurantDetails.logo}`
    : "";

  if (!order) return null;

  // --- Helpers ---
  const itemName = (it) => it.name || it.item_name || "";
  const itemQty = (it) => it.qty ?? it.quantity ?? 0;
  const itemPrice = (it) =>
    it.price_at_order ?? it.item_price ?? it.menu_item?.price ?? 0;

  // --- Financial Calculations ---
  const hasReservation = !!order.reservation_payment;
  const reservationTotal = Number(order.reservation_payment?.total || 0);
  const reservationPaid = Number(order.reservation_payment?.paid || 0);

  // 1. Items Subtotal
  const itemsSubtotal = (order.items || []).reduce((sum, item) => {
    if (item.status === "cancelled") {
      return sum;
    }

    return sum + itemQty(item) * itemPrice(item);
  }, 0);

  // 2. Original Bill Total (Items + Reservation)
  const originalBillTotal = itemsSubtotal + reservationTotal;

  // 3. Discount applies to the WHOLE bill
  const discountPercent = Number(order.discount_percent || 0);
  const discountAmount = (originalBillTotal * discountPercent) / 100;
  const totalAfterDiscount = originalBillTotal - discountAmount;

  // 4. Taxes and Fees
  const deliveryFee = Number(order.delivery_fee || 0);
  const taxRate = Number(order.tax || 0);
  const tax = totalAfterDiscount * taxRate;

  // 5. Grand Totals (Using backend exact values if available to ensure 100% accuracy)
  const grandTotal = order.total
    ? Number(order.total)
    : totalAfterDiscount + tax + deliveryFee;
  const remainingBalance = order.remaining_total
    ? Number(order.remaining_total)
    : grandTotal - reservationPaid;

  function escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str.replace(/[&<>"'`=\/]/g, function (s) {
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
  }

  // --- Print HTML Generator ---
  const generateHtml = () => {
    const itemsHtml = (order.items || [])
      .map((it) => {
        const isCancelled = it.status === "cancelled";

        return `
    <tr 
      style="
        page-break-inside:avoid;
        ${isCancelled ? "opacity:0.5;text-decoration:line-through;" : ""}
      "
    >
      <td style="padding:4px;border-bottom:1px solid #eee;font-size:11px">
        ${escapeHtml(itemName(it))}
        ${isCancelled ? '<span style="color:red"> (Cancelled)</span>' : ""}
      </td>

      <td style="padding:4px;border-bottom:1px solid #eee;text-align:center;font-size:11px">
        ${escapeHtml(String(itemQty(it)))}
      </td>

      <td style="padding:4px;border-bottom:1px solid #eee;text-align:right;font-size:11px">
        ${
          isCancelled
            ? "AFN 0.00"
            : `AFN ${(itemQty(it) * itemPrice(it)).toFixed(2)}`
        }
      </td>
    </tr>
  `;
      })
      .join("");

    const customerDisplay = escapeHtml(
      order.name || order.customer || order.phone || "",
    );

    const restaurantLogoHtml = restaurantDetails?.logo
      ? `<div style="text-align:center;margin-bottom:8px"><img src="${escapeHtml(logo)}" alt="Restaurant Logo" style="max-width:60px;height:auto;"></div>`
      : "";

    const restaurantNameHtml = restaurantDetails?.name
      ? `<h1 style="text-align:center;margin:0 0 4px;font-size:20px">${escapeHtml(restaurantDetails.name)}</h1>`
      : "";

    const restaurantContactHtml =
      restaurantDetails?.phone || restaurantDetails?.address
        ? `<div style="text-align:center;margin-bottom:8px;border-bottom:1px dashed #ccc;padding-bottom:4px">
            ${restaurantDetails?.phone ? `<p style="margin:0 0 2px;font-size:10px"><strong>Phone:</strong> ${escapeHtml(restaurantDetails.phone)}</p>` : ""}
            ${restaurantDetails?.address ? `<p style="margin:0;font-size:10px"><strong>Address:</strong> ${escapeHtml(restaurantDetails.address)}</p>` : ""}
           </div>`
        : "";

    // Standardized Summary for Thermal Printers
    const summaryHtml = `
      <div style="margin-top:8px;border-top:1px dashed #ccc;padding-top:4px;font-size:11px">
        <div style="margin:2px 0">Items Subtotal: <span style="float:right">AFN ${itemsSubtotal.toFixed(2)}</span></div>
        ${hasReservation ? `<div style="margin:2px 0">Reservation: <span style="float:right">AFN ${reservationTotal.toFixed(2)}</span></div>` : ""}
        <div style="margin:2px 0;font-weight:bold">Subtotal: <span style="float:right">AFN ${originalBillTotal.toFixed(2)}</span></div>
        
        ${
          discountPercent > 0
            ? `
          <div style="margin:2px 0;color:red">Discount (${discountPercent}%): <span style="float:right">- AFN ${discountAmount.toFixed(2)}</span></div>
          <div style="margin:2px 0;font-weight:bold">Total After Discount: <span style="float:right">AFN ${totalAfterDiscount.toFixed(2)}</span></div>
        `
            : ""
        }
        
        ${tax > 0 ? `<div style="margin:2px 0">Tax: <span style="float:right">AFN ${tax.toFixed(2)}</span></div>` : ""}
        ${deliveryFee > 0 ? `<div style="margin:2px 0">Delivery Fee: <span style="float:right">AFN ${deliveryFee.toFixed(2)}</span></div>` : ""}
        
        <div style="clear:both"></div>
        <div style="margin:4px 0;font-size:14px;font-weight:bold;border-top:1px solid #000;padding-top:4px">
          Grand Total: <span style="float:right">AFN ${grandTotal.toFixed(2)}</span>
        </div>
        
        ${
          hasReservation
            ? `
          <div style="clear:both;margin-top:6px;padding-top:4px;border-top:1px dashed #ccc">
            <div style="margin:2px 0">Pre-paid: <span style="float:right">AFN ${reservationPaid.toFixed(2)}</span></div>
            <div style="margin:2px 0;font-weight:bold;color:#d32f2f">Remaining Balance: <span style="float:right">AFN ${remainingBalance.toFixed(2)}</span></div>
          </div>
        `
            : ""
        }
        <div style="clear:both"></div>
      </div>
    `;

    return `
      <div style="font-family:Arial,Helvetica,sans-serif;padding:12px;color:#111;font-size:12px">
        ${restaurantLogoHtml}
        ${restaurantNameHtml}
        ${restaurantContactHtml}
        
        <h2 style="text-align:center;margin:0 0 6px;font-size:18px">Bill</h2>
        <p style="margin:0 0 3px;font-size:11px"><strong>Order #</strong> ${escapeHtml(String(order.order_number))}</p>
        <p style="margin:0 0 3px;font-size:11px"><strong>Customer:</strong> ${customerDisplay}</p>
        ${
          order.table
            ? `<p style="margin:0 0 3px;font-size:11px"><strong>Table:</strong> ${escapeHtml(order.tableName)}</p>`
            : `<p style="margin:0 0 3px;font-size:11px"><strong>Type:</strong> ${escapeHtml(order.order_type)}</p>`
        }
        <p style="margin:0 0 8px;font-size:11px"><strong>Date:</strong> ${escapeHtml(new Date(order.created_at || order.createdAt || Date.now()).toLocaleString())}</p>
        
        <table style="width:100%;border-collapse:collapse;text-align:left;margin-bottom:8px">
          <thead>
            <tr>
              <th style="padding:4px;border-bottom:1px solid #000;text-align:left;font-size:11px">Item</th>
              <th style="padding:4px;border-bottom:1px solid #000;text-align:center;font-size:11px">Qty</th>
              <th style="padding:4px;border-bottom:1px solid #000;text-align:right;font-size:11px">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        
        ${summaryHtml}
        
        <p style="text-align:center;color:#666;font-size:10px;margin-top:8px">Thank you for dining with us!</p>
      </div>
    `;
  };

  // --- Print Handler ---
  const handlePrint = async () => {
    try {
      const markAsPrinted = async () => {
        try {
          await instance.post(`/orders/print/${order.id}/`);
        } catch (err) {
          console.error("Failed to mark as printed", err);
        }
      };

      const printWindow = window.open("", "_blank", "width=600,height=700");
      if (!printWindow) {
        alert("Pop-up blocked. Please allow pop-ups to print.");
        return;
      }

      printWindow.document.open();
      const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Bill - ${escapeHtml(String(order.order_number))}</title>
            <style>
              @media print { body { -webkit-print-color-adjust: exact; } @page { margin: 5mm; size: auto; } table { page-break-inside: auto; } tr { page-break-inside: avoid; page-break-after: auto; } }
              body { margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; }
            </style>
          </head>
          <body>${generateHtml()}</body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(async () => {
        printWindow.print();
        await markAsPrinted();
      }, 200);
    } catch (err) {
      console.error("Print error:", err);
      alert("Could not open print window.");
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // --- Modal Render ---
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white w-11/12 md:w-2/3 lg:w-1/3 rounded-2xl shadow-lg p-4 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <div ref={printRef}>
          {restaurantDetails?.logo && (
            <div className="text-center mb-2">
              <img
                src={logo}
                alt="Restaurant Logo"
                className="max-w-16 h-auto mx-auto"
              />
            </div>
          )}

          {restaurantDetails?.name && (
            <h1 className="text-lg font-bold text-center mb-1 text-gray-800">
              {restaurantDetails.name}
            </h1>
          )}

          {(restaurantDetails?.phone || restaurantDetails?.address) && (
            <div className="text-center mb-2 pb-2 border-b border-dashed border-gray-300">
              {restaurantDetails?.phone && (
                <p className="text-[10px] text-gray-600 mb-0.5">
                  <strong>Phone:</strong> {restaurantDetails.phone}
                </p>
              )}
              {restaurantDetails?.address && (
                <p className="text-[10px] text-gray-600">
                  <strong>Address:</strong> {restaurantDetails.address}
                </p>
              )}
            </div>
          )}

          <h2 className="text-base font-bold mb-1 text-center text-gray-800">
            Bill
          </h2>
          <p className="text-[11px] text-gray-600 mb-0.5">
            <strong>Order #</strong> {order.order_number}
          </p>
          <p className="text-[11px] text-gray-600 mb-0.5">
            <strong>Customer:</strong>{" "}
            {order.name || order.customer || order.phone}
          </p>
          {order.table ? (
            <p className="text-[11px] text-gray-600 mb-0.5">
              <strong>Table:</strong> {order.tableName}
            </p>
          ) : (
            <p className="text-[11px] text-gray-600 mb-0.5">
              <strong>Type:</strong> {order.order_type}
            </p>
          )}
          <p className="text-[11px] text-gray-600 mb-2">
            <strong>Date:</strong>{" "}
            {new Date(
              order.created_at || order.createdAt || Date.now(),
            ).toLocaleString()}
          </p>

          <table className="w-full text-[11px] text-gray-700 border border-gray-200 mb-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-1 px-1 text-left">Item</th>
                <th className="py-1 px-1 text-center">Qty</th>
                <th className="py-1 px-1 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="py-0.5 px-1">{itemName(item)}</td>
                  <td className="py-0.5 px-1 text-center">{itemQty(item)}</td>
                  <td className="py-0.5 px-1 text-right">
                    AFN {(itemQty(item) * itemPrice(item)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Standardized Bill Summary */}
          <div className="mt-3 pt-2 border-t border-dashed border-gray-300 text-right text-gray-800 text-[11px]">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span>AFN {itemsSubtotal.toFixed(2)}</span>
            </div>

            {hasReservation && (
              <div className="flex justify-between">
                <span>Reservation:</span>
                <span>AFN {reservationTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-semibold">
              <span>Subtotal:</span>
              <span>AFN {originalBillTotal.toFixed(2)}</span>
            </div>

            {discountPercent > 0 && (
              <>
                <div className="flex justify-between text-red-500">
                  <span>Discount ({discountPercent}%):</span>
                  <span>- AFN {discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total After Discount:</span>
                  <span>AFN {totalAfterDiscount.toFixed(2)}</span>
                </div>
              </>
            )}

            {tax > 0 && (
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>AFN {tax.toFixed(2)}</span>
              </div>
            )}

            {deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>AFN {deliveryFee.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-bold mt-1 pt-1 border-t border-gray-300">
              <span>Grand Total:</span>
              <span>AFN {grandTotal.toFixed(2)}</span>
            </div>

            {hasReservation && (
              <div className="mt-2 pt-2 border-t border-dashed border-gray-300">
                <div className="flex justify-between">
                  <span>Pre-paid:</span>
                  <span>AFN {reservationPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-red-600">
                  <span>Remaining Balance:</span>
                  <span>AFN {remainingBalance.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-gray-500 text-[10px] mt-3">
            Thanks for dining with us!
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handlePrint}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-all text-sm"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1.5 rounded-lg transition-all text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillPrintModal;
