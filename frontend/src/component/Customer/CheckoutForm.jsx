import React, { useState } from "react";
import toast from "react-hot-toast";

export default function CheckoutForm({ user, onSubmit, onClose }) {

  const [formData, setFormData] = useState({
    name: user?.username || "",
    phone: user?.phone || "",
    address: user?.address || "",
    email: user?.email || ""
  });

 
  const validateName = (name) => /^[A-Za-z\s]+$/.test(name);
  const validatePhone = (phone) => /^[0-9]{7,15}$/.test(phone);
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    let { name, value } = e.target;

    
    if (name === "name") {
      value = value.replace(/[^A-Za-z\s]/g, ""); 
    }
    if (name === "phone") {
      value = value.replace(/[^0-9]/g, "");
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (!user && !formData.name) {
      return toast.error("Name is required!");
    }
    if (!validateName(formData.name)) {
      return toast.error("Name can only contain letters!");
    }

    if (!validatePhone(formData.phone)) {
      return toast.error("Phone number must be 7–15 digits!");
    }

    if (formData.address.length < 5) {
      return toast.error("Address must be at least 5 characters long!");
    }

    if (!validateEmail(formData.email)) {
      return toast.error("Invalid email address!");
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#111] p-6 rounded-xl w-80 md:w-96 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-white mb-4">Review your infos</h2>

        <div className="space-y-4">
          {!user && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 rounded bg-[#1a1a1a] border border-gray-700 text-white"
            />
          )}

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 rounded bg-[#1a1a1a] border border-gray-700 text-white"
          />

          <input
            type="text"
            name="address"
            placeholder="Delivery Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 rounded bg-[#1a1a1a] border border-gray-700 text-white"
          />

          <input
            type="text"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 rounded bg-[#1a1a1a] border border-gray-700 text-white"
          />

          <button
            onClick={handleSubmit}
            className="w-full py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
