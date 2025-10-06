import React from "react";

const StaffTable = ({ staff, editStaff, deleteStaff }) => {
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-900 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
      <table className="min-w-full text-sm text-left">
        {/* Table Head */}
        <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700">
          <tr>
            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-right font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {staff.length > 0 ? (
            staff.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">
                  {s.name}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                  {s.role}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                  {s.email}
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
