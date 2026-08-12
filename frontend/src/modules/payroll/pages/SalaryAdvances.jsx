import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import Panel from "../../shared/erp/components/Panel";
import SearchBox from "../../shared/erp/components/SearchBox";
import Toolbar from "../../shared/erp/components/Toolbar";
import AdvanceTable from "../components/AdvanceTable";

export default function SalaryAdvances({
  advances,
  staffOptions,
  search,
  onSearch,
  onAdd,
  basePath = "/admin/dashboard",
}) {
  return (
    <div className="space-y-4">
      <Toolbar>
        <SearchBox value={search} onChange={onSearch} placeholder="Search employee, reason, or notes" />
        <button type="button" onClick={onAdd} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          Add Advance
        </button>
      </Toolbar>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <AdvanceTable advances={advances} />
        <Panel title="Payroll Employees">
          <div className="space-y-2">
            {staffOptions.slice(0, 8).map((employee) => (
              <Link key={employee.value} to={`${basePath}/payroll/employees/${employee.value}`} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-950">{employee.label}</p>
                  <p className="text-xs capitalize text-slate-500">{employee.role} - {employee.salary_type}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
