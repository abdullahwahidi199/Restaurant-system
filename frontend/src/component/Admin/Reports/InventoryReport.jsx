import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import {
  Package,
  AlertTriangle,
  Activity,
  List,
  ShoppingCart,
  TrendingDown,
  Settings2,
  CheckCircle,
  Download,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useTranslation } from "react-i18next";

const MOVEMENT_COLORS = {
  order: "var(--theme-chart-1)",
  purchase: "var(--theme-success)",
  waste: "var(--theme-danger)",
  adjustment: "var(--theme-warning)",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AFN",
  }).format(value || 0);

export default function InventoryReport({ startDate, endDate }) {
  const { t } = useTranslation();
  const [inventoryData, setInventoryData] = useState(null);
  const [movementsData, setMovementsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [low_stock_items, set_low_stock_items] = useState();
  const [low_stock_list, set_low_stock_list] = useState([]);

  const getLowStockItems = async () => {
    try {
      const res = await instance.get("/inventory/low-stock/");
      set_low_stock_items(res.data.length);
      set_low_stock_list(res.data);
    } catch (error) {
      console.log("Could not get low stock items");
    }
  };
  useEffect(() => {
    getLowStockItems();
  }, []);
  const getInvertoryReport = async () => {
    try {
      const res = await instance.get(
        `/reports/generate_report/?type=inventory&start=${startDate}&end=${endDate}`,
      );
      setInventoryData(res.data.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const res = await instance.get(
        `/reports/inventory-pdf/?start=${startDate}&end=${endDate}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "inventory_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };
  const getStockMovementsReport = async () => {
    try {
      const res = await instance.get(
        `/reports/generate_report/?type=stock_movements&start=${startDate}&end=${endDate}`,
      );
      setMovementsData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      setLoading(true);
      // Fetch both reports in parallel
      Promise.all([getInvertoryReport(), getStockMovementsReport()]).finally(
        () => setLoading(false),
      );
    }
  }, [startDate, endDate]);

  if (loading || !inventoryData || !movementsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--theme-primary)]"></div>
      </div>
    );
  }

  const { total_items } = inventoryData;
  const {
    total_movements,
    total_purchase_cost,
    by_type,
    purchase_history = [],
    supplier_history = [],
    purchase_costs = [],
  } = movementsData;

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold theme-text-primary">
            {t("inventory_manager.reports.inventory_report", {
              defaultValue: "Inventory Report",
            })}
          </h2>
          <p className="text-sm theme-text-muted">
            {t("inventory_manager.reports.report_subtitle", {
              defaultValue: "Stock status and movement analysis",
            })}
          </p>
        </div>

        <button
          onClick={handleGeneratePDF}
          className="theme-btn theme-btn-danger w-full px-4 py-2 sm:w-auto"
        >
          <Download className="w-4 h-4" />
          {t("inventory_manager.reports.generate_pdf", {
            defaultValue: "Generate PDF",
          })}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title={t("inventory_manager.reports.total_inventory_items", {
            defaultValue: "Total Inventory Items",
          })}
          value={total_items}
          icon={<Package className="w-6 h-6 text-indigo-600" />}
          bgColor="bg-indigo-50"
          textColor="text-indigo-600"
        />
        <StatCard
          title={t("inventory_manager.nav.low_stock_alerts", {
            defaultValue: "Low Stock Alerts",
          })}
          value={low_stock_items}
          icon={<AlertTriangle className="w-6 h-6 text-amber-600" />}
          bgColor="bg-amber-50"
          textColor="text-amber-600"
          isAlert={low_stock_items > 0}
        />
        <StatCard
          title={t("inventory_manager.reports.total_movements", {
            defaultValue: "Total Movements",
          })}
          value={total_movements}
          icon={<Activity className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
          subtitle={t("inventory_manager.reports.transactions_this_period", {
            defaultValue: "Transactions this period",
          })}
        />
        <StatCard
          title={t("inventory_manager.reports.purchase_value", {
            defaultValue: "Purchase Value",
          })}
          value={formatCurrency(total_purchase_cost || 0)}
          icon={<ShoppingCart className="w-6 h-6 text-emerald-600" />}
          bgColor="bg-emerald-50"
          textColor="text-emerald-600"
          subtitle={t("inventory_manager.reports.inventory_acquired", {
            defaultValue: "Inventory acquired",
          })}
        />
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 xl:gap-6">
        {/* Stock Movements Chart (Left Side - 3 cols) */}
        <div className="theme-card p-4 sm:p-6 lg:col-span-3">
          <h3 className="mb-4 text-lg font-semibold theme-text-primary">
            {t("inventory_manager.reports.movement_breakdown", {
              defaultValue: "Movement Breakdown",
            })}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={by_type}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="var(--theme-chart-1)"
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="movement_type"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${t(`inventory_manager.types.${name}`, {
                      defaultValue: name,
                    })} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {by_type.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={MOVEMENT_COLORS[entry.movement_type] || "var(--theme-border-strong)"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    t(`inventory_manager.types.${name}`, { defaultValue: name }),
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    t(`inventory_manager.types.${value}`, { defaultValue: value })
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Movement Type Legend List */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-2">
            {by_type.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg p-2 theme-muted"
              >
                <div className="flex items-center gap-2">
                  <MovementIcon type={item.movement_type} />
                  <span className="text-sm capitalize theme-text-secondary">
                    {t(`inventory_manager.types.${item.movement_type}`, {
                      defaultValue: item.movement_type,
                    })}
                  </span>
                </div>
                <span className="font-bold theme-text-primary">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock List (Right Side - 2 cols) */}
        <div className="theme-card p-4 sm:p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <List className="h-5 w-5 theme-text-muted" />
            <h3 className="text-lg font-semibold theme-text-primary">
              {t("inventory_manager.low_stock.title", {
                defaultValue: "Low Stock Items",
              })}
            </h3>
          </div>

          {low_stock_items > 0 ? (
            <ul className="divide-y divide-gray-100">
              {low_stock_list.map((item, idx) => (
                <li
                  key={idx}
                  className="py-3 flex justify-between items-center text-sm"
                >
                  <div>
                    <p className="font-medium theme-text-primary">{item.name}</p>
                    <p className="text-xs theme-text-muted">
                      {t("inventory_manager.reports.current_stock", {
                        defaultValue: "Current: {{stock}}",
                        stock: item.current_stock,
                      })}
                    </p>
                  </div>
                  <span className="rounded-full px-2 py-1 text-xs font-medium theme-badge-danger">
                    {t("inventory_manager.common.low", { defaultValue: "Low" })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <div className="mb-3 rounded-full p-4 theme-badge-success">
                <CheckCircle className="h-8 w-8" />
              </div>
              <p className="font-medium theme-text-secondary">
                {t("inventory_manager.reports.all_stock_levels_good", {
                  defaultValue: "All Stock Levels Good",
                })}
              </p>
              <p className="mt-1 text-sm theme-text-muted">
                {t("inventory_manager.reports.no_items_below_threshold", {
                  defaultValue: "No items are currently below the threshold.",
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
        <ReportTable
          title={t("inventory_manager.reports.purchase_cost_intelligence", {
            defaultValue: "Purchase Cost Intelligence",
          })}
          empty={t("inventory_manager.reports.no_purchase_cost_data", {
            defaultValue: "No purchase cost data in this period.",
          })}
          headers={[
            t("inventory_manager.ingredients.ingredient", { defaultValue: "Ingredient" }),
            t("inventory_manager.reports.avg_cost", { defaultValue: "Avg Cost" }),
            t("inventory_manager.reports.last_price", { defaultValue: "Last Price" }),
            t("inventory_manager.reports.last_supplier", { defaultValue: "Last Supplier" }),
            t("inventory_manager.reports.value", { defaultValue: "Value" }),
          ]}
          rows={purchase_costs.map((item) => [
            `${item.ingredient} (${item.unit})`,
            formatCurrency(item.average_purchase_cost),
            formatCurrency(item.last_purchase_price),
            item.last_supplier,
            formatCurrency(item.purchase_value),
          ])}
        />
        <ReportTable
          title={t("inventory_manager.reports.supplier_history", {
            defaultValue: "Supplier History",
          })}
          empty={t("inventory_manager.reports.no_supplier_history", {
            defaultValue: "No supplier purchase history in this period.",
          })}
          headers={[
            t("inventory_manager.common.supplier", { defaultValue: "Supplier" }),
            t("inventory_manager.reports.invoices", { defaultValue: "Invoices" }),
            t("inventory_manager.reports.lines", { defaultValue: "Lines" }),
            t("inventory_manager.common.qty", { defaultValue: "Qty" }),
            t("inventory_manager.reports.value", { defaultValue: "Value" }),
          ]}
          rows={supplier_history.map((item) => [
            item.supplier,
            item.invoice_count,
            item.line_count,
            Number(item.quantity || 0).toLocaleString(),
            formatCurrency(item.purchase_value),
          ])}
        />
      </div>

      <ReportTable
        title={t("inventory_manager.ingredients.purchase_history", {
          defaultValue: "Purchase History",
        })}
        empty={t("inventory_manager.reports.no_purchases", {
          defaultValue: "No purchases in this period.",
        })}
        headers={[
          t("inventory_manager.common.date", { defaultValue: "Date" }),
          t("inventory_manager.common.invoice", { defaultValue: "Invoice" }),
          t("inventory_manager.common.supplier", { defaultValue: "Supplier" }),
          t("inventory_manager.ingredients.ingredient", { defaultValue: "Ingredient" }),
          t("inventory_manager.common.qty", { defaultValue: "Qty" }),
          t("inventory_manager.reports.unit_price", { defaultValue: "Unit Price" }),
          t("inventory_manager.common.total", { defaultValue: "Total" }),
        ]}
        rows={purchase_history.map((item) => [
          item.purchase_date,
          item.invoice_number,
          item.supplier,
          `${item.ingredient} (${item.unit})`,
          Number(item.quantity || 0).toLocaleString(),
          formatCurrency(item.unit_price),
          formatCurrency(item.total_price),
        ])}
      />
    </div>
  );
}

// --- Sub Components ---

function StatCard({
  title,
  value,
  icon,
  bgColor,
  textColor,
  subtitle,
  isAlert,
}) {
  return (
    <div className="theme-kpi-card flex items-start justify-between p-5">
      <div>
        <p className="text-sm font-medium theme-text-muted">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
        {subtitle && <p className="mt-1 text-xs theme-text-muted">{subtitle}</p>}
      </div>
      <div
        className={`p-3 rounded-lg ${bgColor} ${isAlert ? "animate-pulse" : ""}`}
      >
        {icon}
      </div>
    </div>
  );
}

function ReportTable({ title, headers, rows, empty }) {
  return (
    <div className="theme-card p-4 sm:p-6">
      <h3 className="mb-4 text-lg font-semibold theme-text-primary">{title}</h3>
      <div className="space-y-3 md:hidden">
        {rows.length ? (
          rows.map((row, rowIndex) => (
            <article
              key={rowIndex}
              className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4"
            >
              <div className="border-b border-[var(--theme-border)] pb-3 text-sm font-semibold theme-text-primary">
                {row[0]}
              </div>
              <div className="mt-3 grid gap-2">
                {row.slice(1).map((cell, cellIndex) => (
                  <div
                    key={`${rowIndex}-${cellIndex}`}
                    className="flex items-start justify-between gap-3 rounded-lg theme-muted px-3 py-2 text-sm"
                  >
                    <span className="text-xs font-semibold uppercase theme-text-muted">
                      {headers[cellIndex + 1]}
                    </span>
                    <span className="min-w-0 break-words text-right font-medium theme-text-secondary">
                      {cell}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="py-6 text-center text-sm theme-text-muted">{empty}</div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b theme-text-muted">
              {headers.map((header) => (
                <th key={header} className="pb-3 pr-4 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="theme-text-secondary">
            {rows.length ? (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-50">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="py-3 pr-4">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-6 text-center theme-text-muted" colSpan={headers.length}>
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MovementIcon({ type }) {
  const props = { className: "w-4 h-4" };
  switch (type) {
    case "purchase":
      return (
        <ShoppingCart {...props} style={{ color: MOVEMENT_COLORS.purchase }} />
      );
    case "order":
      return (
        <TrendingDown {...props} style={{ color: MOVEMENT_COLORS.order }} />
      );
    case "waste":
      return (
        <AlertTriangle {...props} style={{ color: MOVEMENT_COLORS.waste }} />
      );
    case "adjustment":
      return (
        <Settings2 {...props} style={{ color: MOVEMENT_COLORS.adjustment }} />
      );
    default:
      return <Package {...props} />;
  }
}
