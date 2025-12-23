import React from "react";

export default function BookingSummary() {
  const booking = localStorage.getItem("latestBooking");

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#D0C8B3] flex justify-center items-center">
        <p className="text-xl">No booking found.</p>
      </div>
    );
  }

  const data = JSON.parse(booking);

  return (
    <div className="min-h-screen bg-[#121212] text-[#D0C8B3] pt-28 px-6">
      <div className="max-w-lg mx-auto bg-[#1A1A1A] border border-[#2A2A2A] p-8 rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#D0C8B3]">
          Booking Summary
        </h2>

        <div className="space-y-3 text-lg">
          <p>
            <strong>Name:</strong> {data.name}
          </p>
          <p>
            <strong>Email:</strong> {data.email}
          </p>
          <p>
            <strong>Date:</strong> {data.date}
          </p>
          <p>
            <strong>Time:</strong> {data.time}
          </p>
          <p>
            <strong>Guests:</strong> {data.guests}
          </p>
        </div>
      </div>
    </div>
  );
}
