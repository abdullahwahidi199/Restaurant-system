import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function Platters() {
                 const { t: autoT } = useAutoTranslation();
  const [platters, setPlatters] = useState([]);
  const fetchPlatters = async () => {
    const res = await instance.get("/menu/platters/");
    console.log(res.data);
  };
  useEffect(() => {
    fetchPlatters();
  }, []);
  return <div>{autoT("legacy.platters_84cf7710")}</div>;
}
