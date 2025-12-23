import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { supabase } from "../../libs/supabaseClient";

const isValidLoginIdentifier = (identifier: string) =>
  identifier.trim().length > 0;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const redirectTo = location.state?.from || "/booking";

  const handleSuccess = (name?: string) => {
    toast.success(`Welcome${name ? `, ${name}` : ""}!`, {
      onClose: () => navigate(redirectTo, { replace: true }),
    });
  };

  // -------------------------------
  // 🔐 Email + Password login
  // -------------------------------
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidLoginIdentifier(email) || password.length === 0) {
      toast.error("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    handleSuccess(data.user?.user_metadata?.displayName || data.user?.email);
  };

  // -------------------------------
  // ✨ Magic link login
  // -------------------------------
  const handleMagicLinkRequest = async () => {
    if (!isValidLoginIdentifier(email)) {
      toast.error("Please enter your email.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + redirectTo,
      },
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSent(true);
    toast.success("Magic login link sent! Check your email.");
  };

  // -------------------------------
  // 👤 Guest / Anonymous login
  // -------------------------------
  const handleGuestLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInAnonymously();

    setIsLoading(false);

    if (error) {
      toast.error("Failed to start guest session.");
      return;
    }

    handleSuccess(data.user?.user_metadata?.displayName || "Guest");
  };

  // -------------------------------------------------
  // UI (unchanged visually)
  // -------------------------------------------------
  return (
    <div className="min-h-screen flex items-center mt-7 pt-7 justify-center bg-[#121212] text-[#D0C8B3] px-6">
      <div className="bg-[#1A1A1A] p-8 sm:p-10 rounded-xl max-w-3xl w-full space-y-8 border border-[#2A2A2A]">
        {!sent ? (
          <>
            <h2 className="text-3xl font-bold text-center">Login</h2>

            <form
              onSubmit={handlePasswordLogin}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end"
            >
              <div>
                <label>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#232323]"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#232323]"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="md:col-span-2 py-3 bg-[#F1A7C5] rounded-lg"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={handleMagicLinkRequest}
                disabled={isLoading}
                className="py-3 w-full bg-[#3A3A3A] rounded-lg"
              >
                Send Magic Link
              </button>
            </div>

            <div className="text-center pt-4 border-t">
              <button
                onClick={handleGuestLogin}
                disabled={isLoading}
                className="py-3 w-full bg-[#D0C8B3] text-black rounded-lg"
              >
                Continue as Guest
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Link Sent</h2>
            <p>Check your email ({email}) for the magic login link.</p>
          </div>
        )}
      </div>
    </div>
  );
}
