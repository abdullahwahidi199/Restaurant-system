import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import Panel from "../../shared/erp/components/Panel";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import AdvanceTable from "../components/AdvanceTable";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function SalaryAdvances({
  advances,
  staffOptions,
  search,
  onSearch,
  onAdd,
  basePath = "/admin/dashboard",
}) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="salary-advances-page min-w-0 space-y-3 sm:space-y-4">
      <Toolbar compactMobile>
        <SearchBox value={search} onChange={onSearch} placeholder={autoT("legacy.search_employee_reason_or_notes_505c1a10")} />
        <button type="button" onClick={onAdd} className="theme-btn theme-btn-primary h-[38px] w-full px-4 md:w-auto">
          <Plus className="h-4 w-4" />
          {autoT("legacy.add_advance_deb7a811")}
        </button>
      </Toolbar>
      <div className="grid min-w-0 gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <AdvanceTable advances={advances} />
        <Panel title={autoT("legacy.payroll_employees_dddb7dbf")}>
          <div className="space-y-2">
            {staffOptions.slice(0, 8).map((employee) => (
              <Link key={employee.value} to={`${basePath}/payroll/employees/${employee.value}`} className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50 sm:p-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{employee.label}</p>
                  <p className="truncate text-xs capitalize text-slate-500">{employee.role} - {employee.salary_type}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 flex-none text-slate-400" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
