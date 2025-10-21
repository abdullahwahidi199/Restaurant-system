// src/components/Login.jsx
import React, { useState } from "react";
import { api } from "../../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/customer/login/", form);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", form.username);
      navigate("/");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-[#111] p-8 rounded-2xl shadow-lg w-96 flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Login</h2>

        <input
          name="username"
          placeholder="Username"
          className="p-2 bg-transparent border-b border-gray-500 focus:outline-none"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="p-2 bg-transparent border-b border-gray-500 focus:outline-none"
          onChange={handleChange}
          required
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="bg-red-500 hover:bg-red-600 transition py-2 rounded-md font-semibold">
          Login
        </button>
      </form>
    </div>
  );
}
