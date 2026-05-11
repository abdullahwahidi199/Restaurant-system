import React, { useState } from "react";
import ManagerNavbar from "./ManagerNavbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useDiscountSocket from "../../hooks/useDiscoutSocket";

export default function ManagerRootLayout() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";
  const [discountAlert, setDiscountAlert] = useState(null);
  const navigate = useNavigate();

  const playSound = () => {
    const audio = new Audio("/sounds/notification.mp3");
    audio.play().catch(() => {});
  };

  const handleDiscountMessage = (data) => {
    if (data.type === "NEW_DISCOUNT_REQUEST") {
      setDiscountAlert(data);
      playSound();

      // auto hide after 6s
      setTimeout(() => setDiscountAlert(null), 6000);
    }
  };

  useDiscountSocket(handleDiscountMessage);

  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {discountAlert && (
        <div
          onClick={() => navigate("/manager/discount-requests")}
          className="
      fixed top-6 right-6 z-50
      bg-orange-500 text-white
      px-5 py-4 rounded-xl shadow-2xl
      cursor-pointer
      animate-bounce
      w-72
    "
        >
          <div className="font-bold text-lg">🔔 New Discount Request</div>

          <div className="text-sm mt-1">
            Order #{discountAlert.order_number}
          </div>

          <div className="text-xs mt-2 opacity-90">
            Click to review pending requests
          </div>
        </div>
      )}
      <ManagerNavbar />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
