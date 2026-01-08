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
  Loader,
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

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subValue?: string;
}

/* ===================== SUB-COMPONENTS ===================== */
const KPICard = ({
  title,
  value,
  icon: Icon,
  color,
  subValue,
}: KPICardProps) => (
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
    } catch (err: unknown) {
      console.error(err);
      toast.error("Sync Error");
    } finally {
      setLoading(false);
    }
  }, []);

  /* 1. REAL-TIME SUBSCRIPTION */
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  /* 2. TICKER TIMER EFFECT */
  // Separated from subscription to prevent interval resets on data sync
  useEffect(() => {
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

    return () => clearInterval(timer);
  }, [orders]);

  /* 3. ANALYTICS MEMO */
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

  /* 4. OPERATIONAL ACTIONS */
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
              placeholder="Search ID..."
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

      {/* Operational Table Content (Truncated for brevity, logic remains identical to your source) */}
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
                      <td className="px-8 py-5 text-xs font-bold uppercase">
                        <span
                          className={
                            order.payment_status === "paid"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }
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
                                className="bg-orange-500 text-white p-1.5 rounded-lg hover:bg-orange-600"
                              >
                                <Clock size={14} />
                              </button>
                            )}
                            {order.status === "Preparing" && (
                              <button
                                onClick={() =>
                                  updateOrderStatus(order.id, "Completed")
                                }
                                className="bg-emerald-500 text-white p-1.5 rounded-lg hover:bg-emerald-600"
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
                          <div className="flex items-center gap-2">
                            {order.grant_status === "Granted" ? (
                              <>
                                <span className="text-sm font-black text-indigo-600 tabular-nums">
                                  {formatTime(timeRemaining[order.id] ?? 0)}
                                </span>
                                <button
                                  onClick={() => handleEndSession(order.id)}
                                  className="text-[10px] text-red-500 font-bold underline"
                                >
                                  Kill
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleGrantAccess(order.id)}
                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                              >
                                Grant Access
                              </button>
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
                          className="text-neutral-400 hover:text-indigo-600"
                        >
                          <List size={18} />
                        </button>
                      </td>
                    </tr>
                    {/* EXPANDED DETAILS */}
                    {expandedId === order.id && (
                      <tr className="bg-neutral-50/50">
                        <td colSpan={6} className="px-8 py-4">
                          <div className="flex flex-wrap gap-4">
                            {order.food_items?.map((item, idx) => (
                              <span
                                key={idx}
                                className="bg-white border px-3 py-1 rounded-full text-xs font-medium"
                              >
                                {item.quantity}x {item.name}
                              </span>
                            ))}
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
