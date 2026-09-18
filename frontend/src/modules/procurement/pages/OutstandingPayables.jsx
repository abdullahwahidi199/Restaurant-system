import React from "react";
import { CreditCard, ReceiptText, Users } from "lucide-react";
import Panel from "../../shared/erp/components/Panel";
import StatCard from "../../shared/erp/components/StatCard";
import { money } from "../../shared/erp/formatters";
import PurchaseInvoiceTable from "../components/PurchaseInvoiceTable";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function OutstandingPayables({
  suppliers,
  invoices,
  stats,
  onOpenInvoice,
  onPayment,
  onOpenSupplier,
}) {
                 const { t: autoT } = useAutoTranslation();
  const suppliersWithBalance = suppliers
    .filter((supplier) => Number(supplier.outstanding_balance || 0) > 0)
    .sort((a, b) => Number(b.outstanding_balance || 0) - Number(a.outstanding_balance || 0));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label={autoT("legacy.outstanding_balance_bb9bc5a8")} value={money(stats.outstandingSupplierPayables)} icon={CreditCard} tone="rose" />
        <StatCard label={autoT("legacy.unpaid_invoices_f81e6e6e")} value={invoices.length} icon={ReceiptText} tone="amber" />
        <StatCard label={autoT("legacy.suppliers_with_balance_a120e298")} value={suppliersWithBalance.length} icon={Users} />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title={autoT("legacy.supplier_balances_38694961")}>
          <div className="divide-y divide-[var(--theme-border)]">
            {suppliersWithBalance.length ? (
              suppliersWithBalance.map((supplier) => (
                <button
                  key={supplier.id}
                  type="button"
                  onClick={() => onOpenSupplier(supplier)}
                  className="flex min-h-[48px] w-full items-center justify-between gap-3 py-2.5 text-left transition hover:bg-[var(--theme-hover)]"
                >
                  <span className="text-[13px] font-semibold theme-text-primary">{supplier.name}</span>
                  <span className="text-xs font-semibold tabular-nums text-[var(--theme-danger)]">{money(supplier.outstanding_balance)}</span>
                </button>
              ))
            ) : (
              <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">{autoT("legacy.no_supplier_balances_due_2573e219")}</p>
            )}
          </div>
        </Panel>
        <div className="xl:col-span-2">
          <PurchaseInvoiceTable invoices={invoices} onOpen={onOpenInvoice} onPayment={onPayment} />
        </div>
      </div>
    </div>
  );
}
