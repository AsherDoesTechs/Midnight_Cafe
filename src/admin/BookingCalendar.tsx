import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Home,
  Loader,
  Clock,
  MapPin,
  Activity,
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { supabase } from "../libs/supabaseClient";

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

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  subValue?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  subValue,
}: StatCardProps) => (
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

const BookingCalendar: React.FC = () => {
  const [schedule, setSchedule] = useState<BookingScheduleItem[]>([]);
  const [spaces, setSpaces] = useState<SpaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dayEvents, setDayEvents] = useState<BookingScheduleItem[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const { data: bData, error: bErr } = await supabase
        .from("bookings")
        .select(
          `id, combined_id, customer_name, space_id, start_time, end_time, status, spaces:spaces(title)`
        )
        .order("start_time", { ascending: true });

      if (bErr) throw bErr;

      const formatted = (bData || []).map((b: any) => ({
        ...b,
        space_name: b.spaces?.title || "Unknown",
      })) as BookingScheduleItem[];

      setSchedule(formatted);

      const { data: sData, error: sErr } = await supabase
        .from("spaces")
        .select("*");
      if (sErr) throw sErr;
      setSpaces(sData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleDateChange = (value: any) => {
    const date = value as Date;
    setSelectedDate(date);
    const dateStr = date.toISOString().split("T")[0];
    setDayEvents(schedule.filter((b) => b.start_time?.startsWith(dateStr)));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end border-b pb-6">
        <h2 className="text-3xl font-extrabold flex items-center gap-3">
          <CalendarIcon size={32} /> Booking Schedule
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Availability"
          value={`${spaces.length - analytics.occupiedCount} / ${
            spaces.length
          }`}
          icon={Home}
          color="bg-indigo-600"
        />
        <StatCard
          title="Confirmed"
          value={analytics.totalBookings}
          icon={Activity}
          color="bg-emerald-500"
        />
        <StatCard
          title="Day Events"
          value={dayEvents.length}
          icon={Clock}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileContent={({ date, view }) =>
              view === "month" &&
              analytics.bookedDays.has(date.toISOString().split("T")[0]) ? (
                <div className="mx-auto mt-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              ) : null
            }
          />
        </div>
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="p-5 bg-neutral-50 font-bold border-b">
              Events for {selectedDate.toDateString()}
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {dayEvents.length > 0 ? (
                dayEvents.map((event) => (
                  <div key={event.id} className="p-5">
                    <div className="font-bold">{event.customer_name}</div>
                    <div className="text-xs text-neutral-500">
                      <MapPin size={12} className="inline" /> {event.space_name}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-neutral-400">
                  No events
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
