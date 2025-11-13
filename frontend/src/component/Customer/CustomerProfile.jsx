import React, { useEffect } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function CustomerProfile() {
  const user = JSON.parse(localStorage.getItem("customer"));
  const navigate = useNavigate();
  // console.log(user)

  useEffect(() => {
    if (user) {
      toast.success(`Welcome back, ${user.username}!`, {
        duration: 3000,
        position: "top-center",
      });
    } else {
      toast.error("No user found. Please log in.");
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-black via-[#111] to-[#1a1a1a] text-white flex flex-col items-center py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Toaster />

      <motion.div
        className="w-full max-w-md bg-[#1e1e1e] rounded-2xl shadow-xl p-8 border border-gray-800"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 80 }}
        >
          <div className="bg-red-500 w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold uppercase shadow-lg">
            {user.username.slice(0, 1)}
          </div>
          <h2 className="text-2xl font-semibold mt-4">{user.username}</h2>
          <p className="text-gray-400 text-sm mt-1">{user.email}</p>
        </motion.div>

        <div className="space-y-4">
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span className="text-gray-400">Phone</span>
            <span>{user.phone}</span>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span className="text-gray-400">Address</span>
            <span>{user.address}</span>
          </div>
        </div>

        <motion.button
          className="w-full mt-8 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white py-2 rounded-full font-medium transition"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Customize Profile
        </motion.button>

        
      </motion.div>
    </motion.div>
  );
}
