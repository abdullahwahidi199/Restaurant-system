import { Search } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function FilterBar({ filter, setFilter, search, setSearch }) {
                 const { t: autoT } = useAutoTranslation();
  const filters = [
    { key: "all", label: autoT("all") },
    { key: "pending", label: autoT("stats.pending") },
    { key: "in_progress", label: autoT("status.in_progress") },
    { key: "ready", label: autoT("status.ready") },
  ];

  return (
    <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 shadow-sm p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
      
      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200 ease-in-out
              ${
                filter === key
                  ? "bg-blue-600 text-white shadow-md scale-[1.05]"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-72">
        <Search
          className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500"
          size={18}
        />
        <input
          type="text"
          placeholder={autoT("inventory_manager.ingredients.search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-3 py-2 w-full rounded-full border border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 
                     focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-all"
        />
      </div>
    </div>
  );
}
