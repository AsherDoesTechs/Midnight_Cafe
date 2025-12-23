import React from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="py-2 px-4 bg-[#F1A7C5] text-[#121212] rounded-lg font-semibold hover:bg-[#f3b3cd] transition-all"
    >
      Logoitss
    </button>
  );
}
