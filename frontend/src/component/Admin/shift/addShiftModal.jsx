import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { AuthContext } from "../../../api/authforRBC";
import instance from "../../../api/axiosInstance";

export default function AddShiftModal({ onClose, onShiftAdded }) {
  const [shiftType, setShiftType] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  const [loading, setLoading] = useState(false);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response =await instance.post("/users/shift/", {
        
        
          shift_type: shiftType,
          start_time: startTime,
          end_time: endTime,
        
        
      });

      if (response.status===200||response.status===201){
        onShiftAdded()
      } else{
        throw new Error("Failed to add shift");
      }
    } catch (error) {
      console.error(error);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Add New Shift
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          

          <input
            value={shiftType}
            onChange={(e) => setShiftType(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            required
            placeholder="Shift name"
          />
            

          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            required
          />

          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Shift"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
