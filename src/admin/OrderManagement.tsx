import * as React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Clock,
  CheckCircle,
  Users,
  BookOpen,
  Utensils,
  Zap,
  List,
  Search,
  Timer,
  AlertCircle,
  Loader,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../libs/supabaseClient";

/* ===================== TYPES ===================== */
interface FoodItem {
  name: string;
  quantity: number;
  price: number;
}
interface BookingDetails {
  space_name: string;
  duration_hours: number;
  notes: string;
  student_id?: string;
  customer_name?: string;
}

type GrantStatus =
  | "Pending"
  | "Confirmed"
  | "Granted"
  | "Expired"
  | "Cancelled";
type OrderStatus = "Pending" | "Preparing" | "Completed" | "Cancelled";

interface Order {
  id: number;
  order_id: number | null;
  booking_id: string | null;
  total_amount: number;
  type: "Food" | "Booking" | "Combined";
  status: OrderStatus;
  payment_status: string;
  grant_status?: GrantStatus | null;
  food_items?: FoodItem[] | null;
  booking_details?: BookingDetails | null;
  actual_start_time?: string | null;
  scheduled_end_time?: string | null;
  order_date: string;
}

/* ===================== SUB-COMPONENTS ===================== */
const KPICard = ({ title, value, icon: Icon, color, subValue }: any) => (
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
const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<Record<number, number>>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + "h " : ""}${m}m ${s}s`;
  };

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("combined_orders")
        .select("*")
        .order("order_date", { ascending: false });

      if (error) throw error;
      setOrders((data as unknown as Order[]) ?? []);
    } catch (err: any) {
      toast.error("Sync Error");
    } finally {
      setLoading(false);
    }
  }, []);

  /* 1. REAL-TIME & TIMERS */
  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel("order_monitor")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "combined_orders" },
        () => fetchOrders()
      )
      .subscribe();

    const timer = setInterval(() => {
      const now = Date.now();
      const updated: Record<number, number> = {};
      orders.forEach((order) => {
        if (order.grant_status === "Granted" && order.scheduled_end_time) {
          const end = new Date(order.scheduled_end_time).getTime();
          updated[order.id] = Math.max(0, Math.floor((end - now) / 1000));
        }
      });
      setTimeRemaining(updated);
    }, 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [orders, fetchOrders]);

  /* 2. ANALYTICS MEMO */
  const stats = useMemo(
    () => ({
      activeSessions: orders.filter((o) => o.grant_status === "Granted").length,
      pendingFood: orders.filter(
        (o) => o.type !== "Booking" && o.status === "Pending"
      ).length,
      totalToday: orders.length,
    }),
    [orders]
  );

  /* 3. PERMISSION ACTIONS */
  const handleGrantAccess = async (id: number) => {
    const { error } = await supabase
      .from("combined_orders")
      .update({
        grant_status: "Granted",
        actual_start_time: new Date().toISOString(),
      })
      .eq("id", id);
    if (!error) toast.success("Access Granted & Timer Started");
  };

  const updateOrderStatus = async (id: number, status: OrderStatus) => {
    const { error } = await supabase
      .from("combined_orders")
      .update({ status })
      .eq("id", id);
    if (!error) toast.info(`Order moved to ${status}`);
  };

  const handleEndSession = async (id: number) => {
    const { error } = await supabase
      .from("combined_orders")
      .update({ grant_status: "Expired", status: "Completed" })
      .eq("id", id);
    if (!error) toast.warning("Session Terminated");
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-neutral-500 font-medium">Syncing order status...</p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            F&B and Space Control
          </h2>
          <p className="text-neutral-500 font-medium italic text-sm flex items-center gap-2">
            <Zap size={14} className="text-amber-500 fill-amber-500" /> Managing
            permissions and kitchen queue
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border p-1.5 rounded-xl shadow-sm">
            <Search size={16} className="text-neutral-400 ml-2" />
            <input
              placeholder="Search ID or Customer..."
              className="text-sm font-medium outline-none bg-transparent w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={fetchOrders}
            className="p-2 bg-white border rounded-xl hover:bg-neutral-50 transition shadow-sm"
          >
            <RefreshCcw size={18} className="text-neutral-400" />
          </button>
        </div>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Live Sessions"
          value={stats.activeSessions}
          icon={Timer}
          color="bg-indigo-600"
          subValue="Access Granted"
        />
        <KPICard
          title="Kitchen Queue"
          value={stats.pendingFood}
          icon={Utensils}
          color="bg-orange-500"
          subValue="Unstarted Orders"
        />
        <KPICard
          title="Total Orders"
          value={stats.totalToday}
          icon={Users}
          color="bg-emerald-500"
          subValue="Aggregated Data"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-50 bg-neutral-50/30">
          <h3 className="font-bold text-neutral-800">Operational Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 text-neutral-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-8 py-4">Ref ID</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Payment</th>
                <th className="px-8 py-4">Kitchen Action</th>
                <th className="px-8 py-4">Space Access</th>
                <th className="px-8 py-4 text-center">Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {orders
                .filter((o) => o.id.toString().includes(searchTerm))
                .map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-bold text-neutral-700">
                        #{order.id}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-tight">
                          {order.type === "Food" ? (
                            <Utensils size={14} className="text-orange-500" />
                          ) : (
                            <BookOpen size={14} className="text-indigo-500" />
                          )}
                          {order.type}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase ${
                            order.payment_status === "paid"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-red-50 text-red-600 border-red-100"
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        {order.type !== "Booking" && (
                          <div className="flex gap-2">
                            {order.status === "Pending" && (
                              <button
                                onClick={() =>
                                  updateOrderStatus(order.id, "Preparing")
                                }
                                className="bg-orange-500 text-white p-1.5 rounded-lg hover:bg-orange-600 transition shadow-sm"
                              >
                                <Clock size={14} />
                              </button>
                            )}
                            {order.status === "Preparing" && (
                              <button
                                onClick={() =>
                                  updateOrderStatus(order.id, "Completed")
                                }
                                className="bg-emerald-500 text-white p-1.5 rounded-lg hover:bg-emerald-600 transition shadow-sm"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                            <span className="text-xs font-bold text-neutral-400 mt-1.5 ml-1">
                              {order.status}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        {order.booking_id && (
                          <div className="flex flex-col gap-1">
                            {order.grant_status === "Granted" ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-indigo-600 tabular-nums">
                                  {formatTime(timeRemaining[order.id] ?? 0)}
                                </span>
                                <button
                                  onClick={() => handleEndSession(order.id)}
                                  className="text-[10px] text-red-500 font-bold underline hover:text-red-700 transition"
                                >
                                  Kill Session
                                </button>
                              </div>
                            ) : ["Pending", "Confirmed"].includes(
                                order.grant_status!
                              ) ? (
                              <button
                                onClick={() => handleGrantAccess(order.id)}
                                className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition"
                              >
                                <Zap size={12} fill="white" /> Grant Access
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-neutral-300 italic">
                                {order.grant_status}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button
                          onClick={() =>
                            setExpandedId(
                              expandedId === order.id ? null : order.id
                            )
                          }
                          className={`p-2 rounded-lg transition-all ${
                            expandedId === order.id
                              ? "bg-neutral-100 text-indigo-600 shadow-inner"
                              : "text-neutral-300 hover:text-neutral-500"
                          }`}
                        >
                          <List size={18} />
                        </button>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr className="bg-neutral-50/50">
                        <td colSpan={6} className="px-8 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {order.food_items && (
                              <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Utensils size={12} /> Kitchen Requirements
                                </p>
                                {order.food_items.map((item, i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between items-center py-2 border-b border-neutral-50 last:border-0"
                                  >
                                    <span className="text-sm font-bold text-neutral-700">
                                      {item.quantity}x {item.name}
                                    </span>
                                    <span className="text-sm text-neutral-400 font-medium">
                                      ₱{item.price}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {order.booking_details && (
                              <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <BookOpen size={12} /> Space Allocation
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">
                                      Target Area:
                                    </span>{" "}
                                    <span className="font-bold text-neutral-700">
                                      {order.booking_details.space_name}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">
                                      Duration:
                                    </span>{" "}
                                    <span className="font-bold text-neutral-700">
                                      {order.booking_details.duration_hours}{" "}
                                      Hours
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">
                                      Customer:
                                    </span>{" "}
                                    <span className="font-bold text-neutral-700">
                                      {order.booking_details.customer_name}
                                    </span>
                                  </div>
                                  {order.booking_details.notes && (
                                    <div className="mt-3 p-3 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-100 italic">
                                      "{order.booking_details.notes}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
