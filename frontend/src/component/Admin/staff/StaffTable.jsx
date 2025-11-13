import React from "react";

const StaffTable = ({ staff, editStaff, deleteStaff }) => {
  console.log(staff)
  return (
    <div className="overflow-x-auto bg-white  shadow-xl rounded-2xl border border-gray-100">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gradient-to-r from-gray-200 to-gray-400  ">
          <tr>
            <th className="px-6 py-4 font-semibold text-gray-700  uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700  uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700  uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700  uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700  uppercase tracking-wider">
              Shift
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700  uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-right font-semibold text-gray-700  uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

       
        <tbody className="divide-y divide-gray-200 ">
          {staff.length > 0 ? (
            staff.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-gray-50  transition-colors duration-200"
              >
                <td className="px-6 py-4 font-medium text-gray-800 ">
                  {s.name}
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
                  {s.status}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => editStaff(s)}
                    aria-label={`Edit ${s.name}`}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium shadow hover:bg-blue-600 active:scale-95 transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteStaff(s.id)}
                    aria-label={`Delete ${s.name}`}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium shadow hover:bg-red-600 active:scale-95 transition"
                  >
                    🗑️ Delete
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
                No staff found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StaffTable;
