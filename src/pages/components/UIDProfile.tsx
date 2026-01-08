// src/user/UIDProfile.tsx
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";

interface UserData {
  recentBuys: string[];
  favorites: string[];
}

const UIDProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    recentBuys: [],
    favorites: [],
  });

  // Fetch user-specific data from backend
  useEffect(() => {
    if (!user) return; // ProtectedRoute ensures user exists

    const fetchUserData = async () => {
      try {
        // TODO: Replace these with real API calls:
        // Example:
        // const resRecent = await fetch(`/api/users/${user.id}/recent-buys`);
        // const recentBuys = await resRecent.json();
        // const resFavs = await fetch(`/api/users/${user.id}/favorites`);
        // const favorites = await resFavs.json();

        // Simulated data for now
        setUserData({
          recentBuys: ["Fetched Item 1", "Fetched Item 2"],
          favorites: ["Fetched Favorite A", "Fetched Favorite B"],
        });
      } catch {
        toast.error("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    await logout(); // Clears user in context
    toast.success("Logged out successfully.", { autoClose: 2000 });
  };

  const handleUpdateProfile = async () => {
    try {
      // TODO: Call backend to update profile
      toast.success("Profile updated successfully!", { autoClose: 2000 });
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-[#D0C8B3]">
      <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#2A2A2A] max-w-md w-full space-y-6">
        <h2 className="text-2xl font-bold mb-6">
          Welcome, {user?.displayName || user?.email} (ID: {user?.id}, Role:{" "}
          {user?.role})
        </h2>

        {user?.email && <p>Email: {user.email}</p>}

        <div>
          <h3 className="font-semibold mt-4">Recent Buys:</h3>
          <ul className="list-disc ml-5">
            {userData.recentBuys.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mt-4">Favorites:</h3>
          <ul className="list-disc ml-5">
            {userData.favorites.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleUpdateProfile}
            className="w-1/2 py-3 bg-[#F1A7C5] text-[#121212] rounded-lg font-semibold hover:bg-[#f3b3cd] transition-all"
          >
            Update Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-1/2 py-3 bg-[#F1A7C5] text-[#121212] rounded-lg font-semibold hover:bg-[#f3b3cd] transition-all"
          >
            Logout
          </button>
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

export default UIDProfile;
