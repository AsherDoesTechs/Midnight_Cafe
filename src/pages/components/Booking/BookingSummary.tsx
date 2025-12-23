import { useState, useEffect } from "react";
import type { CartItem } from "../../../context/CartContext";
import { supabase } from "../../../libs/supabaseClient";

interface BookingData {
  name: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  bookingId?: number;
}

export default function BookingSummary() {
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const latestBooking = localStorage.getItem("latestBooking");
    const currentCart = localStorage.getItem("currentBookingCart");

    if (latestBooking) setBooking(JSON.parse(latestBooking));
    if (currentCart) setCart(JSON.parse(currentCart));
  }, []);

  const handleConfirmBooking = async () => {
    if (!booking) return;

    setIsSaving(true);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData?.user?.id ?? null;

      const { data, error } = await supabase
        .from("Bookings")
        .insert({
          user_id: userId,
          name: booking.name,
          email: booking.email,
          date: booking.date,
          time: booking.time,
          guests: booking.guests,
          cart: cart,
        })
        .select()
        .single();

      if (error) throw error;

      if (data && data.id) {
        setBooking({ ...booking, bookingId: data.id });
        localStorage.removeItem("latestBooking");
        localStorage.removeItem("currentBookingCart");
        alert("Booking confirmed! Thank you.");
      } else {
        throw new Error("Booking ID not returned from Supabase.");
      }
    } catch (err: any) {
      console.error("Error saving booking:", err);
      alert("Failed to save booking. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!booking?.bookingId) {
      alert("Booking ID not found. Cannot download PDF.");
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/api/booking-pdf/${booking.bookingId}`
      );

      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Booking-BKG-${booking.bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#D0C8B3] flex items-center justify-center">
        <p>No booking found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#D0C8B3] pt-24 px-6">
      <div className="max-w-3xl mx-auto bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center mb-4">Booking Summary</h2>

        <div className="space-y-2">
          <p>
            <span className="font-semibold">Name:</span> {booking.name}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {booking.email}
          </p>
          <p>
            <span className="font-semibold">Date:</span> {booking.date}
          </p>
          <p>
            <span className="font-semibold">Time:</span> {booking.time}
          </p>
          <p>
            <span className="font-semibold">Guests:</span> {booking.guests}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="text-2xl font-semibold mb-2">Cart Items</h3>
          {cart.length === 0 ? (
            <p className="text-[#B8B1A0]">Your cart is empty.</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-[#232323] p-4 rounded-lg border border-[#2A2A2A]"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-[#B8B1A0]">
                      ₱{item.price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-[#F1A7C5]">
                    ₱{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="mt-4 border-t border-[#2A2A2A] pt-4 flex justify-between items-center">
              <p className="text-xl font-semibold">Total:</p>
              <p className="text-xl font-bold text-[#F1A7C5]">
                ₱
                {cart.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                )}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleConfirmBooking}
            disabled={isSaving}
            className="flex-1 py-3 bg-[#F1A7C5] text-[#121212] rounded-lg font-semibold text-lg hover:bg-[#f3b3cd] transition-all disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Confirm Booking"}
          </button>

          {booking.bookingId && (
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isDownloading ? "Downloading..." : "📥 Download PDF"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
