import { useEffect, useState } from "react";
import { CheckCircle, Coffee, Ban } from "lucide-react";
import TableActionModal from "./TableActionModal";

export default function TablesDisplayModal({ tables, refetchTables }) {
    const [filter, setFilter] = useState("all")
    const [selectedTable, setSelectedTable] = useState(null);

    const handleTableClick = (table) => {
        
        setSelectedTable(table);
    };


    const filteredTables =
        filter === "all"
            ? tables
            : tables.filter((t) => t.status === filter)

    const getStatusIcon = (status) => {
        switch (status) {
            case "available":
                return <CheckCircle className="text-green-600 size={22}" />
            case "occupied":
                return <Coffee className="text-orange-600 size={22}" />
            case "unavailable":
                return <Ban className="text-gray-600" size={22} />;
            default:
                return null;
        }
    }

    const getCardStyle = (status) => {
        switch (status) {
            case "available":
                return "bg-green-100 border-green-500 hover:bg-green-200";
            case "occupied":
                return "bg-orange-100 border-orange-500 hover:bg-orange-200";
            case "unavailable":
                return "bg-gray-200 border-gray-400 opacity-70 cursor-not-allowed";
            default:
                return "";

        }
    }



    return (
        <div className="p-6">
            <div className="flex flex-wrap justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Waiter Dashboard</h1>
                <div className="flex flex-wrap gap-2">
                    {["all", "available", "occupied", "unavailable"].map((s) => (
                        <button key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-1.5 rounded-full text-white transition
                                ${filter === s ? "scale-105 shadow" : ""}
                                ${s === "available"
                                    ? "bg-green-500 hover:bg-green-600"
                                    : s === "occupied"
                                        ? "bg-orange-500 hover:bg-orange-600"
                                        : s === "unavailable"
                                            ? "bg-gray-500 hover:bg-gray-600"
                                            : "bg-blue-500 hover:bg-blue-600"
                                }
                                `}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="mb-4 text-gray-700 font-medium">
                🟢 {tables.filter((t) => t.status === "available").length} Available .
                🔴 {tables.filter((t) => t.status === "occupied").length} Occupied ·
                ⚫ {tables.filter((t) => t.status === "unavailable").length} Unavailable
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTables.length === 0 ? (
                    <p className="text-gray-500">No tables found.</p>
                ) : (
                    filteredTables.map((table) => (
                        <div
                            key={table.number}
                            onClick={() => handleTableClick(table)}
                            className={`p-4 rounded-2xl shadow-md border transition cursor-pointer
                            ${getCardStyle(table.status)}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-lg font-bold">Table {table.number}</h2>
                                {getStatusIcon(table.status)}
                            </div>

                            <p className="text-sm text-gray-700">Capacity: {table.capacity}</p>
                            <p className="text-sm capitalize text-gray-800">
                                Status: {table.status}
                            </p>
                            {table.note && (
                                <p className="text-xs text-gray-600 italic mt-1">
                                    Note: {table.note}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
            {selectedTable && (
                <TableActionModal
                    table={selectedTable}
                    refetchTables={refetchTables}
                    onClose={() => {
                        setSelectedTable(null)
                        
                    }}
                />
            )}

        </div>
    )





}
