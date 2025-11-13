import { useContext, useEffect, useState } from "react"
// import { CheckCircle, UserCheck, Users, Save } from 'lucide-react';
import { AuthContext } from "../../api/authforRBC"
import instance from "../../api/axiosInstance"
export default function Attendance() {
    const [shifts, setShifts] = useState([])
    const [error, setError] = useState(null)
    const [staff, setStaff] = useState([])
    const [attendance, setAttendance] = useState({})
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const {auth}=useContext(AuthContext)
    const token=auth?.tokens?.access

    const [selectedShiftId, setSelectedShiftId] = useState('')

    const getShifts = async () => {
        try {
            const response = await instance.get('/users/shift/')
            
            const data = response.data
            
            setShifts(data)
        }
        catch (error) {
            console.error("Could not get shifts:", error.response?.data || error.message);
            setError(error)
        }
    }
    const getStaffByShift = async () => {
        try {
            const response = await instance.get(`/users/shift/${selectedShiftId}/`)
           
            const data = response.data

            setStaff(data.staff)

        }
        catch (error) {
            console.log("could not get staff!:",error.response?.data||error.message )
            setError(error)
        }
        finally {
            setLoading(false);
        }

    }


    const handleStatusChange = (staffId, status) => {
        setAttendance(prev => ({ ...prev, [staffId]: status }))
    }

    const handleSave = async () => {
  const payload = {
    date: new Date().toISOString().slice(0, 10),
    attendance: staff.map(s => ({
      staff_id: s.id,
      shift_id: selectedShiftId,
      status: attendance[s.id] || "Present"
    }))
  };

  try {
    
    const response = await instance.post(
      `/users/attendance/mark/${selectedShiftId}/`,
      payload
    );

    
    if (response.status === 200 || response.status === 201) {
      setMessage("✅ Attendance saved successfully!");
    } else {
      setMessage("❌ Failed to save attendance.");
    }
  } catch (error) {
    console.error("Attendance save error:", error);
    setMessage("❌ Failed to save attendance.");
  }
};

    useEffect(() => {
        getShifts();
        getStaffByShift();
    }, [selectedShiftId])

    if (loading) return <div className="flex justify-center items-center h-[300px]"><div
        class="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"
    ></div>
    </div>;
    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800">Mark Shift Attendace</h1>

            <div className="flex flex-wrap gap-3">
                {shifts.map((shift) => (
                    <button
                        onClick={() => setSelectedShiftId(shift.id)}
                        key={shift.id}
                        className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded shadow-md transition-all duration-200 ${selectedShiftId === shift.id ? 'bg-blue-600' : 'bg-gray-200 text-blue-600 border-blue-600'} hover:bg-blue-700 hover:text-white `}
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
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                </tr>

                            </thead>
                            <tbody>
                                {staff.map((staff, index) => (
                                    <tr key={staff.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border text-center">{index + 1}</td>
                                        <td className="px-4 py-2 border text-center">{staff.name}</td>
                                        <td className="px-4 py-2 border text-center">{staff.role}</td>
                                        <td className="px-4 py-2 border text-center">
                                            <select value={attendance[staff.id] || "Present"} key={staff.id}
                                                onChange={(e) => handleStatusChange(staff.id, e.target.value)}
                                            >
                                                <option value="Present">Present</option>
                                                <option value="Absent">Absent</option>
                                                <option value="Leave">Leave</option>
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
                            className='flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 shadow'
                        >Save Attendance</button>
                        {message && <span className="text-sm text-blue-600">{message}</span>}
                    </div>
                    <br />
                    <hr />
                </div>
            )}
        </div>
    )
}