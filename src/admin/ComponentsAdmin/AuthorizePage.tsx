import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  ShieldAlert,
  Loader2,
  ArrowRight,
  User,
} from "lucide-react";
import { supabase } from "../../libs/supabaseClient";

export default function AuthorizePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const qrId = searchParams.get("id");

  const [status, setStatus] = useState<
    "verifying" | "ready" | "success" | "error" | "unauthorized"
  >("verifying");
  const [activeUserEmail, setActiveUserEmail] = useState<string | null>(null);

  // THE ONLY EMAIL ALLOWED TO AUTHORIZE LOGINS
  const ADMIN_EMAIL = "funfacts.trend@gmail.com";

  useEffect(() => {
    const checkIdentity = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Not logged in at all? Go to login page.
        navigate("/admin-login");
        return;
      }

      const userEmail = session.user.email;
      setActiveUserEmail(userEmail ?? "");

      // STRICT CHECK: Is the logged-in user the actual owner?
      if (userEmail !== ADMIN_EMAIL) {
        setStatus("unauthorized");
      } else {
        setStatus("ready");
      }
    };

    if (qrId) checkIdentity();
    else setStatus("error");
  }, [qrId, navigate]);

  const handleApprove = async () => {
    if (status !== "ready" || !qrId) return;
    setStatus("verifying");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { error } = await supabase
        .from("qr_logins")
        .update({
          status: "authorized",
          auth_token: session?.access_token,
        })
        .eq("id", qrId);

      if (error) throw error;
      setStatus("success");
      setTimeout(() => navigate("/admin"), 2000);
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#333] w-full max-w-sm shadow-2xl">
        {/* CASE 1: WRONG ACCOUNT LOGGED IN */}
        {status === "unauthorized" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <ShieldAlert className="text-orange-500 mx-auto mb-4" size={50} />
            <h2 className="text-xl font-bold mb-2">Wrong Account</h2>
            <p className="text-gray-400 text-sm mb-6">
              You are logged in as{" "}
              <span className="text-white">{activeUserEmail}</span>. Only{" "}
              <span className="text-pink-400">{ADMIN_EMAIL}</span> can authorize
              this computer.
            </p>
            <button
              onClick={() =>
                supabase.auth.signOut().then(() => navigate("/admin-login"))
              }
              className="text-pink-400 text-sm font-semibold underline"
            >
              Switch to Admin Account
            </button>
          </div>
        )}

        {/* CASE 2: CORRECT ACCOUNT - READY TO AUTHORIZE */}
        {status === "ready" && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="bg-pink-400/20 p-4 rounded-full">
                  <User className="text-pink-400" size={40} />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-[#1A1A1A]"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Authorize Computer?</h2>
            <p className="text-gray-400 text-sm mb-8 px-2">
              Confirming will log you into the admin dashboard on the other
              device as
              <span className="block text-white font-semibold mt-1">
                {ADMIN_EMAIL}
              </span>
            </p>
            <button
              onClick={handleApprove}
              className="w-full bg-pink-400 text-black p-4 rounded-xl font-bold hover:bg-pink-300 transition flex items-center justify-center gap-2"
            >
              Yes, Authorize <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* LOADING & SUCCESS STATES (Same as before) */}
        {status === "verifying" && (
          <Loader2 className="animate-spin text-pink-400 mx-auto" size={48} />
        )}
        {status === "success" && (
          <div>
            <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold">Authorized!</h2>
            <p className="text-gray-400 mt-2">Check your computer screen.</p>
          </div>
        )}
      </div>
    </div>
  );
}
