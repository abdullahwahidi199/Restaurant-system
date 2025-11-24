import React, { useState } from "react";
import { motion } from "framer-motion";
import { signupCustomer, loginCustomer } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const [showPassword,setShowPassword]=useState(false)
  const [showConfirmPassword,setShowConfirmPassword]=useState(false)

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password:"",
    phone: "",
    address: "",
    date_of_birth: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);

 
  const validateUsername = (name) => /^[A-Za-z]+$/.test(name);
  const validatePhone = (phone) => /^[0-9]{7,15}$/.test(phone);
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    let { name, value } = e.target;

    
    if (name === "username") {
      value = value.replace(/[^A-Za-z]/g, ""); 
    }
    if (name === "phone") {
      value = value.replace(/[^0-9]/g, ""); 
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
    
      if (!validateUsername(formData.username)) {
        throw new Error("Username must contain only letters (no numbers/spaces).");
      }

      if (!validateEmail(formData.email)) {
        throw new Error("Invalid email format.");
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      if (!validatePhone(formData.phone)) {
        throw new Error("Phone number must be 7–15 digits long.");
      }
      if (formData.password !== formData.confirm_password) {
        throw new Error("Passwords do not match!");
      }

      if (formData.address.length < 5) {
        throw new Error("Address must be at least 5 characters.");
      }

      if (!formData.gender) {
        throw new Error("Please select a gender.");
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
      setError(err.message);

      toast.error(
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        err.message ||
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
        <h2 className="text-3xl font-bold text-center mb-6">
          Create <span className="text-red-500">Account</span>
        </h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            name="username"
            placeholder="Username (letters only)"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full"
            required
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full"
            required
          />

          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password (min 6 chars)"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 cursor-pointer text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full"
              required
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-3 cursor-pointer text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            name="phone"
            placeholder="Phone (numbers only)"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full"
            required
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full"
            required
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full"
            required
          />

          <motion.select
            whileFocus={{ scale: 1.02 }}
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full"
            required
          >
            <option value="" disabled>Select gender</option>
            <option value="male" className="bg-[#1a1a1a]">Male</option>
            <option value="female" className="bg-[#1a1a1a]">Female</option>
            <option value="other" className="bg-[#1a1a1a]">Other</option>
          </motion.select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            type="submit"
            className={`w-full py-3 rounded-full font-bold transition-all ${
              loading ? "bg-gray-600" : "bg-red-500 hover:bg-red-600"
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
