import React from "react";
import { CreditCard, ReceiptText } from "lucide-react";
import StatCard from "../../shared/erp/components/StatCard";
import { money } from "../../shared/erp/formatters";
import ContractorInvoiceTable from "../components/ContractorInvoiceTable";

export default function ContractorPayables({ invoices, summary, onOpen, onPayment }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        <StatCard label="Outstanding Balance" value={money(summary?.outstanding_balance)} icon={CreditCard} tone="rose" />
        <StatCard label="Open Invoices" value={invoices.length} icon={ReceiptText} tone="amber" />
      </div>
      <ContractorInvoiceTable invoices={invoices} onOpen={onOpen} onPayment={onPayment} />
    </div>
  );
}
