  // src/components/Header.jsx
  import React, { useEffect, useState } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import { logoutCustomer, getProfile } from "../../api/auth";

  export default function Header({restaurantInfo}) {
    // console.log(restaurantInfo)
    const [username, setUsername] = useState("");
    const navigate = useNavigate();



    useEffect(() => {
      const fetchUserProfile = async () => {
        const token = localStorage.getItem("access_token");
        if (token) {
          try {
            const res = await getProfile();
            setUsername(res.data.username);
            // console.log(res.data.username)
            
          } catch (err) {
            console.error(err);
            logoutCustomer();
          }
        }
      };
      fetchUserProfile();
    }, []);

  

    const handleLogout = () => {
      logoutCustomer();
      navigate("/");
      window.location.reload();
    };

    const navLinks = [
      { name: "FAQs", path: "/faqs" },
      { name: "Info", path: "/info" },
      {name:"My Orders", path:"/orders"}
    ];

    return (
      <div className="w-full bg-gradient-to-r from-black via-[#111] to-[#1a1a1a] px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
        {restaurantInfo && (
          <img
            src={restaurantInfo.logo}
            alt="logo"
            className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-md"
          />
        )}
        <h2
          className="text-2xl font-bold text-red-500 cursor-pointer hover:text-red-600 transition"
          onClick={() => navigate("/")}
        >
          {restaurantInfo && restaurantInfo.name}
        </h2>
      </div>

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
              <div
                className="bg-red-500 text-white rounded-full w-10 h-10 flex justify-center items-center font-bold uppercase cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                {username.slice(0, 2)}
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                Logout
              </button>
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
