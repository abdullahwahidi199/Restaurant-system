import React, { useState, useEffect } from "react";
import instance from "../../../api/axiosInstance";

const DeliveryAssignmentModal = ({
  isOpen,
  onClose,
  order,
  deliveryPersons = [],
  onAssign,
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState("");
  console.log(order);
  useEffect(() => {
    if (isOpen) setSelectedPersonId("");
  }, [isOpen, order?.id]);

  if (!isOpen || !order) return null;

  const handleAssign = async () => {
    if (!selectedPersonId) return;

    const selectedPerson = deliveryPersons.find(
      (p) => p.id == selectedPersonId,
    );

    if (!selectedPerson || !selectedPerson.phone) {
      alert("Delivery person has no phone number");
      return;
    }

    const phone = selectedPerson.phone.replace("+", "");

    // ✅ Check if location exists
    const hasLocation = order.latitude && order.longitude;

    let message = `
New Delivery Order 🚚

Order ID: ${order.order_number}
Name: ${order.name}
Phone: ${order.phone}
Address: ${order.address}
`;

    // ✅ Only add map link if lat/lng exist
    if (hasLocation) {
      const mapLink = `https://www.google.com/maps?q=${order.latitude},${order.longitude}`;

      message += `

📍 Location:
${mapLink}
`;
    }

    const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    // 👉 Step 1: Open WhatsApp
    window.open(whatsappURL, "_blank");

    // 👉 Step 2: Ask user confirmation
    const confirmed = window.confirm(
      "Did you send the WhatsApp message to the delivery person?",
    );

    if (!confirmed) return;

    // 👉 Step 3: NOW assign
    try {
      const response = await instance.patch(
        `/orders/orders/${order.id}/assign-delivery/`,
        {
          delivery_person_id: selectedPersonId,
        },
      );

      onAssign(response.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Assignment failed.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-lg w-96 p-6 relative">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Assign Delivery Person</h2>
        <p className="mb-4">
          Order ID: <span className="font-bold">{order.id}</span>
        </p>

        <label className="block mb-2 text-sm font-medium">
          Delivery Person
        </label>
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

          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAssignmentModal;
