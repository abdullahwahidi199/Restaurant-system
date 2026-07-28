import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ClipboardList,
  CookingPot,
  Menu,
  ReceiptText,
  Table2,
  UtensilsCrossed,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
export default function InventoryManagerNavbar() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";
  const [isOpen, setIsOpen] = useState(true);
  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    {
      to: "/inventory-manager",
      label: "Inventory",
      icon: <ClipboardList size={18} />,
    },
    {
      to: "/inventory-manager/menu",
      label: "Menu",
      icon: <UtensilsCrossed size={18} />,
    },
    {
      to: "/inventory-manager/tables",
      label: t("nav.tables"),
      icon: <Table2 size={18} />,
    },
    {
      to: "/inventory-manager/daily-production",
      label: "Daily Production",
      icon: <CookingPot size={18} />,
    },
    {
      to: "/inventory-manager/expenses",
      label: "Expenses",
      icon: <ReceiptText size={18} />,
    },
  ];
  return (
    <nav
      dir={isRTL ? "rtl" : "ltr"}
      className={`bg-gray-200 shadow-lg border border-t-0 border-r-gray-500 sticky top-0 z-50 transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      } h-screen shrink-0 flex flex-col`}
    >
      <div className="flex items-center justify-between bg-white px-4 py-4 border-b border-gray-500 flex-shrink-0">
        <h1
          className={`text-2xl font-bold text-gray-800 transition-all duration-300 ${!isOpen && "opacity-0 hidden"}`}
        >
          {/* {t("nav.admin")} */}
          Inventory Manager
        </h1>
        <button
          className="text-gray-700 cursor-pointer hover:text-gray-900 transition"
          onClick={toggleMenu}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="py-4 space-y-2 md:space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                title={!isOpen ? label : undefined}
                className={({ isActive }) =>
                  `mx-2 flex items-center gap-3 rounded-lg py-2.5 transition-all ${
                    isOpen ? "px-3" : "justify-center px-0"
                  } ${
                    isActive
                      ? "bg-white text-gray-900 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <span className="shrink-0">{icon}</span>
                {isOpen && <span className="truncate">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
