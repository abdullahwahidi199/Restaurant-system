import React from "react";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import { inputClass } from "../../shared/erp/constants";
import { money } from "../../shared/erp/formatters";
import PaymentTable from "../components/PaymentTable";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function PayrollPayments({ payments, payrolls, search, onSearch, onPayment }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="space-y-4">
      <Toolbar>
        <SearchBox value={search} onChange={onSearch} placeholder={autoT("legacy.search_employee_reference_or_notes_21962e75")} />
        <select
          onChange={(event) => {
            const payroll = payrolls.find((item) => String(item.id) === String(event.target.value));
            if (payroll) onPayment(payroll);
            event.target.value = "";
          }}
          className={inputClass}
        >
          <option value="">{autoT("legacy.record_payment_for_c52b2280")}</option>
          {payrolls.map((payroll) => <option key={payroll.id} value={payroll.id}>{payroll.staff_name} - {money(payroll.remaining_balance)}</option>)}
        </select>
      </Toolbar>
      <PaymentTable payments={payments} />
    </div>
  );
}
