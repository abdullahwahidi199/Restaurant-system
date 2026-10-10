import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FilePlus2, Plus, Wallet } from "lucide-react";
import ActionButton from "../shared/erp/components/ActionButton";
import Alert from "../shared/erp/components/Alert";
import ConfirmModal from "../shared/erp/components/ConfirmModal";
import LoadingState from "../shared/erp/components/LoadingState";
import PageHeader from "../shared/erp/components/PageHeader";
import { money } from "../shared/erp/formatters";
import PayrollPaymentModal from "./components/PayrollPaymentModal";
import SalaryAdvanceModal from "./components/SalaryAdvanceModal";
import { payrollTabs, payrollViews } from "./constants";
import usePayrollWorkspace from "./hooks/usePayrollWorkspace";
import EmployeeSalaryProfile from "./pages/EmployeeSalaryProfile";
import PayrollDashboard from "./pages/PayrollDashboard";
import PayrollPayments from "./pages/PayrollPayments";
import PayrollRecordDetail from "./pages/PayrollRecordDetail";
import PayrollRecords from "./pages/PayrollRecords";
import PayrollRun from "./pages/PayrollRun";
import SalaryAdvances from "./pages/SalaryAdvances";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function PayrollWorkspace({
  initialView = "dashboard",
  fixedView = false,
  openPayrollId,
  openStaffId,
}) {
                 const { t: autoT } = useAutoTranslation();
  const location = useLocation();
  const isFinance = location.pathname.startsWith("/finance-manager");
  const basePath = isFinance ? "/finance-manager" : "/admin/dashboard";
  const model = usePayrollWorkspace({
    initialView,
    fixedView,
    openPayrollId,
    openStaffId,
    basePath,
  });
  const pageMeta = payrollViews[model.activeTab] || payrollViews.dashboard;
  const tabs =
    !openPayrollId && !openStaffId
      ? payrollTabs.map((tab) => ({
          ...tab,
          to: tab.to.replace(/^\/admin\/dashboard/i, basePath),
        }))
      : [];

  const content = () => {
    if (model.loading) return <LoadingState label={autoT("legacy.loading_payroll_workspace_3ac1e2ec")} />;
    if (openPayrollId) {
      return <PayrollRecordDetail payroll={model.selectedPayroll} saving={model.saving} onApprove={model.confirmApprove} onPayment={model.openPaymentDialog} basePath={basePath} />;
    }
    if (openStaffId) {
      return <EmployeeSalaryProfile history={model.employeeHistory} form={model.salaryForm} saving={model.saving} onChange={model.setSalaryForm} onSubmit={model.saveSalaryProfile} basePath={basePath} isFinance={isFinance} />;
    }
    if (model.activeTab === "run") {
      return <PayrollRun form={model.wizardForm} staffOptions={model.staffOptions} saving={model.saving} onChange={model.setWizardForm} onToggleStaff={model.toggleWizardStaff} onSubmit={model.submitWizard} />;
    }
    if (model.activeTab === "records") {
      return <PayrollRecords payrolls={model.payrolls} filters={model.recordFilters} onFilters={model.setRecordFilters} onApprove={model.confirmApprove} onPayment={model.openPaymentDialog} basePath={basePath} />;
    }
    if (model.activeTab === "advances") {
      return <SalaryAdvances advances={model.advances} staffOptions={model.staffOptions} search={model.advanceSearch} onSearch={model.setAdvanceSearch} onAdd={() => model.setShowAdvanceDialog(true)} basePath={basePath} />;
    }
    if (model.activeTab === "payments") {
      return <PayrollPayments payments={model.payments} payrolls={model.payablePayrolls} search={model.paymentSearch} onSearch={model.setPaymentSearch} onPayment={model.openPaymentDialog} />;
    }
    return <PayrollDashboard dashboard={model.dashboard} payrolls={model.payrolls} advances={model.advances} onPayment={model.openPaymentDialog} basePath={basePath} />;
  };

  const isAdvancesView = model.activeTab === "advances";

  return (
    <section className="space-y-4">
      <PageHeader
        icon={Wallet}
        title={pageMeta.title}
        description={pageMeta.description}
        quickStats={[
          { label: autoT("legacy.this_month_0f6cc3a8"), value: money(model.dashboard?.payroll_cost_this_month) },
          { label: autoT("legacy.outstanding_f8ee57ec"), value: money(model.dashboard?.outstanding_salaries) },
        ]}
        tabs={tabs}
        activeTab={model.activeTab}
        compactMobile={isAdvancesView}
        actions={
          <>
            <Link to={`${basePath}/payroll/run`} className="theme-btn theme-btn-primary h-[38px] min-w-0 flex-1 whitespace-nowrap px-3 sm:flex-none sm:px-4">
              <FilePlus2 className="h-4 w-4" />
              {autoT("legacy.run_payroll_e6657ad6")}
            </Link>
            <ActionButton className="h-[38px] min-w-0 flex-1 whitespace-nowrap px-3 sm:flex-none sm:px-4" icon={Plus} onClick={() => model.setShowAdvanceDialog(true)}>
              {autoT("legacy.advance_67e70c3c")}
            </ActionButton>
          </>
        }
      />

      {model.notice && <Alert tone="success" message={model.notice} onClose={() => model.setNotice("")} />}
      {model.error && <Alert tone="error" message={model.error} onClose={() => model.setError("")} />}
      {content()}

      {model.paymentTarget && <PayrollPaymentModal payroll={model.paymentTarget} form={model.paymentForm} saving={model.saving} onChange={model.setPaymentForm} onSubmit={model.submitPayment} onClose={() => model.setPaymentTarget(null)} />}
      {model.showAdvanceDialog && <SalaryAdvanceModal form={model.advanceForm} staffOptions={model.staffOptions} saving={model.saving} onChange={model.setAdvanceForm} onSubmit={model.submitAdvance} onClose={() => model.setShowAdvanceDialog(false)} />}
      {model.confirmDialog && <ConfirmModal title={model.confirmDialog.title} message={model.confirmDialog.message} confirmLabel={model.confirmDialog.actionLabel} saving={model.saving} onClose={() => model.setConfirmDialog(null)} onConfirm={model.confirmDialog.action} />}
    </section>
  );
}

export function PayrollDashboardPage() {
  return <PayrollWorkspace initialView="dashboard" />;
}

export function PayrollRunPage() {
  return <PayrollWorkspace initialView="run" fixedView />;
}

export function PayrollRecordsPage() {
  return <PayrollWorkspace initialView="records" fixedView />;
}

export function PayrollRecordDetailPage() {
  const { id } = useParams();
  return <PayrollWorkspace initialView="records" fixedView openPayrollId={id} />;
}

export function PayrollAdvancesPage() {
  return <PayrollWorkspace initialView="advances" fixedView />;
}

export function PayrollPaymentsPage() {
  return <PayrollWorkspace initialView="payments" fixedView />;
}

export function EmployeeSalaryProfilePage() {
  const { id } = useParams();
  return <PayrollWorkspace initialView="employee" fixedView openStaffId={id} />;
}
