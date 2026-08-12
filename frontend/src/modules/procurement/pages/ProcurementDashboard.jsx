import React from "react";
import { CreditCard, ReceiptText, ShoppingCart, TrendingUp, Users, Wallet } from "lucide-react";
import MiniBarChart from "../../shared/erp/components/MiniBarChart";
import Panel from "../../shared/erp/components/Panel";
import StatCard from "../../shared/erp/components/StatCard";
import Timeline from "../../shared/erp/components/Timeline";
import { money } from "../../shared/erp/formatters";
import PurchaseInvoiceTable from "../components/PurchaseInvoiceTable";

export default function ProcurementDashboard({
  basePath = "/admin/dashboard",
  stats,
  invoices,
  payments,
  onOpenInvoice,
  onOpenSupplier,
  onPayment,
}) {
  const purchaseRows = stats.trendRows.map(([label, value]) => ({
    label,
    value,
    tone: "blue",
  }));
  const supplierRows = stats.topSuppliers.map((supplier) => ({
    label: supplier.name,
    value: supplier.total_purchases,
    tone: "green",
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Purchases" value={money(stats.purchasesThisMonth)} icon={ShoppingCart} tone="blue" hint="Current month" trend="up" trendLabel="Live" />
        <StatCard label="Pending Invoices" value={stats.unpaidInvoices.length} icon={ReceiptText} tone="orange" trend="flat" trendLabel="Queue" />
        <StatCard label="Supplier Balance" value={money(stats.outstandingSupplierPayables)} icon={CreditCard} tone="rose" trend="down" trendLabel="Due" />
        <StatCard label="Today's Purchases" value={money(stats.totalPurchasesToday)} icon={TrendingUp} tone="purple" trend="up" trendLabel="Today" />
        <StatCard label="Payments Made" value={money(stats.paymentsMade)} icon={Wallet} tone="green" trend="up" trendLabel="Posted" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel title="Recent Purchase Invoices" to={`${basePath}/procurement/purchase-invoices`}>
            <PurchaseInvoiceTable
              invoices={invoices.slice(0, 6)}
              onOpen={onOpenInvoice}
              onPayment={onPayment}
              compact
            />
          </Panel>
        </div>
        <Panel title="Top Suppliers" to={`${basePath}/procurement/suppliers`}>
          <div className="space-y-2">
            {stats.topSuppliers.length ? (
              stats.topSuppliers.map((supplier) => (
                <button
                  key={supplier.id}
                  type="button"
                  onClick={() => onOpenSupplier(supplier)}
                  className="w-full rounded-lg border border-slate-100 p-3 text-left transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-950">{supplier.name}</span>
                    <Users className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <span>Purchased {money(supplier.total_purchases)}</span>
                    <span>Balance {money(supplier.outstanding_balance)}</span>
                  </div>
                </button>
              ))
            ) : (
              <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">No suppliers yet.</p>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Upcoming Supplier Payments" to={`${basePath}/procurement/payables`}>
          <div className="space-y-2">
            {stats.unpaidInvoices.slice(0, 6).map((invoice) => (
              <button
                key={invoice.id}
                type="button"
                onClick={() => onOpenInvoice(invoice)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 text-left transition hover:bg-slate-50"
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {invoice.invoice_number || `PINV-${invoice.id}`}
                  </p>
                  <p className="text-xs text-slate-500">{invoice.supplier_name || "Cash / No Supplier"}</p>
                </div>
                <p className="font-semibold text-rose-700">{money(invoice.remaining_balance)}</p>
              </button>
            ))}
            {!stats.unpaidInvoices.length && (
              <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">No unpaid invoices.</p>
            )}
          </div>
        </Panel>
        <Panel title="Monthly Purchasing" description="Recent purchase volume by invoice date.">
          <MiniBarChart rows={purchaseRows} tone="blue" empty="No purchase trend data yet." />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Spend By Supplier" description="Top suppliers by purchased value.">
          <MiniBarChart rows={supplierRows} tone="green" empty="No supplier spend data yet." />
        </Panel>
        <Panel title="Recent Payment Activity" to={`${basePath}/procurement/supplier-payments`}>
          <Timeline items={payments.slice(0, 5)} empty="No supplier payments recorded yet." />
        </Panel>
      </div>
    </div>
  );
}
