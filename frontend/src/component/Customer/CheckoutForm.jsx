import React, { useState } from "react";
import toast from "react-hot-toast";

export default function CheckoutForm({ user, onSubmit, onClose }) {
    console.log(user)
  const [formData, setFormData] = useState({
    name: user?.username || "",
    phone: user?.phone || "",
    address: user?.address,
    email:user?.email
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if ((!user && !formData.name) || !formData.phone || !formData.address) {
      return toast.error("All fields are required!");
    }

    onSubmit(formData);
  };

  // console.log(user)

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
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 rounded bg-[#1a1a1a] border border-gray-700 text-white"
            />
          )}
          <input
            type="text"
            name="phone"
            placeholder="Phone"
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
            placeholder="Email"
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