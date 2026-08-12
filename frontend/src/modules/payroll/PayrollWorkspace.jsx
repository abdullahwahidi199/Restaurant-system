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

export default function PayrollWorkspace({
  initialView = "dashboard",
  fixedView = false,
  openPayrollId,
  openStaffId,
}) {
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
    if (model.loading) return <LoadingState label="Loading payroll workspace..." />;
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

  return (
    <section className="space-y-5 px-4 pb-6 lg:px-5">
      <PageHeader
        eyebrow="Pakhlai Payroll"
        breadcrumb={isFinance ? "Finance / Payroll" : "Admin / Finance / Payroll"}
        icon={Wallet}
        title={pageMeta.title}
        description={pageMeta.description}
        quickStats={[
          { label: "This Month", value: money(model.dashboard?.payroll_cost_this_month) },
          { label: "Outstanding", value: money(model.dashboard?.outstanding_salaries) },
        ]}
        tabs={tabs}
        activeTab={model.activeTab}
        actions={
          <>
            <Link to={`${basePath}/payroll/run`} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              <FilePlus2 className="h-4 w-4" />
              Run Payroll
            </Link>
            <ActionButton icon={Plus} onClick={() => model.setShowAdvanceDialog(true)}>
              Advance
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
