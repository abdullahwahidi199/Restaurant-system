import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import ShiftList from "./ShiftList";
import AddShiftModal from "./addShiftModal";
import { AuthContext } from "../../../api/authforRBC";
import instance from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import AttendanceTable from "./AttendanceTable";
export default function () {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show_Add_Modal, set_show_add_modal] = useState(false);

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  const get_shifts = async () => {
    setLoading(true);
    try {
      const response = await instance.get("/users/shift/");
      const data = response.data; // axios gives data here
      setShifts(data);
      console.log(data);
    } catch (error) {
      console.error(
        "Could not get shifts:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    get_shifts();
  }, []);

  const handleShiftAdded = () => {
    get_shifts();
    set_show_add_modal(false);
  };
  const handleShiftDelete = async (id) => {
    try {
      await instance.delete(`/users/shift/${id}/`);

      setShifts((prev) => prev.filter((shift) => shift.id !== id));
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div
      className="min-h-screen bg-gray-100 py-10 px-5"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className={`max-w-6xl mx-auto flex items-center mb-8 ${
          isRTL ? "flex-row-reverse justify-between" : "justify-between"
        }`}
      >
        <h1 className="text-3xl font-semibold text-gray-800">
          {t("staff_shifts")}
        </h1>
        <button
          onClick={() => set_show_add_modal(true)}
          className="flex items-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md transition"
        >
          <Plus className="w-5 h-5" /> {t("add_shift")}
        </button>
      </div>

      {loading ? (
        <div className=" grid place-items-center text-gray-600 mt-10">
          <div className="w-10 h-10 border-4 items-center justify-center border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
        </div>
      ) : (
        <ShiftList shifts={shifts} onShiftDelete={handleShiftDelete} />
      )}

      <AttendanceTable />

      {show_Add_Modal && (
        <AddShiftModal
          onClose={() => set_show_add_modal(false)}
          onShiftAdded={handleShiftAdded}
        />
      )}
    </div>
  );
}
