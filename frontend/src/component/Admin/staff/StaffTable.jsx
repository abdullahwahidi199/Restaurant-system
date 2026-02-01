import React from "react";
import { useTranslation } from "react-i18next";

const StaffTable = ({ staff, editStaff, deleteStaff }) => {
  const { t,i18n } = useTranslation();
  const isRTL = i18n.language !== "en";
  console.log(staff)
  
  return (
    <div className="overflow-x-auto bg-white  shadow-xl rounded-2xl border border-gray-100">
      <table className={`min-w-full text-sm ${isRTL ? "text-right" : "text-left"}`}>
        <thead className="bg-gradient-to-r from-gray-200 to-gray-400  ">
          <tr>
            <th className="px-6 py-4 font-semibold text-gray-700  uppercase tracking-wider">
              {t("staff.table.name")}
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700  uppercase tracking-wider">
              {t("staff.table.role")}
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700  uppercase tracking-wider">
              {t("staff.table.email")}
            </th>
          <th className="px-6 py-4 font-semibold text-gray-700  uppercase tracking-wider">
              {t("staff.table.phone")}
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700  uppercase tracking-wider">
              {t("staff.table.shift")}
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700  uppercase tracking-wider">
              {t("staff.table.status")}
            </th>
            <th  className={`px-6 py-4 text-right font-semibold text-gray-700  uppercase tracking-wider ${isRTL ? "text-left" : "text-right"}`}>
              {t("staff.table.actions")}
            </th>
          </tr>
        </thead>

       
        <tbody className="divide-y divide-gray-200 ">
          {staff.length > 0 ? (
            staff.map((s) => (
              <tr
                  key={s.id}
                  className={`
                    transition-colors duration-200
                    ${s.status=="Inactive"
                      ? "bg-gray-100 opacity-60"
                      : "hover:bg-gray-50"}
                  `}
                >
                <td className="px-6 py-4 font-medium text-gray-800 ">
                  <span className={`${s.status=="Inactive"?"line-through text-gray-500" : ""}`}>
                    {s.name}
                  </span>
                  
                </td>
                <td className="px-6 py-4 text-gray-600 ">
                  {s.role === "Other" ? s.custom_role:s.role}
                </td>
                <td className="px-6 py-4 text-gray-600 ">
                  {s.email}
                </td>
                <td className="px-6 py-4 text-gray-600 ">
                  {s.phone}
                </td>
                <td className="px-6 py-4 text-gray-600 ">
                  {s.shift_name||'_'}
                </td>
                <td className="px-6 py-4 text-gray-600 ">
                  <span
                      className={`
                        px-3 py-1 rounded-full text-xs font-semibold
                        ${s.status=="Inactive"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"}
                      `}
                    >
                      {s.status=="Inactive" ? "Inactive" : "Active"}
                    </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => editStaff(s)}
                    aria-label={`Edit ${s.name}`}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium shadow hover:bg-blue-600 active:scale-95 transition"
                  >
                    ✏️ {t("staff.table.edit")}
                  </button>
                  <button
                    onClick={() => deleteStaff(s.id)}
                    aria-label={`Delete ${s.name}`}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium shadow hover:bg-red-600 active:scale-95 transition"
                  >
                    🗑️ {t("staff.table.delete")}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={4}
                className="text-center px-6 py-8 text-gray-500 dark:text-gray-400 italic"
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
