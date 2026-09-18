import React from "react";
import { CreditCard, ReceiptText } from "lucide-react";
import StatCard from "../../shared/erp/components/StatCard";
import { money } from "../../shared/erp/formatters";
import ContractorInvoiceTable from "../components/ContractorInvoiceTable";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ContractorPayables({ invoices, summary, onOpen, onPayment }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        <StatCard label={autoT("legacy.outstanding_balance_bb9bc5a8")} value={money(summary?.outstanding_balance)} icon={CreditCard} tone="rose" />
        <StatCard label={autoT("legacy.open_invoices_15b94544")} value={invoices.length} icon={ReceiptText} tone="amber" />
      </div>
      <ContractorInvoiceTable invoices={invoices} onOpen={onOpen} onPayment={onPayment} />
    </div>
  );
}
