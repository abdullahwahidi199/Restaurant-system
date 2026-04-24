import React from "react";

export default function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  step,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        required={required}
        className={`w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none ${className}`}
        {...props}
      />
    </div>
  );
}
