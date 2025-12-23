import { useState, useEffect } from "react";
import { BarChart2, TrendingUp, Loader, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { supabase } from "../libs/supabaseClient";

interface AnalyticsData {
  month: string;
  revenue: number;
  sales: number;
}

const RevenueBarChart = ({ data }: { data: AnalyticsData[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
      <XAxis dataKey="month" stroke="#555" />
      <YAxis
        stroke="#555"
        tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
      />
      <Tooltip
        cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
        formatter={(value) => [`₱${value.toLocaleString()}`, "Revenue"]}
      />
      <Bar
        dataKey="revenue"
        fill="#4f46e5"
        name="Monthly Revenue"
        radius={[4, 4, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
);

const SalesLineChart = ({ data }: { data: AnalyticsData[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
      <XAxis dataKey="month" stroke="#555" />
      <YAxis stroke="#555" />
      <Tooltip formatter={(value) => [value.toLocaleString(), "Sales Units"]} />
      <Legend />
      <Line
        type="monotone"
        dataKey="sales"
        stroke="#10b981"
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 8 }}
        name="Sales Units"
      />
    </LineChart>
  </ResponsiveContainer>
);

const SalesAnalytics = () => {
  const [salesData, setSalesData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Filter state ---
  const [filterMonth, setFilterMonth] = useState<string>(""); // Format: "YYYY-MM"
  const [filterYear, setFilterYear] = useState<string>(""); // Format: "YYYY"

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("orders")
        .select(`created_at, total_amount`)
        .eq("status", "paid");

      // Apply filtering
      if (filterMonth) {
        const start = new Date(filterMonth + "-01");
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        query = query
          .gte("created_at", start.toISOString())
          .lt("created_at", end.toISOString());
      } else if (filterYear) {
        const start = new Date(`${filterYear}-01-01`);
        const end = new Date(`${filterYear}-12-31T23:59:59`);
        query = query
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Aggregate monthly
      const monthlyMap: Record<string, { revenue: number; sales: number }> = {};
      data?.forEach((order: any) => {
        const date = new Date(order.created_at);
        const month = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, sales: 0 };
        monthlyMap[month].revenue += order.total_amount;
        monthlyMap[month].sales += 1;
      });

      const formattedData = Object.entries(monthlyMap)
        .map(([month, values]) => ({
          month,
          revenue: values.revenue,
          sales: values.sales,
        }))
        .sort(
          (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
        );

      setSalesData(formattedData);
    } catch (e: any) {
      console.error("Analytics fetching error:", e);
      setError(
        `Failed to load sales analytics: ${e.message}. Check Supabase connection.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterMonth, filterYear]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-10 h-64 text-indigo-600 bg-white border rounded-xl shadow-lg">
        <Loader size={32} className="animate-spin mb-3" />
        <p className="text-lg font-medium">Loading Sales Analytics...</p>
      </div>
    );

  if (error)
    return (
      <div className="py-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-xl w-full flex flex-col items-center justify-center gap-3">
        <AlertTriangle size={32} />
        <p className="font-bold text-xl">Data Fetching Error</p>
        <p className="font-medium max-w-lg text-sm">{error}</p>
      </div>
    );

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-neutral-800 flex items-center gap-2">
        <BarChart2 size={28} />
        Sales Analytics
      </h2>

      {/* --- FILTERS --- */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Filter by Month
          </label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => {
              setFilterMonth(e.target.value);
              setFilterYear(""); // reset year if month is selected
            }}
            className="p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Filter by Year
          </label>
          <input
            type="number"
            placeholder="YYYY"
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setFilterMonth(""); // reset month if year is selected
            }}
            className="p-2 border rounded-md w-24"
          />
        </div>

        <button
          onClick={() => {
            setFilterMonth("");
            setFilterYear("");
          }}
          className="px-3 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
        >
          Reset Filters
        </button>
      </div>

      {/* --- CHARTS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-white border rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-neutral-800 flex items-center gap-2">
            <BarChart2 size={20} className="text-indigo-600" />
            Monthly Revenue
          </h3>
          <RevenueBarChart data={salesData} />
        </div>

        <div className="p-4 bg-white border rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-neutral-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-teal-600" />
            Sales Units Volume
          </h3>
          <SalesLineChart data={salesData} />
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="p-4 bg-white border rounded-xl shadow-lg">
        <p className="text-lg font-medium mb-3 text-neutral-700">
          Monthly Sales Volume and Revenue (Detailed Table)
        </p>
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Month
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Revenue (₱)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Sales Units
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {salesData.length > 0 ? (
              salesData.map((data) => (
                <tr key={data.month} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    {data.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-neutral-700">
                    ₱{data.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-neutral-700">
                    {data.sales.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-4 text-center text-sm text-neutral-500"
                >
                  No paid sales data found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesAnalytics;
