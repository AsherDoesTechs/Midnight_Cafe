import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { LogOut, User, Settings } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

import { supabase } from "../libs/supabaseClient"; // your Supabase client import

const UserAccountSettings: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = supabase.auth.user();
      if (!user) {
        toast.error("You must be logged in to access your profile.", {
          autoClose: 2000,
        });
        navigate("/login");
        return;
      }
      setUserId(user.id);

      // Fetch profile from "users" table
      const { data, error } = await supabase
        .from("users")
        .select("display_name, email")
        .eq("id", user.id)
        .single();

      if (error) {
        toast.error("Failed to load user profile");
        setLoading(false);
        return;
      }

      setName(data.display_name || "");
      setEmail(data.email || "");
      setLoading(false);
    };

    fetchUserProfile();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);

    try {
      // Update email in Supabase Auth
      const { error: emailError } = await supabase.auth.update({ email });
      if (emailError) throw emailError;

      // Update display name in users table
      const { error: profileError } = await supabase
        .from("users")
        .update({ display_name: name })
        .eq("id", userId);

      if (profileError) throw profileError;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully.", {
      autoClose: 2000,
      onClose: () => navigate("/login"),
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#121212] text-white">
        <p>Loading user profile and settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-[#D0C8B3]">
      <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#2A2A2A] max-w-2xl w-full space-y-8 shadow-2xl">
        <h2 className="text-3xl font-bold border-b border-[#2A2A2A] pb-3 flex items-center gap-3">
          <Settings size={28} className="text-[#F1A7C5]" />
          Account Settings & Profile
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User size={20} /> Personal Details
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#D0C8B3]"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-[#222] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:border-[#F1A7C5] focus:ring-1 focus:ring-[#F1A7C5] transition"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#D0C8B3]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-[#222] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:border-[#F1A7C5] focus:ring-1 focus:ring-[#F1A7C5] transition"
                  placeholder="JuanDelaCruz@gmail.com"
                  required
                />
              </div>

              <p className="text-sm text-gray-500 pt-2">
                User ID:{" "}
                <span className="text-[#F1A7C5] font-mono">{userId}</span>
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#F1A7C5] text-[#121212] rounded-lg font-bold tracking-wide hover:bg-[#f3b3cd] transition-all mt-4 disabled:opacity-50"
              >
                Save Changes
              </button>
            </form>
          </div>

          <div className="md:w-1/2 space-y-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <LogOut size={20} className="text-red-500" /> Session Management
            </h3>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold tracking-wide transition-all"
            >
              Log Out Now
            </button>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        theme="dark"
      />
    </div>
  );
};

export default UserAccountSettings;
