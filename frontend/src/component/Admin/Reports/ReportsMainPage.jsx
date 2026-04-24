import React, { useState } from "react";
import OrdersReport from "./OrdersReport";
import FinanceReport from "./FinanceReport";
import InventoryReport from "./InventoryReport";
import StaffReport from "./StaffReport";

const REPORT_OPTIONS = [
  { value: "orders", label: "Orders Report" },
  { value: "finance", label: "Finance (Profit & Loss)" },
  { value: "inventory", label: "Inventory Status" },
  // { value: "staff_attendance", label: "Staff Attendance" },
  { value: "staff_performance", label: "Staff Performance" },
];

export default function ReportsMainPage() {
  const [reportType, setReportType] = useState("orders");
  const [startDate, setStartDate] = useState("2026-04-01");
  const [endDate, setEndDate] = useState("2026-04-30");

  return (
    <div className="p-6 space-y-6">
      {/* Header + Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Reports</h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Report Type Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="report-type" className="text-sm font-medium">
              Report Type:
            </label>
            <select
              id="report-type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="border rounded px-3 py-2"
            >
              {REPORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filters (UI-only for now) */}
          <div className="flex items-center gap-2">
            <label htmlFor="start" className="text-sm font-medium">
              From:
            </label>
            <input
              id="start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <label htmlFor="end" className="text-sm font-medium">
              To:
            </label>
            <input
              id="end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>

          {/* Placeholder button (no action yet) */}
          <button
            type="button"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              // Intentionally left empty for now
              console.log("Generate clicked (placeholder):", {
                reportType,
                startDate,
                endDate,
              });
            }}
          >
            Generate
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        {reportType === "orders" && (
          <OrdersReport startDate={startDate} endDate={endDate} />
        )}
        {reportType === "finance" && (
          <FinanceReport startDate={startDate} endDate={endDate} />
        )}
        {reportType === "inventory" && (
          <InventoryReport startDate={startDate} endDate={endDate} />
        )}
        {/* Staff Performance */}
        {reportType === "staff_performance" && (
          <StaffReport startDate={startDate} endDate={endDate} />
        )}
        {/* Customers
        {reportType === "customers" && (
          <CustomersReport startDate={startDate} endDate={endDate} />
        )} */}
      </div>
    </div>
  );
}
