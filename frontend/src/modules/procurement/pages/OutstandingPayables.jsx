import React from "react";
import { CreditCard, ReceiptText, Users } from "lucide-react";
import Panel from "../../shared/erp/components/Panel";
import StatCard from "../../shared/erp/components/StatCard";
import { money } from "../../shared/erp/formatters";
import PurchaseInvoiceTable from "../components/PurchaseInvoiceTable";

export default function OutstandingPayables({
  suppliers,
  invoices,
  stats,
  onOpenInvoice,
  onPayment,
  onOpenSupplier,
}) {
  const suppliersWithBalance = suppliers
    .filter((supplier) => Number(supplier.outstanding_balance || 0) > 0)
    .sort((a, b) => Number(b.outstanding_balance || 0) - Number(a.outstanding_balance || 0));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="Outstanding Balance" value={money(stats.outstandingSupplierPayables)} icon={CreditCard} tone="rose" />
        <StatCard label="Unpaid Invoices" value={invoices.length} icon={ReceiptText} tone="amber" />
        <StatCard label="Suppliers With Balance" value={suppliersWithBalance.length} icon={Users} />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Supplier Balances">
          <div className="space-y-2">
            {suppliersWithBalance.length ? (
              suppliersWithBalance.map((supplier) => (
                <button
                  key={supplier.id}
                  type="button"
                  onClick={() => onOpenSupplier(supplier)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 text-left transition hover:bg-slate-50"
                >
                  <span className="font-semibold text-slate-950">{supplier.name}</span>
                  <span className="font-semibold text-rose-700">{money(supplier.outstanding_balance)}</span>
                </button>
              ))
            ) : (
              <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">No supplier balances due.</p>
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
