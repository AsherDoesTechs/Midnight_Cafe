import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, AlertCircle, Loader } from "lucide-react";
import { supabase } from "../libs/supabaseClient";

export default function AdminAuthorize() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const qrId = searchParams.get("id");

  const [status, setStatus] = useState<
    "verifying" | "ready" | "success" | "error"
  >("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("You must be logged in on this device to authorize access.");
        setStatus("error");
        return;
      }

      if (!qrId) {
        setError("Invalid authorization link.");
        setStatus("error");
        return;
      }

      setStatus("ready");
    }
    checkSession();
  }, [qrId]);

  const handleAuthorize = async () => {
    setStatus("verifying");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Update the QR login entry with the mobile user's token
      const { error: updateError } = await supabase
        .from("qr_logins")
        .update({
          status: "authorized",
          auth_token: session?.access_token,
          authorized_at: new Date().toISOString(),
        })
        .eq("id", qrId);

      if (updateError) throw updateError;

      setStatus("success");
      // Auto-close or redirect after 3 seconds
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError("Authorization failed. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-[#1A1A1A] border border-[#333] rounded-3xl p-8 shadow-2xl">
        {status === "verifying" && (
          <div className="space-y-4">
            <Loader className="animate-spin mx-auto text-pink-400" size={48} />
            <p className="text-gray-400">Verifying security context...</p>
          </div>
        )}

        {status === "ready" && (
          <div className="space-y-6">
            <div className="bg-pink-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-pink-400" size={40} />
            </div>
            <h1 className="text-2xl font-bold">Authorize Login?</h1>
            <p className="text-gray-400">
              A new device is requesting access to the Admin Dashboard.
            </p>
            <button
              onClick={handleAuthorize}
              className="w-full bg-pink-400 text-black py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-pink-300 transition-all active:scale-95"
            >
              APPROVE ACCESS
            </button>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Lock className="text-emerald-400" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-emerald-400">Authorized</h2>
            <p className="text-gray-400">
              The desktop terminal has been granted access.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <AlertCircle className="mx-auto text-red-500" size={48} />
            <p className="text-red-400 font-medium">{error}</p>
            <button
              onClick={() => navigate("/admin/login")}
              className="text-sm text-gray-500 underline"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
