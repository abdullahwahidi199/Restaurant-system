import React, { useRef, useContext } from "react";
import { AuthContext } from "../../../api/authforRBC";

const ReservationPrintModal = ({ reservation, onClose }) => {
  const printRef = useRef();
  const { restaurantDetails } = useContext(AuthContext);
  const receiptFooter = "Powered by Pakhlai - pakhlai.com";
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
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Reservation - ${escapeHtml(String(reservationNumber))}</title>
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
              <img src="${escapeHtml(logo)}" alt="Restaurant Logo" style="max-width:60px;height:auto;">
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
              ${restaurantDetails?.phone ? `<p style="margin:0 0 1px"><strong>Phone:</strong> ${escapeHtml(restaurantDetails.phone)}</p>` : ""}
              ${restaurantDetails?.address ? `<p style="margin:0"><strong>Address:</strong> ${escapeHtml(restaurantDetails.address)}</p>` : ""}
            </div>
          `
              : ""
          }

          <h2 class="center" style="margin:0 0 6px;font-size:14px;font-weight:bold;letter-spacing:1px">
            RESERVATION RECEIPT
          </h2>

          <p style="margin:0 0 2px;font-size:11px">
            <strong>Reservation #</strong> ${escapeHtml(String(reservationNumber))}
          </p>
          <p style="margin:0 0 2px;font-size:11px">
            <strong>Customer:</strong> ${escapeHtml(reservation.customer_name || "")}
          </p>
          <p style="margin:0 0 2px;font-size:11px">
            <strong>Phone:</strong> ${escapeHtml(reservation.phone || "")}
          </p>

          <table style="margin:4px 0">
            <tr>
              <td style="padding:2px 8px 2px 0;width:50%">
                <strong>Table:</strong> ${escapeHtml(reservation.table_name || "—")}
              </td>
              <td style="padding:2px 0;width:50%">
                <strong>Guests:</strong> ${escapeHtml(String(reservation.guests || "—"))}
              </td>
            </tr>
            <tr>
              <td style="padding:2px 8px 2px 0">
                <strong>Date:</strong> ${escapeHtml(formatDate(reservation.start_time))}
              </td>
              <td style="padding:2px 0">
                <strong>Time:</strong> ${escapeHtml(`${formatTime(reservation.start_time)} – ${formatTime(reservation.end_time)}`)}
              </td>
            </tr>
            <tr>
              <td style="padding:2px 8px 2px 0">
                <strong>Type:</strong> ${escapeHtml(reservation.reservation_type || "—")}
              </td>
              <td style="padding:2px 0">
                <strong>Duration:</strong> ${escapeHtml(`${reservation.duration_minutes || 0} min`)}
              </td>
            </tr>
          </table>

          <div class="dashed" style="margin:6px 0"></div>

          <table>
            <tr>
              <td style="padding:2px 0;width:60%">Reservation Fee</td>
              <td class="right" style="padding:2px 0;width:40%">${escapeHtml(String(reservation.amount || "0"))}</td>
            </tr>
            <tr>
              <td style="padding:2px 0">Paid</td>
              <td class="right" style="padding:2px 0">${escapeHtml(String(reservation.paid_amount || "0"))}</td>
            </tr>
            <tr>
              <td class="bold" style="padding:2px 0">Total</td>
              <td class="right bold" style="padding:2px 0">${escapeHtml(String(reservation.total_price || "0"))}</td>
            </tr>
          </table>

          <div class="dashed" style="margin:6px 0"></div>

          <table>
            <tr>
              <td style="padding:2px 0;width:60%">Status</td>
              <td style="padding:2px 0;width:40%">${escapeHtml(reservation.status || "—")}</td>
            </tr>
            <tr>
              <td style="padding:2px 0">Created By</td>
              <td style="padding:2px 0">${escapeHtml(reservation.created_by_name || "—")}</td>
            </tr>
            <tr>
              <td style="padding:2px 0">Created At</td>
              <td style="padding:2px 0">${escapeHtml(formatDateTime(reservation.created_at))}</td>
            </tr>
          </table>

          ${
            reservation.notes
              ? `
            <div class="dashed" style="margin:6px 0"></div>
            <div style="margin-top:4px">
              <p style="margin:0 0 2px;font-weight:bold;font-size:11px">Notes:</p>
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
        alert("Pop-up blocked. Please allow pop-ups to print.");
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
      alert("Could not open print window.");
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
          aria-label="Close"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
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
            Reservation Receipt
          </h2>
          <p className="text-[11px] text-gray-600 mb-0.5">
            <strong>Reservation #</strong>{" "}
            {reservation.reservation_number ?? reservation.id}
          </p>
          <p className="text-[11px] text-gray-600 mb-0.5">
            <strong>Customer:</strong> {reservation.customer_name}
          </p>
          <p className="text-[11px] text-gray-600 mb-0.5">
            <strong>Phone:</strong> {reservation.phone}
          </p>

          <div className="flex gap-4 my-1">
            <div className="flex-1">
              <p className="text-[11px] text-gray-600 mb-0.5">
                <strong>Table:</strong> {reservation.table_name}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-gray-600 mb-0.5">
                <strong>Guests:</strong> {reservation.guests}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-[11px] text-gray-600 mb-0.5">
                <strong>Date:</strong> {formatDate(reservation.start_time)}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-gray-600 mb-0.5">
                <strong>Time:</strong>{" "}
                {`${formatTime(reservation.start_time)} – ${formatTime(reservation.end_time)}`}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-[11px] text-gray-600 mb-0.5">
                <strong>Type:</strong> {reservation.reservation_type}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-gray-600 mb-0.5">
                <strong>Duration:</strong>{" "}
                {`${reservation.duration_minutes} min`}
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-2"></div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">Reservation Fee</span>
              <span className="text-gray-800">{reservation.amount}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">Paid</span>
              <span className="text-gray-800">{reservation.paid_amount}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-gray-600">Total</span>
              <span className="text-gray-800">{reservation.total_price}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-2"></div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">Status</span>
              <span className="text-gray-800">{reservation.status}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">Created By</span>
              <span className="text-gray-800">
                {reservation.created_by_name}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">Created At</span>
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
                  Notes:
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
            Close
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationPrintModal;
