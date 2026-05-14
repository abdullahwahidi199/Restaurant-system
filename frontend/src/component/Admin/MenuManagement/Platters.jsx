import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";

export default function Platters() {
  const [platters, setPlatters] = useState([]);
  const fetchPlatters = async () => {
    const res = await instance.get("/menu/platters/");
    console.log(res.data);
  };
  useEffect(() => {
    fetchPlatters();
  }, []);
  return <div>Platters</div>;
}
