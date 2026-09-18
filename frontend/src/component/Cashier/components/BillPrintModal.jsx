import React, { useRef, useEffect, useContext } from "react";
import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";
import { useTranslation as useAutoTranslation } from "react-i18next";

const BillPrintModal = ({ order, onClose }) => {
  const { t: autoT, i18n } = useAutoTranslation();
  const printRef = useRef();
  console.log(order);
  const { restaurantDetails } = useContext(AuthContext);
  const receiptFooter = autoT("printing.powered_by");
  const BASE_URL = import.meta.env.VITE_MEDIA_URL;
  const logo = restaurantDetails?.logo
    ? `${BASE_URL}${restaurantDetails.logo}`
    : "";

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
      <td style="padding:4px;border-bottom:1px solid var(--theme-border);font-size:11px">
        ${escapeHtml(itemName(it))}
        ${isCancelled ? `<span style="color:red"> (${escapeHtml(autoT("printing.cancelled"))})</span>` : ""}
      </td>

      <td style="padding:4px;border-bottom:1px solid var(--theme-border);text-align:center;font-size:11px">
        ${escapeHtml(String(itemQty(it)))}
      </td>

      <td style="padding:4px;border-bottom:1px solid var(--theme-border);text-align:right;font-size:11px">
        ${
          isCancelled
            ? `${autoT("labels.afn")} 0.00`
            : `${autoT("labels.afn")} ${(itemQty(it) * itemPrice(it)).toFixed(2)}`
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
      ? `<div style="text-align:center;margin-bottom:8px"><img src="${escapeHtml(logo)}" alt="${escapeHtml(autoT("printing.restaurant_logo"))}" style="max-width:60px;height:auto;"></div>`
      : "";

    const restaurantNameHtml = restaurantDetails?.name
      ? `<h1 style="text-align:center;margin:0 0 4px;font-size:20px">${escapeHtml(restaurantDetails.name)}</h1>`
      : "";

    const restaurantContactHtml =
      restaurantDetails?.phone || restaurantDetails?.address
        ? `<div style="text-align:center;margin-bottom:8px;border-bottom:1px dashed var(--theme-border-strong);padding-bottom:4px">
            ${restaurantDetails?.phone ? `<p style="margin:0 0 2px;font-size:10px"><strong>${escapeHtml(autoT("printing.phone"))}:</strong> ${escapeHtml(restaurantDetails.phone)}</p>` : ""}
            ${restaurantDetails?.address ? `<p style="margin:0;font-size:10px"><strong>${escapeHtml(autoT("printing.address"))}:</strong> ${escapeHtml(restaurantDetails.address)}</p>` : ""}
           </div>`
        : "";
    const receiptFooterHtml = receiptFooter
      ? `<p style="text-align:center;color:var(--theme-text-muted);font-size:10px;margin-top:8px;white-space:pre-line">${escapeHtml(receiptFooter)}</p>`
      : "";

    // Standardized Summary for Thermal Printers
    const summaryHtml = `
      <div style="margin-top:8px;border-top:1px dashed var(--theme-border-strong);padding-top:4px;font-size:11px">
        <div style="margin:2px 0">${autoT("printing.items_subtotal")}: <span style="float:inline-end">${autoT("labels.afn")} ${itemsSubtotal.toFixed(2)}</span></div>
        ${hasReservation ? `<div style="margin:2px 0">${autoT("printing.reservation")}: <span style="float:inline-end">${autoT("labels.afn")} ${reservationTotal.toFixed(2)}</span></div>` : ""}
        <div style="margin:2px 0;font-weight:bold">${autoT("printing.subtotal")}: <span style="float:inline-end">${autoT("labels.afn")} ${originalBillTotal.toFixed(2)}</span></div>
        
        ${
          discountPercent > 0
            ? `
          <div style="margin:2px 0;color:red">${autoT("printing.discount")} (${discountPercent}%): <span style="float:inline-end">- ${autoT("labels.afn")} ${discountAmount.toFixed(2)}</span></div>
          <div style="margin:2px 0;font-weight:bold">${autoT("printing.total_after_discount")}: <span style="float:inline-end">${autoT("labels.afn")} ${totalAfterDiscount.toFixed(2)}</span></div>
        `
            : ""
        }
        
        ${tax > 0 ? `<div style="margin:2px 0">${autoT("printing.tax")}: <span style="float:inline-end">${autoT("labels.afn")} ${tax.toFixed(2)}</span></div>` : ""}
        ${deliveryFee > 0 ? `<div style="margin:2px 0">${autoT("printing.delivery_fee")}: <span style="float:inline-end">${autoT("labels.afn")} ${deliveryFee.toFixed(2)}</span></div>` : ""}
        
        <div style="clear:both"></div>
        <div style="margin:4px 0;font-size:14px;font-weight:bold;border-top:1px solid var(--theme-text-primary);padding-top:4px">
          ${autoT("printing.grand_total")}: <span style="float:inline-end">${autoT("labels.afn")} ${grandTotal.toFixed(2)}</span>
        </div>
        
        ${
          hasReservation
            ? `
          <div style="clear:both;margin-top:6px;padding-top:4px;border-top:1px dashed var(--theme-border-strong)">
            <div style="margin:2px 0">${autoT("printing.prepaid")}: <span style="float:inline-end">${autoT("labels.afn")} ${reservationPaid.toFixed(2)}</span></div>
            <div style="margin:2px 0;font-weight:bold;color:var(--theme-danger-hover)">${autoT("printing.remaining_balance")}: <span style="float:inline-end">${autoT("labels.afn")} ${remainingBalance.toFixed(2)}</span></div>
          </div>
        `
            : ""
        }
        <div style="clear:both"></div>
      </div>
    `;

    return `
      <div style="font-family:Arial,Helvetica,sans-serif;padding:12px;color:var(--theme-text-primary);font-size:12px">
        ${restaurantLogoHtml}
        ${restaurantNameHtml}
        ${restaurantContactHtml}
        
        <h2 style="text-align:center;margin:0 0 6px;font-size:18px">${autoT("printing.bill")}</h2>
        <p style="margin:0 0 3px;font-size:11px"><strong>${autoT("printing.order_number")}:</strong> ${escapeHtml(String(order.order_number))}</p>
        <p style="margin:0 0 3px;font-size:11px"><strong>${autoT("printing.customer")}:</strong> ${customerDisplay}</p>
        ${
          order.table
            ? `<p style="margin:0 0 3px;font-size:11px"><strong>${autoT("printing.table")}:</strong> ${escapeHtml(order.tableName)}</p>`
            : `<p style="margin:0 0 3px;font-size:11px"><strong>${autoT("printing.type")}:</strong> ${escapeHtml(order.order_type)}</p>`
        }
        <p style="margin:0 0 8px;font-size:11px"><strong>${autoT("printing.date")}:</strong> ${escapeHtml(new Date(order.created_at || order.createdAt || Date.now()).toLocaleString())}</p>
        
        <table style="width:100%;border-collapse:collapse;text-align:left;margin-bottom:8px">
          <thead>
            <tr>
              <th style="padding:4px;border-bottom:1px solid var(--theme-text-primary);text-align:start;font-size:11px">${autoT("printing.item")}</th>
              <th style="padding:4px;border-bottom:1px solid var(--theme-text-primary);text-align:center;font-size:11px">${autoT("printing.quantity")}</th>
              <th style="padding:4px;border-bottom:1px solid var(--theme-text-primary);text-align:end;font-size:11px">${autoT("printing.price")}</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        
        ${summaryHtml}
        
        ${receiptFooterHtml}
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
        alert(autoT("printing.popup_blocked"));
        return;
      }

      printWindow.document.open();
      const html = `
        <!doctype html>
        <html lang="${i18n.resolvedLanguage || i18n.language}" dir="${i18n.dir()}">
          <head>
            <meta charset="utf-8" />
            <title>${autoT("printing.bill")} - ${escapeHtml(String(order.order_number))}</title>
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
      alert(autoT("printing.print_window_error"));
    }
  };

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
          aria-label={autoT("menuDetails.close")}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <div ref={printRef}>
          {restaurantDetails?.logo && (
            <div className="text-center mb-2">
              <img
                src={logo}
                alt={autoT("legacy.restaurant_logo_aeb74aea")}
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
                  <strong>{autoT("legacy.phone_daeea4d0")}</strong> {restaurantDetails.phone}
                </p>
              )}
              {restaurantDetails?.address && (
                <p className="text-[10px] text-gray-600">
                  <strong>{autoT("legacy.address_303d9813")}</strong> {restaurantDetails.address}
                </p>
              )}
            </div>
          )}

          <h2 className="text-base font-bold mb-1 text-center text-gray-800">
            {autoT("legacy.bill_3d734614")}
          </h2>
          <p className="text-[11px] text-gray-600 mb-0.5">
            <strong>{autoT("table.order_number")}</strong> {order.order_number}
          </p>
          <p className="text-[11px] text-gray-600 mb-0.5">
            <strong>{autoT("legacy.customer_5e0d7363")}</strong>{" "}
            {order.name || order.customer || order.phone}
          </p>
          {order.table ? (
            <p className="text-[11px] text-gray-600 mb-0.5">
              <strong>{autoT("legacy.table_692eeda0")}</strong> {order.tableName}
            </p>
          ) : (
            <p className="text-[11px] text-gray-600 mb-0.5">
              <strong>{autoT("legacy.type_ee3fb11d")}</strong> {order.order_type}
            </p>
          )}
          <p className="text-[11px] text-gray-600 mb-2">
            <strong>{autoT("legacy.date_81b7d2ea")}</strong>{" "}
            {new Date(
              order.created_at || order.createdAt || Date.now(),
            ).toLocaleString()}
          </p>

          <table className="w-full text-[11px] text-gray-700 border border-gray-200 mb-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-1 px-1 text-left">{autoT("legacy.item_ecdda59a")}</th>
                <th className="py-1 px-1 text-center">{autoT("inventory_manager.common.qty")}</th>
                <th className="py-1 px-1 text-right">{autoT("menuDetails.price")}</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, index) => {
                const isCancelled = item.status === "cancelled";

                return (
                  <tr
                    key={index}
                    className={`border-t ${isCancelled ? "opacity-50" : ""}`}
                  >
                    <td
                      className={`py-0.5 px-1 ${
                        isCancelled ? "line-through text-red-500" : ""
                      }`}
                    >
                      {itemName(item)}
                      {isCancelled && (
                        <span className="ml-1 text-[10px] text-red-500">
                          {autoT("legacy.cancelled_948c9daf")}
                        </span>
                      )}
                    </td>

                    <td className="py-0.5 px-1 text-center">{itemQty(item)}</td>

                    <td className="py-0.5 px-1 text-right">
                      {isCancelled
                        ? autoT("legacy.afn_0_00_bf1a9b95")
                        : `AFN ${(itemQty(item) * itemPrice(item)).toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Standardized Bill Summary */}
          <div className="mt-3 pt-2 border-t border-dashed border-gray-300 text-right text-gray-800 text-[11px]">
            <div className="flex justify-between">
              <span>{autoT("legacy.items_subtotal_79b4a595")}</span>
              <span>{autoT("labels.afn")} {itemsSubtotal.toFixed(2)}</span>
            </div>

            {hasReservation && (
              <div className="flex justify-between">
                <span>{autoT("legacy.reservation_39551938")}</span>
                <span>{autoT("labels.afn")} {reservationTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-semibold">
              <span>{autoT("legacy.subtotal_0db16380")}</span>
              <span>{autoT("labels.afn")} {originalBillTotal.toFixed(2)}</span>
            </div>

            {discountPercent > 0 && (
              <>
                <div className="flex justify-between text-red-500">
                  <span>{autoT("legacy.discount_a89c8edc")}{discountPercent}%):</span>
                  <span>{autoT("legacy.afn_67a0b9be")} {discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>{autoT("legacy.total_after_discount_d5900e1f")}</span>
                  <span>{autoT("labels.afn")} {totalAfterDiscount.toFixed(2)}</span>
                </div>
              </>
            )}

            {tax > 0 && (
              <div className="flex justify-between">
                <span>{autoT("legacy.tax_45e28eee")}</span>
                <span>{autoT("labels.afn")} {tax.toFixed(2)}</span>
              </div>
            )}

            {deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>{autoT("legacy.delivery_fee_f6a5af54")}</span>
                <span>{autoT("labels.afn")} {deliveryFee.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-bold mt-1 pt-1 border-t border-gray-300">
              <span>{autoT("legacy.grand_total_fe5c1120")}</span>
              <span>{autoT("labels.afn")} {grandTotal.toFixed(2)}</span>
            </div>

            {hasReservation && (
              <div className="mt-2 pt-2 border-t border-dashed border-gray-300">
                <div className="flex justify-between">
                  <span>{autoT("legacy.pre_paid_c4a17be2")}</span>
                  <span>{autoT("labels.afn")} {reservationPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-red-600">
                  <span>{autoT("legacy.remaining_balance_8dc97d9b")}</span>
                  <span>{autoT("labels.afn")} {remainingBalance.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-gray-500 text-[10px] mt-3 whitespace-pre-line">
            {receiptFooter}
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handlePrint}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-all text-sm"
          >
            {autoT("legacy.print_5b221e9c")}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1.5 rounded-lg transition-all text-sm"
          >
            {autoT("menuDetails.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillPrintModal;
