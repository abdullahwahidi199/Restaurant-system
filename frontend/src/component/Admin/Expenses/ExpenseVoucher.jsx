// src/pages/expenses/ExpenseVoucher.jsx
import { formatCurrency, formatDate } from "./helpers";

/**
 * Generates an HTML string for a printable payment voucher.
 */
const buildVoucherHTML = (
  expense,
  restaurantName = "Restaurant",
  logo = null,
) => {
  const themeValue = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const printThemeVars = [
    "--theme-surface",
    "--theme-surface-rgb",
    "--theme-text-primary",
    "--theme-text-muted",
    "--theme-border",
    "--theme-muted",
  ]
    .map((name) => `${name}:${themeValue(name)};`)
    .join("");
  const voucherNumber = `EXP-${String(expense.id).padStart(5, "0")}`;
  const isUSD = expense.currency === "USD";
  const BASE_MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

  // Allow passing either a URL or a base64 data URI string
  const logoHTML = logo
    ? `<img class="logo-img" src="${BASE_MEDIA_URL}${logo}" alt="${restaurantName} logo" />`
    : `<div class="logo-placeholder" aria-hidden="true"></div>`;

  const styles = `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: var(--theme-surface);
      color: var(--theme-text-primary);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body { padding: 28px; }

    :root{
      ${printThemeVars}
      --ink:var(--theme-text-primary);
      --muted:var(--theme-text-muted);
      --line:var(--theme-border);
      --panel:var(--theme-muted);
      --accent:var(--theme-text-primary);
      --radius:14px;
    }

    .voucher {
      max-width: 820px;
      margin: 0 auto;
      border: 2px solid var(--ink);
      border-radius: var(--radius);
      overflow: hidden;
      background: var(--theme-surface);
    }

    /* HEADER */
    .header {
      background: var(--ink);
      color: var(--theme-surface);
      padding: 18px 26px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }

    .logo-img {
      height: 44px;
      width: auto;
      object-fit: contain;
      background: rgb(var(--theme-surface-rgb) / 0.08);
      border-radius: 10px;
      padding: 6px 8px;
      border: 1px solid rgb(var(--theme-surface-rgb) / 0.2);
    }

    .logo-placeholder{
      height: 44px;
      width: 58px;
      border-radius: 10px;
      background: rgb(var(--theme-surface-rgb) / 0.08);
      border: 1px solid rgb(var(--theme-surface-rgb) / 0.2);
    }

    .company-name {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .voucher-meta{
      text-align: right;
      line-height: 1.2;
      white-space: nowrap;
    }
    .voucher-meta .label-sm{
      font-size: 10px;
      opacity: 0.85;
      letter-spacing: 2.2px;
      text-transform: uppercase;
    }
    .voucher-meta .number{
      font-size: 18px;
      font-weight: 800;
      margin-top: 4px;
      letter-spacing: 0.6px;
    }

    /* TITLE */
    .title-bar {
      text-align: center;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 5px;
      padding: 16px 16px;
      background: var(--theme-muted);
      border-bottom: 2px solid var(--ink);
      text-transform: uppercase;
    }

    /* CONTENT */
    .body {
      padding: 26px;
    }

    .section {
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 16px 16px;
      margin-bottom: 14px;
      background: var(--theme-surface);
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 10px 16px;
      align-items: baseline;
      padding: 6px 2px;
    }

    .field-label{
      font-size: 12px;
      color: var(--muted);
      letter-spacing: 0.3px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .field-value{
      font-size: 14px;
      color: var(--theme-text-primary);
      font-weight: 700;
      text-align: right;
    }

    /* AMOUNT CARD */
    .amount-section {
      background: var(--panel);
      padding: 18px;
      margin: 14px 0;
      border: 2px solid var(--ink);
      border-radius: 12px;
      text-align: center;
    }
    .amount-section .amt-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: var(--muted);
      font-weight: 800;
    }
    .amount-section .amt-value {
      font-size: 40px;
      font-weight: 900;
      margin-top: 10px;
      letter-spacing: 0.4px;
    }
    .amount-section .amt-sub {
      font-size: 13px;
      color: var(--muted);
      margin-top: 10px;
      line-height: 1.6;
    }

    /* DESCRIPTION */
    .desc-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2.2px;
      color: var(--muted);
      margin: 12px 0 8px;
      font-weight: 900;
    }
    .desc-text {
      padding: 12px 14px;
      background: var(--theme-background);
      border-left: 4px solid var(--ink);
      line-height: 1.6;
      font-size: 13px;
      border-radius: 10px;
    }

    /* SIGNATURES */
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px;
      margin-top: 28px;
      padding-top: 16px;
    }

    .signature-box{
      border: 1px dashed var(--theme-border-strong);
      border-radius: 12px;
      padding: 16px 12px 18px;
      background: var(--theme-surface);
      min-height: 120px;
      position: relative;
    }

    .signature-title{
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2.2px;
      color: var(--muted);
      font-weight: 900;
      text-align: center;
      margin-bottom: 10px;
    }

    .signature-line{
      border-top: 2px solid var(--ink);
      margin: 34px 24px 0;
    }

    .signature-note{
      position: absolute;
      bottom: 12px;
      left: 0; right: 0;
      text-align: center;
      font-size: 10px;
      color: var(--muted);
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }

    /* FOOTER */
    .footer {
      text-align: center;
      padding: 12px 16px;
      background: var(--theme-muted);
      border-top: 2px solid var(--ink);
      font-size: 10px;
      color: var(--theme-text-muted);
      letter-spacing: 1px;
      line-height: 1.5;
    }

    @media print {
      body { padding: 0; }
      .voucher { border-radius: 0; }
    }
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Payment Voucher - ${voucherNumber}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>${styles}</style>
</head>
<body>
  <div class="voucher">
    <div class="header">
      <div class="brand">
        ${logoHTML}
        <div class="company-name">${restaurantName}</div>
      </div>

      <div class="voucher-meta">
        <div class="label-sm">Voucher No.</div>
        <div class="number">${voucherNumber}</div>
      </div>
    </div>

    <div class="title-bar">Payment Voucher</div>

    <div class="body">
      <div class="section">
        <div class="grid-2">
          <div class="field-label">Date</div>
          <div class="field-value">${formatDate(expense.date)}</div>

          <div class="field-label">Expense</div>
          <div class="field-value">${expense.name ?? "-"}</div>

          <div class="field-label">Currency</div>
          <div class="field-value">
            ${expense.currency === "USD" ? "Foreign Currency (USD)" : "Local Currency (AFN)"}
          </div>
        </div>
      </div>

      <div class="amount-section">
        <div class="amt-label">Total Amount</div>
        <div class="amt-value">${formatCurrency(expense.amount, expense.currency)}</div>

        ${
          isUSD
            ? `<div class="amt-sub">
                Exchange Rate: 1 USD = ${expense.exchange_rate} AFN<br/>
                AFN Equivalent: <strong>${formatCurrency(expense.amount_afn, "AFN")}</strong>
              </div>`
            : `<div class="amt-sub">Local currency payment recorded.</div>`
        }
      </div>

      ${
        expense.description
          ? `<div class="desc-title">Description</div>
             <div class="desc-text">${expense.description}</div>`
          : ""
      }

      <div class="signatures">
        <div class="signature-box">
          <div class="signature-title">Authorized By</div>
          <div class="signature-line"></div>
          <div class="signature-note">Signature / Stamp</div>
        </div>

        <div class="signature-box">
          <div class="signature-title">Received By</div>
          <div class="signature-line"></div>
          <div class="signature-note">Signature / Stamp</div>
        </div>
      </div>
    </div>

    <div class="footer">
      This is a system-generated payment voucher • Printed on ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>`;
};

/**
 * Opens a new window with the voucher and triggers the print dialog.
 * @param {Object} expense
 * @param {string} restaurantName
 * @param {string|null} logo - URL or base64 data URI to show in the voucher header
 */
export const printVoucher = (
  expense,
  restaurantName = "Restaurant",
  logo = null,
) => {
  const printWindow = window.open("", "_blank", "width=850,height=950");
  if (!printWindow) {
    alert("Please allow popups to print vouchers");
    return;
  }
  printWindow.document.write(buildVoucherHTML(expense, restaurantName, logo));
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };
};

export default printVoucher;
