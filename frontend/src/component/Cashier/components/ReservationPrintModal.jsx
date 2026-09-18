import React, { useRef, useContext } from "react";
import { AuthContext } from "../../../api/authforRBC";
import { useTranslation as useAutoTranslation } from "react-i18next";

const ReservationPrintModal = ({ reservation, onClose }) => {
  const { t: autoT, i18n } = useAutoTranslation();
  const printRef = useRef();
  const { restaurantDetails } = useContext(AuthContext);
  const receiptFooter = autoT("printing.powered_by");
  const BASE_URL = import.meta.env.VITE_MEDIA_URL;
  const logo = restaurantDetails?.logo
    ? `${BASE_URL}${restaurantDetails.logo}`
    : "";

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!reservation) return null;

  // --- Helpers ---
  const formatDate = (date) => new Date(date).toLocaleDateString();
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  const formatDateTime = (date) => new Date(date).toLocaleString();

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

  // --- Print HTML Generator ---
  const generateHtml = () => {
    const reservationNumber = reservation.reservation_number ?? reservation.id;

    return `
      <!doctype html>
      <html lang="${i18n.resolvedLanguage || i18n.language}" dir="${i18n.dir()}">
        <head>
          <meta charset="utf-8" />
          <title>${autoT("printing.reservation")} - ${escapeHtml(String(reservationNumber))}</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @page { margin: 5mm; size: auto; }
            }
            body { 
              margin: 0; 
              padding: 12px; 
              font-family: 'Courier New', 'Segoe UI', system-ui, sans-serif; 
              font-size: 11px; 
              line-height: 1.35; 
              color: var(--theme-text-primary); 
            }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 2px 0; }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .dashed { border-bottom: 1px dashed var(--theme-border-strong); }
            .mt-1 { margin-top: 4px; }
            .mt-2 { margin-top: 8px; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          ${
            restaurantDetails?.logo
              ? `
            <div class="center mb-1">
              <img src="${escapeHtml(logo)}" alt="${escapeHtml(autoT("printing.restaurant_logo"))}" style="max-width:60px;height:auto;">
            </div>
          `
              : ""
          }

          ${
            restaurantDetails?.name
              ? `
            <h1 class="center" style="margin:0 0 2px;font-size:16px;font-weight:bold">
              ${escapeHtml(restaurantDetails.name)}
            </h1>
          `
              : ""
          }

          ${
            restaurantDetails?.phone || restaurantDetails?.address
              ? `
            <div class="center" style="margin-bottom:6px;padding-bottom:4px;border-bottom:1px dashed var(--theme-border-strong);font-size:10px">
              ${restaurantDetails?.phone ? `<p style="margin:0 0 1px"><strong>${autoT("printing.phone")}:</strong> ${escapeHtml(restaurantDetails.phone)}</p>` : ""}
              ${restaurantDetails?.address ? `<p style="margin:0"><strong>${autoT("printing.address")}:</strong> ${escapeHtml(restaurantDetails.address)}</p>` : ""}
            </div>
          `
              : ""
          }

          <h2 class="center" style="margin:0 0 6px;font-size:14px;font-weight:bold;letter-spacing:1px">
            ${autoT("printing.reservation_receipt")}
          </h2>

          <p style="margin:0 0 2px;font-size:11px">
            <strong>${autoT("printing.reservation_number")}:</strong> ${escapeHtml(String(reservationNumber))}
          </p>
          <p style="margin:0 0 2px;font-size:11px">
            <strong>${autoT("printing.customer")}:</strong> ${escapeHtml(reservation.customer_name || "")}
          </p>
          <p style="margin:0 0 2px;font-size:11px">
            <strong>${autoT("printing.phone")}:</strong> ${escapeHtml(reservation.phone || "")}
          </p>

          <table style="margin:4px 0">
            <tr>
              <td style="padding:2px 8px 2px 0;width:50%">
                <strong>${autoT("printing.table")}:</strong> ${escapeHtml(reservation.table_name || "—")}
              </td>
              <td style="padding:2px 0;width:50%">
                <strong>${autoT("printing.guests")}:</strong> ${escapeHtml(String(reservation.guests || "—"))}
              </td>
            </tr>
            <tr>
              <td style="padding:2px 8px 2px 0">
                <strong>${autoT("printing.date")}:</strong> ${escapeHtml(formatDate(reservation.start_time))}
              </td>
              <td style="padding:2px 0">
                <strong>${autoT("printing.time")}:</strong> ${escapeHtml(`${formatTime(reservation.start_time)} – ${formatTime(reservation.end_time)}`)}
              </td>
            </tr>
            <tr>
              <td style="padding:2px 8px 2px 0">
                <strong>${autoT("printing.type")}:</strong> ${escapeHtml(reservation.reservation_type || "—")}
              </td>
              <td style="padding:2px 0">
                <strong>${autoT("printing.duration")}:</strong> ${escapeHtml(`${reservation.duration_minutes || 0} ${autoT("printing.minutes")}`)}
              </td>
            </tr>
          </table>

          <div class="dashed" style="margin:6px 0"></div>

          <table>
            <tr>
              <td style="padding:2px 0;width:60%">${autoT("printing.reservation_fee")}</td>
              <td class="right" style="padding:2px 0;width:40%">${escapeHtml(String(reservation.amount || "0"))}</td>
            </tr>
            <tr>
              <td style="padding:2px 0">${autoT("printing.paid")}</td>
              <td class="right" style="padding:2px 0">${escapeHtml(String(reservation.paid_amount || "0"))}</td>
            </tr>
            <tr>
              <td class="bold" style="padding:2px 0">${autoT("printing.total")}</td>
              <td class="right bold" style="padding:2px 0">${escapeHtml(String(reservation.total_price || "0"))}</td>
            </tr>
          </table>

          <div class="dashed" style="margin:6px 0"></div>

          <table>
            <tr>
              <td style="padding:2px 0;width:60%">${autoT("printing.status")}</td>
              <td style="padding:2px 0;width:40%">${escapeHtml(reservation.status || "—")}</td>
            </tr>
            <tr>
              <td style="padding:2px 0">${autoT("printing.created_by")}</td>
              <td style="padding:2px 0">${escapeHtml(reservation.created_by_name || "—")}</td>
            </tr>
            <tr>
              <td style="padding:2px 0">${autoT("printing.created_at")}</td>
              <td style="padding:2px 0">${escapeHtml(formatDateTime(reservation.created_at))}</td>
            </tr>
          </table>

          ${
            reservation.notes
              ? `
            <div class="dashed" style="margin:6px 0"></div>
            <div style="margin-top:4px">
              <p style="margin:0 0 2px;font-weight:bold;font-size:11px">${autoT("printing.notes")}:</p>
              <p style="margin:0;font-size:11px;white-space:pre-line">${escapeHtml(reservation.notes)}</p>
            </div>
          `
              : ""
          }

          <div class="dashed" style="margin:8px 0"></div>

          <p class="center" style="margin:0;font-size:10px;color:var(--theme-text-muted);white-space:pre-line">${escapeHtml(receiptFooter)}</p>
        </body>
      </html>
    `;
  };

  // --- Print Handler ---
  const handlePrint = async () => {
    try {
      const printWindow = window.open("", "_blank", "width=600,height=700");
      if (!printWindow) {
        alert(autoT("printing.popup_blocked"));
        return;
      }

      printWindow.document.open();
      printWindow.document.write(generateHtml());
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
      }, 300);
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
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
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
            {autoT("legacy.reservation_receipt_d3815df2")}
          </h2>
          <p className="text-[11px] text-gray-600 mb-0.5">
            <strong>{autoT("legacy.reservation_c574ce11")}</strong>{" "}
            {reservation.reservation_number ?? reservation.id}
          </p>
          <p className="text-[11px] text-gray-600 mb-0.5">
            <strong>{autoT("legacy.customer_5e0d7363")}</strong> {reservation.customer_name}
          </p>
          <p className="text-[11px] text-gray-600 mb-0.5">
            <strong>{autoT("legacy.phone_daeea4d0")}</strong> {reservation.phone}
          </p>

          <div className="flex gap-4 my-1">
            <div className="flex-1">
              <p className="text-[11px] text-gray-600 mb-0.5">
                <strong>{autoT("legacy.table_692eeda0")}</strong> {reservation.table_name}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-gray-600 mb-0.5">
                <strong>{autoT("legacy.guests_3c018d6d")}</strong> {reservation.guests}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-[11px] text-gray-600 mb-0.5">
                <strong>{autoT("legacy.date_81b7d2ea")}</strong> {formatDate(reservation.start_time)}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-gray-600 mb-0.5">
                <strong>{autoT("legacy.time_179578fe")}</strong>{" "}
                {`${formatTime(reservation.start_time)} – ${formatTime(reservation.end_time)}`}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-[11px] text-gray-600 mb-0.5">
                <strong>{autoT("legacy.type_ee3fb11d")}</strong> {reservation.reservation_type}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-gray-600 mb-0.5">
                <strong>{autoT("legacy.duration_9693aeaa")}</strong>{" "}
                {`${reservation.duration_minutes} min`}
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-2"></div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">{autoT("legacy.reservation_fee_9f754091")}</span>
              <span className="text-gray-800">{reservation.amount}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">{autoT("legacy.paid_dc9d4584")}</span>
              <span className="text-gray-800">{reservation.paid_amount}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-gray-600">{autoT("table.total")}</span>
              <span className="text-gray-800">{reservation.total_price}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-2"></div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">{autoT("table.status")}</span>
              <span className="text-gray-800">{reservation.status}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">{autoT("inventory_manager.common.created_by")}</span>
              <span className="text-gray-800">
                {reservation.created_by_name}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">{autoT("legacy.created_at_5db1542e")}</span>
              <span className="text-gray-800">
                {formatDateTime(reservation.created_at)}
              </span>
            </div>
          </div>

          {reservation.notes && (
            <>
              <div className="border-t border-dashed border-gray-300 my-2"></div>
              <div className="py-1">
                <span className="text-gray-600 text-[11px] font-medium">
                  {autoT("legacy.notes_9c3befe7")}
                </span>
                <p className="text-[11px] text-gray-800 mt-1 whitespace-pre-line leading-relaxed">
                  {reservation.notes}
                </p>
              </div>
            </>
          )}

          <div className="border-t border-dashed border-gray-300 mt-3 pt-2 text-center text-[10px] text-gray-500 whitespace-pre-line">
            {receiptFooter}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-5 py-4 bg-gray-50 -mx-4 -mb-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            {autoT("menuDetails.close")}
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
          >
            {autoT("legacy.print_receipt_4e896ec2")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationPrintModal;
