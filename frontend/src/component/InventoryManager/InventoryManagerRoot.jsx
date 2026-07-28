import React from "react";
import { Outlet } from "react-router-dom";
import InventoryManagerNavbar from "./InventoryManagerNavbar";

export default function () {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <InventoryManagerNavbar />

      <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
