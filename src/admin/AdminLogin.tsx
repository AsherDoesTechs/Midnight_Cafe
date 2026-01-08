import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, QrCode, ArrowLeft, Loader } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../libs/supabaseClient";
// Import the RealtimeChannel type from Supabase
import type { RealtimeChannel } from "@supabase/supabase-js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQrMode, setShowQrMode] = useState(false);
  const [qrId, setQrId] = useState<string | null>(null);

  // FIX: Replaced <any> with <RealtimeChannel | null>
  const [activeChannel, setActiveChannel] = useState<RealtimeChannel | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (activeChannel) supabase.removeChannel(activeChannel);
    };
  }, [activeChannel]);

  const startQrLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      await supabase.from("qr_logins").delete().lt("created_at", fiveMinsAgo);

      const { data, error: insertError } = await supabase
        .from("qr_logins")
        .insert([{}])
        .select()
        .single();

      if (insertError) throw insertError;
      setQrId(data.id);

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
            if (
              payload.new &&
              "status" in payload.new &&
              payload.new.status === "authorized"
            ) {
              localStorage.setItem("adminToken", payload.new.auth_token);
              navigate("/admin");
            }
          }
        )
        .subscribe();

      setActiveChannel(channel);
    } catch {
      setError("Failed to generate QR code. Try password login.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        { email, password }
      );
      if (authError || !data.session) {
        setError("Invalid email or password.");
      } else {
        localStorage.setItem("adminToken", data.session.access_token);
        navigate("/admin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const getQrValue = () =>
    qrId ? `${window.location.origin}/admin/authorize?id=${qrId}` : "";

  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white p-4">
      <div className="bg-[#1A1A1A] p-8 md:p-10 rounded-2xl w-full max-w-sm border border-[#333] shadow-2xl">
        <h2 className="text-3xl font-bold mb-2 text-center">Admin Access</h2>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 text-sm text-red-100 bg-red-900/50 rounded-lg border border-red-600">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!showQrMode ? (
          <form onSubmit={handlePasswordLogin} className="space-y-5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#222] border border-[#333] outline-none focus:border-pink-400 transition-colors"
              required
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#222] border border-[#333] outline-none focus:border-pink-400 transition-colors"
              required
              placeholder="Password"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-400 hover:bg-pink-500 text-black p-3.5 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Log In"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowQrMode(true);
                startQrLogin();
              }}
              className="w-full text-sm text-gray-400 mt-4 flex items-center justify-center gap-2 hover:text-white transition-colors"
            >
              <QrCode size={16} /> QR Login
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl mb-6">
              {qrId ? (
                <QRCodeSVG value={getQrValue()} size={180} />
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center">
                  <Loader className="animate-spin text-pink-500" size={32} />
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setShowQrMode(false);
                if (activeChannel) supabase.removeChannel(activeChannel);
              }}
              className="text-gray-500 hover:text-white flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
