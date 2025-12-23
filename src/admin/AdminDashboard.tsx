import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  BarChart3,
  Activity,
  LogOut,
  Circle,
} from "lucide-react";

import MenuManagement from "./MenuManagement";
import OrderManagement from "./OrderManagement";
import BookingCalendar from "./BookingCalendar";
import SalesAnalytics from "./SalesAnalytics";
import ActivityLogs from "./ActivityLogs";

import { supabase } from "../libs/supabaseClient";
import { useNavigate } from "react-router-dom";

const AdminDash: React.FC = () => {
  const [activeTab, setActiveTab] = useState("menu");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const tabs = [
    { id: "menu", label: "Menu Management", icon: LayoutDashboard },
    { id: "orders", label: "Order Management", icon: ClipboardList },
    { id: "calendar", label: "Booking Calendar", icon: CalendarDays },
    { id: "analytics", label: "Sales Analytics", icon: BarChart3 },
    { id: "activity", label: "User Activity Logs", icon: Activity },
  ];

  // --- Authentication Check on Mount ---
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        // Redirect if no valid session
        navigate("/admin-login");
      } else {
        // Optionally store the access token in localStorage if needed
        localStorage.setItem("adminToken", session.access_token);
        setLoading(false);
      }
    };
    checkSession();
  }, [navigate]);

  // --- Timer ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Logout Handler ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xl">Checking admin session...</div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-100 font-inter overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-neutral-900 text-gray-200 shadow-xl flex flex-col border-r border-neutral-800">
        {/* Profile */}
        <div className="p-6 border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center text-lg font-semibold">
              A
            </div>
            <div>
              <p className="text-white font-semibold">Admin User</p>
              <p className="text-gray-400 text-sm">System Administrator</p>
            </div>
          </div>
          <p className="mt-4 text-gray-400 text-sm">Current time:</p>
          <p className="text-white font-medium text-lg">{time}</p>
        </div>

        {/* Tabs */}
        <nav className="flex-1 overflow-y-auto mt-4 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-3 text-left text-base rounded-lg mx-3 mb-2 transition-all
                  ${
                    isActive
                      ? "bg-neutral-700 text-white shadow-md"
                      : "text-gray-400 hover:bg-neutral-800 hover:text-white"
                  }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <Circle size={10} className="text-green-400 fill-green-400" />
            <span className="text-gray-400 text-sm">System Online</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="bg-neutral-50 shadow-lg rounded-2xl p-6 md:p-8 border border-neutral-200 min-h-[90vh]">
          {activeTab === "menu" && <MenuManagement />}
          {activeTab === "orders" && <OrderManagement />}
          {activeTab === "calendar" && <BookingCalendar />}
          {activeTab === "analytics" && <SalesAnalytics />}
          {activeTab === "activity" && <ActivityLogs />}
        </div>
      </main>
    </div>
  );
};

export default AdminDash;
