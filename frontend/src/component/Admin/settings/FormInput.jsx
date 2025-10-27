import React from "react";

export default function FormInput({ label, name, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-xl p-2"
        required={required}
      />
    </div>
  );
}
