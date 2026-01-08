import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Home,
  Loader,
  AlertTriangle,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { supabase } from "../libs/supabaseClient";

/* ===================== TYPES ===================== */
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

/* ===================== SUB-COMPONENTS ===================== */
const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
  <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-neutral-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-neutral-800">{value}</p>
        {subValue && (
          <p className="text-xs text-neutral-400 mt-1">{subValue}</p>
        )}
      </div>
    </div>
  </div>
);

/* ===================== MAIN COMPONENT ===================== */
const BookingCalendar: React.FC = () => {
  const [schedule, setSchedule] = useState<BookingScheduleItem[]>([]);
  const [spaces, setSpaces] = useState<SpaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dayEvents, setDayEvents] = useState<BookingScheduleItem[]>([]);

  /* 1. DATA FETCHING */
  const fetchData = useCallback(async () => {
    try {
      const { data: bData, error: bErr } = await supabase
        .from("bookings")
        .select(
          `id, combined_id, customer_name, space_id, start_time, end_time, status, spaces:spaces(title)`
        )
        .order("start_time", { ascending: true });

      if (bErr) throw bErr;
      setSchedule(
        (bData || []).map((b: any) => ({
          ...b,
          space_name: b.spaces?.title || "Unknown",
        }))
      );

      const { data: sData, error: sErr } = await supabase
        .from("spaces")
        .select("*");
      if (sErr) throw sErr;
      setSpaces(sData || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /* 2. REAL-TIME AUTO-SYNC */
  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("calendar_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  /* 3. MEMOIZED ANALYTICS */
  const analytics = useMemo(() => {
    const now = new Date();
    const occupied = new Set();
    const bookedDays = new Set();

    schedule.forEach((b) => {
      const start = b.start_time ? new Date(b.start_time) : null;
      const end = b.end_time ? new Date(b.end_time) : null;

      if (["Confirmed", "In Progress"].includes(b.status) && start) {
        bookedDays.add(start.toISOString().split("T")[0]);
        if (end && now >= start && now < end) occupied.add(b.space_id);
      }
    });

    return {
      bookedDays,
      occupiedCount: occupied.size,
      totalBookings: schedule.filter((s) => s.status === "Confirmed").length,
    };
  }, [schedule]);

  /* 4. EVENT HANDLERS */
  const handleDateChange = (value: any) => {
    const date = value as Date;
    setSelectedDate(date);
    const dateStr = date.toISOString().split("T")[0];
    const filtered = schedule.filter((b) => b.start_time?.startsWith(dateStr));
    setDayEvents(filtered);
  };

  // UI Helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-neutral-50 text-neutral-600 border-neutral-100";
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-neutral-500 font-medium italic">
          Syncing live schedule...
        </p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-neutral-100 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
            <CalendarIcon size={32} className="text-indigo-600" />
            Booking Schedule
          </h2>
          <p className="text-neutral-500 font-medium">
            Manage and track space occupancy in real-time
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
            Live Feed
          </span>
        </div>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Availability"
          value={`${spaces.length - analytics.occupiedCount} / ${
            spaces.length
          }`}
          icon={Home}
          color="bg-indigo-600"
          subValue="Available Spaces Now"
        />
        <StatCard
          title="Pending Bookings"
          value={analytics.totalBookings}
          icon={Activity}
          color="bg-emerald-500"
          subValue="Confirmed Reservations"
        />
        <StatCard
          title="Daily Occupancy"
          value={dayEvents.length}
          icon={Clock}
          color="bg-orange-500"
          subValue={`For ${selectedDate.toDateString()}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CALENDAR MAIN */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileContent={({ date, view }) => {
              if (
                view === "month" &&
                analytics.bookedDays.has(date.toISOString().split("T")[0])
              ) {
                return (
                  <div className="mx-auto mt-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                );
              }
              return null;
            }}
            className="w-full border-none font-sans"
          />
        </div>

        {/* DETAILS SIDE PANEL */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-neutral-50 bg-neutral-50/50 flex justify-between items-center">
              <h3 className="font-bold text-neutral-800 flex items-center gap-2">
                <Clock size={18} className="text-indigo-600" />
                Schedule for {selectedDate.toLocaleDateString()}
              </h3>
              <span className="text-[10px] bg-white px-2 py-1 rounded-md border font-bold text-neutral-400">
                {dayEvents.length} EVENTS
              </span>
            </div>

            <div className="divide-y divide-neutral-50 max-h-[500px] overflow-y-auto">
              {dayEvents.length > 0 ? (
                dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-5 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-neutral-800 text-sm">
                          {event.customer_name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                          <MapPin size={12} /> {event.space_name}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 bg-neutral-50 p-2 rounded-lg">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {event.start_time
                          ? new Date(event.start_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--:--"}
                      </div>
                      <div className="h-px flex-1 bg-neutral-200 mx-3" />
                      <div>
                        {event.end_time
                          ? new Date(event.end_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--:--"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="bg-neutral-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-neutral-300" />
                  </div>
                  <p className="text-sm font-bold text-neutral-400">
                    No events scheduled for this day
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
