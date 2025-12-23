// src/user/UserDash.tsx (CLEANED ALIGNMENT)

import { useState, useEffect } from "react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Lightbulb,
  User,
  Clock,
  Home,
  LogOut,
  Settings,
} from "lucide-react";
import { toast } from "react-toastify";

// Import: useAuth
import { useAuth } from "../context/AuthContext";

// Import Child Components
import RecentBuys from "../user/RecentBuys";
import Favorites from "../user/Favorites";
import CustomIdeas from "../user/CustomIdeas";
import UserAccountSettings from "../user/UserAccountSettings";

// --- Component Data ---
const tabs = [
  { id: "settings", label: "Account Settings", icon: Settings },
  { id: "favorites", label: "My Favorites", icon: Heart },
  { id: "custom", label: "Custom Ideas", icon: Lightbulb },
];

const UserDash: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("settings");
  const [time, setTime] = useState("");

  const { user, logout } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.dispatchEvent(new CustomEvent("userStatusChange"));
    toast.success("Logged out successfully.", {
      autoClose: 1500,
      onClose: () => navigate("/"),
    });
  };

  const handleGoHome = () => navigate("/");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "buys":
        return <RecentBuys />;
      case "favorites":
        return <Favorites />;
      case "custom":
        return <CustomIdeas />;
      case "settings":
      default:
        return <UserAccountSettings />;
    }
  };

  const userName = user!.displayName || user!.email || `User ID: ${user!.id}`;

  return (
    <div className="flex min-h-screen bg-neutral-900 text-[#D0C8B3] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1A1A1A] text-[#D0C8B3] shadow-2xl flex flex-col border-r border-[#2A2A2A] flex-shrink-0">
        {/* Profile Header */}
        <div className="p-6 border-b border-[#2A2A2A] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F1A7C5] text-[#121212] flex items-center justify-center text-lg font-semibold">
              <User size={20} />
            </div>
            <div>
              <p className="text-white font-semibold truncate">{userName}</p>
              <p className="text-[#D0C8B3] text-sm">Customer Profile</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[#D0C8B3] text-sm">
            <Clock size={16} className="text-[#F1A7C5]" />
            <span>Local Time: {time}</span>
          </div>
        </div>

        {/* Tabs Navigation */}
        <nav className="flex-1 overflow-y-auto mt-4 px-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 text-left text-base rounded-lg mb-2 transition-all w-full ${
                  isActive
                    ? "bg-[#F1A7C5] text-[#121212] font-semibold shadow-md"
                    : "text-[#D0C8B3] hover:bg-[#2A2A2A] hover:text-[#F1A7C5]"
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#2A2A2A] flex-shrink-0 space-y-2">
          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#D0C8B3] rounded-lg transition-all font-medium"
          >
            <Home size={20} /> Back to Shop
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-800 hover:bg-red-700 text-white rounded-lg transition-all font-medium"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="bg-[#1A1A1A] shadow-xl rounded-2xl p-6 md:p-8 border border-[#2A2A2A] min-h-full">
          <h1 className="text-3xl font-bold text-white mb-6 border-b border-[#2A2A2A] pb-2">
            {tabs.find((t) => t.id === activeTab)?.label || "Dashboard"}
          </h1>

          {/* Render the active child component */}
          {renderActiveComponent()}
        </div>
      </main>
    </div>
  );
};

export default UserDash;
