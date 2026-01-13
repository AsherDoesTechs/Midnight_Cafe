import { useState, useEffect } from "react";
import * as React from "react";
import { ShoppingBag, Calendar, DollarSign, Repeat } from "lucide-react";
import { supabase } from "../libs/supabaseClient";

interface OrderHistoryItem {
  id: number;
  date: string;
  total: number;
  items: string; // comma-separated list
  status: "Delivered" | "In Progress" | "Paid" | "Confirmed" | "Cancelled";
}

const RecentBuys: React.FC = () => {
  const [recentBuys, setRecentBuys] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        // FIX: Await the getUser call
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setRecentBuys([]);
          setLoading(false);
          return;
        }

        // FIX: Remove the <OrderHistoryItem> from .from()
        // and cast the data at the end or via the select
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedData = (data as any[]).map((order) => ({
          ...order,
          total: order.total,
          date: new Date(order.date).toLocaleDateString(),
        })) as OrderHistoryItem[];

        setRecentBuys(formattedData);
      } catch (err) {
        console.error("❌ Failed to fetch recent buys:", err);
        setRecentBuys([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  if (loading) {
    return (
      <p className="text-center text-gray-400">Loading purchase history...</p>
    );
  }

  const getStatusClasses = (status: OrderHistoryItem["status"]) => {
    switch (status) {
      case "Delivered":
        return "bg-green-600 text-white";
      case "Confirmed":
      case "Paid":
        return "bg-blue-600 text-white";
      case "Cancelled":
        return "bg-red-600 text-white";
      case "In Progress":
      default:
        return "bg-yellow-600 text-black";
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-2xl font-semibold mb-4 text-[#F1A7C5] flex items-center gap-2">
        <ShoppingBag size={24} /> Full Purchase History
      </h3>

      {recentBuys.length === 0 ? (
        <div className="text-center p-10 bg-[#222] rounded-lg border border-[#333]">
          <p className="text-lg font-medium">
            You haven't made any purchases yet.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Start shopping to see your history here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentBuys.map((order) => (
            <div
              key={order.id}
              className="bg-[#222] p-5 rounded-lg border border-[#333] shadow-lg flex justify-between items-center transition-all hover:border-[#F1A7C5]"
            >
              <div className="space-y-1">
                <p className="text-lg font-bold text-white flex flex-col gap-1">
                  Order #{order.id}
                  <span className="text-sm text-gray-400">
                    {order.items.split(", ").join(", ")}
                  </span>
                </p>
                <div className="flex items-center text-sm text-gray-400 gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} className="text-[#F1A7C5]" />{" "}
                    {order.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign size={14} className="text-[#F1A7C5]" /> Total: ₱
                    {order.total}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusClasses(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <button className="text-[#F1A7C5] text-sm font-medium hover:underline flex items-center gap-1">
                  Re-Order <Repeat size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentBuys;
