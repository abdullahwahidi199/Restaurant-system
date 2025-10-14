import { useEffect, useState } from "react"
import { Plus } from "lucide-react";
import ShiftList from "./ShiftList";
import AddShiftModal from "./addShiftModal";
export default function () {
    const [shifts, setShifts] = useState([])
    const [loading, setLoading] = useState(true)
    const [show_Add_Modal, set_show_add_modal] = useState(false)
    const get_shifts = async () => {

        try {
            const response = await fetch(`http://127.0.0.1:8000/users/shift/`)
            if (!response.ok) {
                throw new Error("Could not get shifts")
            }
            const data = await response.json()
            setShifts(data)
            console.log(data)

        }
        catch (error) {
            console.log(error)
        }
        finally {
            setLoading(false)
        }


    }
    useEffect(() => {
        get_shifts();
    }, [])

    const handleShiftAdded = () => {
        get_shifts();
        set_show_add_modal(false);
    }
    return (
        <div className="min-h-screen bg-gray-100 py-10 px-5">
            <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
                <h1 className="text-3xl font-semibold text-gray-800">Staff Shifts</h1>
                <button
          onClick={() => set_show_add_modal(true)}
          className="flex items-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md transition"
        >
          <Plus className="w-5 h-5" /> Add Shift
        </button>
            </div>

            {loading ? (
                <div className=" grid place-items-center text-gray-600 mt-10">
                    <div className="w-10 h-10 border-4 items-center justify-center border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
                </div>
            ) : (
                <ShiftList shifts={shifts} />
            )}

            {show_Add_Modal && (
                <AddShiftModal
                    onClose={() => set_show_add_modal(false)}
                    onShiftAdded={handleShiftAdded}
                />
            )}

        </div>
    )
}