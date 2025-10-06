import React from "react";
import { NavLink } from "react-router-dom";

function Navbar() {
    return (
        <div className="h-full flex flex-col justify-between">
            <div>
                <div className="text-2xl font-bold text-white mb-8">Admin</div>

                <ul className="space-y-2">
                    <li>
                        <NavLink
                            to="/admin/dashboard"
                            end
                            className={({ isActive }) =>
                                `block px-4 py-[5px] rounded hover:bg-gray-700 transition ${isActive ? "bg-gray-700 text-white" : "text-gray-300"
                                }`
                            }
                        >
                            Home
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/admin/dashboard/attendance"
                            className={({ isActive }) =>
                                `block px-4 py-[5px] rounded hover:bg-gray-700 transition ${isActive ? "bg-gray-700 text-white" : "text-gray-300"
                                }`
                            }
                        >
                            Attendance
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/admin/dashboard/staff"
                            className={({ isActive }) =>
                                `block px-4 py-[5px] rounded hover:bg-gray-700 transition ${isActive ? "bg-gray-700 text-white" : "text-gray-300"
                                }`
                            }
                        >
                            Staff
                        </NavLink>
                    </li>

                    <li className="text-gray-300 px-4 py-2 hover:bg-gray-700 rounded cursor-pointer">About</li>
                </ul>
            </div>

            <h2 className="text-gray-400 px-4 py-4 cursor-pointer">Info</h2>
        </div>
    );
}
export default Navbar;