import React, { useState } from "react";
import { motion } from "framer-motion";
import { signupCustomer, loginCustomer } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();
  const [error,setError]=useState(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    date_of_birth: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.username.includes(" ")){
        throw new Error("Firstname cant't contain spaces!")
      }
      await signupCustomer(formData);
      const res = await loginCustomer({
        username: formData.username,
        password: formData.password,
      });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      toast.success("Account created successfully!");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      console.error(err);
      setError(err.message)
      toast.error(
        err.response?.data?.username?.[0] ||
          err.response?.data?.email?.[0] ||
          err.response?.data?.detail ||
          "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-[#111] to-[#0a0a0a] text-white px-6">
      <Toaster position="bottom-center" />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="bg-[#121212] border border-[#1f1f1f] shadow-xl rounded-3xl w-full max-w-md p-8"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-6"
        >
          Create <span className="text-red-500">Account</span>
        </motion.h2>
        {error && (
          <p className="text-red-600">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
            required
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
            required
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
            required
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            name="phone"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
            required
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
            required
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="date"
            name="date_of_birth"
            placeholder="Date of Birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
            required
          />

          <motion.select
            whileFocus={{ scale: 1.02 }}
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          >
            <option value="" disabled>
              Select gender
            </option>
            <option value="male" className="bg-[#1a1a1a]">
              Male
            </option>
            <option value="female" className="bg-[#1a1a1a]">
              Female
            </option>
            <option value="other" className="bg-[#1a1a1a]">
              Other
            </option>
          </motion.select>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            type="submit"
            className={`w-full py-3 rounded-full font-bold transition-all duration-300 ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </motion.button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-red-500 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
