// src/utils/booking.ts
import type { CartItem } from "../context/CartContext"; // type-only import

export interface Booking {
  name: string;
  email: string;
  message: string;
  cart: CartItem[];
  total: number;
  date: string;
}

export const saveBooking = (booking: Booking) => {
  // Basic validation
  if (!booking?.name || !booking?.email || !booking?.cart) {
    throw new Error("Invalid booking data");
  }

  // Parse existing bookings from localStorage safely
  let existing: Booking[] = [];
  try {
    const stored = localStorage.getItem("bookings");
    if (stored) {
      existing = JSON.parse(stored) as Booking[];
      if (!Array.isArray(existing)) existing = [];
    }
  } catch (error) {
    console.error(
      "Failed to parse existing bookings from localStorage:",
      error
    );
    existing = [];
  }

  existing.push(booking);
  localStorage.setItem("bookings", JSON.stringify(existing));
};
