import { Clock, Calendar, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import instance from "../../../api/axiosInstance";
export default function ShiftList({ shifts, onShiftDelete }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";
  const BASE_URL = import.meta.env.VITE_API_URL;
  if (!shifts.length)
    return <div className="text-center text-gray-500">{t("no_shifts")}</div>;

  function formatTime(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(":");
    const date = new Date();
    date.setHours(hours, minutes, seconds);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const handleShiftDelete = async (id) => {
    onShiftDelete(id);
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {shifts.map((shift) => (
        <div
          key={shift.id}
          className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">
                {shift.shift_type} {t("shift")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">
                {formatTime(shift.start_time)} → {formatTime(shift.end_time)}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border">
            <div className="flex items-center gap-2 mb-3 text-gray-700">
              <Users className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-gray-800">
                {t("assigned_staff")}
              </h3>
            </div>
            {shift.staff.length > 0 ? (
              <ul className="space-y-3">
                {shift.staff.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm"
                  >
                    <img
                      src={`${BASE_URL}${member.image}`}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{member.name}</p>
                      <p className="text-sm text-gray-500">
                        {member.custom_role || member.role}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">{t("no_staff")}</p>
            )}
            <button onClick={() => handleShiftDelete(shift.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
