import { Search, Filter } from "lucide-react";

export default function OrderFilters({ filters, setFilters, onSearch }) {
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Search size={18} />
        <input
          type="text"
          name="search"
          placeholder="Search by name or phone"
          value={filters.search}
          onChange={handleChange}
          className="border rounded-lg px-3 py-1 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter size={18} />
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="border cursor-pointer rounded-lg px-2 py-1"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="flex gap-2">
        <label htmlFor="">From:</label>
        <input
          type="date"
          name="start_date"
          value={filters.start_date}
          onChange={handleChange}
          className="border cursor-pointer rounded-lg px-2 py-1"
        />
        <label htmlFor="">To:</label>
        <input
          type="date"
          name="end_date"
          value={filters.end_date}
          onChange={handleChange}
          className="border cursor-pointer rounded-lg px-2 py-1"
        />
      </div>

      <button
        onClick={onSearch}
        className="bg-blue-600 cursor-pointer text-white px-4 py-1.5 rounded-lg hover:bg-blue-700"
      >
        Apply
      </button>
    </div>
  );
}
