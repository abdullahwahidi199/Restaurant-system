import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) setUsername(user);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const navLinks = [
    { name: "Favorites", path: "/favorites" },
    { name: "FAQs", path: "/faqs" },
    { name: "Info", path: "/info" },
  ];

  return (
    <div className="w-full bg-gradient-to-r from-black via-[#111] to-[#1a1a1a] px-6 py-4 flex justify-between items-center shadow-md">
      <h2
        className="text-2xl font-bold text-red-500 cursor-pointer hover:text-red-600 transition"
        onClick={() => navigate("/")}
      >
        Restaurant
      </h2>

      <div className="flex gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="text-gray-300 hover:text-white font-medium transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        {username ? (
          <div className="flex items-center gap-2">
            <div className="bg-red-500 text-white rounded-full w-10 h-10 flex justify-center items-center font-bold uppercase cursor-pointer"
                 onClick={() => navigate("/account")}>
              {username.slice(0, 2)}
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-white">Logout</button>
          </div>
        ) : (
          <>
            <button className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition">
              <Link to="/login">Login</Link>
            </button>
            <button className="px-4 py-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition">
              <Link to="/signup">Signup</Link>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
