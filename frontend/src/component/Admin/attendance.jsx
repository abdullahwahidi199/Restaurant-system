import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../api/authforRBC";
import instance from "../../api/axiosInstance";
import RestrictedToast from "../RistrictedAction";
import { useTranslation } from "react-i18next";

export default function Attendance() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";
  const { auth } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;
  const today = new Date().toISOString().slice(0, 10);

  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showRestriction, setShowRestriction] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState(null);

  const getShifts = async () => {
    try {
      const res = await instance.get("/users/shift/");
      setShifts(res.data);
      if (res.data.length > 0 && !selectedShiftId)
        setSelectedShiftId(res.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const getStaffAndAttendance = async () => {
    if (!selectedShiftId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const resStaff = await instance.get(`/users/shift/${selectedShiftId}/`);
      const staffData = resStaff.data.staff || [];

      const resAttendance = await instance.get("/users/attendance/recent/");

      const existingAttendance = resAttendance.data.filter(
        (a) => a.shift?.id === selectedShiftId && a.date === today,
      );

      const attendanceMap = {};
      existingAttendance.forEach((a) => {
        attendanceMap[a.staff.id] = a.status;
      });

      setStaff(staffData);
      setAttendance(attendanceMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getShifts();
  }, []);

  useEffect(() => {
    getStaffAndAttendance();
  }, [selectedShiftId]);

  const handleStatusChange = (staffId, status) => {
    setAttendance((prev) => ({ ...prev, [staffId]: status }));
  };

  const handleSave = async () => {
    if (isDemo) {
      setShowRestriction(true);
      return;
    }
    const payload = {
      date: today,
      attendance: staff.map((s) => ({
        staff_id: s.id,
        shift_id: selectedShiftId,
        status: attendance[s.id] || "Present",
      })),
    };

    try {
      const res = await instance.post(
        `/users/attendance/mark/${selectedShiftId}/`,
        payload,
      );
      if (res.status === 200 || res.status === 201) {
        setMessage(t("attendance.saved"));
      } else {
        setMessage(t("attendance.failed"));
      }
    } catch (err) {
      console.error(err);
      setMessage(t("attendance.failed"));
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div
      className={`p-6 space-y-8 bg-gray-50 min-h-screen ${
        isRTL ? "text-right" : "text-left"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <h1 className="text-2xl font-bold text-gray-800">
        {t("attendance.title")}
      </h1>

      <div className="flex flex-wrap gap-3">
        {shifts.map((shift) => (
          <button
            key={shift.id}
            onClick={() => setSelectedShiftId(shift.id)}
            className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded shadow-md transition-all duration-200 ${selectedShiftId === shift.id ? "bg-blue-600 text-white" : "bg-gray-200 text-blue-600 border border-blue-600"}`}
          >
            {shift.shift_type}
          </button>
        ))}
      </div>

      {selectedShiftId && (
        <div className="bg-white p-6 shadow rounded-lg mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-150">
                <tr>
                  <th>{t("attendance.table.index")}</th>
                  <th>{t("attendance.table.name")}</th>
                  <th>{t("attendance.table.role")}</th>
                  <th>{t("attendance.table.status")}</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">{i + 1}</td>
                    <td className="px-4 py-2 border text-center">{s.name}</td>
                    <td className="px-4 py-2 border text-center">{s.role}</td>
                    <td className="px-4 py-2 border text-center">
                      <select
                        value={attendance[s.id] || "Present"}
                        onChange={(e) =>
                          handleStatusChange(s.id, e.target.value)
                        }
                      >
                        <option value="Present">
                          {t("attendance.status.present")}
                        </option>
                        <option value="Absent">
                          {t("attendance.status.absent")}
                        </option>
                        <option value="Leave">
                          {t("attendance.status.leave")}
                        </option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 shadow"
            >
              {t("attendance.save")}
            </button>
            {message && (
              <span className="text-sm text-blue-600">{message}</span>
            )}
          </div>
          <br />
          <hr />
        </div>
      )}
      {showRestriction && (
        <RestrictedToast onClose={() => setShowRestriction(false)} />
      )}
    </div>
  );
}
