import React from "react";
import { CreditCard, ReceiptText, ShoppingCart, TrendingUp, Users, Wallet } from "lucide-react";
import MiniBarChart from "../../shared/erp/components/MiniBarChart";
import Panel from "../../shared/erp/components/Panel";
import StatCard from "../../shared/erp/components/StatCard";
import Timeline from "../../shared/erp/components/Timeline";
import { money } from "../../shared/erp/formatters";
import PurchaseInvoiceTable from "../components/PurchaseInvoiceTable";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ProcurementDashboard({
  basePath = "/admin/dashboard",
  stats,
  invoices,
  payments,
  onOpenInvoice,
  onOpenSupplier,
  onPayment,
}) {
                 const { t: autoT } = useAutoTranslation();
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
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label={autoT("legacy.total_purchases_6231e5c8")} value={money(stats.purchasesThisMonth)} icon={ShoppingCart} tone="blue" hint={autoT("legacy.current_month_76f0b10a")} trend="up" trendLabel={autoT("landing.mockups.live")} />
        <StatCard label={autoT("legacy.pending_invoices_87ee4485")} value={stats.unpaidInvoices.length} icon={ReceiptText} tone="orange" trend="flat" trendLabel={autoT("landing.mockups.orders.panels.queue")} />
        <StatCard label={autoT("legacy.supplier_balance_227b5ea1")} value={money(stats.outstandingSupplierPayables)} icon={CreditCard} tone="rose" trend="down" trendLabel={autoT("legacy.due_145caf29")} />
        <StatCard label={autoT("legacy.today_s_purchases_95528d0b")} value={money(stats.totalPurchasesToday)} icon={TrendingUp} tone="purple" trend="up" trendLabel={autoT("dashboard.best_selling.today")} />
        <StatCard label={autoT("legacy.payments_made_c1fe8ee2")} value={money(stats.paymentsMade)} icon={Wallet} tone="green" trend="up" trendLabel={autoT("legacy.posted_301777ff")} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel title={autoT("legacy.recent_purchase_invoices_88eb49f0")} to={`${basePath}/procurement/purchase-invoices`}>
            <PurchaseInvoiceTable
              invoices={invoices.slice(0, 6)}
              onOpen={onOpenInvoice}
              onPayment={onPayment}
              compact
            />
          </Panel>
        </div>
        <Panel title={autoT("legacy.top_suppliers_128b962d")} to={`${basePath}/procurement/suppliers`}>
          <div className="divide-y divide-[var(--theme-border)]">
            {stats.topSuppliers.length ? (
              stats.topSuppliers.map((supplier) => (
                <button
                  key={supplier.id}
                  type="button"
                  onClick={() => onOpenSupplier(supplier)}
                  className="min-h-[54px] w-full py-2.5 text-left transition hover:bg-[var(--theme-hover)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold theme-text-primary">{supplier.name}</span>
                    <Users className="h-4 w-4 theme-text-muted" />
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-[11px] tabular-nums theme-text-muted">
                    <span>{autoT("legacy.purchased_8b70c504")} {money(supplier.total_purchases)}</span>
                    <span>{autoT("legacy.balance_90eef613")} {money(supplier.outstanding_balance)}</span>
                  </div>
                </button>
              ))
            ) : (
              <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">{autoT("legacy.no_suppliers_yet_834e5743")}</p>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title={autoT("legacy.upcoming_supplier_payments_d52d1a4d")} to={`${basePath}/procurement/payables`}>
          <div className="divide-y divide-[var(--theme-border)]">
            {stats.unpaidInvoices.slice(0, 6).map((invoice) => (
              <button
                key={invoice.id}
                type="button"
                onClick={() => onOpenInvoice(invoice)}
                className="flex min-h-[52px] w-full items-center justify-between gap-3 py-2.5 text-left transition hover:bg-[var(--theme-hover)]"
              >
                <div>
                  <p className="text-[13px] font-semibold theme-text-primary">
                    {invoice.invoice_number || `PINV-${invoice.id}`}
                  </p>
                  <p className="text-[11px] theme-text-muted">{invoice.supplier_name || autoT("legacy.cash_no_supplier_1aacbab6")}</p>
                </div>
                <p className="text-xs font-semibold tabular-nums text-[var(--theme-danger)]">{money(invoice.remaining_balance)}</p>
              </button>
            ))}
            {!stats.unpaidInvoices.length && (
              <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">{autoT("legacy.no_unpaid_invoices_1d87ff4f")}</p>
            )}
          </div>
        </Panel>
        <Panel title={autoT("legacy.monthly_purchasing_bf7a187b")} description={autoT("legacy.recent_purchase_volume_by_invoice_date_4e8297a3")}>
          <MiniBarChart rows={purchaseRows} tone="blue" empty={autoT("legacy.no_purchase_trend_data_yet_83740366")} />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title={autoT("legacy.spend_by_supplier_c0d07e32")} description={autoT("legacy.top_suppliers_by_purchased_value_81646a6f")}>
          <MiniBarChart rows={supplierRows} tone="green" empty={autoT("legacy.no_supplier_spend_data_yet_663850d0")} />
        </Panel>
        <Panel title={autoT("legacy.recent_payment_activity_6c1ca562")} to={`${basePath}/procurement/supplier-payments`}>
          <Timeline items={payments.slice(0, 5)} empty={autoT("legacy.no_supplier_payments_recorded_yet_6c9c50c0")} />
        </Panel>
      </div>
    </div>
  );
}
