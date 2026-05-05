import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import ManagerReservationsTable from "./ManagerReservationsTable";
import AddReservation from "../../Cashier/components/AddReservation";

export default function ManagerReservationBase() {
  const [reservations, setReservations] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fetchReservations = async () => {
    try {
      const res = await instance.get("/orders/reservations/");
      console.log(res.data);
      setReservations(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reservations</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md"
        >
          <span className="text-xl">+</span> Add Reservation
        </button>
      </div>
      <ManagerReservationsTable
        reservations={reservations}
        onUpdate={fetchReservations}
        onReservationSaved={fetchReservations}
      />

      {isAddModalOpen && (
        <AddReservation
          onClose={() => setIsAddModalOpen(false)}
          onReservationSaved={() => {
            setIsAddModalOpen(false);
            fetchReservations();
          }}
        />
      )}
    </div>
  );
}
