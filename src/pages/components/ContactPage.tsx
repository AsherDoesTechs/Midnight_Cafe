import React, { useState } from "react";
import { toast } from "react-toastify";
import Header from "../components/Header";
import { Send, MapPin, Phone, Mail, Clock } from "lucide-react";
import { supabase } from "../../libs/supabaseClient";
// --- FormField Helper ---
const FormField: React.FC<
  React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> & {
    label: string;
    isTextArea?: boolean;
  }
> = ({ label, isTextArea = false, ...props }) => (
  <div>
    <label
      htmlFor={props.id || props.name}
      className="block text-sm font-medium text-[#D0C8B3] mb-2 text-left"
    >
      {label}
    </label>
    {isTextArea ? (
      <textarea
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        id={props.id || props.name}
        className="w-full p-3 rounded-lg bg-[#232323] border border-[#2A2A2A] text-[#D0C8B3] placeholder-[#777] focus:outline-none focus:ring-2 focus:ring-[#F1A7C5] transition-all resize-none"
        rows={5}
        required
      />
    ) : (
      <input
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        id={props.id || props.name}
        className="w-full p-3 rounded-lg bg-[#232323] border border-[#2A2A2A] text-[#D0C8B3] placeholder-[#777] focus:outline-none focus:ring-2 focus:ring-[#F1A7C5] transition-all"
        required
      />
    )}
  </div>
);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("contact_messages").insert([
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
      ]);

      if (error) throw error;

      toast.success("Message sent! We'll be in touch soon.", {
        position: "top-center",
        autoClose: 3000,
      });

      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#D0C8B3] pt-28 pb-20">
      <Header setIsCartOpen={() => {}} />{" "}
      {/* Pass a dummy function or real handler */}
      <div className="max-w-6xl mx-auto px-6">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-extrabold text-[#F1A7C5] tracking-tight mb-4">
            Connect with the Midnight Cafe
          </h1>
          <p className="text-xl text-[#B8B1A0] max-w-2xl mx-auto">
            Reach out for reservations, special requests, or just to say hello.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-10 shadow-2xl">
            <h2 className="text-3xl font-semibold text-[#D0C8B3] mb-8">
              Send a Direct Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                label="Your Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
              />
              <FormField
                label="Your Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
              <FormField
                label="Your Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what's on your mind..."
                isTextArea
              />
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-lg transition-all transform hover:scale-[1.01] ${
                  loading
                    ? "bg-[#666] text-[#A4A19A] cursor-not-allowed"
                    : "bg-[#F1A7C5] text-[#121212] hover:bg-[#f3b3cd]"
                }`}
              >
                {loading ? (
                  <>
                    <Clock className="animate-spin h-5 w-5" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info Panel */}
          <div className="p-6 md:p-8 space-y-8 bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-xl">
            <h2 className="text-3xl font-semibold text-[#D0C8B3] mb-4 border-b border-[#F1A7C5]/30 pb-3">
              Cafe Information
            </h2>

            <div className="flex items-start gap-4">
              <MapPin size={24} className="text-[#F1A7C5] mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold">Location</h3>
                <p className="text-[#B8B1A0]">
                  123 Midnight Cafe, Starfall City, Dreamscape District
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone size={24} className="text-[#F1A7C5] mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold">Call Us</h3>
                <p className="text-[#B8B1A0]">(123) 456-7890</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail size={24} className="text-[#F1A7C5] mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold">Email</h3>
                <p className="text-[#B8B1A0]">silentgrindyt@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock size={24} className="text-[#F1A7C5] mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold">Hours</h3>
                <p className="text-[#B8B1A0]">
                  Tuesday - Sunday: 6:00 PM - 2:00 AM
                </p>
                <p className="text-[#B8B1A0] italic text-sm">
                  Closed on Mondays
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
