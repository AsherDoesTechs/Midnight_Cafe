import { useState, useEffect } from "react";
import * as React from "react";
import {
  Clock,
  CheckCircle,
  Users,
  BookOpen,
  Utensils,
  Zap,
  XCircle,
  List,
  Calendar,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../libs/supabaseClient"; // Adjust path

// --- INTERFACES ---
interface FoodItem {
  name: string;
  quantity: number;
  price: number;
}

interface BookingDetails {
  space_name: string;
  duration_hours: number;
  notes: string;
}

interface Order {
  id: number;
  order_id: number | null;
  booking_id: number | null;
  customer_name: string;
  student_id: string;
  total_amount: number;
  type: "Food" | "Booking" | "Combined";
  food_items?: FoodItem[];
  booking_details?: BookingDetails | null;
  status: "Pending" | "Preparing" | "Completed" | "Cancelled" | "N/A" | string;
  grant_status:
    | "Pending"
    | "Granted"
    | "Expired"
    | "Confirmed"
    | "N/A"
    | string;
  actual_start_time: string | null;
  scheduled_end_time: string | null;
  order_date: string;
}

// --- HELPERS ---
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
};

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: number]: number }>(
    {}
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // --- FETCH ORDERS ---
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from<Order>("orders")
        .select(
          `
          id,
          order_id,
          booking_id,
          customer_name,
          student_id,
          total_amount,
          type,
          food_items,
          booking_details,
          status,
          grant_status,
          actual_start_time,
          scheduled_end_time,
          order_date
        `
        )
        .order("order_date", { ascending: false });

      if (error) throw error;

      setOrders(data ?? []);
    } catch (error: any) {
      console.error("Error fetching orders:", error.message);
      toast.error("Could not load orders from Supabase.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // --- TIMER EFFECT ---
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const updatedRemaining: { [key: number]: number } = {};
      let expiredOrderFound = false;

      const updatedOrders = orders.map((order) => {
        if (
          order.booking_id &&
          order.grant_status === "Granted" &&
          order.scheduled_end_time
        ) {
          const endTime = new Date(order.scheduled_end_time).getTime();
          const remainingSeconds = Math.max(
            0,
            Math.floor((endTime - now) / 1000)
          );
          updatedRemaining[order.id] = remainingSeconds;

          if (remainingSeconds === 0 && order.grant_status !== "Expired") {
            expiredOrderFound = true;
            return { ...order, grant_status: "Expired", status: "Completed" };
          }
        }
        return order;
      });

      setTimeRemaining(updatedRemaining);

      if (expiredOrderFound) {
        setOrders(updatedOrders);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  useEffect(() => {
    fetchOrders();
    const refreshInterval = setInterval(fetchOrders, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  // --- ACTIONS ---
  const updateOrderStatus = async (id: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast.info(`Order #${id} status changed to ${newStatus}`);
      fetchOrders();
    } catch (error: any) {
      console.error(error.message);
      toast.error("Failed to update order status.");
    }
  };

  const handleGrantAccess = async (id: number) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          grant_status: "Granted",
          actual_start_time: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Access granted for booking #${id}`);
      fetchOrders();
    } catch (error: any) {
      toast.error("Failed to grant access.");
    }
  };

  const handleEndSession = async (id: number) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ grant_status: "Expired", status: "Completed" })
        .eq("id", id);

      if (error) throw error;

      toast.warning(`Booking #${id} session ended`);
      fetchOrders();
    } catch (error: any) {
      toast.error("Failed to end session.");
    }
  };

  const handleCancelOrder = async (id: number) => {
    if (!window.confirm(`Cancel Order #${id}?`)) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "Cancelled", grant_status: "Cancelled" })
        .eq("id", id);

      if (error) throw error;

      toast.error(`Order #${id} cancelled`);
      fetchOrders();
    } catch (error: any) {
      toast.error("Failed to cancel order.");
    }
  };

  // --- HELPERS ---
  const toggleDetails = (id: number) =>
    setExpandedId(expandedId === id ? null : id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
      case "Confirmed":
        return "bg-yellow-200 text-yellow-700 border-yellow-300";
      case "Preparing":
      case "Granted":
        return "bg-blue-200 text-blue-700 border-blue-300";
      case "Completed":
        return "bg-green-200 text-green-700 border-green-300";
      case "Expired":
      case "Cancelled":
        return "bg-red-200 text-red-700 border-red-300";
      default:
        return "bg-neutral-200 text-neutral-700 border-neutral-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Food":
        return <Utensils size={16} className="text-pink-600" />;
      case "Booking":
        return <BookOpen size={16} className="text-indigo-600" />;
      case "Combined":
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <></>;
    }
  };

  const renderBookingActions = (order: Order) => {
    if (!order.booking_id) return null;

    switch (order.grant_status) {
      case "Pending":
      case "Confirmed":
        return (
          <div className="flex flex-col gap-1 items-start">
            <button
              onClick={() => handleGrantAccess(order.id)}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-indigo-700"
            >
              <Zap size={16} /> Grant Access
            </button>
            <button
              onClick={() => handleCancelOrder(order.id)}
              className="text-red-600 underline text-xs mt-1 flex items-center gap-1 hover:text-red-800"
            >
              <X size={14} /> Decline Booking
            </button>
          </div>
        );

      case "Granted":
        const remaining = timeRemaining[order.id] ?? -1;
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="text-lg font-bold text-blue-600">
              {formatTime(remaining)}
            </span>
            <button
              onClick={() => handleEndSession(order.id)}
              className="text-red-600 underline text-xs flex items-center gap-1 hover:text-red-800"
            >
              <XCircle size={14} /> End Session
            </button>
          </div>
        );

      case "Expired":
      case "Cancelled":
        return (
          <span className="text-red-500 italic text-sm">
            {order.grant_status === "Expired"
              ? "Time Expired"
              : "Declined/Cancelled"}
          </span>
        );

      default:
        return null;
    }
  };

  const renderFoodActions = (order: Order) => {
    if (
      !order.order_id ||
      order.status === "Completed" ||
      order.status === "Cancelled" ||
      order.status === "N/A"
    )
      return <span className="text-neutral-500 italic text-sm">N/A</span>;

    if (order.status === "Pending") {
      return (
        <div className="flex flex-col gap-1 items-start">
          <button
            onClick={() => updateOrderStatus(order.id, "Preparing")}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700"
          >
            <Clock size={16} /> Start Prep
          </button>
          <button
            onClick={() => handleCancelOrder(order.id)}
            className="text-red-600 underline text-xs mt-1 flex items-center gap-1 hover:text-red-800"
          >
            <X size={14} /> Cancel Order
          </button>
        </div>
      );
    } else if (order.status === "Preparing") {
      return (
        <button
          onClick={() => updateOrderStatus(order.id, "Completed")}
          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"
        >
          <CheckCircle size={16} /> Complete
        </button>
      );
    }
  };

  const renderDetailRow = (order: Order) => {
    if (expandedId !== order.id) return null;

    return (
      <tr className="bg-neutral-50 border-t border-indigo-200">
        <td colSpan={7} className="p-4 text-sm">
          <div className="flex flex-wrap gap-8">
            {(order.food_items ?? []).length > 0 && (
              <div className="flex-1 min-w-[250px]">
                <h4 className="font-bold text-lg text-pink-700 flex items-center gap-1 mb-2">
                  <Utensils size={18} /> Food Items ({order.order_id ?? "N/A"})
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {(order.food_items ?? []).map((item, idx) => (
                    <li key={idx} className="text-neutral-700">
                      <strong>{item.quantity}x</strong> {item.name} (₱
                      {item.price.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {order.booking_details && (
              <div className="flex-1 min-w-[250px]">
                <h4 className="font-bold text-lg text-indigo-700 flex items-center gap-1 mb-2">
                  <Calendar size={18} /> Booking Details (
                  {order.booking_id ?? "N/A"})
                </h4>
                <p className="text-neutral-700">
                  <strong>Space:</strong>{" "}
                  {order.booking_details?.space_name ?? "N/A"}
                </p>
                <p className="text-neutral-700">
                  <strong>Duration:</strong>{" "}
                  {order.booking_details?.duration_hours ?? "N/A"} hours
                </p>
                <p className="text-neutral-700 mt-2">
                  <strong>Notes:</strong>{" "}
                  <span className="italic">
                    {order.booking_details?.notes ?? "N/A"}
                  </span>
                </p>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // --- RENDER ---
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-neutral-800 flex items-center gap-2">
        <Users size={32} className="text-indigo-600" /> Order & Booking
        Management
      </h2>

      <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
        <span className="font-bold">Booking Control:</span> Grant Access starts
        the timer. Timer hitting zero automatically sets status to Expired.
        Decline/Cancel is available.
      </div>

      <div className="rounded-xl border bg-white shadow-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-100 border-b text-neutral-600">
            <tr>
              <th className="p-3 text-left">ID/Time</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Customer (ID)</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Food Status</th>
              <th className="p-3 text-left">Booking Status / Control</th>
              <th className="p-3 text-left w-[80px]">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-6 text-neutral-500">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-6 text-neutral-500">
                  No orders or bookings available.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="border-b hover:bg-neutral-50 transition">
                    <td className="p-3 font-semibold text-sm">
                      <span className="text-neutral-900 block">
                        #{order.id}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {new Date(order.order_date).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
                          order.type === "Food"
                            ? "bg-pink-100 text-pink-700"
                            : order.type === "Booking"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {getTypeIcon(order.type)} {order.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium block">
                        {order.customer_name}
                      </span>
                      <span className="text-xs text-neutral-500">
                        ({order.student_id})
                      </span>
                    </td>
                    <td className="p-3 font-bold text-neutral-700">
                      ₱{order.total_amount.toFixed(2)}
                    </td>
                    <td className="p-3">{renderFoodActions(order)}</td>
                    <td className="p-3">{renderBookingActions(order)}</td>
                    <td className="p-3 text-center">
                      {(order.food_items?.length ?? 0) > 0 ||
                      order.booking_details ? (
                        <button
                          onClick={() => toggleDetails(order.id)}
                          className="text-indigo-600 hover:text-indigo-800 transition p-2 rounded-full hover:bg-indigo-100"
                          title={
                            expandedId === order.id
                              ? "Hide Details"
                              : "Show Details"
                          }
                        >
                          <List
                            size={20}
                            className={
                              expandedId === order.id
                                ? "rotate-180 transform transition"
                                : "transition"
                            }
                          />
                        </button>
                      ) : (
                        <span className="text-neutral-400 italic text-xs">
                          No Info
                        </span>
                      )}
                    </td>
                  </tr>
                  {renderDetailRow(order)}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
