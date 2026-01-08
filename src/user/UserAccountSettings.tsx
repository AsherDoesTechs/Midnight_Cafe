import { useState, useEffect } from "react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { LogOut, User, Settings, Loader2 } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

import { supabase } from "../libs/supabaseClient";

const UserAccountSettings: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // FIX: Modern Supabase uses getSession or getUser instead of auth.user()
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        toast.error("You must be logged in to access your profile.", {
          autoClose: 2000,
        });
        navigate("/login");
        return;
      }
      setUserId(user.id);

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
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) throw emailError;

      // Update display name in users table
      const { error: profileError } = await supabase
        .from("users")
        .update({ display_name: name })
        .eq("id", userId);

      if (profileError) throw profileError;

      toast.success("Profile updated successfully!");
    } catch (error: unknown) {
      // FIX: Handle error type safely instead of using 'any'
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile.";
      toast.error(errorMessage);
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

  if (loading && !userId) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#121212] text-[#F1A7C5]">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-[#D0C8B3]">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-[#D0C8B3] p-4">
      <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#2A2A2A] max-w-2xl w-full space-y-8 shadow-2xl">
        <h2 className="text-3xl font-bold border-b border-[#2A2A2A] pb-3 flex items-center gap-3">
          <Settings size={28} className="text-[#F1A7C5]" />
          Account Settings
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User size={20} /> Personal Details
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#F1A7C5] outline-none transition"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#F1A7C5] outline-none transition"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="bg-[#222] p-3 rounded-lg border border-[#333]">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                  Secure User ID
                </p>
                <p className="text-xs text-[#F1A7C5] font-mono break-all">
                  {userId}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#F1A7C5] text-[#121212] rounded-lg font-bold hover:bg-[#f3b3cd] transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          <div className="md:w-1/2 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <LogOut size={20} className="text-red-500" /> Session
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Logging out will end your current session on this device.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-900/20 border border-red-700/50 hover:bg-red-700 text-white rounded-lg font-bold transition-all"
            >
              Log Out Now
            </button>
          </div>
        </div>
      </div>

      <ToastContainer theme="dark" position="top-center" />
    </div>
  );
};

export default UserAccountSettings;
