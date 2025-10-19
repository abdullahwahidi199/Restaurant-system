import { Search } from "lucide-react";

export default function FilterBar({ filter, setFilter, search, setSearch }) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex gap-2">
                {["all", "pending", "in_progress", "ready"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${filter === f
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            }`}
                    >

                        {f.replace("_", " ")}</button>
                ))}
            </div>

            <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-1 w-full border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                />
            </div>
        </div>
    )
}