import { useState } from "react";
import { motion } from "framer-motion";
import { X,Plus } from "lucide-react";
import instance from "../../../api/axiosInstance";

export default function TableAddModal({onTableAdded,onClose}){
    const [tableNumber,setTableNumber]=useState('')
    const [capacity,setCapacity]=useState('')
    const [note,setNote]=useState('')
    const [loading, setLoading] = useState(false);
    const [error,setError]=useState(null)

    const handleSubmit=async ()=>{
      setLoading(true)
        try{
            const response=await instance.post(`http://127.0.0.1:8000/orders/tables/`,{
               
               
                    number:tableNumber,
                    capacity:capacity,
                    note:note
               
            })
            
        }
        catch(error){
            
            setError(error)
        }
        finally{
          setLoading(false)
        }
    }

    if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
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
          Add New Table
        </h2>

        <form onSubmit={handleSubmit}  className="space-y-4">
          

          <input
           type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            required
            placeholder="Number"
          />
            

          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            required
            placeholder="Capacity"
          />

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            required
            placeholder="note"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Table"}
          </button>

          {error && (
            <p className="text-red-600">{error.message}</p>
          )}
        </form>
      </motion.div>
    </div>
  );
}