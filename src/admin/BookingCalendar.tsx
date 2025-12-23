import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Home,
  Loader,
  AlertTriangle,
  Info,
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { supabase } from "../libs/supabaseClient";

// --- INTERFACES ---
interface BookingScheduleItem {
  id: number;
  combined_id: number;
  customer_name: string;
  space_name: string;
  space_id: number;
  start_time: string | null;
  end_time: string | null;
  status: "Confirmed" | "Cancelled" | "Completed" | "No Show" | "In Progress";
}

interface SpaceItem {
  id: number;
  title: string;
  capacity: number;
}

const BookingCalendar: React.FC = () => {
  const [schedule, setSchedule] = useState<BookingScheduleItem[]>([]);
  const [spaces, setSpaces] = useState<SpaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch Data from Supabase ---
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch Bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          `
          id,
          combined_id,
          customer_name,
          space_id,
          start_time,
          end_time,
          status,
          spaces:spaces(title)
        `
        )
        .order("start_time", { ascending: true });

      if (bookingsError) throw bookingsError;

      // Map bookings to include space_name
      const mappedBookings = (bookingsData || []).map((b: any) => ({
        ...b,
        space_name: b.spaces?.title || "Unknown",
      }));

      setSchedule(mappedBookings);

      // Fetch Spaces
      const { data: spacesData, error: spacesError } = await supabase
        .from("spaces")
        .select("*")
        .order("title", { ascending: true });

      if (spacesError) throw spacesError;

      setSpaces(spacesData || []);
    } catch (e: any) {
      console.error("Supabase fetch error:", e);
      setError(`Failed to load data: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Memoized Data ---
  const bookedDaysSet = useMemo(() => {
    const days = new Set<string>();
    schedule.forEach((booking) => {
      if (
        booking.start_time &&
        ["Confirmed", "In Progress"].includes(booking.status)
      ) {
        const date = new Date(booking.start_time);
        days.add(date.toISOString().split("T")[0]);
      }
    });
    return days;
  }, [schedule]);

  const occupiedSpacesCount = useMemo(() => {
    const now = new Date();
    const occupiedSpaceIds = new Set<number>();

    schedule.forEach((booking) => {
      const startTime = booking.start_time
        ? new Date(booking.start_time)
        : null;
      const endTime = booking.end_time ? new Date(booking.end_time) : null;

      if (
        ["Confirmed", "In Progress"].includes(booking.status) &&
        startTime &&
        endTime &&
        now >= startTime &&
        now < endTime
      ) {
        occupiedSpaceIds.add(booking.space_id);
      }
    });

    return occupiedSpaceIds.size;
  }, [schedule]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const dateString = date.toISOString().split("T")[0];
      if (bookedDaysSet.has(dateString)) return "has-bookings";
      return "no-bookings";
    }
    return null;
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const dateString = date.toISOString().split("T")[0];
      if (bookedDaysSet.has(dateString))
        return <div className="event-dot bg-red-500" />;
      const todayString = new Date().toISOString().split("T")[0];
      if (dateString >= todayString)
        return <div className="event-dot bg-green-500" />;
    }
    return null;
  };

  const handleDateClick = (value: any) => {
    if (!value || Array.isArray(value)) return;
    const date: Date = value;
    const dateString = date.toISOString().split("T")[0];

    if (bookedDaysSet.has(dateString)) {
      const eventsOnDay = schedule
        .filter((b) => b.start_time?.startsWith(dateString))
        .map(
          (b) =>
            `[${b.space_name}] Status: ${b.status} | Customer: ${b.customer_name}`
        );
      alert(`Bookings on ${dateString}:\n\n${eventsOnDay.join("\n")}`);
    } else {
      alert(`No Confirmed or Active bookings found on ${dateString}.`);
    }
  };

  const availableSpaces = spaces.length - occupiedSpacesCount;

  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-2 border-b pb-2">
        <CalendarIcon size={32} className="text-indigo-600" />
        Reservation Schedule Dashboard
      </h2>

      <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <Home size={18} className="text-indigo-600" />
          <span className="font-bold">Available Slots Now:</span>
          <span className="text-lg font-extrabold text-indigo-700">
            {loading
              ? "Loading..."
              : `${availableSpaces} / ${spaces.length} Available`}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-xl p-6 flex justify-center">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-96 text-indigo-600">
            <Loader size={32} className="animate-spin mb-3" />
            <p className="text-lg font-medium">
              Fetching real-time schedule data...
            </p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg w-full flex flex-col items-center justify-center gap-3">
            <AlertTriangle size={32} />
            <p className="font-bold text-xl">Data Fetching Error</p>
            <p className="font-medium max-w-lg text-sm">{error}</p>
          </div>
        ) : (
          <Calendar
            onChange={handleDateClick}
            tileClassName={tileClassName}
            tileContent={tileContent}
            className="react-calendar-override"
          />
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;
