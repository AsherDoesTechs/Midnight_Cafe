import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  QrCode,
  Mail,
  Lock as LockIcon,
  ArrowLeft,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../libs/supabaseClient";

export default function AdminLogin() {
  const navigate = useNavigate();

  // UI States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQrMode, setShowQrMode] = useState(false);

  // QR Login States
  const [qrId, setQrId] = useState<string | null>(null);

  // --- QR REALTIME LOGIC ---
  const startQrLogin = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Housekeeping: Delete expired codes (> 5 mins old)
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      await supabase.from("qr_logins").delete().lt("created_at", fiveMinsAgo);

      // 2. Create a new handshake record
      const { data, error: insertError } = await supabase
        .from("qr_logins")
        .insert([{}])
        .select()
        .single();

      if (insertError) throw insertError;
      setQrId(data.id);

      // 3. Listen for the phone to authorize this specific ID
      const channel = supabase
        .channel(`qr-login-${data.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "qr_logins",
            filter: `id=eq.${data.id}`,
          },
          (payload) => {
            if (payload.new.status === "authorized") {
              // Phone authorized! Manual session set
              localStorage.setItem("adminToken", payload.new.auth_token);
              // Clean up and navigate
              supabase.removeChannel(channel);
              navigate("/admin");
            }
          }
        )
        .subscribe();
    } catch (err: any) {
      setError("Failed to generate QR code. Try password login.");
    } finally {
      setLoading(false);
    }
  };

  // --- STANDARD LOGIN LOGIC ---
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError || !data.session) {
        setError("Invalid email or password.");
      } else {
        localStorage.setItem("adminToken", data.session.access_token);
        navigate("/admin");
      }
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER: GENERATE SCANABLE URL ---
  const getQrValue = () => {
    if (!qrId) return "";

    // If you are on localhost, this window.location.origin will be "http://localhost:5173"
    // BUT if you opened the site via your IP (http://192.168.x.x:5173), it will use that IP!
    // This is the best way to ensure the phone can "see" the computer.
    const baseUrl = window.location.origin;
    return `${baseUrl}/admin/authorize?id=${qrId}`;
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white p-4">
      <div className="bg-[#1A1A1A] p-8 md:p-10 rounded-2xl w-full max-w-sm border border-[#333] shadow-2xl">
        <h2 className="text-3xl font-bold mb-2 text-center">Admin Access</h2>
        <p className="text-gray-400 text-sm text-center mb-8">
          {showQrMode
            ? "Scan with your logged-in phone"
            : "Enter your credentials"}
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 text-sm text-red-100 bg-red-900/50 rounded-lg border border-red-600">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!showQrMode ? (
          /* PASSWORD FORM */
          <form onSubmit={handlePasswordLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 ml-1">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-500"
                  size={18}
                />
                <input
                  type="email"
                  className="w-full pl-10 p-3 rounded-xl bg-[#222] border border-[#333] focus:border-pink-400 outline-none transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <LockIcon
                  className="absolute left-3 top-3 text-gray-500"
                  size={18}
                />
                <input
                  type="password"
                  className="w-full pl-10 p-3 rounded-xl bg-[#222] border border-[#333] focus:border-pink-400 outline-none transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-400 text-black p-3.5 rounded-xl hover:bg-pink-300 transition font-bold disabled:opacity-50 mt-2"
            >
              {loading ? "Verifying..." : "Log In"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowQrMode(true);
                startQrLogin();
              }}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition mt-4"
            >
              <QrCode size={16} /> Login with QR Code
            </button>
          </form>
        ) : (
          /* QR CODE MODE */
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="bg-white p-4 rounded-2xl mb-6 shadow-[0_0_20px_rgba(241,167,197,0.3)]">
              {qrId ? (
                <QRCodeSVG value={getQrValue()} size={180} level="H" />
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-400 text-center mb-6 px-4">
              Open the authorize page on your phone to confirm.
            </p>

            <button
              onClick={() => setShowQrMode(false)}
              className="flex items-center gap-2 text-gray-500 hover:text-white transition text-sm"
            >
              <ArrowLeft size={16} /> Back to Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
