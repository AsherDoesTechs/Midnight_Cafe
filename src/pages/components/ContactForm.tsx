import React, { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { saveBooking } from "../../utils/Bookings";
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css"; // Ensure CSS is included

export default function ContactForm() {
  const cartContext = useContext(CartContext);
  if (!cartContext) return null;

  const { cart, clearCart, totalPrice } = cartContext;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const booking = {
        name,
        email,
        message,
        cart,
        total: totalPrice(),
        date: new Date().toISOString(),
      };
      await saveBooking(booking);
      clearCart();
      setName("");
      setEmail("");
      setMessage("");

      toast.success("Booking saved successfully!", {
        autoClose: 4000,
      });
    } catch (error) {
      toast.error("Something went wrong. Please try again.", {
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 max-w-lg mx-auto relative">
      <h3 className="text-2xl font-semibold text-[#D0C8B3] mb-6">
        Send Us a Message
      </h3>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-lg bg-[#232323] border border-[#2A2A2A] text-[#D0C8B3] placeholder-[#777] focus:border-[#F1A7C5] outline-none"
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-[#232323] border border-[#2A2A2A] text-[#D0C8B3] placeholder-[#777] focus:border-[#F1A7C5] outline-none"
        />
        <textarea
          placeholder="Your Message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 rounded-lg bg-[#232323] border border-[#2A2A2A] text-[#D0C8B3] placeholder-[#777] focus:border-[#F1A7C5] outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-[#121212] font-semibold text-lg ${
            loading
              ? "bg-[#f1a7c5] cursor-not-allowed"
              : "bg-[#F1A7C5] hover:bg-[#f3b3cd]"
          } transition-all`}
        >
          {loading ? "Sending..." : "Send Message / Save Booking"}
        </button>
      </form>
    </div>
  );
}
