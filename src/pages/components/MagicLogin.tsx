import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { supabase } from "../../libs/supabaseClient";

export default function MagicLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsLoading(true);

    try {
      // Supabase passwordless login
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Optional: redirect URL after login
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      setSent(true);
      toast.success(`Magic link sent to ${email}. Check your email!`);
    } catch (error) {
      console.error("Error sending magic link:", error);
      toast.error("Failed to send magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-[#D0C8B3]">
      <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#2A2A2A] max-w-md w-full">
        {!sent ? (
          <>
            <h2 className="text-2xl font-bold mb-6">Login with Email</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#232323] border border-[#2A2A2A] text-[#D0C8B3]"
                required
                disabled={isLoading}
              />
              <button
                type="submit"
                className="w-full py-3 bg-[#F1A7C5] text-[#121212] rounded-lg font-semibold hover:bg-[#f3b3cd] transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          </>
        ) : (
          <div>
            <p className="mb-4">
              A magic link has been sent to <strong>{email}</strong>. Please
              check your inbox.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-[#D0C8B3] text-[#121212] rounded-lg font-semibold hover:bg-[#B8B1A0] transition-all"
            >
              Back to Login Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
