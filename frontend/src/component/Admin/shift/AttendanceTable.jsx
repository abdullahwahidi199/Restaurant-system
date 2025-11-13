import { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import { Check, X } from "lucide-react";

export default function AttendanceTable() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [uniqueStaff, setUniqueStaff] = useState([]);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterShift, setFilterShift] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await instance.get("/users/attendance/recent/");
        const data = res.data;
        setAttendanceData(data);
        processData(data);
      } catch (err) {
        console.error("Failed to fetch attendance", err);
      }
    };
    fetchAttendance();
  }, []);

  // Generate all dates of the current month
  const getMonthDates = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate(); // last day of month
    const dates = [];
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day);
      // format as YYYY-MM-DD to match your API data
      const formatted = date.toISOString().split("T")[0];
      dates.push(formatted);
    }
    return dates;
  };

  const processData = (data) => {
    const staffList = [...new Map(data.map((a) => [a.staff.id, a.staff])).values()];
    setUniqueStaff(staffList);

    // Use all dates of the month instead of only those in data
    setUniqueDates(getMonthDates());
    setFilteredData(data);
  };

  const handleFilter = () => {
    let filtered = attendanceData;
    if (filterName)
      filtered = filtered.filter((a) =>
        a.staff.name.toLowerCase().includes(filterName.toLowerCase())
      );
    if (filterShift)
      filtered = filtered.filter(
        (a) => a.shift && a.shift.shift_type.toLowerCase().includes(filterShift.toLowerCase())
      );
    processData(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [filterName, filterShift]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Monthly Attendance</h2>

      <div className="flex flex-wrap gap-4 mb-5">
        <input
          type="text"
          placeholder="Filter by staff name..."
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="border p-2 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <input
          type="text"
          placeholder="Filter by shift..."
          value={filterShift}
          onChange={(e) => setFilterShift(e.target.value)}
          className="border p-2 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border px-0 py-0 bg-gray-100 text-left">Staff Name</th>
            {uniqueDates.map((date) => (
              <th key={date} className="border px-0 py-0 bg-gray-100 text-center">
                {new Date(date).getDate()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {uniqueStaff.map((staff) => (
            <tr key={staff.id}>
              <td className="border px-3 py-1 font-medium text-gray-700">{staff.name}</td>
              {uniqueDates.map((date) => {
                const record = filteredData.find(
                  (a) => a.staff.id === staff.id && a.date === date
                );
                const status = record ? record.status : null;
                return (
                  <td key={date} className="border px-0 py-0 text-center">
                    {status === "Present" ? (
                      <Check className="text-green-800 inline w-4 h-4" />
                    ) : status === "Absent" ? (
                      <X className="text-red-800 inline w-4 h-4" />
                    ) : status === "Leave" ? (
                      <span className="text-yellow-800 font-bold w-4 h-4">L</span>
                    ) : (
                      "-"
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
