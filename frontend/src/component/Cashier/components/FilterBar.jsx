// src/pages/cashier/components/FilterBar.jsx
import React from "react";

// Provide value options as backend keys
const ORDER_TYPES = [
  { value: "", label: "All Types" },
  { value: "dine-in", label: "Dine-in" },
  { value: "takeaway", label: "Takeaway" },
  { value: "delivery", label: "Delivery" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "ready", label: "Ready" },
  { value: "served", label: "Served" },
  { value: "picked_up", label: "Picked Up" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
];

const FilterBar = ({ filters, setFilters }) => {
  const f = { search: "", type: "", status: "", date: "", ...filters };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 mb-6">
      <input
        type="text"
        name="search"
        value={f.search}
        onChange={handleChange}
        placeholder="Search by Order ID or Customer"
        className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Search orders"
      />

      <select
        name="type"
        value={f.type}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-1/5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filter by type"
      >
        {ORDER_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      

    
    </div>
  );
};

export default FilterBar;
