// src/user/UpgradePrompt.tsx

import React from "react";
import { Sparkles, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UpgradePrompt: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-8 text-center min-h-[50vh] bg-[#232323] rounded-xl border border-[#2A2A2A]">
      <Sparkles size={48} className="text-[#F1A7C5]" />
      <h2 className="text-3xl font-bold text-white">
        Establish Residency: Unlock Permanent Memory
      </h2>
      <p className="text-[#D0C8B3] max-w-2xl">
        As a **Wanderer**, your memories fade with the dawn. To secure your
        data, save your favorites, and access your full order archives, you must
        **Establish Residency** via a Magic Link.
      </p>

      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={() => navigate("/login")} // Navigate to your sign-up/login page
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F1A7C5] text-[#121212] font-semibold rounded-lg hover:bg-[#f3b3cd] transition-colors shadow-lg"
        >
          <Mail size={20} />
          Get Magic Link
        </button>
        <button
          onClick={() => alert("Learn more about Resident perks!")}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-[#F1A7C5] text-[#F1A7C5] font-semibold rounded-lg hover:bg-[#121212] transition-colors"
        >
          <Lock size={20} />
          View Resident Perks
        </button>
      </div>
    </div>
  );
};

export default UpgradePrompt;
