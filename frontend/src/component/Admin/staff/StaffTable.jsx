import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Edit3, Trash2, Wallet } from "lucide-react";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "AFN",
});

const actionButtonBase =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition active:scale-95";

const StaffTable = ({ staff, editStaff, deleteStaff }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table
        className={`min-w-[980px] w-full border-collapse text-sm ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-4 py-3 font-semibold">
              {t("staff.table.name")}
            </th>
            <th className="px-4 py-3 font-semibold">
              {t("staff.table.role")}
            </th>
            <th className="px-4 py-3 font-semibold">
              {t("staff.table.email")}
            </th>
            <th className="px-4 py-3 font-semibold">
              {t("staff.table.phone")}
            </th>
            <th className="px-4 py-3 font-semibold">
              {t("staff.table.shift")}
            </th>
            <th className="px-4 py-3 font-semibold">
              Salary
            </th>
            <th className="px-4 py-3 font-semibold">
              {t("staff.table.status")}
            </th>
            <th
              className={`px-4 py-3 font-semibold ${
                isRTL ? "text-left" : "text-right"
              }`}
            >
              {t("staff.table.actions")}
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {staff.length > 0 ? (
            staff.map((s, index) => (
              <tr
                key={s.id}
                className={`transition-colors ${
                  s.status === "Inactive"
                    ? "bg-slate-100 text-slate-500"
                    : index % 2 === 0
                      ? "bg-white hover:bg-slate-50"
                      : "bg-slate-50/70 hover:bg-slate-100"
                }`}
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  <span
                    className={
                      s.status === "Inactive" ? "line-through text-slate-500" : ""
                    }
                  >
                    {s.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {s.role === "Other" ? s.custom_role : s.role}
                </td>
                <td className="px-4 py-3 text-slate-600">{s.email}</td>
                <td className="px-4 py-3 text-slate-600">{s.phone}</td>
                <td className="px-4 py-3 text-slate-600">
                  {s.shift_name || "_"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <div className="font-semibold text-slate-900">
                    {currency.format(Number(s.payroll_base_salary || 0))}
                  </div>
                  <div className="text-xs capitalize text-slate-500">
                    {s.salary_type || "monthly"}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      s.status === "Inactive"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {s.status === "Inactive" ? "Inactive" : "Active"}
                  </span>
                </td>
                <td className={`px-4 py-3 ${isRTL ? "text-left" : "text-right"}`}>
                  <div
                    className={`flex items-center gap-1.5 whitespace-nowrap ${
                      isRTL ? "justify-start" : "justify-end"
                    }`}
                  >
                    <Link
                      to={`/admin/dashboard/payroll/employees/${s.id}`}
                      aria-label={`Open payroll profile for ${s.name}`}
                      title={`Payroll profile: ${s.name}`}
                      className={`${actionButtonBase} border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100`}
                    >
                      <Wallet className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => editStaff(s)}
                      aria-label={`Edit ${s.name}`}
                      title={`Edit ${s.name}`}
                      className={`${actionButtonBase} border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteStaff(s.id)}
                      aria-label={`Delete ${s.name}`}
                      title={`Delete ${s.name}`}
                      className={`${actionButtonBase} border-red-100 bg-red-50 text-red-700 hover:bg-red-100`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={8}
                className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 italic"
              >
                {t("staff.search.no_staff")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StaffTable;
