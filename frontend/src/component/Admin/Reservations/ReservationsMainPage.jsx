import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import ReservationsTable from "./ReservationsTable";

export default function ReservationsMainPage() {
  const [reservations, setReservations] = useState([]);
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
      <ReservationsTable reservations={reservations} />
    </div>
  );
}
