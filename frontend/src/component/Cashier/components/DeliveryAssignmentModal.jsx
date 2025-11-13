import React, { useState, useEffect } from "react";
import instance from "../../../api/axiosInstance";

const DeliveryAssignmentModal = ({ isOpen, onClose, order, deliveryPersons = [], onAssign }) => {
    const [selectedPersonId, setSelectedPersonId] = useState("");
    console.log(order)
    useEffect(() => {
        if (isOpen) setSelectedPersonId("");
    }, [isOpen, order?.id]);

    if (!isOpen || !order) return null;

    const handleAssign = async () => {
    if (!selectedPersonId) return;

    try {
        const response = await instance.patch(`http://127.0.0.1:8000/orders/orders/${order.id}/assign-delivery/`, {
            delivery_person_id: selectedPersonId 
        });

        if (!response.ok) {
            const err = await response.json();
            alert(err.error || "Failed to assign delivery person");
            return;
        }

        const updatedOrder = await response.json();
        onAssign(updatedOrder); // Callback to parent to update UI
        onClose(); // Close modal
    } catch (err) {
        console.error(err);
        alert("Something went wrong.");
    }
};


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-lg w-96 p-6 relative">
                <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">✕</button>
                <h2 className="text-xl font-semibold mb-4">Assign Delivery Person</h2>
                <p className="mb-4">Order ID: <span className="font-bold">{order.id}</span></p>

                <label className="block mb-2 text-sm font-medium">Delivery Person</label>
                <select
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedPersonId}
                    onChange={(e) => setSelectedPersonId(e.target.value)}
                    aria-label="Select delivery person"
                >
                    <option value="">Select delivery person</option>
                    {deliveryPersons.map((person) => (
                        <option key={person.id} value={person.id}>
                            {person.name}
                        </option>
                    ))}
                </select>

                <div className="flex gap-3">
                    <button
                        onClick={handleAssign}
                        disabled={!selectedPersonId}
                        className={`flex-1 ${selectedPersonId ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-200 text-gray-600 cursor-not-allowed"} py-2 rounded transition`}
                    >
                        Assign
                    </button>

                    <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded transition">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeliveryAssignmentModal;
